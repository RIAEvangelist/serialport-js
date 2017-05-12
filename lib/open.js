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
  const flags = 'r+';

  // Open file for reading and writing. An exception occurs if the file does not exist.
  fs.open(path, flags, function(error, fd){
    if (error) {
      throw error;
    }

    self.term(path, delimiter, callback, fd);
  });

}

module.exports = open;
