/* ==========================================================================
   DERIVE — runs after every brand file has registered.

   ptw : power to weight, so it sorts like any other metric
   id  : unique within a brand — the card anchor the ladder scrolls to
   uid : unique across all brands — the row key both ladders are built on
   estOf : Set of metric keys that are estimated for this bike

   Wheel sizes are deliberately not stored. tyreSpec() splits them out of the
   published tyre string at the point of use, so a generation that overrides
   the tyres needs no other bookkeeping and nothing can fall out of sync.

   Licence class is not stored either, for the same reason — licence() works
   it out from power, weight and capacity. See the block above SBL.licence().
   ========================================================================== */

(function(SBL){
  "use strict";

  /* Speed symbol, moulded into every road tyre's sidewall. Meaningless as a
     letter on its own, so the page prints what it stands for next to it. */
  var SPEED = { J:100, K:110, L:120, M:130, N:140, P:150, Q:160, R:170, S:180,
                T:190, U:200, H:210, V:240, W:270, Y:300, Z:"240+" };

  /* Split a tyre designation into the things actually printed on the tyre —
     nothing is computed from them. "190/55 ZR17 73W" is a 190 mm section
     width, a sidewall 55% of that width, a Z-rated radial, a 17-inch rim and
     a load index of 73.

       width   section width in mm, the first number
       profile aspect ratio as a percentage, the second number
       rim     rim diameter in inches, the number everyone quotes
       speed   speed symbol, from the service description or the ZR prefix
       load    load index, where the manufacturer publishes one

     Returns null for the fourteen models whose manufacturer publishes no tyre
     size at all. */
  SBL.tyreSpec = function(tyre){
    if(!tyre) return null;
    var m = String(tyre).match(
      /^(\d{2,3})\/(\d{2,3})\s*(?:([A-Z]{0,2}R|B)|-)(\d{2})(?:\s+(\d{2,3})([A-Z]))?$/);
    if(!m) return null;

    var second = Number(m[2]), code = m[3] || "";

    /* An aspect ratio is a percentage and never exceeds 100 — 80/100-18 is a
       real size sitting on the ceiling of the scale. Racing slicks put the
       overall diameter in millimetres in that slot instead, which is the only
       thing telling the two notations apart. The H2R is the only one here. */
    var slick = second > 100;

    /* Modern tyres carry the speed symbol in the service description; older
       and very fast ones carry it as the Z ahead of the R. Prefer the
       explicit one, fall back to the prefix, and say nothing when the
       manufacturer publishes neither. */
    var speed = m[6] || (/^Z/.test(code) ? "Z" : null);

    return {
      width:   Number(m[1]),
      profile: slick ? null : second,
      rim:     Number(m[4]),
      speed:   speed,
      speedTo: speed && SPEED[speed] ? SPEED[speed] : null,
      load:    m[5] ? Number(m[5]) : null
    };
  };

  /* One field for both ends. Collapsed to a single value when the two match,
     because repeating a number reads like a mistake rather than a fact, and
     null when neither end publishes it. */
  SBL.tyrePair = function(bike, field, unit){
    var f = SBL.tyreSpec(bike.tyreF), r = SBL.tyreSpec(bike.tyreR);
    if(!f || !r) return null;
    var a = f[field], b = r[field];
    if(a === null && b === null) return null;
    var text = (a === b) ? String(a) : (a === null ? "—" : a) + " / " + (b === null ? "—" : b);
    return unit ? text + " " + unit : text;
  };

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

  /* ==========================================================================
     LICENCE — a rule applied to the figures, not a label typed into the data.

     Directive 2006/126/EC, Article 4. A1 and A2 are each three conditions at
     once, and the interesting one is the last:

       A1   ≤ 125 cc, ≤ 11 kW, ≤ 0.1 kW/kg
       A2   ≤ 35 kW, ≤ 0.2 kW/kg, and not derived from a machine of more
            than double its own power
       A    everything else

     That third A2 condition is why a restriction kit works on a 54 kW twin
     and not on a 77 kW one, and it is invisible in a licence label. The site
     holds both numbers it needs, so it computes the answer instead.

     Two data fields feed the parts a calculation cannot reach:

       kw    rated output as the manufacturer publishes it. The licence
             limits are written in kW; this site's power column is in PS, and
             converting a rounded PS figure back costs enough precision to
             move a bike across a limit. 93 of the 130 have a published kW.
       a2    "kit"     the manufacturer restricts this machine itself
             "version" a separate reduced-power model is sold
             absent    no A2 machine is offered

     A2 availability is a fact about what is on sale, which no amount of
     arithmetic will yield: a bike can be perfectly restrictable on paper and
     have no kit behind the parts counter. The rule decides whether an offered
     restriction is legal; `a2` says whether one exists.
     ========================================================================== */

  var PS_PER_KW = 1.35962;
  var A1_KW = 11, A1_RATIO = 0.1, A1_CC = 125;
  var A2_KW = 35, A2_RATIO = 0.2;
  var EPS = 1e-9;                 /* 0.2 * 167 is not exactly 33.4 in binary */

  SBL.powerKw = function(bike){
    return bike.kw !== undefined ? bike.kw : bike.p / PS_PER_KW;
  };

  /* Engine capacity, off the front of the short engine label — "689 CP2". */
  function capacityOf(bike){ return parseInt(bike.es, 10) }

  /* The most power an A2-legal version of a machine this heavy may make.
     Both limits apply at once, and the lighter the bike the sooner the ratio
     bites: at 175 kg it may have the full 35 kW, at 160 kg only 32. */
  function a2Cap(bike){ return Math.min(A2_KW, A2_RATIO * bike.w) }

  function round1(n){ return Math.round(n * 10) / 10 }
  function round2(n){ return Math.round(n * 100) / 100 }

  /* The licence class a bike's own figures put it in.

       cls      A1 | A2 | A | track — what the filters and the ranking use
       label    how it reads on a card: "A", "A / A2 kit", "Track only"
       kw       the figure the test was run on
       ratio    kW per kilogram of kerb weight
       exact    false when kw was converted from PS rather than published
       onLimit  true when that conversion straddles the limit being tested
       why      one sentence saying how it got there                        */
  SBL.licence = function(bike){
    var exact = bike.kw !== undefined;
    var kw    = SBL.powerKw(bike);
    var ratio = kw / bike.w;
    var cap   = a2Cap(bike);

    /* A PS figure rounded to a whole number carries half a PS of slack, and
       half a PS is 0.37 kW — enough to push a genuine 35.0 kW machine over a
       limit written in kW. Weight gets no such allowance: the rule is applied
       to the kerb figure the manufacturer publishes, whatever a real bike
       with a full tank and a topbox weighs. */
    var slack = exact ? 0 : 0.5 / PS_PER_KW;

    var straddled = false;
    function within(value, limit){
      if(value <= limit + EPS) return true;
      if(value - slack <= limit + EPS){ straddled = true; return true }
      return false;
    }

    function out(cls, label, why){
      return { cls: cls, label: label, kw: round1(kw), ratio: round2(ratio),
               exact: exact, onLimit: straddled, why: why };
    }

    var figures   = round1(kw) + " kW and " + round2(ratio) + " kW/kg";
    var asSold    = round1(kw) + " kW as sold";
    var capText   = round1(cap) + " kW";
    var doubled   = round1(2 * cap) + " kW";

    /* Below 175 kg the ratio limit sets the ceiling before the flat 35 kW
       does. Worth a sentence wherever that ceiling is quoted, or a bike
       restricted to 32 kW reads as an error. */
    var capNote = cap < A2_KW - EPS
      ? " At " + bike.w + " kg the " + A2_RATIO + " kW/kg limit bites first, so " +
        capText + " is the ceiling rather than the flat " + A2_KW + " kW."
      : "";

    /* Said whenever a converted figure decided a close call. Naming the PS
       figure it came from is the point: it lets a reader see for themselves
       that the overshoot is a rounding artefact rather than the machine. */
    function hedged(text){
      return text + " That comes from converting " + bike.p + " PS, which is " +
        "rounded, so the margin here is smaller than the arithmetic error — " +
        "guidance for a shortlist, not a determination. Confirm with the dealer.";
    }
    function maybe(text){ return straddled ? hedged(text) : text }
    /* "inside" would be a plain overstatement on a figure that only clears
       the limit once its rounding error is allowed for. */
    function inside(){ return straddled ? "level with" : "inside" }

    if(bike.track){
      return out("track", "Track only",
        "Not road-registered in Europe, so no licence class applies.");
    }

    if(capacityOf(bike) <= A1_CC && within(kw, A1_KW) && within(ratio, A1_RATIO)){
      return out("A1", "A1", maybe(capacityOf(bike) + " cc, " + figures +
        " — " + inside() + " all three A1 limits of " + A1_CC + " cc, " +
        A1_KW + " kW and " + A1_RATIO + " kW/kg."));
    }

    if(within(kw, cap)){
      return out("A2", "A2", maybe(figures + " — " + inside() +
        " the A2 limits of " + A2_KW + " kW and " + A2_RATIO + " kW/kg."));
    }

    /* Over the line as it stands. Whether that is the end of it depends on
       what the manufacturer sells, and on the double-power clause. */
    if(bike.a2 === "kit"){
      if(within(kw, 2 * cap)){
        return out("A2", "A / A2 kit", maybe(asSold + ", over the " + capText +
          " an A2 machine may make, and a restriction to that figure is offered. " +
          "Legal because the full-power bike stays within " + doubled + " — an A2 " +
          "machine may not be derived from one of more than double its power.") +
          capNote);
      }
      console.warn("A2 kit listed for " + bike.bkey + "|" + bike.n + " but " +
        round1(kw) + " kW is more than double the " + capText +
        " cap — such a restriction could not be type-approved.");
    }

    /* A reduced-power model rather than a restriction of this one. Sometimes
       that is forced — past double the cap, no restriction of this machine
       could be approved — and sometimes it is simply how the manufacturer
       chose to sell it. Worth telling apart: only the first is a rule. */
    if(bike.a2 === "version" || bike.a2 === "kit"){
      return out("A2", "A / A2 version", asSold + ", over the " + capText +
        " an A2 machine may make. " +
        (kw > 2 * cap + EPS
          ? "Past " + doubled + " too, so no restriction of this bike could be " +
            "approved — an A2 machine may not be derived from one of more than " +
            "double its power. "
          : "") +
        "A separate reduced-power model is sold instead, so the figures above " +
        "are the full-power bike's rather than the one an A2 licence reaches." +
        capNote);
    }

    /* Plain A. Say which of the two limits it misses, and whether the only
       thing standing between it and A2 is that nobody sells the parts. */
    var misses = [];
    if(kw > cap + EPS)          misses.push("the " + capText + " ceiling");
    if(ratio > A2_RATIO + EPS)  misses.push("the " + A2_RATIO + " kW/kg limit");

    return out("A", "A", figures + " — over " + misses.join(" and ") + ". " +
      (kw <= 2 * cap + EPS
        ? "Low enough that a restriction to " + capText + " would be legal, but " +
          "none is offered."
        : "More than double " + capText + ", so no restriction of this machine " +
          "could be A2-legal either.") + capNote);
  };

  /* Licence classes ranked by how easy they are to hold, not alphabetically —
     "A" sorts before "A1" as a string but is the harder licence to get. */
  var LICENCE_RANK = { A1:0, A2:1, A:2, track:3 };

  /* The most accessible licence class in a set of bikes. */
  SBL.entryLicence = function(bikes){
    return bikes.map(function(bike){ return SBL.licence(bike).cls })
      .sort(function(a, b){ return LICENCE_RANK[a] - LICENCE_RANK[b] })[0];
  };

  /* How the class reads on a card or in a spec table. A model no longer sold
     new here keeps its class — the licence rule has not changed — but says so,
     because "A2" on its own reads as something you can walk in and buy.

     Not on an archived generation, though: every one of those is out of
     production by definition, so the note would be on almost every row and
     would stop meaning anything on the few where it matters. */
  SBL.licenceLabel = function(bike){
    return SBL.licence(bike).label +
      (bike.to !== null && !bike.isHistoric ? " (EU: discontinued)" : "");
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

    return SBL.asGeneration(bike, gen);
  };

  /* Label for a span of model years. "now" rather than the current year,
     because a generation still on sale has no known end. */
  SBL.genLabel = function(from, to){
    return from + "–" + (to || "now");
  };

  /* Merge a generation's overrides onto the bike. Fields the generation does
     not mention fall through, so an entry that only changed weight lists only
     weight. ptw is recomputed because p or w may have moved; wheel sizes
     need nothing, since they are read from tyreF/tyreR at the point of use.

     kw is the exception that has to be dropped rather than inherited. It is a
     published figure for the current bike, and a generation that moved the
     power moved it too — carrying it over would run the licence test on one
     generation's kW and another's weight. Without it the class falls back to
     converting the generation's own PS, which is what is actually known. */
  SBL.asGeneration = function(bike, gen){
    var spec = Object.assign({}, bike, gen);
    if(gen.p !== undefined && gen.kw === undefined) delete spec.kw;
    spec.ptw        = spec.p / spec.w;
    spec.isHistoric = true;
    spec.genFrom    = gen.from;
    spec.genTo      = gen.to;
    spec.gLabel     = SBL.genLabel(gen.from, gen.to);
    return spec;
  };

  /* Every generation of a bike as its own spec, newest first. Used by the
     compare view's generation mode, where one model occupies several rows.
     uid is suffixed so the ladder can key them apart; baseUid keeps the link
     back to the model the checkbox controls. */
  SBL.generationsOf = function(bike){
    var current = Object.assign({}, bike, {
      genFrom: bike.from,
      genTo:   bike.to,
      gLabel:  SBL.genLabel(bike.from, bike.to),
      baseUid: bike.uid,
      uid:     bike.uid + "@" + bike.from
    });

    return [current].concat(bike.gens.map(function(gen){
      var spec = SBL.asGeneration(bike, gen);
      spec.baseUid = bike.uid;
      spec.uid     = bike.uid + "@" + gen.from;
      return spec;
    }));
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

  /* ---------- provenance ----------
     A bike with `src` has had its power, torque, weight and seat height
     checked against that page. Everything else is model knowledge that has
     never been re-checked, which is a materially weaker claim, so the two
     are shown differently rather than being left to look alike. */
  SBL.isSourced = function(bike){ return !!bike.src };

  SBL.sourceHost = function(url){
    var m = /^https?:\/\/([^/]+)/.exec(url || "");
    return m ? m[1].replace(/^www\./, "") : "";
  };

  SBL.sourcedCount = function(bikes){
    return (bikes || SBL.ALL).filter(SBL.isSourced).length;
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
