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
  var pickerYear = null;
  var brandCat   = null;
  var brandYear  = null;

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

  var pickerYearChips = SBL.buildYearChips(document.getElementById("pickerYears"), {
    count:  function(y){ return SBL.specsFor(SBL.ALL, y).length },
    onPick: function(y){ pickerYear = y; renderPicker() }
  });

  function renderPicker(){
    pickerChips.render(pickerCat);
    pickerYearChips.render(pickerYear);
    document.getElementById("pickerYearNote").innerHTML = SBL.yearNote(SBL.ALL, pickerYear);
    document.getElementById("catNote").textContent = pickerCat
      ? SBL.CATEGORIES[pickerCat].blurb
      : "Everything all " + SBL.spellOut(SBL.BRAND_COUNT) + " of them sell on European roads, in one place. Narrow it down, or leave it wide and see how far the spread goes.";
    renderBrandGrid();
  }

  function renderBrandGrid(){
    brandGrid.innerHTML = Object.keys(SBL.DATA).map(function(key){
      var brand = SBL.DATA[key];
      var bikes = SBL.specsFor(SBL.inCategory(brand.bikes, pickerCat), pickerYear);
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

  var brandYearChips = SBL.buildYearChips(document.getElementById("brandYears"), {
    count:  function(y){ return current ? SBL.specsFor(current.bikes, y).length : 0 },
    onPick: function(y){ brandYear = y; refreshBrandBody() }
  });

  /* Bikes for the current category, resolved to the selected model year. */
  function visibleBikes(){
    return SBL.specsFor(SBL.inCategory(current.bikes, brandCat), brandYear);
  }

  function open(key){
    var brand = SBL.DATA[key];
    if(!brand) return false;
    current = brand;

    /* A brand may not sell into the category the picker was showing —
       fall back to everything rather than opening an empty page. */
    brandCat  = (pickerCat && SBL.countIn(brand.bikes, pickerCat)) ? pickerCat : null;
    brandYear = pickerYear;

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
    brandYearChips.render(brandYear);
    document.getElementById("brandYearNote").innerHTML =
      SBL.yearNote(SBL.inCategory(current.bikes, brandCat), brandYear);
    var bikes = visibleBikes();
    renderCards(bikes);
    renderTable(bikes);
    draw(metricButtons.active() || "power");
  }

  /* The tyre designation split into the things printed on the tyre, in two
     labelled columns. Every other row on the card is a single value, so a
     bare "120 / 180" here reads as one number that needs decoding rather
     than as two ends of the bike — hence the front/rear heading, and hence
     both columns are always filled even when they hold the same figure. */
  function wheelBlock(bike){
    var f = SBL.tyreSpec(bike.tyreF), r = SBL.tyreSpec(bike.tyreR);
    if(!f || !r){
      return '<div><dt>Wheels</dt><dd><span class="unknown">not published</span></dd></div>';
    }

    function row(label, field, unit){
      if(f[field] === null && r[field] === null) return "";
      var cell = function(spec){
        return '<span class="wcol">' +
          (spec[field] === null ? "&mdash;" : spec[field] + (unit ? " " + unit : "")) +
          '</span>';
      };
      return '<div><dt>' + label + '</dt><dd>' + cell(f) + cell(r) + '</dd></div>';
    }

    /* What the speed symbols certify, listed once however many distinct
       ratings the two ends carry. The letter alone tells a reader nothing. */
    var speeds = [f, r].filter(function(s){ return s.speedTo })
      .map(function(s){ return s.speed + " = " + s.speedTo + " km/h" })
      .filter(function(t, i, all){ return all.indexOf(t) === i });

    return '<div class="whead"><dt>Wheels</dt><dd>' +
             '<span class="wcol">front</span><span class="wcol">rear</span></dd></div>' +
           row("Rim", "rim", "in") +
           row("Tyre width", "width", "mm") +
           row("Profile", "profile", "%") +
           row("Speed rating", "speed", "") +
           '<div><dt>Tyres</dt><dd><span class="tyres">' +
             bike.tyreF + '<br>' + bike.tyreR +
             (speeds.length ? '<br>' + speeds.join(" &middot; ") : "") +
           '</span></dd></div>';
  }

  function renderCards(bikes){
    document.getElementById("cards").innerHTML = bikes.map(function(bike){
      return '<article class="card' + (bike.isHistoric ? " historic" : "") +
        '" id="' + bike.id + '">' +
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
        '<p class="cat-tag">' + SBL.CATEGORIES[bike.cat].name +
          (bike.isHistoric ? ' <span class="hist-badge">' + brandYear + ' spec</span>' : "") + '</p>' +
        (bike.isHistoric && bike.why ? '<p class="gen-note">' + bike.why + '</p>' : "") +
        /* The role and verdict copy is written for the current model, so when
           an archived spec is on screen it has to be labelled as such rather
           than left to read as a description of the older bike. */
        (bike.isHistoric ? '<p class="prose-label">Written about the current model</p>' : "") +
        '<p class="role">' + bike.r + '</p>' +
        '<dl class="kv">' +
          '<div><dt>Engine</dt><dd>' + bike.e + '</dd></div>' +
          '<div><dt>Power</dt><dd>' + bike.p + ' PS</dd></div>' +
          '<div><dt>Torque</dt><dd>' + bike.t + ' Nm</dd></div>' +
          '<div><dt>Wet weight</dt><dd>' + bike.w + ' kg</dd></div>' +
          '<div><dt>0–100 km/h</dt><dd>' + cell(bike, "a", "~" + bike.a + " s") + '</dd></div>' +
          '<div><dt>Top speed</dt><dd>' + cell(bike, "ts", "~" + bike.ts + " km/h") + '</dd></div>' +
          '<div><dt>Seat height</dt><dd>' + bike.s + ' mm</dd></div>' +
          wheelBlock(bike) +
          /* Which generation these figures belong to. Without this, two years
             showing identical specs looks like the year filter is broken,
             when it usually means the model simply did not change. */
          '<div><dt>Generation</dt><dd>' +
            SBL.genLabel(bike.genFrom || bike.from, bike.genTo || bike.to) +
          '</dd></div>' +
        '</dl>' +
        (bike.x ? '<p class="variant">' + bike.x + '</p>' : "") +
        '<p class="verdict">' + bike.v + '</p>' +
        /* Provenance, stated per model rather than only in the page caveats.
           A reader checking one number should be able to see where it came
           from, or that it has not been checked at all. */
        (SBL.isSourced(bike)
          ? '<p class="prov sourced">Specs verified against ' +
              '<a href="' + bike.src + '" target="_blank" rel="noopener">' +
              SBL.sourceHost(bike.src) + '</a></p>'
          : '<p class="prov">Specs not yet verified against a source</p>') +
      '</article>';
    }).join("");

    /* No photo on disk yet? Drop the <img> so the patterned caption behind it
       shows through, rather than leaving a broken-image icon in the card.
       The complete/naturalWidth check catches images that already failed
       before this listener was attached; the listener catches the lazy ones
       that have not tried to load yet. */
    document.querySelectorAll("#cards .shot img").forEach(function(img){
      var figure = img.parentNode;

      /* has-shot is added only once a photo has actually decoded. Narrow
         screens give the slot no height until then, so the common case —
         no file on disk — costs nothing, and lazy images further down the
         page cannot collapse the layout under the reader's thumb as they
         fail one by one. */
      img.addEventListener("load", function(){ figure.classList.add("has-shot") });
      img.addEventListener("error", function(){ img.remove() });

      if(img.complete){
        if(img.naturalWidth === 0) img.remove();
        else figure.classList.add("has-shot");
      }
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
        '<td>' + bike.s + ' mm</td>' +
        '<td>' + (SBL.tyrePair(bike, "rim", "in") || "&mdash;") + '</td>' +
        '<td>' + bike.l + '</td></tr>';
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
