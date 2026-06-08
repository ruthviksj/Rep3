/* =========================================================
   RUTHVIK.TERMINAL · v3.2  ·  interactions
   ========================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Live clock + uptime in header ---- */
  function pad(n) { return n < 10 ? "0" + n : n; }
  function tickClock() {
    var d = new Date();
    var hh = pad(d.getUTCHours()), mm = pad(d.getUTCMinutes()), ss = pad(d.getUTCSeconds());
    document.querySelectorAll("[data-clock]").forEach(function (el) { el.textContent = hh + ":" + mm + ":" + ss + " UTC"; });
    var ist = new Date(d.getTime() + (5.5 * 3600 * 1000));
    var dateStr = ist.getUTCFullYear() + "." + pad(ist.getUTCMonth() + 1) + "." + pad(ist.getUTCDate());
    document.querySelectorAll("[data-date]").forEach(function (el) { el.textContent = dateStr; });
  }
  tickClock();
  setInterval(tickClock, 1000);

  function uptime() {
    var start = new Date("2021-01-15T00:00:00Z");
    var now = new Date();
    var ms = now - start;
    var days = Math.floor(ms / 86400000);
    var years = Math.floor(days / 365);
    var rem = days - years * 365;
    var months = Math.floor(rem / 30);
    var d = rem - months * 30;
    var s = years + "y " + months + "m " + d + "d";
    document.querySelectorAll("[data-uptime]").forEach(function (el) { el.textContent = s; });
  }
  uptime();
  setInterval(uptime, 60000);

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-today]").forEach(function (el) {
    var d = new Date();
    var m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    el.textContent = d.getDate() + " " + m[d.getMonth()] + " " + d.getFullYear();
  });

  /* ---- Animated counters when in view ---- */
  function animate(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 950;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.round(target * eased);
      el.textContent = prefix + v + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) {
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      el.textContent = prefix + el.getAttribute("data-count") + suffix;
    });
  }

  /* ---- Sparkline draw (inline) ---- */
  document.querySelectorAll("[data-spark]").forEach(function (svg) {
    var raw = svg.getAttribute("data-spark");
    var w = parseFloat(svg.getAttribute("width") || 70);
    var h = parseFloat(svg.getAttribute("height") || 22);
    var nums = raw.split(",").map(parseFloat);
    var min = Math.min.apply(null, nums), max = Math.max.apply(null, nums);
    var rng = max - min || 1;
    var pts = nums.map(function (n, i) {
      var x = (i / (nums.length - 1)) * (w - 2) + 1;
      var y = h - 2 - ((n - min) / rng) * (h - 4);
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
    var col = svg.getAttribute("data-color") || "#5DCAA5";
    svg.innerHTML = '<polyline points="' + pts + '" fill="none" stroke="' + col + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
  });

  /* ---- Prompt: rotating echo line ---- */
  var promptLines = [
    'type <b>/about</b> to read more',
    'type <b>/work</b> to see case files',
    'type <b>/contact</b> to reach out',
    'currently <b>open to PM roles</b>',
    'avg. response time: <b>~24h</b>'
  ];
  var promptEl = document.querySelector(".prompt .echo");
  if (promptEl && !reduce) {
    var idx = 0;
    setInterval(function () {
      idx = (idx + 1) % promptLines.length;
      promptEl.style.opacity = "0";
      setTimeout(function () { promptEl.innerHTML = promptLines[idx]; promptEl.style.opacity = "1"; }, 200);
    }, 4200);
    promptEl.style.transition = "opacity .25s";
  }

  /* ---- Compose -> mailto ---- */
  var form = document.querySelector("#compose-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(form);
      var subject = encodeURIComponent("[/contact] " + (f.get("subject") || "from " + (f.get("name") || "the site")));
      var body = encodeURIComponent(
        "from: " + (f.get("name") || "") + " <" + (f.get("email") || "") + ">\n\n" +
        (f.get("message") || "")
      );
      var hint = form.querySelector(".compose__hint");
      window.location.href = "mailto:sjruthvik99@gmail.com?subject=" + subject + "&body=" + body;
      if (hint) hint.textContent = "▌ opening mail client… or write to sjruthvik99@gmail.com";
    });
  }
})();
