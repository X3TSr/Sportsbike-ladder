/* ==========================================================================
   FINDER — the three questions a rider actually starts with.

   The site could already answer "A2 licence, 80 cm inseam, £8,000" — the
   licence class is computed from the figures, seat height and price are both
   filterable — but only as three separate controls buried in step one of the
   compare view, with nothing on the front page suggesting you could ask.

   So this asks. It owns no filtering logic of its own: it counts with the
   same predicates the compare view uses and then hands that view a starting
   position, because the answer to "what can I ride" is a ladder you carry on
   adjusting, not a separate list that dead-ends.
   ========================================================================== */

(function(SBL){
  "use strict";

  var host = document.getElementById("finder");
  if(!host) return;

  var want = { licence: "any", maxSeat: null, maxPrice: null };

  var LICENCES = [
    { key: "any", label: "Any",       note: "everything on the site" },
    { key: "A1",  label: "A1",        note: "125 cc, 11 kW" },
    { key: "A2",  label: "A2",        note: "35 kW, and the A1 machines under it" },
    { key: "A",   label: "Full (A)",  note: "every road-legal machine" }
  ];

  host.innerHTML =
    '<div class="find-row">' +
      '<p class="filter-label">Licence</p>' +
      '<div class="cats" id="findLic" role="group" aria-label="Your licence"></div>' +
    '</div>' +
    '<div class="find-row">' +
      '<p class="filter-label">Seat height</p>' +
      '<div class="seat">' +
        '<input type="range" id="findSeat" aria-label="Maximum seat height in millimetres">' +
        '<output class="seat-val" id="findSeatVal" for="findSeat"></output>' +
      '</div>' +
    '</div>' +
    '<div class="find-row">' +
      '<p class="filter-label">Budget</p>' +
      '<div class="seat">' +
        '<input type="range" id="findPrice" aria-label="Maximum price in pounds">' +
        '<output class="seat-val" id="findPriceVal" for="findPrice"></output>' +
      '</div>' +
    '</div>' +
    '<p class="find-count" id="findCount" role="status"></p>' +
    '<button class="qbtn find-go" id="findGo">Show them on the ladder &rarr;</button>';

  var lic   = document.getElementById("findLic");
  var seat  = document.getElementById("findSeat");
  var price = document.getElementById("findPrice");

  seat.min   = SBL.SEAT_MIN;  seat.max  = SBL.SEAT_MAX;  seat.step  = SBL.SEAT_STEP;
  price.min  = SBL.PRICE_MIN; price.max = SBL.PRICE_CAP; price.step = SBL.PRICE_STEP;
  seat.value = SBL.SEAT_MAX;  price.value = SBL.PRICE_CAP;

  /* The top of each slider's travel means no limit, exactly as it does on
     the compare view — the two controls are the same control. */
  function readSeat(){
    var mm = Number(seat.value);
    return mm >= SBL.SEAT_MAX ? null : mm;
  }
  function readPrice(){
    var amount = Number(price.value);
    return amount >= SBL.PRICE_CAP ? null : amount;
  }

  /* Counted with the compare view's own predicates rather than a second
     implementation, so the number here and the ladder there cannot disagree. */
  function matches(){
    return SBL.ALL
      .filter(SBL.LICENCE_FILTERS[want.licence])
      .filter(function(bike){ return !want.maxSeat || bike.s <= want.maxSeat })
      .filter(function(bike){
        if(!want.maxPrice) return true;
        return bike.price !== undefined && bike.price <= want.maxPrice;
      });
  }

  function render(){
    lic.innerHTML = LICENCES.map(function(entry){
      return '<button class="cat" data-lic="' + entry.key + '"' +
        ' aria-pressed="' + (want.licence === entry.key) + '"' +
        ' title="' + entry.note + '">' + entry.label + '</button>';
    }).join("");

    document.getElementById("findSeatVal").textContent =
      want.maxSeat ? want.maxSeat + " mm" : "no limit";
    document.getElementById("findSeatVal").classList.toggle("off", !want.maxSeat);
    document.getElementById("findPriceVal").textContent =
      want.maxPrice ? "£" + want.maxPrice.toLocaleString("en-GB") : "no limit";
    document.getElementById("findPriceVal").classList.toggle("off", !want.maxPrice);

    /* The count is the point of the panel: it answers before you navigate,
       and it is the thing that makes a slider worth dragging. */
    var found = matches().length;
    var note  = document.getElementById("findCount");

    if(!found){
      note.innerHTML = "<b>Nothing matches.</b> Loosen one of the three — " +
        "a budget in particular, since a machine with no published price " +
        "cannot be shown to fit one.";
      return;
    }

    var unpriced = want.maxPrice
      ? SBL.ALL.filter(SBL.LICENCE_FILTERS[want.licence])
          .filter(function(b){ return !want.maxSeat || b.s <= want.maxSeat })
          .filter(function(b){ return b.price === undefined }).length
      : 0;

    note.innerHTML = "<b>" + found + "</b> of " + SBL.ALL.length + " match" +
      (found === 1 ? "es" : "") +
      (unpriced ? ", and " + unpriced + " more are unknown — no price is " +
                  "published for them, so a budget cannot include them" : "") + ".";
  }

  lic.addEventListener("click", function(e){
    var button = e.target.closest("[data-lic]");
    if(!button) return;
    want.licence = button.dataset.lic;
    render();
  });

  seat.addEventListener("input", function(){ want.maxSeat = readSeat(); render() });
  price.addEventListener("input", function(){ want.maxPrice = readPrice(); render() });

  document.getElementById("findGo").addEventListener("click", function(){
    SBL.compareView.applyFinder(want);
    SBL.goToCompare();
  });

  render();

})(window.SBL);
