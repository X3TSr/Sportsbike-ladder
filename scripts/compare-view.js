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

    emptyState.classList.toggle("hidden", list.length > 0);
    ladderEl.classList.toggle("hidden", list.length === 0);
    var models = genMode
      ? new Set(list.map(function(g){ return g.baseUid })).size : 0;
    document.getElementById("cmpCount").textContent = genMode
      ? plural(list.length, "generation") + " across " + plural(models, "model")
      : list.length + " of " + SBL.ALL.length + " models shown" +
        (year === null ? "" : " · " + year + " model year");
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
        '<td>' + bike.l + '</td></tr>';
    }).join("");
  }

  function plural(n, word){ return n + " " + word + (n === 1 ? "" : "s") }

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

  var FILTERS = {
    all:   function(){ return true },
    none:  function(){ return false },
    A1:    function(bike){ return bike.l === "A1" },
    A2:    function(bike){ return /A2/.test(bike.l) },
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
      return { metric: metric, year: year, gen: genMode, selected: selected };
    },

    /* A selection of null means the URL carried none, which is the common
       case and means everything — not nothing. */
    setState: function(s){
      metric  = s.metric;
      year    = s.year;
      genMode = s.gen;

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
