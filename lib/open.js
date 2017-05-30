'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs');

/**
 * Opens the serialport.
 * @param  {String}   path - Absolute path to the file
 * @param  {String}   [delimiter='\r\n'] - Received data line delimiter
 * @return {Promise}
 */
function open (path, delimiter = '\r\n') {

  const self = this;
  const flags = 'r+';

  return new Promise((resolve, reject) => {
    // Open file for reading and writing. An exception occurs if the file does not exist.
    fs.open(path, flags, (error, fd) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        let promise = self.term(path, delimiter, fd);
        resolve(promise);
      } catch (termError) {
        reject(termError);
      }
    });
  });
}

module.exports = open;
