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
  /* Sort metric from a URL, held until the brand page actually opens —
     the buttons do not exist as state until then. */
  var pendingMetric = null;

  var ladder = SBL.createLadder(document.getElementById("ladder"), {
    nameCell: function(bike){
      return '<div class="lname" role="button" tabindex="0" data-t="' + bike.id + '">' +
        bike.n + '<span class="tag">' + bike.es + '</span></div>';
    }
  });

  var metricButtons = SBL.bindMetricButtons(view, function(metricId){
    draw(metricId);
    SBL.stateChanged();
  });

  /* ---------- picker: category chips ---------- */
  var pickerChips = SBL.buildCategoryChips(document.getElementById("pickerCats"), {
    total:      function(){ return SBL.ALL.length },
    count:      function(cat){ return SBL.countIn(SBL.ALL, cat) },
    showCounts: true,
    onPick:     function(cat){ pickerCat = cat; renderPicker(); SBL.stateChanged() }
  });

  var pickerYearChips = SBL.buildYearChips(document.getElementById("pickerYears"), {
    count:  function(y){ return SBL.specsFor(SBL.ALL, y).length },
    onPick: function(y){ pickerYear = y; renderPicker(); SBL.stateChanged() }
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
        ' style="--bc-light:' + brand.accent + ';--bc-dark:' + brand.accentDark + '">' +
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
    onPick:     function(cat){ brandCat = cat; refreshBrandBody(); SBL.stateChanged() }
  });

  var brandYearChips = SBL.buildYearChips(document.getElementById("brandYears"), {
    count:  function(y){ return current ? SBL.specsFor(current.bikes, y).length : 0 },
    onPick: function(y){ brandYear = y; refreshBrandBody(); SBL.stateChanged() }
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

    /* Both halves of the pair, so a theme change is a CSS resolution rather
       than a re-render — see the token block at the top of base.css. */
    document.documentElement.style.setProperty("--accent-light", brand.accent);
    document.documentElement.style.setProperty("--accent-dark", brand.accentDark);
    document.getElementById("bEyebrow").textContent = brand.series + " · 2026 · EU market";
    document.getElementById("bTitle").textContent   = brand.name;
    document.getElementById("bLede").textContent    = brand.lede;

    ladder.build(brand.bikes);
    renderNotes(brand);
    metricButtons.reset(pendingMetric || "power");
    pendingMetric = null;
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
    /* The whole field, resolved to the year on screen, so a card can say
       where its bike sits among every machine of its kind rather than only
       among the ones the category filter has left showing. Built once per
       render because each card asks it three questions. */
    renderCards(bikes, SBL.specsFor(SBL.ALL, brandYear));
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

    /* Speed rating keeps its row even when it is empty. Dropping it would say
       the tyre has no rating, and every road tyre sold in Europe has one
       moulded on the sidewall — what is missing is the manufacturer's
       willingness to print it on a spec page. The note below says which. */
    var speedRow = '<div><dt>Speed rating</dt><dd>' +
      [f, r].map(function(s){
        return '<span class="wcol">' + (s.speed || "&mdash;") + '</span>';
      }).join("") + '</dd></div>';

    /* What the symbols certify, listed once however many distinct ratings the
       two ends carry. The letter alone tells a reader nothing. */
    var speeds = [f, r].filter(function(s){ return s.speedTo })
      .map(function(s){ return s.speed + " = " + s.speedTo + " km/h" })
      .filter(function(t, i, all){ return all.indexOf(t) === i });

    var note = (f.profile === null || r.profile === null)
      ? "Racing slicks: no speed rating, and the second number is overall diameter in mm rather than a profile"
      : (!f.speed || !r.speed)
        ? current.name + " does not publish it — the tyres themselves carry one"
        : "";

    return '<div class="whead"><dt>Wheels</dt><dd>' +
             '<span class="wcol">front</span><span class="wcol">rear</span></dd></div>' +
           row("Rim", "rim", "in") +
           row("Tyre width", "width", "mm") +
           row("Profile", "profile", "%") +
           speedRow +
           '<div><dt>Tyres</dt><dd><span class="tyres">' +
             bike.tyreF + '<br>' + bike.tyreR +
             (speeds.length ? '<br>' + speeds.join(" &middot; ") : "") +
             (note ? '<br>' + note : "") +
           '</span></dd></div>';
  }

  /* The licence class with its working shown. The badge at the top of the
     card gives the answer; this gives the two numbers it was reached from and
     the limit they were measured against, because "A" and "A / A2 kit" are
     conclusions, and a reader deciding what they can ride deserves to see
     which line the bike falls on and by how much. */
  function licenceBlock(bike){
    var licence = SBL.licence(bike);
    return '<div class="licrow"><dt>Licence</dt><dd>' + licence.label +
      '<span class="lic-why' + (licence.onLimit ? " hedged" : "") + '">' +
        licence.why + '</span></dd></div>';
  }

  /* Price, and the two things that stop it being read as a quote: which
     market it is from, and how long ago it was true. Every other figure here
     is a property of the machine and stays put; this one is a snapshot of a
     market, and it is the only field on the card that will be wrong through
     nobody's fault in six months. */
  function priceBlock(bike){
    if(!bike.price){
      return '<div><dt>Price</dt><dd><span class="unknown">' +
        (bike.isHistoric
          ? "not recorded for this model year"
          : "not published where this site can read it") +
        '</span></dd></div>';
    }
    return '<div><dt>Price</dt><dd>&pound;' + bike.price.toLocaleString("en-GB") +
      '<span class="rank">' + SBL.PRICE_BASIS + '</span>' +
      '<span class="rank">&pound;' + Math.round(bike.pricePerPs) + ' per PS</span>' +
      '</dd></div>';
  }

  /* A figure and where it places among every machine of the same kind. */
  function ranked(bike, field, peers, value){
    var place = SBL.rankIn(bike, field, peers);
    return value + (place ? '<span class="rank">' + place + '</span>' : "");
  }

  function renderCards(bikes, peers){
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
          '<span class="lic ' + (SBL.isTrackOnly(bike) ? "track-only" : "") + '">' +
            SBL.licenceLabel(bike) + '</span>' +
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
          /* kW alongside PS only where the manufacturer publishes it. It is
             the unit the licence limits are written in, so a reader checking
             the licence row against the rule needs the real figure — and a
             converted one printed the same way would look just as solid. */
          '<div><dt>Power</dt><dd>' + ranked(bike, "p", peers, bike.p + ' PS' +
            (bike.kw !== undefined ? ' &middot; ' + bike.kw + ' kW' : "")) + '</dd></div>' +
          '<div><dt>Torque</dt><dd>' + bike.t + ' Nm</dd></div>' +
          '<div><dt>Wet weight</dt><dd>' +
            ranked(bike, "w", peers, bike.w + ' kg') + '</dd></div>' +
          /* The spec table has carried power-to-weight all along and the card
             never has, which left the one figure that best predicts how a
             bike feels visible only in a table nobody scrolls to. */
          '<div><dt>Power to weight</dt><dd>' +
            ranked(bike, "ptw", peers, bike.ptw.toFixed(2) + ' PS/kg') + '</dd></div>' +
          '<div><dt>0–100 km/h</dt><dd>' + cell(bike, "a", "~" + bike.a + " s") + '</dd></div>' +
          '<div><dt>Top speed</dt><dd>' + cell(bike, "ts", "~" + bike.ts + " km/h") + '</dd></div>' +
          '<div><dt>Seat height</dt><dd>' + bike.s + ' mm</dd></div>' +
          priceBlock(bike) +
          wheelBlock(bike) +
          licenceBlock(bike) +
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

  function priceCell(bike){
    return bike.price ? "&pound;" + bike.price.toLocaleString("en-GB") : "&mdash;";
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
        '<td>' + priceCell(bike) + '</td>' +
        '<td>' + SBL.licenceLabel(bike) + '</td></tr>';
    }).join("");
  }

  function renderNotes(brand){
    document.getElementById("bNotes").innerHTML = brand.notes.map(function(note){
      return '<div><h4>' + note[0] + '</h4><p>' + note[1] + '</p></div>';
    }).join("");
  }

  /* A price-sorted ladder can only hold the models that have one. Dropping
     them silently would make the ladder look like the whole range, so the
     note under it says how many are missing and why. */
  function draw(metricId){
    if(!current) return;
    var all   = visibleBikes();
    var shown = SBL.withMetric(all, metricId);
    ladder.render(metricId, shown);

    var missing = all.length - shown.length;
    document.getElementById("metricNote").textContent =
      SBL.METRICS[metricId].note +
      (missing ? " " + missing + " of " + current.name + "'s " + all.length +
                 " here " + (missing === 1 ? "has" : "have") +
                 " no published price and so cannot be ranked on it." : "");
  }

  renderPicker();

  SBL.brandView = {
    open: open,
    close: function(){ current = null },

    /* ---------- router ----------
       The picker and the brand page keep separate category and year
       filters, but only one of them is ever on screen, so the router sees a
       single pair and does not need to know which view owns it. */
    state: function(){
      return current
        ? { brand: current.key, cat: brandCat, year: brandYear,
            metric: metricButtons.active() || "power" }
        : { brand: null, cat: pickerCat, year: pickerYear, metric: "power" };
    },

    /* Seeds the filters before the view is shown. Setting the picker's copy
       too means going back from a brand lands on a picker filtered the same
       way, which is what a reader who filtered then drilled in expects. */
    setState: function(s){
      pickerCat  = s.cat;
      pickerYear = s.year;
      /* open() derives the brand page's own filters from the picker's, so
         seeding the picker is enough; only the metric needs holding. */
      if(s.brand) pendingMetric = s.metric;
      renderPicker();
    },

    /* Clear whichever filters would hide one particular model, before its
       brand page opens. Someone who typed a bike's name into the search field
       has asked for that bike; a category chip left over from earlier is not
       a reason to hand them a page it is filtered out of. The year is only
       dropped when the model was genuinely not on sale then. */
    prepareFor: function(bike){
      pickerCat = null;
      if(!SBL.specFor(bike, pickerYear)) pickerYear = null;
    },

    /* re-lay the ladder after a resize changes --row-h */
    refresh: function(){
      var active = metricButtons.active();
      if(active && current) draw(active);
    }
  };

})(window.SBL);
