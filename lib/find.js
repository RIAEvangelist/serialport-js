'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  path = require('path');

function find () {

  return new Promise((resolve, reject) => {

    fs.readdir(this.paths.linux.serial, (error, files) => {
      if (error) {
        reject(error);
        return;
      }
      const size = files.length;

      if (!size) {
        resolve([]);
        return;
      }

      for (let i = 0; i < size; i++) {
        const file = files[i];
        const filePath = path.join(this.paths.linux.serial, files[i]);

        fs.readlink(filePath, (error, link) => {
          if (error) {
            reject(error);
            return;
          }

          this.ports.push({
            'info': file.replace(/\_/g, ' '),
            'port': path.resolve(this.paths.linux.serial, link)
          });
        });
      }

      resolve(this.ports);
    });

  })

}

module.exports = find;
