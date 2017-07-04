'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  events = require('events'),
  Duplex = require('stream').Duplex;

/**
 * Read and write to serial port.
 * @param  {String}   portPath  - Path to the serialport
 * @param  {String}   delimiter - Serial output delimiter
 * @param  {Object}   fd        - Filedescriptor
 * @return {Promise}
 */
function term (portPath, delimiter, fd) {

  return new Promise((resolve, reject) => {
    let out = '',
      event = new events.EventEmitter();

    try {
      const _fd = { fd: fd };
      // Open a write stream
      Duplex.Writable = fs.createWriteStream(null, _fd);

      // Open a read stream
      Duplex.Readable = fs.createReadStream(null, _fd);
      Duplex.Readable.setEncoding('utf8');

    } catch (error) {
      reject(error);
      return;
    }

    /**
     * Serial data receiver; emits the data when received.
     * @param  {String} data - The received data
     */
    Duplex.Readable.on('data', function (data) {
      if (!data) return;

      out += data;

      if (delimiter) {
        // Check if he data contains the delimiter
        if (out.indexOf(delimiter) < 0) {
          return;
        }
        // Replace the delimiter in the output data
        out = out.replace(delimiter, '');
      }

      // Emit the output
      event.emit('data', out);

      // Reset the output
      out = '';
    });

    /**
     * Eventhandler that will close the communication.
     * @param  {String} data - The last received data
     */
    const onend = (data) => {
      if (!event.isOpen) return;
      event.isOpen = false;
      event.emit('closed', data);
    };

    /**
     * Sends data to the serialport.
     * @param  {String} data - The data to send
     */
    const onsend = (data) => {
      if (!event.isOpen) return;
      Duplex.Writable.write(data + delimiter);
    };

    /**
     * Closes the read- and writeable stream.
     */
    const onclose = () => {
      // end will call `closed()`
      Duplex.Readable.destroy();
      Duplex.Writable.destroy();
    };

    // Readable error handler
    Duplex.Readable.on('error', function (error) {
      process.nextTick(() => event.emit('error', error));
    });

    // Writable error handler
    Duplex.Writable.on('error', function (error) {
      process.nextTick(() => event.emit('error', error));
    });

    // Readable end handler
    Duplex.Readable.on('end', onend);


    event.serialPort = portPath;
    event.send = onsend;
    event.close = onclose;
    event.isOpen = true;

    resolve(event);
  });
};

module.exports = term;
