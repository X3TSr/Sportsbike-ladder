/* ==========================================================================
   LADDER — the animated bar chart, shared by the brand and compare views.

   Rows are built once and then never reordered in the DOM. Sorting only
   changes each row's translateY, which is what makes the re-sort animate
   rather than snap. Row height comes from the --row-h custom property so
   the narrow-screen layout stays in sync with the CSS.
   ========================================================================== */

(function(SBL){
  "use strict";

  function rowHeight(){
    return parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--row-h")
    );
  }

  /* el      the .ladder container
     options.nameCell(bike)  HTML for the first column
     options.barStyle(bike)  optional inline style for the bar element */
  SBL.createLadder = function(el, options){
    options = options || {};
    var rows = {};
    var built = [];

    function build(bikes){
      el.innerHTML = "";
      rows = {};
      built = bikes.slice();

      bikes.forEach(function(bike){
        var row = document.createElement("div");
        row.className = "lrow";
        row.innerHTML =
          options.nameCell(bike) +
          '<div class="track"><div class="bar"' +
            (options.barStyle ? ' style="' + options.barStyle(bike) + '"' : "") +
          '></div></div>' +
          '<div class="lval"></div>';
        el.appendChild(row);
        rows[bike.uid] = row;
      });
    }

    /* visible defaults to everything that was built. Bikes left out are
       hidden rather than removed, so ticking them back on is free. */
    function render(metricId, visible){
      var metric = SBL.METRICS[metricId];
      var list = visible || built;
      var h = rowHeight();
      var shown = new Set(list.map(function(b){ return b.uid }));

      built.forEach(function(bike){
        if(!shown.has(bike.uid)) rows[bike.uid].style.display = "none";
      });

      if(!list.length){ el.style.height = "0px"; return [] }

      var max = Math.max.apply(null, list.map(function(b){ return b[metric.key] }));
      var sorted = list.slice().sort(function(a, b){
        return (a[metric.key] - b[metric.key]) * metric.dir;
      });

      el.style.height = (list.length * h) + "px";
      sorted.forEach(function(bike, i){
        var row = rows[bike.uid];
        row.style.display = "";
        row.style.transform = "translateY(" + (i * h) + "px)";
        row.querySelector(".bar").style.width = (bike[metric.key] / max * 100) + "%";
        row.querySelector(".lval").innerHTML = metric.fmt(bike[metric.key]);
      });

      return sorted;
    }

    return { build:build, render:render };
  };

})(window.SBL);
