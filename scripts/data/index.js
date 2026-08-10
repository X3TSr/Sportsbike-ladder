/* ==========================================================================
   DATA REGISTRY — categories, and the empty shelf each brand file fills.

   Load order: this file, then one file per brand, then derive.js.

   Bike fields (kept terse because they repeat ~150 times):
     n   name                cat category key (see CATEGORIES below)
     e   engine, long form   es  engine, short
     p   power, PS (crank)   t   torque, Nm
     w   wet weight, kg      a   0-100 km/h, s
     ts  top speed, km/h     s   seat height, mm
     l   licence class       x   variant note (optional)
     r   what it is for (HTML)
     v   the verdict (HTML)
     est comma-separated metric keys whose value is derived, not published
         (e.g. "a,ts"). The UI marks these so a reader can tell an estimate
         from a manufacturer claim.

   Weights are kerb/wet WITH fuel. Ducati and a few others publish weight
   with the tank empty; those are converted (tank litres x 0.75 kg/l) and
   the conversion is noted on the brand's caveats.
   ========================================================================== */

var SBL = window.SBL || {};

/* The higher selector. Order here is the order the chips appear in. */
SBL.CATEGORIES = {
  sport:     {name:"Sport",        blurb:"Fairings, clip-ons, and a riding position that only makes sense above legal speeds."},
  naked:     {name:"Naked",        blurb:"The same engines with the bodywork taken off and the bars raised. Usually the sensible one."},
  sportTour: {name:"Sport-tourer", blurb:"Built to cover distance quickly. Screens, luggage mounts, and a seat you can sit on for hours."},
  adventure: {name:"Adventure",    blurb:"Long travel, upright bars, and at least the suggestion of going somewhere unpaved."},
  cruiser:   {name:"Cruiser",      blurb:"Feet forward, low seats, torque over revs. Ranked here on the same metrics as everything else, which flatters none of them."},
  retro:     {name:"Retro",        blurb:"Modern engines and brakes under styling borrowed from the manufacturer's own back catalogue."}
};

SBL.CATEGORY_ORDER = ["sport","naked","sportTour","adventure","cruiser","retro"];

/* Brand files push themselves in here. */
SBL.DATA = {};

SBL.registerBrand = function(key, brand){ SBL.DATA[key] = brand };

window.SBL = SBL;
