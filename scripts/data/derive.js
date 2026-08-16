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
      bike.bkey  = brandKey;
      bike.id    = bike.n.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + i;
      bike.uid   = brandKey + "__" + bike.id;
      bike.estOf = new Set((bike.est || "").split(",").filter(Boolean));

      var years  = SBL.YEARS[brandKey + "|" + bike.n] || {};
      bike.from  = years.from || SBL.YEAR_MIN;
      bike.to    = years.to || null;
      bike.gens  = years.gens || [];
      bike.hasHistory = bike.gens.length > 0;

      /* A generation that runs into `from` can never be selected — the
         current entry wins for every year it covers. Silent data loss
         otherwise, so say so rather than shipping an entry nobody sees. */
      bike.gens.forEach(function(gen){
        if(gen.to >= bike.from){
          console.warn("Unreachable generation for " + brandKey + "|" + bike.n +
            ": " + gen.from + "-" + gen.to + " overlaps current from:" + bike.from);
        }
      });
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

  /* ---------- model years ----------
     specFor returns the bike as it was sold in `year`, or null if it was not
     on sale. year === null means "current spec", which is the default view.

     A generation's fields override the current entry's; anything it does not
     mention falls through, so a generation that only changed weight lists
     only weight. ptw is recomputed because p or w may have moved. */
  SBL.specFor = function(bike, year){
    if(year === null || year === undefined) return bike;

    var launched = bike.from <= year;
    var retired  = bike.to !== null && bike.to < year;

    if(launched && !retired) return bike;

    var gen = bike.gens.find(function(g){
      return g.from <= year && year <= g.to;
    });
    if(!gen) return null;

    var spec = Object.assign({}, bike, gen);
    spec.ptw = spec.p / spec.w;
    spec.isHistoric = true;
    return spec;
  };

  /* Resolve a list of bikes to a given year, dropping those not on sale. */
  SBL.specsFor = function(bikes, year){
    return bikes.map(function(b){ return SBL.specFor(b, year) })
                .filter(Boolean);
  };

  /* Small counts read better spelled out in prose. */
  var WORDS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten"];
  SBL.spellOut = function(n){ return WORDS[n] || String(n) };
  SBL.BRAND_COUNT = Object.keys(SBL.DATA).length;

  /* Every year the selector offers, newest first. */
  SBL.YEAR_LIST = [];
  for(var y = SBL.YEAR_MAX; y >= SBL.YEAR_MIN; y--) SBL.YEAR_LIST.push(y);

  /* The line under the year chips. Its job is to stop a reader mistaking a
     model shown at today's figures for one that genuinely did not change:
     archive data exists for some models and not others, and the difference
     is not visible from the numbers alone. */
  SBL.yearNote = function(bikes, year){
    if(year === null){
      var withHistory = bikes.filter(function(b){ return b.hasHistory }).length;
      if(!withHistory) return "Showing current specifications.";
      return "Showing current specifications. " + withHistory + " of these " +
        (withHistory === 1 ? "has an earlier generation" : "have earlier generations") +
        " on record — pick a year to see " + (withHistory === 1 ? "it" : "them") + ".";
    }

    var onSale   = SBL.specsFor(bikes, year);
    var archived = onSale.filter(function(b){ return b.isHistoric }).length;
    var carried  = onSale.length - archived;

    if(!onSale.length) return "Nothing in this selection was on sale in " + year + ".";

    var note = "<b>" + year + "</b> &middot; " + onSale.length + " of " + bikes.length +
      " on sale. ";
    note += archived
      ? archived + " shown at their " + year + " specification"
      : "None of them has archived specs for that year";
    if(carried){
      note += (archived ? "; the other " + carried : ", so all " + carried) +
        " " + (carried === 1 ? "is" : "are") +
        " shown at current figures because no earlier generation is recorded.";
    } else {
      note += ".";
    }
    return note;
  };

  /* Where a bike's photo lives. Convention over configuration: drop a file at
     images/<brand>/<id>.jpg and it appears, no data edit needed. Set `img` on
     a bike to override the path or point at a different extension. */
  SBL.imageFor = function(bike){
    return bike.img || "images/" + bike.bkey + "/" + bike.id + ".jpg";
  };

  /* Bikes in a category, optionally within one brand. cat === null = all. */
  SBL.inCategory = function(list, cat){
    return cat ? list.filter(function(b){ return b.cat === cat }) : list.slice();
  };

})(window.SBL);
