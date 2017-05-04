'use strict';

/**
 * Module dependencies.
 */
const tty = require('tty'),
  events = require('events');

const term = (portPath, delimiter, callback, fd) => {
  let out = '',
    portRefrence = new events.EventEmitter(),
    port = new tty.ReadStream(fd);

  // port.setRawMode(true);
  port.on('data', function (data) {
    out += data.asciiSlice();
    if (delimiter) {
      if (out.indexOf(delimiter) < 0) {
        return;
      }

      out = out.replace(delimiter, '');
    }

    portRefrence.emit('data', out);

    out = '';
  });

  const closed = (data) => {
    try {
      portRefrence.emit('closed', data);
    } catch(err) {
      //already removed from memory
    }
  };

  port.on('error', function (data) {
    portRefrence.emit('error', data);
  });

  port.on('close', closed);

  port.on('end', closed);

  port.on('exit', closed);

  const sendData = (data) => {
    port.write(data + delimiter);
  };

  portRefrence.serialPort = portPath;
  portRefrence.send = sendData;
  portRefrence.close = function() {
    port.end();
    port = null;
    portRefrence = null;
  };

  callback(portRefrence);
}

module.exports = term;
