/* ==========================================================================
   ROUTER — the view state, in the address bar.

   Everything the three views hold — which brand is open, the category and
   year filters, the sort metric, generation mode, the compare selection —
   used to live only in JavaScript variables, so a reload lost it and a link
   could point no deeper than the homepage. This mirrors it into the hash.

     #/                          the picker
     #/ducati?cat=sport&m=ptw    a brand page, filtered and sorted
     #/compare?y=2021&sel=…      the compare view, in a past model year

   Two kinds of write, because they want different history behaviour:

     go()   changing view — pushes, so Back returns where you came from
     sync() changing a filter — replaces, so Back does not step through
            every chip you touched on the way

   The views call SBL.stateChanged() after mutating anything; this module
   installs itself as that hook, so nothing below it needs to know a router
   exists.
   ========================================================================== */

(function(SBL){
  "use strict";

  var COMPARE = "compare";
  var applying = false;   /* guards the write → hashchange → read loop */

  /* ---------- compare selection ----------
     130 uids will not fit in a shareable URL, so the selection travels as a
     bitmask over SBL.ALL in index order, six bits per character.

     The model count rides along as a prefix. Adding a bike shifts every
     index after it, which would silently select the wrong machines in an old
     link; a length mismatch makes the selection drop back to "everything"
     rather than quietly lie. */
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  function packSelection(selected){
    if(selected.size === SBL.ALL.length) return null;      /* the default */
    if(selected.size === 0) return "none";

    var out = "", bits = 0, acc = 0;
    SBL.ALL.forEach(function(bike){
      acc = (acc << 1) | (selected.has(bike.uid) ? 1 : 0);
      if(++bits === 6){ out += B64[acc]; bits = 0; acc = 0 }
    });
    if(bits) out += B64[acc << (6 - bits)];
    return SBL.ALL.length + "." + out;
  }

  function unpackSelection(text){
    if(!text) return null;
    if(text === "none") return new Set();

    var parts = text.split(".");
    if(parts.length !== 2 || Number(parts[0]) !== SBL.ALL.length) return null;

    var set = new Set();
    SBL.ALL.forEach(function(bike, i){
      var chunk = B64.indexOf(parts[1][Math.floor(i / 6)]);
      if(chunk < 0) return;
      if(chunk & (1 << (5 - (i % 6)))) set.add(bike.uid);
    });
    return set;
  }

  /* ---------- hash <-> state ---------- */
  function buildHash(){
    var params = [];
    var path;

    if(SBL.compareView.isOpen()){
      var c = SBL.compareView.state();
      path = "/" + COMPARE;
      if(c.gen) params.push("gen=1");
      else if(c.year !== null) params.push("y=" + c.year);
      if(c.metric !== "power") params.push("m=" + c.metric);
      if(c.maxSeat) params.push("seat=" + c.maxSeat);
      var sel = packSelection(c.selected);
      if(sel) params.push("sel=" + sel);
    }else{
      var b = SBL.brandView.state();
      path = "/" + (b.brand || "");
      if(b.cat) params.push("cat=" + b.cat);
      if(b.year !== null) params.push("y=" + b.year);
      if(b.brand && b.metric && b.metric !== "power") params.push("m=" + b.metric);
    }

    return "#" + path + (params.length ? "?" + params.join("&") : "");
  }

  function parseHash(){
    var raw = location.hash.replace(/^#/, "");
    var split = raw.indexOf("?");
    var path = (split < 0 ? raw : raw.slice(0, split)).replace(/^\//, "");
    var query = split < 0 ? "" : raw.slice(split + 1);

    var params = {};
    query.split("&").forEach(function(pair){
      if(!pair) return;
      var eq = pair.indexOf("=");
      params[eq < 0 ? pair : pair.slice(0, eq)] =
        decodeURIComponent(eq < 0 ? "" : pair.slice(eq + 1));
    });
    return { path: path, params: params };
  }

  /* A year only counts if it is one the chips actually offer; a metric only
     if it exists. Anything else in the hash is ignored rather than trusted,
     since the address bar is user-editable. */
  function readYear(text){
    var year = Number(text);
    return (text && year >= SBL.YEAR_MIN && year <= SBL.YEAR_MAX) ? year : null;
  }
  function readMetric(text){
    return SBL.METRICS[text] ? text : "power";
  }
  function readCat(text){
    return SBL.CATEGORIES[text] ? text : null;
  }

  function applyHash(){
    applying = true;

    var route = parseHash();
    var p = route.params;

    if(route.path === COMPARE){
      SBL.compareView.setState({
        metric:   readMetric(p.m),
        year:     p.gen === "1" ? null : readYear(p.y),
        gen:      p.gen === "1",
        maxSeat:  Number(p.seat) || null,
        selected: unpackSelection(p.sel)
      });
      SBL.showView(COMPARE);
    }else{
      var brand = SBL.DATA[route.path] ? route.path : null;
      SBL.brandView.setState({
        brand:  brand,
        cat:    readCat(p.cat),
        year:   readYear(p.y),
        metric: readMetric(p.m)
      });
      SBL.showView(brand);
    }

    applying = false;
  }

  /* ---------- writes ---------- */
  /* The hash this module set, waiting for its own hashchange to come back.
     Pushing fires the event, and reading it back would re-apply state the
     views are already in — a wasted rebuild, and one that throws away
     anything done to the DOM after the write, such as the search field's
     jump to a card. Back and Forward never match it, so they still read. */
  var written = null;

  function write(push){
    if(applying) return;
    var hash = buildHash();
    if(hash === location.hash) return;
    written = hash;
    if(push) location.hash = hash;              /* fires hashchange, pushes */
    else history.replaceState(null, "", hash);  /* silent, no history entry */
  }

  SBL.stateChanged = function(){ write(false) };
  SBL.viewChanged  = function(){ write(true) };

  window.addEventListener("hashchange", function(){
    if(applying) return;
    if(location.hash === written){ written = null; return }
    applyHash();
  });

  SBL.router = { apply: applyHash };

})(window.SBL);
