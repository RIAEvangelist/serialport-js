'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  tty = require('tty'),
  events = require('events'),
  Duplex = require('stream').Duplex;

const term = (portPath, delimiter, callback, fd) => {

  let out = '',
    event = new events.EventEmitter();
    // port = new tty.ReadStream(fd);

  Duplex.Readable = fs.createReadStream(null, {fd: fd});
  Duplex.Writable = fs.createWriteStream(null, {fd: fd});
  Duplex.Readable.setEncoding('utf8');
  console.log(Duplex.Readable);
  Duplex.Readable.on('data', function (data) {
    console.log(data);
    out += data.asciiSlice();
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

  const closed = (data) => {
    if (!event.isOpen) return;
    event.isOpen = false;
    event.emit('closed', data);
  };

  Duplex.Readable.on('error', function (error) {
    console.log(error);
    event.emit('error', error);
  });
  Duplex.Writable.on('error', function (error) {
    console.log(error);
    event.emit('error', error);
  });

  // // port.on('close', closed);

  Duplex.Readable.on('end', closed);

  // // port.on('exit', closed);

  const sendData = (data) => {
    Duplex.Writable.write(data + delimiter);
  };

  event.serialPort = portPath;
  event.send = sendData;
  event.isOpen = true; 
  event.close = function close() {
    Duplex.Readable.end();
    Duplex.Writable.end();
  };

  callback(event);
};

module.exports = term;
