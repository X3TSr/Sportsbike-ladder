/* ==========================================================================
   CATEGORY CHIPS — the higher selector, above brand and above metric.

   The same component drives the picker, the brand page and the compare
   filters. Each instance owns its own chip row; the current selection is
   held by whoever created it, not in here.
   ========================================================================== */

(function(SBL){
  "use strict";

  var ALL_LABEL = "All";

  /* el          container to fill with chips
     opts.count(catKey)  how many bikes this chip represents (0 hides it)
     opts.total()        count for the "All" chip
     opts.onPick(catKey) called with a category key, or null for "All"
     opts.showCounts     append the count to each chip label            */
  SBL.buildCategoryChips = function(el, opts){
    function render(active){
      var chips = [];

      chips.push(chip(null, ALL_LABEL, opts.total(), active === null));
      SBL.CATEGORY_ORDER.forEach(function(cat){
        var n = opts.count(cat);
        if(n > 0) chips.push(chip(cat, SBL.CATEGORIES[cat].name, n, active === cat));
      });

      el.innerHTML = chips.join("");
    }

    function chip(cat, label, count, isActive){
      return '<button class="cat" data-cat="' + (cat || "") + '"' +
        ' aria-pressed="' + (isActive ? "true" : "false") + '">' +
        label +
        (opts.showCounts ? '<span class="cat-n">' + count + '</span>' : "") +
        '</button>';
    }

    el.addEventListener("click", function(e){
      var button = e.target.closest("[data-cat]");
      if(!button) return;
      opts.onPick(button.dataset.cat || null);
    });

    return { render: render };
  };

  /* Count helpers shared by the three chip rows. */
  SBL.countIn = function(bikes, cat){
    return bikes.filter(function(b){ return b.cat === cat }).length;
  };

  /* ---------- year chips ----------
     Same shape as the category chips. "Current" (null) is the default and
     shows today's spec; picking a year rewinds the whole page to that
     model year. Years with no models at all are still offered, so the empty
     state can explain itself rather than the chip silently vanishing. */
  SBL.buildYearChips = function(el, opts){
    function render(active){
      var chips = ['<button class="cat yr" data-yr="" aria-pressed="' +
        (active === null ? "true" : "false") + '">Current</button>'];

      SBL.YEAR_LIST.forEach(function(y){
        var n = opts.count(y);
        chips.push('<button class="cat yr" data-yr="' + y + '"' +
          ' aria-pressed="' + (active === y ? "true" : "false") + '">' + y +
          '<span class="cat-n">' + n + '</span></button>');
      });

      el.innerHTML = chips.join("");
    }

    el.addEventListener("click", function(e){
      var button = e.target.closest("[data-yr]");
      if(!button) return;
      opts.onPick(button.dataset.yr ? parseInt(button.dataset.yr, 10) : null);
    });

    return { render: render };
  };

})(window.SBL);
