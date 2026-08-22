/* ==========================================================================
   HEAD TO HEAD — two machines, every figure paired.

   The ladder answers "how does this class spread across one number". This
   answers the other question people actually ask, which a ladder is built to
   be bad at: these two specifically, how do they differ across everything at
   once. Until now that meant ticking two boxes on the compare view and
   reading a thirteen-column table sideways.

   Either side can be a current model or any generation on record, so a
   Panigale V2 can face the 955cc one it replaced.
   ========================================================================== */

(function(SBL){
  "use strict";

  var view = document.getElementById("vsView");
  var body = document.getElementById("vsBody");

  /* The two slots. Each holds a base bike and, optionally, which generation
     of it — kept apart so changing the generation does not re-run the search. */
  var slots = { a: { bike: null, gen: null }, b: { bike: null, gen: null } };

  /* ---------- the rows ----------
     `better` is the direction of the arrow, and most rows do not get one.
     Power, torque, weight, power-to-weight and 0–100 have a direction almost
     nobody disputes. Seat height, price and pounds-per-PS do not: there is no
     version of those where one end is simply the good end, and drawing an
     arrow would be inventing an opinion the data does not hold.

     `est` names the metric key that marks a figure as derived rather than
     published, so a delta between two derived figures can be softened. */
  var ROWS = [
    { label:"Category",  text:function(s){ return SBL.CATEGORIES[s.cat].name } },
    { label:"Engine",    text:function(s){ return s.e } },
    { label:"Power",     key:"p",   better:1,  unit:" PS",
      show:function(s){ return s.p + " PS" + (s.kw !== undefined ? " · " + s.kw + " kW" : "") } },
    { label:"Torque",    key:"t",   better:1,  unit:" Nm" },
    { label:"Wet weight",key:"w",   better:-1, unit:" kg" },
    { label:"Power to weight", key:"ptw", better:1, unit:" PS/kg", dp:2 },
    { label:"0–100 km/h",key:"a",   better:-1, unit:" s", dp:1, est:"a",
      show:function(s){ return "~" + s.a + " s" } },
    { label:"Top speed", key:"ts",  better:1,  unit:" km/h", est:"ts",
      show:function(s){ return "~" + s.ts + " km/h" } },
    { label:"Seat height", key:"s", unit:" mm" },
    { label:"Price",     key:"price", unit:"", money:true },
    { label:"£ per PS",  key:"pricePerPs", unit:"", money:true, dp:0 },
    { label:"Wheels",    text:function(s){ return SBL.tyrePair(s, "rim", "in") || "—" } },
    { label:"Licence",   text:function(s){ return SBL.licenceLabel(s) } }
  ];

  function money(n){ return "£" + Math.round(n).toLocaleString("en-GB") }

  function round(n, dp){ return dp ? n.toFixed(dp) : String(Math.round(n)) }

  /* The spec on screen for a slot: the current bike, or one of its
     generations resolved to that generation's own figures. */
  function specOf(slot){
    if(!slot.bike) return null;
    if(!slot.gen) return slot.bike;
    var gen = slot.bike.gens.find(function(g){ return g.from === slot.gen });
    return gen ? SBL.asGeneration(slot.bike, gen) : slot.bike;
  }

  /* ---------- pickers ---------- */
  ["a", "b"].forEach(function(side){
    SBL.buildSearch(view.querySelector('[data-vs="' + side + '"]'), {
      label:  side === "a" ? "First bike" : "Second bike",
      brands: false,
      onPick: function(hit){
        slots[side] = { bike: hit.bike, gen: null };
        render();
        SBL.stateChanged();
      }
    });
  });

  /* Generation chips and the clear button, delegated because both are
     rebuilt on every render. */
  view.addEventListener("click", function(e){
    var chip = e.target.closest("[data-vsgen]");
    if(chip){
      var slot = slots[chip.dataset.vsside];
      slot.gen = chip.dataset.vsgen ? Number(chip.dataset.vsgen) : null;
      render();
      SBL.stateChanged();
      return;
    }
    var clear = e.target.closest("[data-vsclear]");
    if(clear){
      slots[clear.dataset.vsclear] = { bike: null, gen: null };
      render();
      SBL.stateChanged();
    }
  });

  /* ---------- the chosen-bike block ---------- */
  function renderChosen(side){
    var el   = document.getElementById("vsChosen" + side.toUpperCase());
    var slot = slots[side];

    if(!slot.bike){ el.innerHTML = ""; return }

    var gens = [{ from: slot.bike.from, to: slot.bike.to, current: true }]
      .concat(slot.bike.gens);

    /* One chip per generation, and none at all for a model with no archive —
       a lone chip that cannot be changed is a control that does nothing. */
    var chips = gens.length < 2 ? "" :
      '<div class="vs-gens">' + gens.map(function(g){
        var value = g.current ? "" : g.from;
        var on = (slot.gen || "") === (value || "");
        return '<button class="cat yr" data-vsside="' + side + '" data-vsgen="' + value +
          '" aria-pressed="' + on + '">' + SBL.genLabel(g.from, g.to) + '</button>';
      }).join("") + '</div>';

    el.innerHTML =
      '<p class="vs-name"><span class="s-dot" style="--bc-light:' + slot.bike.accent +
        ';--bc-dark:' + slot.bike.accentDark + '"></span>' + slot.bike.brand + ' <b>' + slot.bike.n + '</b>' +
        '<button class="vs-clear" data-vsclear="' + side + '" aria-label="Clear this bike">' +
        '&times;</button></p>' + chips;
  }

  /* ---------- the table ---------- */
  function cell(spec, row, winner){
    var text = row.text ? row.text(spec)
             : row.show ? row.show(spec)
             : spec[row.key] === undefined ? "—"
             : row.money ? money(spec[row.key])
             : round(spec[row.key], row.dp) + row.unit;

    /* An estimate keeps its marking here exactly as it has it everywhere
       else, whether or not the delta beside it ends up softened. */
    if(row.est && SBL.isEstimated(spec, row.est)){
      text = '<span class="est" title="Estimated, not a published figure">' + text + '</span>';
    }
    return '<td class="vsv' + (winner ? " win" : "") + '">' + text + '</td>';
  }

  function render(){
    ["a", "b"].forEach(renderChosen);

    var a = specOf(slots.a), b = specOf(slots.b);

    if(!a || !b){
      body.innerHTML = '<div class="empty">' +
        (a || b ? "One more to go — pick a second bike above."
                : "Pick two bikes above and every figure lines up side by side.") +
        '</div>';
      return;
    }

    if(a.uid === b.uid && (slots.a.gen || null) === (slots.b.gen || null)){
      body.innerHTML = '<div class="empty">That is the same machine on both sides. ' +
        'Pick a different bike, or a different generation of this one.</div>';
      return;
    }

    var rows = ROWS.map(function(row){
      if(row.text){
        return '<tr>' + cell(a, row) +
          '<th class="vsmid">' + row.label + '</th>' + cell(b, row) + '</tr>';
      }

      var va = a[row.key], vb = b[row.key];
      var known = va !== undefined && vb !== undefined;
      var soft  = row.est && SBL.isEstimated(a, row.est) && SBL.isEstimated(b, row.est);
      var gap   = known ? va - vb : 0;

      /* No arrow on a row with no agreed direction, on a tie, on a row where
         one side has no figure, or where both figures are derived. */
      var winA = known && !soft && row.better && gap * row.better > 0;
      var winB = known && !soft && row.better && gap * row.better < 0;

      /* The arrow points at the side it favours, which is the left-hand one
         when winA — so the left-pointing mark goes with winA, not winB. */
      var delta = !known ? "—"
        : gap === 0 ? "level"
        : (winA ? "◂ " : "") +
          (row.money ? money(Math.abs(gap)) : round(Math.abs(gap), row.dp) + row.unit) +
          (winB ? " ▸" : "");

      return '<tr>' + cell(a, row, winA) +
        '<th class="vsmid">' + row.label +
          '<span class="vsdelta' + (soft ? " soft" : "") + '"' +
            (soft ? ' title="Both figures are derived from power to weight, so the difference between them is mostly an artefact of that"' : "") +
            '>' + delta + '</span>' +
        '</th>' +
        cell(b, row, winB) + '</tr>';
    }).join("");

    body.innerHTML =
      '<div class="scroller vs-scroller"><table class="vstable"><thead><tr>' +
        '<th>' + head(a, slots.a) + '</th><th class="vsmid"></th><th>' + head(b, slots.b) + '</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function head(spec, slot){
    return '<span class="s-dot" style="--bc-light:' + spec.accent +
      ';--bc-dark:' + spec.accentDark + '"></span>' +
      spec.brand + ' ' + spec.n +
      (slot.gen ? ' <span class="gyr">' + spec.gLabel + '</span>' : "");
  }

  /* ---------- router ----------
     Slots travel as a uid, with the generation's first year after an @ —
     the same shape SBL.generationsOf() gives a generation's own uid. */
  function packSlot(slot){
    if(!slot.bike) return null;
    return slot.bike.uid + (slot.gen ? "@" + slot.gen : "");
  }

  function unpackSlot(text){
    if(!text) return { bike: null, gen: null };
    var parts = String(text).split("@");
    var bike  = SBL.ALL.find(function(x){ return x.uid === parts[0] });
    if(!bike) return { bike: null, gen: null };
    var year = Number(parts[1]);
    var has  = bike.gens.some(function(g){ return g.from === year });
    return { bike: bike, gen: has ? year : null };
  }

  SBL.vsView = {
    render: render,
    isOpen: function(){ return !view.classList.contains("hidden") },
    state:  function(){ return { a: packSlot(slots.a), b: packSlot(slots.b) } },
    setState: function(s){
      slots.a = unpackSlot(s.a);
      slots.b = unpackSlot(s.b);
      render();
    },

    /* Used by the compare view, where having exactly two models ticked is
       already most of the way to asking this question. */
    open: function(uidA, uidB){
      slots.a = unpackSlot(uidA);
      slots.b = unpackSlot(uidB);
      render();
    }
  };

  render();

})(window.SBL);
