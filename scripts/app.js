/* ==========================================================================
   APP — swaps between the three views and handles page-level interaction.
   ========================================================================== */

(function(SBL){
  "use strict";

  var pickerView = document.getElementById("pickerView");
  var brandView  = document.getElementById("brandView");
  var cmpView    = document.getElementById("cmpView");

  var COMPARE = "__cmp";
  var INK     = "#0E1216";

  /* key: a brand key, COMPARE, or null for the picker */
  function show(key){
    if(key === COMPARE){
      pickerView.classList.add("hidden");
      brandView.classList.add("hidden");
      cmpView.classList.remove("hidden");
      SBL.compareView.draw();
      window.scrollTo(0, 0);
      return;
    }

    cmpView.classList.add("hidden");

    if(key && SBL.brandView.open(key)){
      pickerView.classList.add("hidden");
      brandView.classList.remove("hidden");
      window.scrollTo(0, 0);
    }else{
      brandView.classList.add("hidden");
      pickerView.classList.remove("hidden");
      SBL.brandView.close();
      document.documentElement.style.setProperty("--accent", INK);
    }
  }

  /* Delegated so it also covers the tiles and ladder rows built at runtime.
     data-cmp opens compare, data-b opens a brand, data-t jumps to a card. */
  function activate(el){
    if(el.dataset.cmp){ show(COMPARE); return }
    if(el.dataset.b){ show(el.dataset.b); return }
    if(el.dataset.t){
      var target = document.getElementById(el.dataset.t);
      if(target) target.scrollIntoView({ block:"start", behavior:"smooth" });
    }
  }

  var ACTIVATABLE = "[data-b],[data-t],[data-cmp]";

  document.addEventListener("click", function(e){
    var el = e.target.closest(ACTIVATABLE);
    if(el) activate(el);
  });

  /* The tiles and ladder names are divs with role="button", so Enter and
     Space have to be wired up by hand. */
  document.addEventListener("keydown", function(e){
    if(e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest(ACTIVATABLE);
    if(el){ e.preventDefault(); activate(el) }
  });

  document.getElementById("backBtn").addEventListener("click", function(){ show(null) });
  document.getElementById("cmpBack").addEventListener("click", function(){ show(null) });

  /* Counts written into the copy, so adding a brand never leaves stale prose.
     Brand counts read better spelled out at this scale. */
  var WORDS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten"];
  var COUNTS = {
    brands: WORDS[Object.keys(SBL.DATA).length] || Object.keys(SBL.DATA).length,
    models: SBL.ALL.length
  };
  document.querySelectorAll("[data-count]").forEach(function(el){
    el.textContent = COUNTS[el.dataset.count];
  });

  /* The logo lockup in the brand and compare headers goes home. */
  document.addEventListener("click", function(e){
    if(e.target.closest("[data-home]")) show(null);
  });

  /* --row-h changes at the 620px breakpoint, so both ladders need to be
     re-laid out after a resize. */
  var resizeTimer;
  window.addEventListener("resize", function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      SBL.brandView.refresh();
      if(SBL.compareView.isOpen()) SBL.compareView.draw();
    }, 150);
  });

  show(null);

})(window.SBL);
