'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs');

function open (path, callback, delimiter) {
  if (!callback) {
    throw new Error('Undefined parameter callback');
  }

  const self = this;
  fs.open(path, 'r+', function(error, fd){
    if (error) {
      throw error;
    }

    self.term(path, delimiter, callback, fd);
  });

}

module.exports = open;
