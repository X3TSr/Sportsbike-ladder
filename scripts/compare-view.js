/* ==========================================================================
   COMPARE VIEW — every model from every brand on one ladder.

   Selection lives in a Set of uids. The checkbox grid, the category filters,
   the licence filters and the per-brand toggles all write to that Set and
   then ask for a redraw.
   ========================================================================== */

(function(SBL){
  "use strict";

  var view       = document.getElementById("cmpView");
  var pickerGrid = document.getElementById("pickerGrid");
  var emptyState = document.getElementById("cmpEmpty");
  var ladderEl   = document.getElementById("cmpLadder");

  var selected = new Set(SBL.ALL.map(function(b){ return b.uid }));
  var metric   = "power";
  var year     = null;
  var genMode  = false;
  var maxSeat  = null;

  /* Every generation of every model, flattened. Built once; the ladder is
     rebuilt from this list when generation mode is switched on, because the
     rows are keyed by uid and a model contributes several of them here. */
  var GENERATIONS = SBL.ALL.reduce(function(acc, bike){
    return acc.concat(SBL.generationsOf(bike));
  }, []);

  var ladder = SBL.createLadder(ladderEl, {
    nameCell: function(bike){
      return '<div class="lname" style="cursor:default">' +
        '<span class="cbrand">' + bike.brand + '</span>' + bike.n +
        (bike.gLabel ? ' <span class="gyr">' + bike.gLabel + '</span>' : "") +
        '<span class="tag">' + bike.es + '</span></div>';
    },
    barStyle: function(bike){ return "background:" + bike.accent }
  });
  ladder.build(SBL.ALL);

  /* ---------- year chips ---------- */
  var yearChips = SBL.buildYearChips(document.getElementById("cmpYears"), {
    count:  function(y){ return SBL.specsFor(SBL.ALL, y).length },
    onPick: function(y){ year = y; draw(); SBL.stateChanged() }
  });

  /* ---------- seat height ----------
     Seat height is the one number in the data that decides whether a bike is
     usable rather than how fast it is, and it sits in a 690–905 mm band that
     no chip row would divide sensibly — the threshold that matters is the
     rider's, not one of six the site picked. Hence a slider, at the top of
     its travel by default, where it means no limit rather than 905 mm. */
  var seatSlider = document.getElementById("cmpSeat");
  var seatValue  = document.getElementById("cmpSeatVal");
  var seatClear  = document.getElementById("cmpSeatClear");

  seatSlider.min   = SBL.SEAT_MIN;
  seatSlider.max   = SBL.SEAT_MAX;
  seatSlider.step  = SBL.SEAT_STEP;
  seatSlider.value = SBL.SEAT_MAX;

  /* null means no limit, so nothing downstream has to know that the top of
     the slider's travel is a special case. */
  function readSeat(){
    var mm = Number(seatSlider.value);
    return mm >= SBL.SEAT_MAX ? null : mm;
  }

  seatSlider.addEventListener("input", function(){
    maxSeat = readSeat();
    draw();
    SBL.stateChanged();
  });

  seatClear.addEventListener("click", function(){
    maxSeat = null;
    seatSlider.value = SBL.SEAT_MAX;
    draw();
    SBL.stateChanged();
  });

  /* ---------- generation mode ----------
     Answers "how does this bike compare with its own earlier self", which a
     single global year cannot: the year selector shows one year at a time,
     so a model can never sit beside another version of itself. */
  var genToggle = document.getElementById("cmpGenToggle");
  genToggle.addEventListener("click", function(){
    genMode = !genMode;
    genToggle.setAttribute("aria-pressed", genMode ? "true" : "false");
    document.getElementById("cmpYears").classList.toggle("hidden", genMode);
    ladder.build(genMode ? GENERATIONS : SBL.ALL);
    draw();
    SBL.stateChanged();
  });

  /* ---------- category filter buttons ---------- */
  document.getElementById("cmpCats").innerHTML = SBL.CATEGORY_ORDER.map(function(cat){
    return '<button class="qbtn" data-cat="' + cat + '">' + SBL.CATEGORIES[cat].name +
      ' <span class="cat-n">' + SBL.countIn(SBL.ALL, cat) + '</span></button>';
  }).join("");

  /* ---------- checkbox grid, grouped by category within each brand ---------- */
  pickerGrid.innerHTML = Object.keys(SBL.DATA).map(function(key){
    var brand = SBL.DATA[key];

    var groups = brand.cats.map(function(cat){
      var bikes = brand.bikes.filter(function(b){ return b.cat === cat });
      return '<p class="pcat">' + SBL.CATEGORIES[cat].name + '</p>' +
        bikes.map(function(bike){
          return '<label><input type="checkbox" checked data-uid="' + bike.uid + '"> ' +
            bike.n + '</label>';
        }).join("");
    }).join("");

    /* <details> so narrow screens can collapse 125 checkboxes into seven
       headings. Opened on wide screens below, where the space exists. */
    return '<details class="pcol" data-brand="' + key + '">' +
      '<summary><span class="dot" style="background:' + brand.accent + '"></span>' +
        brand.name + '<span class="pcount">' + brand.bikes.length + '</span></summary>' +
      '<button class="all" data-allb="' + key + '">toggle all</button>' +
      groups +
    '</details>';
  }).join("");

  /* Open by default where there is room; collapsed on phones. Re-evaluated on
     resize so rotating a tablet does not leave every group shut. */
  var wide = window.matchMedia("(min-width:700px)");
  function syncOpen(){
    pickerGrid.querySelectorAll(".pcol").forEach(function(d){ d.open = wide.matches });
  }
  syncOpen();
  wide.addEventListener("change", syncOpen);

  function syncBoxes(){
    pickerGrid.querySelectorAll("input").forEach(function(input){
      input.checked = selected.has(input.dataset.uid);
    });
  }

  /* ---------- draw ---------- */
  function draw(){
    yearChips.render(year);
    document.getElementById("cmpYearNote").innerHTML = genMode
      ? "Each selected model appears once per generation on record, so you can " +
        "put a bike beside its own earlier self. A model with a single row is " +
        "one whose earlier specs are not recorded — not necessarily one that " +
        "never changed."
      : SBL.yearNote(SBL.ALL, year);

    var list = genMode
      ? GENERATIONS.filter(function(g){ return selected.has(g.baseUid) })
      : SBL.specsFor(
          SBL.ALL.filter(function(bike){ return selected.has(bike.uid) }), year);

    /* Seat height narrows what is drawn rather than what is ticked, so it
       stacks with the year, category and licence filters instead of
       overwriting the selection the way the quick buttons do. Applied after
       the year resolves, so a generation is measured on its own seat. */
    var tooTall = maxSeat
      ? list.filter(function(spec){ return spec.s > maxSeat }) : [];
    if(maxSeat) list = list.filter(function(spec){ return spec.s <= maxSeat });
    renderSeat(tooTall);

    emptyState.classList.toggle("hidden", list.length > 0);
    ladderEl.classList.toggle("hidden", list.length === 0);
    var models = genMode
      ? new Set(list.map(function(g){ return g.baseUid })).size : 0;
    var hidden = tooTall.length
      ? " · " + tooTall.length + " over " + maxSeat + " mm hidden" : "";
    document.getElementById("cmpCount").textContent = (genMode
      ? plural(list.length, "generation") + " across " + plural(models, "model")
      : list.length + " of " + SBL.ALL.length + " models shown" +
        (year === null ? "" : " · " + year + " model year")) + hidden;
    document.getElementById("cmpNote").textContent = SBL.METRICS[metric].note;

    var sorted = ladder.render(metric, list);
    document.getElementById("cmpBody").innerHTML = sorted.map(function(bike){
      return '<tr class="' + (bike.isHistoric ? "historic-row" : "") + '">' +
        '<th>' + bike.n +
          (bike.gLabel ? ' <span class="gyr">' + bike.gLabel + '</span>' : "") +
        '</th><td>' + bike.brand + '</td>' +
        '<td>' + SBL.CATEGORIES[bike.cat].name + '</td>' +
        '<td>' + bike.es + '</td><td>' + bike.p + ' PS</td><td>' + bike.t + ' Nm</td>' +
        '<td>' + bike.w + ' kg</td><td>' + bike.ptw.toFixed(2) + '</td>' +
        '<td>' + cell(bike, "a", "~" + bike.a + " s") + '</td>' +
        '<td>' + cell(bike, "ts", "~" + bike.ts) + '</td>' +
        '<td>' + bike.s + ' mm</td>' +
        '<td>' + (SBL.tyrePair(bike, "rim", "in") || "&mdash;") + '</td>' +
        '<td>' + SBL.licenceLabel(bike) + '</td></tr>';
    }).join("");
  }

  function plural(n, word){ return n + " " + word + (n === 1 ? "" : "s") }

  /* The slider's own readout and caveat.

     The caveat is not boilerplate: seat height is the only figure here that
     people treat as a measurement of themselves, and it is a poor one. It
     appears whenever a limit is set, because that is exactly when someone is
     about to rule a bike out on 10 mm.

     The filter matches the standard seat and nothing else. A lowered variant
     or a low-seat accessory is a different bike or a different invoice, so
     quietly letting one through would break the promise the slider makes —
     but silently dropping it would be worse, so the models that come within
     reach that way are named underneath. */
  function renderSeat(tooTall){
    seatValue.textContent = maxSeat ? maxSeat + " mm" : "no limit";
    seatValue.classList.toggle("off", !maxSeat);
    seatClear.hidden = !maxSeat;

    if(!maxSeat){
      document.getElementById("cmpSeatNote").innerHTML = "";
      return;
    }

    /* By model, not by row: generation mode puts a bike on the ladder several
       times over, and naming it once per generation would read as several
       different machines. */
    var reachable = [];
    tooTall.forEach(function(spec){
      if(!spec.sLow || spec.sLow > maxSeat) return;
      if(reachable.some(function(seen){ return seen.n === spec.n })) return;
      reachable.push(spec);
    });

    var note = "Showing bikes with a standard seat at or below <b>" + maxSeat +
      " mm</b>. Seat height is a proxy for reach rather than a measurement of " +
      "it: a narrow 830 mm seat can be easier to get a foot down on than a wide " +
      "810 mm one, and the suspension gives some of it back under your own " +
      "weight. Treat it as a way to shorten a list, then go and sit on them.";

    if(reachable.length){
      note += " " + reachable.length + " of the hidden " +
        (reachable.length === 1 ? "models comes" : "models come") +
        " down to this height with a lower seat or a lowered version: " +
        reachable.map(function(spec){
          return spec.brand + " " + spec.n + " (" + spec.sLow + " mm)";
        }).join(", ") + ". Those are not shown, because the standard bike is " +
        "the one the figures describe.";
    }

    document.getElementById("cmpSeatNote").innerHTML = note;
  }

  function cell(bike, key, text){
    return SBL.isEstimated(bike, key)
      ? '<span class="est" title="Estimated, not a published figure">' + text + '</span>'
      : text;
  }

  /* ---------- selection ---------- */
  pickerGrid.addEventListener("change", function(e){
    var uid = e.target.dataset.uid;
    if(!uid) return;
    if(e.target.checked) selected.add(uid); else selected.delete(uid);
    draw();
    SBL.stateChanged();
  });

  /* per-brand "toggle": clears the brand if it is fully selected, else selects it */
  pickerGrid.addEventListener("click", function(e){
    var button = e.target.closest("[data-allb]");
    if(!button) return;
    var mine = SBL.ALL.filter(function(b){ return b.bkey === button.dataset.allb });
    var allOn = mine.every(function(b){ return selected.has(b.uid) });
    mine.forEach(function(b){ allOn ? selected.delete(b.uid) : selected.add(b.uid) });
    syncBoxes();
    draw();
    SBL.stateChanged();
  });

  function selectWhere(matches){
    selected.clear();
    SBL.ALL.forEach(function(bike){ if(matches(bike)) selected.add(bike.uid) });
    syncBoxes();
    draw();
    SBL.stateChanged();
  }

  /* A2 here means "an A2 licence reaches it", which includes the bikes that
     only get there restricted — the whole point of computing the class rather
     than matching a label is that those are not a separate case. */
  var FILTERS = {
    all:   function(){ return true },
    none:  function(){ return false },
    A1:    function(bike){ return SBL.licence(bike).cls === "A1" },
    A2:    function(bike){ var c = SBL.licence(bike).cls; return c === "A1" || c === "A2" },
    road:  function(bike){ return !SBL.isTrackOnly(bike) },
    track: function(bike){ return SBL.isTrackOnly(bike) }
  };

  view.querySelectorAll(".qbtn[data-q]").forEach(function(button){
    button.addEventListener("click", function(){
      selectWhere(FILTERS[button.dataset.q] || FILTERS.none);
    });
  });

  document.getElementById("cmpCats").addEventListener("click", function(e){
    var button = e.target.closest("[data-cat]");
    if(!button) return;
    var cat = button.dataset.cat;
    selectWhere(function(bike){ return bike.cat === cat });
  });

  var metricButtons = SBL.bindMetricButtons(view, function(metricId){
    metric = metricId;
    draw();
    SBL.stateChanged();
  });

  SBL.compareView = {
    draw: draw,
    isOpen: function(){ return !view.classList.contains("hidden") },

    /* ---------- router ---------- */
    state: function(){
      return { metric: metric, year: year, gen: genMode,
               maxSeat: maxSeat, selected: selected };
    },

    /* A selection of null means the URL carried none, which is the common
       case and means everything — not nothing. */
    setState: function(s){
      metric  = s.metric;
      year    = s.year;
      genMode = s.gen;

      /* A seat limit outside the slider's own travel is no limit at all — the
         hash is user-editable, and a value below the shortest bike would leave
         an empty ladder under a control that looks untouched. Snapped to the
         step as well, so the number in the URL and the number under the slider
         cannot disagree. */
      seatSlider.value = s.maxSeat || SBL.SEAT_MAX;
      maxSeat = (s.maxSeat >= SBL.SEAT_MIN) ? readSeat() : null;
      if(!maxSeat) seatSlider.value = SBL.SEAT_MAX;

      if(s.selected){
        selected = s.selected;
      }else{
        selected = new Set(SBL.ALL.map(function(b){ return b.uid }));
      }

      metricButtons.reset(metric);
      genToggle.setAttribute("aria-pressed", genMode ? "true" : "false");
      document.getElementById("cmpYears").classList.toggle("hidden", genMode);
      ladder.build(genMode ? GENERATIONS : SBL.ALL);
      syncBoxes();
    }
  };

})(window.SBL);
