/* ==========================================================================
   DERIVE — runs after every brand file has registered.

   ptw : power to weight, so it sorts like any other metric
   id  : unique within a brand — the card anchor the ladder scrolls to
   uid : unique across all brands — the row key both ladders are built on
   estOf : Set of metric keys that are estimated for this bike
   ========================================================================== */

(function(SBL){
  "use strict";

  Object.keys(SBL.DATA).forEach(function(brandKey){
    var brand = SBL.DATA[brandKey];

    brand.bikes.forEach(function(bike, i){
      bike.ptw   = bike.p / bike.w;
      bike.id    = bike.n.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + i;
      bike.uid   = brandKey + "__" + bike.id;
      bike.estOf = new Set((bike.est || "").split(",").filter(Boolean));
    });

    /* Which categories this brand actually sells into. */
    brand.cats = SBL.CATEGORY_ORDER.filter(function(cat){
      return brand.bikes.some(function(b){ return b.cat === cat });
    });
  });

  /* Every bike from every brand, flattened and tagged with its manufacturer.
     The compare view works exclusively from this list. */
  SBL.ALL = [];
  Object.keys(SBL.DATA).forEach(function(brandKey){
    var brand = SBL.DATA[brandKey];
    brand.bikes.forEach(function(bike){
      SBL.ALL.push(Object.assign({}, bike, {
        brand:  brand.name,
        bkey:   brandKey,
        accent: brand.accent
      }));
    });
  });

  SBL.isEstimated = function(bike, metricKey){
    return bike.estOf ? bike.estOf.has(metricKey) : false;
  };

  /* Licence classes ranked by how easy they are to hold, not alphabetically —
     "A" sorts before "A1" as a string but is the harder licence to get. */
  function licenceRank(l){
    if(/track/i.test(l)) return 3;
    if(/^A1\b/.test(l))  return 0;
    if(/A2/.test(l))     return 1;
    return 2;
  }

  /* The most accessible licence class in a set of bikes. */
  SBL.entryLicence = function(bikes){
    return bikes.slice().sort(function(a, b){
      return licenceRank(a.l) - licenceRank(b.l);
    })[0].l.split(" ")[0];
  };

  /* Bikes in a category, optionally within one brand. cat === null = all. */
  SBL.inCategory = function(list, cat){
    return cat ? list.filter(function(b){ return b.cat === cat }) : list.slice();
  };

})(window.SBL);
