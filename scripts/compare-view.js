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

  var ladder = SBL.createLadder(ladderEl, {
    nameCell: function(bike){
      return '<div class="lname" style="cursor:default">' +
        '<span class="cbrand">' + bike.brand + '</span>' + bike.n +
        '<span class="tag">' + bike.es + '</span></div>';
    },
    barStyle: function(bike){ return "background:" + bike.accent }
  });
  ladder.build(SBL.ALL);

  /* ---------- year chips ---------- */
  var yearChips = SBL.buildYearChips(document.getElementById("cmpYears"), {
    count:  function(y){ return SBL.specsFor(SBL.ALL, y).length },
    onPick: function(y){ year = y; draw() }
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

    return '<div class="pcol">' +
      '<h4><span class="dot" style="background:' + brand.accent + '"></span>' + brand.name +
        '<button class="all" data-allb="' + key + '">toggle</button></h4>' +
      groups +
    '</div>';
  }).join("");

  function syncBoxes(){
    pickerGrid.querySelectorAll("input").forEach(function(input){
      input.checked = selected.has(input.dataset.uid);
    });
  }

  /* ---------- draw ---------- */
  function draw(){
    yearChips.render(year);
    document.getElementById("cmpYearNote").innerHTML = SBL.yearNote(SBL.ALL, year);

    var list = SBL.specsFor(
      SBL.ALL.filter(function(bike){ return selected.has(bike.uid) }), year);

    emptyState.classList.toggle("hidden", list.length > 0);
    ladderEl.classList.toggle("hidden", list.length === 0);
    document.getElementById("cmpCount").textContent =
      list.length + " of " + SBL.ALL.length + " models shown" +
      (year === null ? "" : " · " + year + " model year");
    document.getElementById("cmpNote").textContent = SBL.METRICS[metric].note;

    var sorted = ladder.render(metric, list);
    document.getElementById("cmpBody").innerHTML = sorted.map(function(bike){
      return '<tr class="' + (bike.isHistoric ? "historic-row" : "") + '">' +
        '<th>' + bike.n + '</th><td>' + bike.brand + '</td>' +
        '<td>' + SBL.CATEGORIES[bike.cat].name + '</td>' +
        '<td>' + bike.es + '</td><td>' + bike.p + ' PS</td><td>' + bike.t + ' Nm</td>' +
        '<td>' + bike.w + ' kg</td><td>' + bike.ptw.toFixed(2) + '</td>' +
        '<td>' + cell(bike, "a", "~" + bike.a + " s") + '</td>' +
        '<td>' + cell(bike, "ts", "~" + bike.ts) + '</td>' +
        '<td>' + bike.s + ' mm</td><td>' + bike.l + '</td></tr>';
    }).join("");
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
  });

  function selectWhere(matches){
    selected.clear();
    SBL.ALL.forEach(function(bike){ if(matches(bike)) selected.add(bike.uid) });
    syncBoxes();
    draw();
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

  SBL.bindMetricButtons(view, function(metricId){ metric = metricId; draw() });

  SBL.compareView = {
    draw: draw,
    isOpen: function(){ return !view.classList.contains("hidden") }
  };

})(window.SBL);
