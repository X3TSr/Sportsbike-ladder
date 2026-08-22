/* ==========================================================================
   THEME — light, dark, or whatever the operating system says.

   Three states rather than two, because a two-way switch has no way back:
   once you have overridden the system setting there is no position that means
   "go back to following it". And following it is the right default — but only
   the default. A phone in a dark garage and the same phone in daylight are
   different situations from whatever the OS was told last week.

   The palette itself lives entirely in base.css. This module only stamps
   data-theme on <html> and remembers the choice; every colour follows from
   the token blocks there, including the brand accents, which are carried as
   light/dark pairs so a switch repaints them with no re-render at all.
   ========================================================================== */

(function(){
  "use strict";

  var KEY   = "sbl-theme";
  var ORDER = ["system", "light", "dark"];

  var LABEL = { system: "Theme: auto", light: "Theme: light", dark: "Theme: dark" };
  /* Sun, moon, and the half-filled circle that means "whatever the room is". */
  var ICON  = { system: "◐", light: "☀", dark: "☾" };

  /* The stamp is already on <html> from the snippet in <head>; this only
     needs to agree with it. Doing it there rather than here is what stops a
     dark-mode reader getting a white flash on every page load. */
  var current = read();
  var buttons = [];

  /* localStorage is unavailable in some privacy modes and throws rather than
     returning null, so every touch of it is guarded. The site works without
     it; the choice just does not survive a reload. */
  function read(){
    try{
      var saved = localStorage.getItem(KEY);
      return ORDER.indexOf(saved) >= 0 ? saved : "system";
    }catch(e){ return "system" }
  }

  function save(value){
    try{
      if(value === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, value);
    }catch(e){ /* nothing to do about it, and nothing depends on it */ }
  }

  function apply(){
    var root = document.documentElement;
    if(current === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", current);

    buttons.forEach(function(button){
      button.textContent = ICON[current];
      button.setAttribute("aria-label", LABEL[current] + ". Click to change.");
      button.title = LABEL[current];
    });
  }

  function cycle(){
    current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    save(current);
    apply();
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function(host){
    var button = document.createElement("button");
    button.className = "theme-toggle";
    button.type = "button";
    button.addEventListener("click", cycle);
    host.appendChild(button);
    buttons.push(button);
  });

  apply();

  window.SBL = window.SBL || {};
  window.SBL.theme = {
    get: function(){ return current },
    set: function(value){
      if(ORDER.indexOf(value) < 0) return;
      current = value;
      save(current);
      apply();
    }
  };

})();
