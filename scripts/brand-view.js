/* ==========================================================================
   BRAND VIEW — the picker grid, and the single-manufacturer page it opens.
   ========================================================================== */

(function(SBL){
  "use strict";

  var view    = document.getElementById("brandView");
  var current = null;

  var ladder = SBL.createLadder(document.getElementById("ladder"), {
    nameCell: function(bike){
      return '<div class="lname" role="button" tabindex="0" data-t="' + bike.id + '">' +
        bike.n + '<span class="tag">' + bike.es + '</span></div>';
    }
  });

  var metricButtons = SBL.bindMetricButtons(view, function(metricId){ draw(metricId) });

  /* ---------- picker grid ---------- */
  document.getElementById("brandGrid").innerHTML =
    Object.keys(SBL.DATA).map(function(key){
      var brand = SBL.DATA[key];
      var power = brand.bikes.map(function(b){ return b.p });
      var licences = brand.bikes.map(function(b){ return b.l.split(" ")[0] })
        .filter(function(l, i, all){ return all.indexOf(l) === i });

      return '<div class="brand" role="button" tabindex="0" data-b="' + key + '"' +
        ' style="--bc:' + brand.accent + '">' +
        '<span class="stripe"></span>' +
        '<span class="inner">' +
          '<h3>' + brand.name + '</h3>' +
          '<span class="sub">' + brand.series + ' &mdash; ' + brand.bikes.length + ' models</span>' +
          '<dl>' +
            '<div><dt>Power</dt><dd>' + Math.min.apply(null, power) + '&ndash;' +
              Math.max.apply(null, power) + ' PS</dd></div>' +
            '<div><dt>Entry licence</dt><dd>' + licences[0] + '</dd></div>' +
          '</dl>' +
          '<span class="go">See the ladder &rarr;</span>' +
        '</span></div>';
    }).join("");

  /* ---------- the brand page ---------- */
  function open(key){
    var brand = SBL.DATA[key];
    if(!brand) return false;
    current = brand;

    document.documentElement.style.setProperty("--accent", brand.accent);
    document.getElementById("bEyebrow").textContent = brand.series + " · 2026 · EU market";
    document.getElementById("bTitle").textContent   = brand.name;
    document.getElementById("bLede").textContent    = brand.lede;

    ladder.build(brand.bikes);
    renderCards(brand);
    renderTable(brand);
    renderNotes(brand);

    metricButtons.reset("power");
    draw("power");
    return true;
  }

  function renderCards(brand){
    document.getElementById("cards").innerHTML = brand.bikes.map(function(bike){
      return '<article class="card" id="' + bike.id + '">' +
        '<div class="card-top">' +
          '<h3>' + bike.n + '</h3>' +
          '<span class="lic ' + (SBL.isTrackOnly(bike) ? "track-only" : "") + '">' + bike.l + '</span>' +
        '</div>' +
        '<p class="role">' + bike.r + '</p>' +
        '<dl class="kv">' +
          '<div><dt>Engine</dt><dd>' + bike.e + '</dd></div>' +
          '<div><dt>Power</dt><dd>' + bike.p + ' PS</dd></div>' +
          '<div><dt>Torque</dt><dd>' + bike.t + ' Nm</dd></div>' +
          '<div><dt>Wet weight</dt><dd>' + bike.w + ' kg</dd></div>' +
          '<div><dt>0–100 km/h</dt><dd>~' + bike.a + ' s</dd></div>' +
          '<div><dt>Top speed</dt><dd>~' + bike.ts + ' km/h</dd></div>' +
          '<div><dt>Seat height</dt><dd>' + bike.s + ' mm</dd></div>' +
        '</dl>' +
        (bike.x ? '<p class="variant">' + bike.x + '</p>' : "") +
        '<p class="verdict">' + bike.v + '</p>' +
      '</article>';
    }).join("");
  }

  function renderTable(brand){
    var byPower = brand.bikes.slice().sort(function(a, b){ return b.p - a.p });
    document.getElementById("tbody").innerHTML = byPower.map(function(bike){
      return '<tr><th>' + bike.n + '</th><td>' + bike.es + '</td><td>' + bike.p + ' PS</td>' +
        '<td>' + bike.t + ' Nm</td><td>' + bike.w + ' kg</td><td>' + bike.ptw.toFixed(2) + '</td>' +
        '<td>~' + bike.a + ' s</td><td>~' + bike.ts + '</td><td>' + bike.s + ' mm</td>' +
        '<td>' + bike.l + '</td></tr>';
    }).join("");
  }

  function renderNotes(brand){
    document.getElementById("bNotes").innerHTML = brand.notes.map(function(note){
      return '<div><h4>' + note[0] + '</h4><p>' + note[1] + '</p></div>';
    }).join("");
  }

  function draw(metricId){
    if(!current) return;
    ladder.render(metricId, current.bikes);
    document.getElementById("metricNote").textContent = SBL.METRICS[metricId].note;
  }

  SBL.brandView = {
    open: open,
    close: function(){ current = null },
    /* re-lay the ladder after a resize changes --row-h */
    refresh: function(){
      var active = metricButtons.active();
      if(active && current) draw(active);
    }
  };

})(window.SBL);
