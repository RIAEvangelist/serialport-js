'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  term = require('./term');

function open (path, callback, delimiter) {
  if(!callback){
    return;
  }

  fs.open(path, 'r+', function(err, fd){
    term(path, delimiter, callback, fd);
  });

}

module.exports = open;
