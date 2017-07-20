'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  path = require('path');

/**
 * Find all registered serial ports by-id
 *
 * @return {Promise<Object[]|Error>}
 */
function find () {
  const serialPath = this.paths.linux.serial;
  const readLink = (file, filePath) => (
    new Promise((resolve, reject) => {
      fs.readlink(filePath, (error, link) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            'info': file.replace(/\_/g, ' '),
            'port': path.resolve(serialPath, link)
          });
        }
      });
    })
  );
  const readDir = (directory) => (
    new Promise((resolve, reject) => {
      fs.readdir(directory, (error, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(files);
        }
      });
    })
  );

  return new Promise(async (resolve, reject) => {
    try {
      const files = await readDir(this.paths.linux.serial);

      if (!files.length) {
        // Resolve if the directory is empty
        resolve([]);
      }

      let promises = [];
      files.forEach((file) => {
        const filePath = path.join(serialPath, file);
        promises.push(readLink(file, filePath));
      });

      // Wait for all promisses to be resolved
      this.ports = await Promise.all(promises);

      resolve(this.ports);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Find a serialport by id.
 * @param  {String} id - The serial device id.
 * @return {Promise<Object|Error>}
 */
function findById (id) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id || !id.length) {
        throw new Error('Undefined parameter id!');
      }

      const ports = await this.find();
      const result = ports.filter(port => port.info.includes(id));

      if (!result.length) {
        resolve(null);
      } else {
        resolve(result[0]);
      }
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  'find': find,
  'findById': findById
};
