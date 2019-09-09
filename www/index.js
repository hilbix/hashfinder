"use strict";
// hashfinder.org

function E(s) { return document.getElementById(s); }

class App
  {
    constructor(name)
      {
        this.name = name;
      }
    onready() { return () => this.init() }
    init() { E('main').innerHTML = 'HW' }
  };

window.onready = new App('hashfinder').onready();

