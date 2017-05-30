'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  path = require('path');

/**
 * Find all registered serial ports by-id
 * @param  {Function} callback
 * @return {Promise}
 */
function find () {

  const readLink = (file, filePath) => (
    new Promise((resolve, reject) => {
      fs.readlink(filePath, (error, link) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          'info': file.replace(/\_/g, ' '),
          'port': path.resolve(this.paths.linux.serial, link)
        });
      });
    })
  );

  return new Promise((resolve, reject) => {

    // List the directory
    fs.readdir(this.paths.linux.serial, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      if (!files.length) {
        // Resolve if the directory is empty
        resolve([]);
        return;
      }

      let promises = [];
      files.forEach((file) => {
        const filePath = path.join(this.paths.linux.serial, file);
        promises.push(readLink(file, filePath));
      });

      // Wait for all promisses to be resolved
      Promise.all(promises)
      .then((ports) => {
        this.ports = ports;
        resolve(ports);
      })
      .catch((error) => {
        reject(error);
      });
    });
  });
}

module.exports = find;
