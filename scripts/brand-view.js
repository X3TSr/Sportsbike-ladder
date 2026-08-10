/* ==========================================================================
   BRAND VIEW — the picker (category chips + brand grid), and the
   single-manufacturer page it opens.

   Two category selections are in play: the one on the picker, which decides
   what the brand tiles summarise, and the one on the brand page itself. The
   picker's choice seeds the brand page's when you open a brand, after which
   they move independently.
   ========================================================================== */

(function(SBL){
  "use strict";

  var view       = document.getElementById("brandView");
  var brandGrid  = document.getElementById("brandGrid");
  var current    = null;
  var pickerCat  = null;
  var brandCat   = null;

  var ladder = SBL.createLadder(document.getElementById("ladder"), {
    nameCell: function(bike){
      return '<div class="lname" role="button" tabindex="0" data-t="' + bike.id + '">' +
        bike.n + '<span class="tag">' + bike.es + '</span></div>';
    }
  });

  var metricButtons = SBL.bindMetricButtons(view, function(metricId){ draw(metricId) });

  /* ---------- picker: category chips ---------- */
  var pickerChips = SBL.buildCategoryChips(document.getElementById("pickerCats"), {
    total:      function(){ return SBL.ALL.length },
    count:      function(cat){ return SBL.countIn(SBL.ALL, cat) },
    showCounts: true,
    onPick:     function(cat){ pickerCat = cat; renderPicker() }
  });

  function renderPicker(){
    pickerChips.render(pickerCat);
    document.getElementById("catNote").textContent = pickerCat
      ? SBL.CATEGORIES[pickerCat].blurb
      : "Everything the six of them sell on European roads, in one place. Narrow it down, or leave it wide and see how far the spread goes.";
    renderBrandGrid();
  }

  function renderBrandGrid(){
    brandGrid.innerHTML = Object.keys(SBL.DATA).map(function(key){
      var brand = SBL.DATA[key];
      var bikes = SBL.inCategory(brand.bikes, pickerCat);
      if(!bikes.length) return "";

      var power = bikes.map(function(b){ return b.p });
      var label = pickerCat ? SBL.CATEGORIES[pickerCat].name : brand.cats.length + " categories";

      return '<div class="brand" role="button" tabindex="0" data-b="' + key + '"' +
        ' style="--bc:' + brand.accent + '">' +
        '<span class="stripe"></span>' +
        '<span class="inner">' +
          '<h3>' + brand.name + '</h3>' +
          '<span class="sub">' + label + ' &mdash; ' + bikes.length + ' model' +
            (bikes.length === 1 ? "" : "s") + '</span>' +
          '<dl>' +
            '<div><dt>Power</dt><dd>' + Math.min.apply(null, power) + '&ndash;' +
              Math.max.apply(null, power) + ' PS</dd></div>' +
            '<div><dt>Entry licence</dt><dd>' + SBL.entryLicence(bikes) + '</dd></div>' +
          '</dl>' +
          '<span class="go">See the ladder &rarr;</span>' +
        '</span></div>';
    }).join("");
  }

  /* ---------- brand page: category chips ---------- */
  var brandChips = SBL.buildCategoryChips(document.getElementById("brandCats"), {
    total:      function(){ return current ? current.bikes.length : 0 },
    count:      function(cat){ return current ? SBL.countIn(current.bikes, cat) : 0 },
    showCounts: true,
    onPick:     function(cat){ brandCat = cat; refreshBrandBody() }
  });

  function visibleBikes(){
    return SBL.inCategory(current.bikes, brandCat);
  }

  function open(key){
    var brand = SBL.DATA[key];
    if(!brand) return false;
    current = brand;

    /* A brand may not sell into the category the picker was showing —
       fall back to everything rather than opening an empty page. */
    brandCat = (pickerCat && SBL.countIn(brand.bikes, pickerCat)) ? pickerCat : null;

    document.documentElement.style.setProperty("--accent", brand.accent);
    document.getElementById("bEyebrow").textContent = brand.series + " · 2026 · EU market";
    document.getElementById("bTitle").textContent   = brand.name;
    document.getElementById("bLede").textContent    = brand.lede;

    ladder.build(brand.bikes);
    renderNotes(brand);
    metricButtons.reset("power");
    refreshBrandBody();
    return true;
  }

  /* Everything below the header that depends on the category filter. */
  function refreshBrandBody(){
    brandChips.render(brandCat);
    var bikes = visibleBikes();
    renderCards(bikes);
    renderTable(bikes);
    draw(metricButtons.active() || "power");
  }

  function renderCards(bikes){
    document.getElementById("cards").innerHTML = bikes.map(function(bike){
      return '<article class="card" id="' + bike.id + '">' +
        /* The caption is the no-photo state, so it carries the brand and engine
           rather than repeating the model name printed directly beneath it. */
        '<figure class="shot">' +
          '<figcaption><span class="shot-name">' + current.name + '</span>' +
            '<span class="shot-meta">' + bike.es + ' &middot; ' +
            SBL.CATEGORIES[bike.cat].name + '</span></figcaption>' +
          '<img src="' + SBL.imageFor(bike) + '" loading="lazy" decoding="async"' +
            ' alt="' + current.name + ' ' + bike.n + '">' +
        '</figure>' +
        '<div class="card-top">' +
          '<h3>' + bike.n + '</h3>' +
          '<span class="lic ' + (SBL.isTrackOnly(bike) ? "track-only" : "") + '">' + bike.l + '</span>' +
        '</div>' +
        '<p class="cat-tag">' + SBL.CATEGORIES[bike.cat].name + '</p>' +
        '<p class="role">' + bike.r + '</p>' +
        '<dl class="kv">' +
          '<div><dt>Engine</dt><dd>' + bike.e + '</dd></div>' +
          '<div><dt>Power</dt><dd>' + bike.p + ' PS</dd></div>' +
          '<div><dt>Torque</dt><dd>' + bike.t + ' Nm</dd></div>' +
          '<div><dt>Wet weight</dt><dd>' + bike.w + ' kg</dd></div>' +
          '<div><dt>0–100 km/h</dt><dd>' + cell(bike, "a", "~" + bike.a + " s") + '</dd></div>' +
          '<div><dt>Top speed</dt><dd>' + cell(bike, "ts", "~" + bike.ts + " km/h") + '</dd></div>' +
          '<div><dt>Seat height</dt><dd>' + bike.s + ' mm</dd></div>' +
        '</dl>' +
        (bike.x ? '<p class="variant">' + bike.x + '</p>' : "") +
        '<p class="verdict">' + bike.v + '</p>' +
      '</article>';
    }).join("");

    /* No photo on disk yet? Drop the <img> so the patterned caption behind it
       shows through, rather than leaving a broken-image icon in the card.
       The complete/naturalWidth check catches images that already failed
       before this listener was attached; the listener catches the lazy ones
       that have not tried to load yet. */
    document.querySelectorAll("#cards .shot img").forEach(function(img){
      img.addEventListener("error", function(){ img.remove() });
      if(img.complete && img.naturalWidth === 0) img.remove();
    });
  }

  /* Wraps a spec-sheet cell when the figure is derived rather than published. */
  function cell(bike, key, text){
    return SBL.isEstimated(bike, key)
      ? '<span class="est" title="Estimated, not a published figure">' + text + '</span>'
      : text;
  }

  function renderTable(bikes){
    var byPower = bikes.slice().sort(function(a, b){ return b.p - a.p });
    document.getElementById("tbody").innerHTML = byPower.map(function(bike){
      return '<tr><th>' + bike.n + '</th><td>' + SBL.CATEGORIES[bike.cat].name + '</td>' +
        '<td>' + bike.es + '</td><td>' + bike.p + ' PS</td>' +
        '<td>' + bike.t + ' Nm</td><td>' + bike.w + ' kg</td><td>' + bike.ptw.toFixed(2) + '</td>' +
        '<td>' + cell(bike, "a", "~" + bike.a + " s") + '</td>' +
        '<td>' + cell(bike, "ts", "~" + bike.ts) + '</td>' +
        '<td>' + bike.s + ' mm</td><td>' + bike.l + '</td></tr>';
    }).join("");
  }

  function renderNotes(brand){
    document.getElementById("bNotes").innerHTML = brand.notes.map(function(note){
      return '<div><h4>' + note[0] + '</h4><p>' + note[1] + '</p></div>';
    }).join("");
  }

  function draw(metricId){
    if(!current) return;
    ladder.render(metricId, visibleBikes());
    document.getElementById("metricNote").textContent = SBL.METRICS[metricId].note;
  }

  renderPicker();

  SBL.brandView = {
    open: open,
    close: function(){ current = null },
    /* re-lay the ladder after a resize changes --row-h */
    refresh: function(){
      var active = metricButtons.active();
      if(active && current) draw(active);
    }
  };

})(window.SBL);
