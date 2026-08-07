/* ==========================================================================
   METRICS — the five ways a ladder can be sorted.

   Each entry owns everything the ladder needs to know about a metric:
     key  which field on a bike holds the value
     dir  sort direction: -1 = biggest first, 1 = smallest first
     fmt  how the value is written out next to the bar
     note the line of explanation printed above the ladder
   ========================================================================== */

(function(SBL){
  "use strict";

  SBL.METRICS = {
    power:{
      key:"p", dir:-1,
      fmt:function(v){ return v + " <em>PS</em>" },
      note:"Peak crank output, highest first."
    },
    accel:{
      key:"a", dir:1,
      fmt:function(v){ return v + " <em>s</em>" },
      note:"0–100 km/h, quickest first. Shorter bars are faster. Above roughly 100 PS the differences collapse — traction and gearing become the limit, not power."
    },
    top:{
      key:"ts", dir:-1,
      fmt:function(v){ return v + " <em>km/h</em>" },
      note:"Terminal speed, mostly set by gearing and aerodynamics rather than raw output. Note how many bikes stop at the same 299 km/h limiter."
    },
    weight:{
      key:"w", dir:1,
      fmt:function(v){ return v + " <em>kg</em>" },
      note:"Wet weight, lightest first. Often the number that separates two bikes with identical power."
    },
    ptw:{
      key:"ptw", dir:-1,
      fmt:function(v){ return v.toFixed(2) + " <em>PS/kg</em>" },
      note:"Power to weight — the figure that best predicts how a bike actually feels. This is where a lineup stops being a gentle progression and turns into a cliff."
    }
  };

  /* A bike is track-only when its licence string says so — "Track only",
     "Track only (EU)". Used for the card badge and the compare filters. */
  SBL.isTrackOnly = function(bike){ return /track/i.test(bike.l) };

  /* Wire a group of aria-pressed metric buttons to a callback. Only one
     button in the group reads as pressed at a time. */
  SBL.bindMetricButtons = function(scope, onPick){
    var buttons = scope.querySelectorAll(".metric");
    buttons.forEach(function(btn){
      btn.addEventListener("click", function(){
        buttons.forEach(function(b){ b.setAttribute("aria-pressed", "false") });
        btn.setAttribute("aria-pressed", "true");
        onPick(btn.dataset.m);
      });
    });
    return {
      reset: function(metricId){
        buttons.forEach(function(b){
          b.setAttribute("aria-pressed", b.dataset.m === metricId ? "true" : "false");
        });
      },
      active: function(){
        var pressed = scope.querySelector('.metric[aria-pressed="true"]');
        return pressed ? pressed.dataset.m : null;
      }
    };
  };

})(window.SBL);
