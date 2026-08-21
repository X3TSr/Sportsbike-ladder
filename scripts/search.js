/* ==========================================================================
   SEARCH — type a model name from anywhere.

   130 models across seven brands, and until now the only route to a specific
   bike was knowing which brand sold it. This is the shortcut: one field in
   each of the three headers, matching model name, engine label and brand.

   Matching is a normalise-and-substring pass over 130 entries, ranked. At
   this scale that beats an index on every count that matters — no build step,
   no dependency, and the whole thing is legible.

   Normalising away punctuation is what makes it forgiving: "GSX-R125" and
   "gsxr" both come down to gsxr125 and gsxr, so the hyphen a reader never
   types stops mattering.
   ========================================================================== */

(function(SBL){
  "use strict";

  var LIMIT = 8;   /* enough to choose from, few enough to read at a glance */

  function norm(text){ return String(text).toLowerCase().replace(/[^a-z0-9]/g, "") }

  /* Built once. Each entry keeps the shapes the ranking asks about, so the
     work per keystroke is 130 substring tests and a sort. */
  var INDEX = SBL.ALL.map(function(bike){
    return {
      bike:   bike,
      name:   norm(bike.n),
      brand:  norm(bike.brand),
      engine: norm(bike.es),
      words:  bike.n.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
    };
  });

  var BRANDS = Object.keys(SBL.DATA).map(function(key){
    return { key: key, brand: SBL.DATA[key], name: norm(SBL.DATA[key].name) };
  });

  /* Lower is better. The order is the point: someone typing "r7" wants the R7,
     not the four other models with an r and a 7 somewhere in them. */
  function score(entry, q){
    if(entry.name === q)                          return 0;
    if(entry.name.indexOf(q) === 0)               return 1;
    if(entry.words.some(function(word){ return norm(word).indexOf(q) === 0 }))
                                                  return 2;
    if(entry.name.indexOf(q) > 0)                 return 3;
    if((entry.brand + entry.name).indexOf(q) >= 0) return 4;   /* "yamahar7" */
    if(entry.engine.indexOf(q) >= 0)              return 5;    /* "689", "cp2" */
    if(entry.brand.indexOf(q) >= 0)               return 6;
    return -1;
  }

  /* A brand match returns one row rather than every bike it sells: "ducati"
     means take me to Ducati, not here are fifteen Ducatis. */
  SBL.search = function(query){
    var q = norm(query);
    if(q.length < 2) return [];

    var hits = [];

    BRANDS.forEach(function(entry){
      if(entry.name.indexOf(q) !== 0) return;
      hits.push({ rank: -1, kind: "brand", key: entry.key, brand: entry.brand });
    });

    INDEX.forEach(function(entry){
      var rank = score(entry, q);
      if(rank < 0) return;
      hits.push({ rank: rank, kind: "bike", bike: entry.bike });
    });

    /* Within a rank that matched the name, the shorter name wins: "gsxr"
       prefixes both the GSX-R125 and the GSX-R1000R, and the 125 is the
       tighter match. Ranks 5 and 6 matched the engine or the brand instead,
       where name length says nothing, so those stay alphabetical. Either way
       the order never depends on the order the data happens to be in. */
    return hits.sort(function(a, b){
      if(a.rank !== b.rank) return a.rank - b.rank;
      var an = a.kind === "bike" ? a.bike.n : a.brand.name;
      var bn = b.kind === "bike" ? b.bike.n : b.brand.name;
      if(a.rank <= 4 && an.length !== bn.length) return an.length - bn.length;
      return an.localeCompare(bn);
    });
  };

  /* ---------- the field ----------
     One instance per view header, because only one header is ever on screen
     and each keeps its own query. They share nothing but the functions above. */
  var built = 0;

  function build(host){
    var listId = "searchList" + (++built);
    var hits = [], active = -1;

    host.innerHTML =
      '<input class="search-in" type="search" autocomplete="off" spellcheck="false"' +
        ' role="combobox" aria-expanded="false" aria-autocomplete="list"' +
        ' aria-controls="' + listId + '" aria-label="Find a model"' +
        ' placeholder="Find a model — try “gsxr” or “africa”">' +
      '<ul class="search-out" id="' + listId + '" role="listbox" hidden></ul>';

    var input = host.querySelector(".search-in");
    var list  = host.querySelector(".search-out");

    function rowHtml(hit, i){
      var id = listId + "-" + i;
      var selected = i === active;
      if(hit.kind === "brand"){
        return '<li role="option" id="' + id + '" data-i="' + i + '"' +
          ' aria-selected="' + selected + '"' + (selected ? ' class="on"' : "") + '>' +
          '<span class="s-dot" style="background:' + hit.brand.accent + '"></span>' +
          '<span class="s-name">' + hit.brand.name + '</span>' +
          '<span class="s-meta">' + hit.brand.bikes.length + ' models</span></li>';
      }
      return '<li role="option" id="' + id + '" data-i="' + i + '"' +
        ' aria-selected="' + selected + '"' + (selected ? ' class="on"' : "") + '>' +
        '<span class="s-dot" style="background:' + hit.bike.accent + '"></span>' +
        '<span class="s-name">' + hit.bike.n + '</span>' +
        '<span class="s-meta">' + hit.bike.brand + ' &middot; ' + hit.bike.es + '</span></li>';
    }

    function render(){
      var shown = hits.slice(0, LIMIT);
      var rest  = hits.length - shown.length;

      if(!input.value.trim()){
        close();
        return;
      }

      list.innerHTML = shown.length
        ? shown.map(rowHtml).join("") +
          (rest ? '<li class="s-more" aria-hidden="true">and ' + rest + ' more</li>' : "")
        : '<li class="s-none" aria-hidden="true">Nothing matches &ldquo;' +
            input.value.trim().replace(/[<&]/g, "") + '&rdquo;</li>';

      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      input.setAttribute("aria-activedescendant",
        active >= 0 ? listId + "-" + active : "");
    }

    function close(){
      list.hidden = true;
      list.innerHTML = "";
      active = -1;
      input.setAttribute("aria-expanded", "false");
      input.setAttribute("aria-activedescendant", "");
    }

    /* Arrowing past either end lands back on "nothing chosen" rather than
       wrapping straight round, so there is always a way back to the query as
       typed. -1 is that state, which is why the arithmetic is offset by one. */
    function move(step){
      var shown = Math.min(hits.length, LIMIT);
      if(!shown) return;
      var slots = shown + 1;
      active = ((active + 1 + step) % slots + slots) % slots - 1;
      render();
      var el = list.querySelector(".on");
      if(el) el.scrollIntoView({ block: "nearest" });
    }

    function pick(i){
      var hit = hits[i];
      if(!hit) return;
      input.value = "";
      close();
      if(hit.kind === "brand") SBL.goToBrand(hit.key);
      else SBL.goToBike(hit.bike);
    }

    input.addEventListener("input", function(){
      hits = SBL.search(input.value);
      active = -1;
      render();
    });

    input.addEventListener("keydown", function(e){
      if(e.key === "ArrowDown"){ e.preventDefault(); move(1) }
      else if(e.key === "ArrowUp"){ e.preventDefault(); move(-1) }
      else if(e.key === "Enter"){
        if(!hits.length) return;
        e.preventDefault();
        pick(active >= 0 ? active : 0);   /* Enter with nothing chosen takes the best match */
      }
      else if(e.key === "Escape"){
        if(list.hidden){ input.value = "" } else { close() }
      }
    });

    /* mousedown rather than click, and prevented, so the field does not blur
       out from under the pointer before the option registers. */
    list.addEventListener("mousedown", function(e){
      var row = e.target.closest("[data-i]");
      if(!row) return;
      e.preventDefault();
      pick(Number(row.dataset.i));
    });

    input.addEventListener("blur", close);

    return input;
  }

  var fields = [].map.call(document.querySelectorAll("[data-search]"), build);

  /* "/" is the search key everywhere else on the web, and the only field on
     the page it could collide with is this one. */
  document.addEventListener("keydown", function(e){
    if(e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    var open = fields.find(function(input){ return input.offsetParent !== null });
    if(!open) return;
    e.preventDefault();
    open.focus();
  });

})(window.SBL);
