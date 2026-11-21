(function () {
  var root = document.getElementById("root");

  var STATUS = { planned: "Запланировано", progress: "В работе", done: "Сделано", failed: "Не получилось" };
  var IDEA = { "new": "Новое", review: "Рассматривается", accepted: "Принято", declined: "Отклонено" };
  var IDEA_CLS = { "new": "s-planned", review: "s-progress", accepted: "s-done", declined: "s-failed" };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "cls") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function fmt(d) {
    if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return d || "";
    var p = d.split("-"); return p[2] + "." + p[1] + "." + p[0];
  }
  function daysSince(d) {
    if (!d) return 0;
    var a = new Date(d + "T00:00:00"), now = new Date();
    var b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((b - a) / 86400000);
  }

  function hero(s) {
    var c = { done: 0, progress: 0, planned: 0, failed: 0 };
    s.items.forEach(function (it) { c[it.status] = (c[it.status] || 0) + 1; });
    function t(n, label) { return el("div", null, [el("b", { text: String(n) }), el("span", { text: label })]); }
    return el("header", { cls: "hero" }, [el("div", { cls: "wrap" }, [
      el("p", { cls: "eyebrow", text: "Lakeview School Almaty · ученическое самоуправление" }),
      el("h1", { text: "Открытый отчёт" }),
      el("p", { cls: "lead" }, [
        "Всё, что обещано в программе, и что с этим сейчас. Без секретов: что сделано, что в работе, а что не получилось и почему. ",
        el("span", { cls: "motto", text: "Мы делаем, а не говорим." })
      ]),
      el("div", { cls: "notice", text: "Бирюков Платон, 11А · кандидат в Президенты. Работа по программе начнётся после выборов 7 декабря 2026." }),
      el("div", { cls: "tally" }, [t(c.done, "Сделано"), t(c.progress, "В работе"), t(c.planned, "Запланировано"), t(c.failed, "Не получилось")])
    ])]);
  }

  function items(s) {
    var list = el("div", { cls: "ledger" });
    s.items.forEach(function (it, i) {
      var kids = [
        el("div", null, [el("h3", { text: (i + 1) + ". " + it.title }), el("div", { cls: "meta", text: it.plan })]),
        el("span", { cls: "pill s-" + it.status, text: STATUS[it.status] || it.status }),
        el("div", { cls: "meta", text: "Срок: " + it.deadline + " · Результат: " + it.result })
      ];
      if (it.note) kids.push(el("div", { cls: "note", text: it.note }));
      list.appendChild(el("article", { cls: "row" }, kids));
    });
    return el("section", { id: "programma" }, [
      el("h2", { text: "Программа" }),
      el("p", { cls: "sub", text: "Пять инициатив из предвыборной программы. Статус меняется, как только что-то происходит." }),
      list
    ]);
  }

  function poll(s) {
    var p = s.poll, body;
    if (p.status === "none" || !p.question) {
      body = el("div", { cls: "card empty", text: "Первое голосование пройдёт в начале 3-й четверти. Здесь появится вопрос, варианты и итог." });
    } else {
      var total = p.options.reduce(function (a, o) { return a + (Number(o.votes) || 0); }, 0);
      var kids = [el("p", { cls: "poll-q", text: p.question + (p.month ? " · " + p.month : "") })];
      p.options.forEach(function (o) {
        var v = Number(o.votes) || 0, pct = total ? Math.round(v * 100 / total) : 0;
        kids.push(el("div", { cls: "bar" }, [
          el("span", { text: o.text }), el("span", { cls: "n", text: String(v) }),
          el("div", { cls: "track" }, [el("div", { cls: "fill", style: "width:" + pct + "%" })])
        ]));
      });
      kids.push(el("p", { cls: "meta", text: p.status === "open" ? "Голосование идёт." : "Голосование завершено." }));
      if (p.outcome) kids.push(el("p", { cls: "note", text: "Что сделали: " + p.outcome }));
      body = el("div", { cls: "card" }, kids);
    }
    return el("section", { id: "30-dnei" }, [
      el("h2", { text: "Решаем за 30 дней" }),
      el("p", { cls: "sub", text: "Каждый месяц ученики выбирают одну проблему школы. Через 30 дней здесь отчёт о том, что сделано." }),
      body
    ]);
  }

  function ideas(s) {
    var list = el("div", { cls: "ideas" });
    var arr = s.ideas.slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    if (!arr.length) list.appendChild(el("div", { cls: "card empty", text: "Пока ответов нет. Напиши первым в форме ниже." }));
    arr.forEach(function (d) {
      var waiting = (d.status === "new" || d.status === "review") && !d.answer;
      var age = daysSince(d.date);
      var kids = [
        el("div", { cls: "top" }, [
          el("span", { cls: "meta", text: "Написано " + fmt(d.date) }),
          el("span", { cls: "pill " + (IDEA_CLS[d.status] || "s-planned"), text: IDEA[d.status] || d.status })
        ]),
        el("p", { cls: "txt", text: d.text })
      ];
      if (d.answer) kids.push(el("div", { cls: "ans", text: "Ответ" + (d.answerDate ? " от " + fmt(d.answerDate) : "") + ": " + d.answer }));
      else if (waiting) kids.push(el("p", { cls: "meta" + (age > 7 ? " late" : ""), text: age > 7 ? "Ждёт ответа " + age + " дн. Срок 7 дней пропущен." : "Ответ будет в течение 7 дней." }));
      list.appendChild(el("article", { cls: "card idea" }, kids));
    });
    return el("section", { id: "idei" }, [
      el("h2", { text: "Идеи и вопросы учеников" }),
      el("p", { cls: "sub", text: "Здесь сообщения учеников и ответы на них. На каждое сообщение ответ в течение 7 дней." }),
      list
    ]);
  }

  function form(s) {
    var kids = [
      el("h2", { text: "Напиши Платону" }),
      el("p", { cls: "sub", text: "Идея, вопрос, жалоба, что угодно. Можно анонимно. Ответ появится в разделе выше." })
    ];
    if (s.meta.formEmbed) {
      kids.push(el("div", { cls: "form-wrap" }, [el("iframe", { cls: "form-frame", src: s.meta.formEmbed, title: "Форма для сообщений", loading: "lazy" })]));
    }
    if (s.meta.formUrl) {
      kids.push(el("div", { cls: "actions" }, [
        el("a", { cls: "btn ghost", href: s.meta.formUrl, target: "_blank", rel: "noopener", text: "Открыть форму в отдельной вкладке" })
      ]));
    }
    return el("section", { id: "napisat" }, kids);
  }

  function reports(s) {
    var list = el("div", { cls: "reports" });
    if (!s.reports.length) list.appendChild(el("div", { cls: "card empty", text: "Первый отчёт выйдет в конце 3-й четверти." }));
    s.reports.forEach(function (r) {
      list.appendChild(el("article", { cls: "card" }, [el("h3", { text: r.title }), el("div", { cls: "meta", text: fmt(r.date) }), el("p", { text: r.text })]));
    });
    return el("section", { id: "otchety" }, [
      el("h2", { text: "Отчёты по четвертям" }),
      el("p", { cls: "sub", text: "Раз в четверть: что получилось, что нет и что дальше." }),
      list
    ]);
  }

  function render(s) {
    root.textContent = "";
    root.appendChild(hero(s));
    root.appendChild(el("main", { cls: "wrap" }, [
      items(s), poll(s), ideas(s), form(s), reports(s),
      el("footer", null, [el("p", { text: "Обновлено " + fmt(s.meta.updated) + ". Вопросы можно задать Платону лично или через форму выше." })])
    ]));
  }

  fetch("data.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () {
      root.textContent = "";
      root.appendChild(el("p", { cls: "wrap", style: "padding-block:2rem", text: "Не удалось загрузить отчёт. Обнови страницу через минуту." }));
    });
})();
