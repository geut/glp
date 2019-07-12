'use strict';
const {join} = require('path');
const Store = require('electron-store');

module.exports = new Store({
  defaults: {
    keys: [
      'dat://af206247d57b0cdba9bb54b17773d258dce4d6570b7e1c6982e7aadb6f920be2'
    ],
    directories: {
      main: join(__dirname, 'glp_main'),
      dest: join(__dirname, 'glp_archives')
    }
  }
});
