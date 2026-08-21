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
    },
    /* The two priced metrics. `sparse` marks a metric that not every model
       has a value for: 91 of the 130 carry a price, and a ladder sorted on
       one has to leave the rest out rather than rank them at zero. */
    price:{
      key:"price", dir:1, sparse:true,
      fmt:function(v){ return "&pound;" + v.toLocaleString("en-GB") },
      note:"UK list price as the manufacturer publishes it, cheapest first, checked August 2026. The one figure here that goes stale on its own — treat it as this summer's shape of the market rather than a quote."
    },
    pricePerPs:{
      key:"pricePerPs", dir:1, sparse:true,
      fmt:function(v){ return "&pound;" + Math.round(v) + " <em>/PS</em>" },
      note:"Pounds per PS, cheapest first. Not a measure of value — a 125 and a superbike are not competing for the same money — but it does show which machines charge a premium for their power and which do not."
    }
  };

  /* Whether a bike has a figure for a metric at all. Only sparse metrics can
     answer no; everything else is published for all 130. */
  SBL.hasMetric = function(bike, metricId){
    return !SBL.METRICS[metricId].sparse || bike[SBL.METRICS[metricId].key] !== undefined;
  };

  SBL.withMetric = function(bikes, metricId){
    return SBL.METRICS[metricId].sparse
      ? bikes.filter(function(bike){ return SBL.hasMetric(bike, metricId) })
      : bikes;
  };

  /* Track-only machines are not road-registered here, so no licence class
     applies to them at all. Used for the card badge and the compare filters. */
  SBL.isTrackOnly = function(bike){ return !!bike.track };

  /* Format a bike's value for a metric, wrapping it if the figure is derived
     rather than published so the reader can tell the two apart. */
  SBL.formatValue = function(bike, metricId){
    var metric = SBL.METRICS[metricId];
    var html = metric.fmt(bike[metric.key]);
    return SBL.isEstimated(bike, metric.key)
      ? '<span class="est" title="Estimated from power-to-weight, not a published figure">' + html + '</span>'
      : html;
  };

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
