/* ==========================================================================
   DATA REGISTRY — categories, and the empty shelf each brand file fills.

   Load order: this file, then one file per brand, then derive.js.

   Bike fields (kept terse because they repeat ~150 times):
     n   name                cat category key (see CATEGORIES below)
     e   engine, long form   es  engine, short — leads with capacity in cc
     p   power, PS (crank)   t   torque, Nm
     w   wet weight, kg      a   0-100 km/h, s
     ts  top speed, km/h     s   seat height, mm
     r   what it is for (HTML)
     v   the verdict (HTML)
     x   variant note (optional)
     src the manufacturer page p/t/w/s were checked against (optional)
     price UK list price in GBP, checked August 2026 (optional). The only
         field here about a market rather than a machine — see PRICE_BASIS
         in derive.js. 91 of the 130 have one; the rest are absent, not
         guessed, and the price ladders drop them and say so.
     est comma-separated metric keys whose value is derived, not published
         (e.g. "a,ts"). The UI marks these so a reader can tell an estimate
         from a manufacturer claim.

   There is no licence field. A1 and A2 are rules and derive.js applies them
   to the figures; these three feed the parts a calculation cannot reach:
     kw    rated output in kW as published, where the manufacturer does
     a2    "kit" or "version" — the reduced-power machine on offer, if any
     track 1 for machines not road-registered here, which have no class

   Optional and read by the compare view's seat-height filter:
     sLow  lowest published seat height where a lower seat or lowered
           version exists. Reported, never matched on.

   Weights are kerb/wet WITH fuel. Ducati and a few others publish weight
   with the tank empty; those are converted (tank litres x 0.75 kg/l) and
   the conversion is noted on the brand's caveats.
   ========================================================================== */

var SBL = window.SBL || {};

/* The higher selector. Order here is the order the chips appear in.
   `name` labels a chip; `plural` counts machines in prose, as in "3rd
   lightest of 20 adventure bikes", which the chip label cannot do. */
SBL.CATEGORIES = {
  sport:     {name:"Sport",        plural:"sport bikes",
              blurb:"Fairings, clip-ons, and a riding position that only makes sense above legal speeds."},
  naked:     {name:"Naked",        plural:"nakeds",
              blurb:"The same engines with the bodywork taken off and the bars raised. Usually the sensible one."},
  sportTour: {name:"Sport-tourer", plural:"sport-tourers",
              blurb:"Built to cover distance quickly. Screens, luggage mounts, and a seat you can sit on for hours."},
  adventure: {name:"Adventure",    plural:"adventure bikes",
              blurb:"Long travel, upright bars, and at least the suggestion of going somewhere unpaved."},
  cruiser:   {name:"Cruiser",      plural:"cruisers",
              blurb:"Feet forward, low seats, torque over revs. Ranked here on the same metrics as everything else, which flatters none of them."},
  retro:     {name:"Retro",        plural:"retros",
              blurb:"Modern engines and brakes under styling borrowed from the manufacturer's own back catalogue."}
};

SBL.CATEGORY_ORDER = ["sport","naked","sportTour","adventure","cruiser","retro"];

/* Brand files push themselves in here. */
SBL.DATA = {};

/* The key rides along on the brand object as well as being its slot in
   DATA, so anything holding a brand — the router, in particular — can name
   it without a reverse lookup. */
SBL.registerBrand = function(key, brand){ brand.key = key; SBL.DATA[key] = brand };

window.SBL = SBL;
