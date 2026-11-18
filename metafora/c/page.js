// Card text as HTML: a small copy of the app's CardTextFormatter (paragraphs, headings,
// numbered steps, bulleted items, Markdown tables). Used by build.mjs for the card pages
// and by the browser for a person's own card, which travels inside the link.
// Everything is escaped; links become <a> only for http(s).
var MetaforaRender = (function () {
  var HEADINGS = new Set(["Як провести","Проведення","Інструкція","Мета","Матеріали","Підготовка","Запитання","Питання","Обговорення","Для обговорення","Завершення","Структура","Спільна домовленість","Нормальні відповіді","Насторожувальні відповіді","Запитання для обговорення","Бланк","Шкала","Орієнтир для фахівця","Якщо виникають насмішки","How to run","Procedure","Instructions","Goal","Materials","Preparation","Questions","Discussion","For discussion","Closing","Structure","Group agreement","Typical answers","Red-flag answers","Discussion questions","Form","Scale","Note for the practitioner","If someone mocks","Cómo realizarlo","Desarrollo","Instrucciones","Objetivo","Materiales","Preparación","Preguntas","Puesta en común","Para comentar","Cierre","Estructura","Acuerdo de grupo","Respuestas habituales","Respuestas de alerta","Preguntas para comentar","Formulario","Escala","Nota para el profesional","Si hay burlas","Come si svolge","Svolgimento","Istruzioni","Obiettivo","Materiali","Preparazione","Domande","Discussione","Per la discussione","Chiusura","Struttura","Accordo di gruppo","Risposte tipiche","Risposte d’allarme","Domande per la discussione","Modulo","Scala","Nota per il professionista","Se qualcuno deride","Ablauf","Durchführung","Anleitung","Ziel","Material","Vorbereitung","Fragen","Nachbesprechung","Zur Besprechung","Abschluss","Struktur","Gruppenvereinbarung","Typische Antworten","Auffällige Antworten","Fragen zur Besprechung","Formular","Skala","Hinweis für Fachleute","Wenn jemand spottet","Déroulement","Mise en œuvre","Consignes","Objectif","Matériel","Préparation","Échange","Pour l’échange","Clôture","Accord de groupe","Réponses habituelles","Réponses préoccupantes","Questions pour l’échange","Formulaire","Échelle","Repère pour le praticien","En cas de moqueries","Jak przeprowadzić","Przebieg","Instrukcja","Cel","Materiały","Przygotowanie","Pytania","Omówienie","Do omówienia","Zakończenie","Struktura","Umowa grupowa","Typowe odpowiedzi","Niepokojące odpowiedzi","Pytania do omówienia","Formularz","Wskazówka dla specjalisty","Jeśli pojawiają się drwiny","Запитання","Питання","Обговорення","Для обговорення","Запитання для обговорення","Заповніть","Завершіть речення","Questions","Discussion","For discussion","Discussion questions","Fill in","Complete the sentence","Preguntas","Puesta en común","Para comentar","Preguntas para comentar","Completa","Completa la frase","Domande","Discussione","Per la discussione","Domande per la discussione","Compila","Fragen","Nachbesprechung","Zur Besprechung","Fragen zur Besprechung","Ausfüllen","Satz vervollständigen","Échange","Pour l’échange","Questions pour l’échange","Complétez","Complétez la phrase","Pytania","Omówienie","Do omówienia","Pytania do omówienia","Uzupełnij","Dokończ zdanie","Приклади","Варіанти","Підказки","Не записуйте","Нормальні відповіді","Насторожувальні відповіді","Examples","Example","For example","Options","Hints","Don't write down","Typical answers","Red-flag answers","Ejemplos","Ejemplo","Por ejemplo","Opciones","Pistas","No lo anotes","Respuestas habituales","Respuestas de alerta","Esempi","Esempio","Per esempio","Opzioni","Suggerimenti","Non scriverlo","Risposte tipiche","Risposte d’allarme","Beispiele","Beispiel","Zum Beispiel","Varianten","Hinweise","Nicht aufschreiben","Typische Antworten","Auffällige Antworten","Exemples","Exemple","Par exemple","Pistes","Ne notez pas","Réponses habituelles","Réponses préoccupantes","Przykłady","Przykład","Na przykład","Warianty","Podpowiedzi","Nie zapisuj","Typowe odpowiedzi","Niepokojące odpowiedzi"]);
  var numbered = /^\s*(\d{1,3}[.)])\s+(.+)$/;
  var bulleted = /^\s*([▫■▪□✓✔☑•*–—-])\s+(.+)$/;
  var url = /https?:\/\/[^\s<>«»"”]+[^\s<>«»"”.,;:!?)\]]/g;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function linked(s) {
    var out = "", last = 0, m;
    url.lastIndex = 0;
    while ((m = url.exec(s))) {
      out += esc(s.slice(last, m.index)) +
        '<a href="' + esc(m[0]) + '" rel="nofollow noopener" target="_blank">' + esc(m[0]) + "</a>";
      last = m.index + m[0].length;
    }
    return out + esc(s.slice(last));
  }

  function cells(line) {
    var t = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return t.split("|").map(function (c) { return c.trim(); });
  }

  function table(lines, i) {
    if (i + 1 >= lines.length) return null;
    var head = lines[i].trim(), sep = lines[i + 1].trim();
    if (head.indexOf("|") !== 0 || !/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(sep)) return null;
    var headers = cells(head), rows = [], j = i + 2;
    while (j < lines.length && lines[j].trim().indexOf("|") === 0) { rows.push(cells(lines[j])); j++; }
    var box = function (v) {
      if (v === "□" || v === "☐" || v === "[ ]") return "☐";
      if (v === "☑" || v === "[x]" || v === "[X]") return "☑";
      return null;
    };
    var html = '<div class="table"><table><thead><tr>' +
      headers.map(function (h) { return "<th>" + linked(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) {
        return "<tr>" + headers.map(function (_, k) {
          var v = r[k] || "", b = box(v);
          var blank = !v || /^_+$/.test(v);
          return "<td>" + (b ? '<span class="box">' + b + "</span>" : blank ? "" : linked(v)) + "</td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
    return { html: html, end: j };
  }

  function html(text) {
    var lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
    var out = [], list = null, i = 0;
    var close = function () { if (list) { out.push("</" + list + ">"); list = null; } };
    var open = function (tag) { if (list !== tag) { close(); out.push("<" + tag + ">"); list = tag; } };
    while (i < lines.length) {
      var t = table(lines, i);
      if (t) { close(); out.push(t.html); i = t.end; continue; }
      var line = lines[i++].trim();
      if (!line) { close(); continue; }
      var m;
      if ((m = numbered.exec(line))) {
        open("ol");
        out.push('<li><span class="mark">' + esc(m[1]) + "</span>" + linked(m[2]) + "</li>");
      } else if ((m = bulleted.exec(line)) && !(/[–—-]/.test(m[1]) && list !== "ul")) {
        open("ul");
        var mark = /[▫■▪]/.test(m[1]) ? "▫" : /[✓✔☑]/.test(m[1]) ? "✓" : m[1] === "□" ? "☐" : "•";
        out.push('<li><span class="mark">' + mark + "</span>" + linked(m[2]) + "</li>");
      } else if (HEADINGS.has(line.replace(/[:.]$/, ""))) {
        close();
        out.push("<h3>" + esc(line.replace(/:$/, "")) + "</h3>");
      } else {
        close();
        out.push("<p>" + linked(line) + "</p>");
      }
    }
    close();
    return out.join("\n");
  }

  return { html: html, esc: esc, linked: linked };
})();
if (typeof module !== "undefined") module.exports = MetaforaRender;

// Shared card pages: store buttons for this phone, the install sheet, and a person's own card,
// which travels inside the link after # (never sent to the server): deflate-raw + base64url JSON
// {v:1, t:title, x:text, o:source, f:format, p:[topics], i:key idea}, written by the app.
(function () {
  var APP_ID = "6819642218", PACKAGE = "com.metafora.app", PT = "129568531";
  var apple = "https://apps.apple.com/app/apple-store/id" + APP_ID + "?pt=" + PT + "&ct=share-card&mt=8";
  var play = "https://play.google.com/store/apps/details?id=" + PACKAGE +
    "&referrer=" + encodeURIComponent("utm_source=share&utm_medium=card&utm_campaign=share-card");
  var ua = navigator.userAgent || "";
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
  var android = /Android/.test(ua);

  function stores(root) {
    root.querySelectorAll("a.apple").forEach(function (a) { a.href = apple; if (android) a.hidden = true; });
    root.querySelectorAll("a.play").forEach(function (a) { a.href = play; if (ios) a.hidden = true; });
    root.querySelectorAll("a.get").forEach(function (a) { a.href = ios ? apple : android ? play : "#about"; });
  }

  function sheet() {
    var d = document.getElementById("install");
    if (!d) return;
    document.querySelectorAll("[data-install]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        if (d.showModal) d.showModal(); else d.setAttribute("open", "");
      });
    });
    d.addEventListener("click", function (e) { if (e.target === d || e.target.hasAttribute("data-close")) d.close(); });
  }

  function b64(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function own() {
    var main = document.querySelector("main[data-own]");
    if (!main) return;
    var R = window.MetaforaRender, raw = location.hash.slice(1);
    var fail = function () { main.querySelector(".error").hidden = false; };
    if (!raw || typeof DecompressionStream === "undefined") return fail();
    var stream;
    try { stream = new Blob([b64(raw)]).stream().pipeThrough(new DecompressionStream("deflate-raw")); }
    catch (e) { return fail(); }
    new Response(stream).text().then(function (json) {
      var c = JSON.parse(json);
      if (!c || typeof c.t !== "string") throw new Error("card");
      var str = function (v) { return typeof v === "string" ? v : ""; };
      var h = [];
      if (str(c.f)) h.push('<p class="format">' + R.esc(c.f) + "</p>");
      h.push("<h1>" + R.esc(c.t) + "</h1>");
      var topics = Array.isArray(c.p) ? c.p.filter(function (t) { return typeof t === "string" && t; }) : [];
      if (topics.length) h.push('<ul class="topics">' + topics.map(function (t) { return "<li>" + R.esc(t) + "</li>"; }).join("") + "</ul>");
      if (str(c.i)) h.push('<section class="idea"><p class="cap">' + R.esc(main.dataset.idea) + '</p><p class="idea-text">' + R.esc(c.i) + "</p></section>");
      if (str(c.x).trim()) h.push('<article class="text">' + R.html(c.x) + "</article>");
      if (str(c.o).trim()) h.push('<section class="source"><p class="cap">' + R.esc(main.dataset.source) + "</p><p>" + R.linked(c.o) + "</p></section>");
      h.push('<p class="own-note">' + R.esc(main.dataset.note) + "</p>");
      main.innerHTML = h.join("\n");
      document.title = c.t + " · Metafora";
    }).catch(fail);
  }

  document.addEventListener("DOMContentLoaded", function () {
    stores(document);
    sheet();
    own();
  });
})();
