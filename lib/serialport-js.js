'use strict';

/**
 * Module dependencies.
 */
const cp = require('child_process'),
  events = require('events');

let serial = new events.EventEmitter();

function nwjs() {
  let serial = new events.EventEmitter();
  serial.find = findPorts;
  serial.open = open;
  serial.ports = [];

  let callbacks = { find:[] };

  let openPorts = {};

  let child = cp.spawn('node',
    [__dirname + '/nodeThread.js'],
    { stdio: ['pipe', 'pipe', 'pipe'] }
  );

  function findPorts(callback) {
    callbacks.find.push(callback);
    child.stdin.write(
      JSON.stringify({ type: 'find' })
    );
  }

  function open(path, callback, delimiter) {
    if (!callback) {
      return;
    }

    child.stdin.write(JSON.stringify({
      type: 'connect',
      data: {
        port: path,
        delimiter: delimiter
      }
    }));

    let portRefrence = openPorts[path] = new events.EventEmitter();
    portRefrence.serialPort = path;
    portRefrence.send = sendData;

    portRefrence.close = function() {
      child.stdin.write(JSON.stringify({
        type: 'close',
        data: this.serialPort
      }));

      openPorts[this.serialPort] = null;
      portRefrence = null;
    };

    openPorts[path] = portRefrence;

    function sendData(data) {
      child.stdin.write(JSON.stringify({
        type: 'data',
        data: {
          port: path,
          data: data
        }
      }));
    }

    //allow connection to happen
    setTimeout(() => callback(portRefrence), 2);
  }

  child.stdout.on('data', function (data) {
    try {
      data = JSON.parse(data.asciiSlice());
    } catch(err) {
      console.log(err);
      console.log(data.asciiSlice());
    }

    switch(data.type) {
      case 'portList' :
        let callback = callbacks.find.shift();
        if (!callback) {
          return;
        }

        callback(data.data);

        break;
      case 'data':
        openPorts[data.data.port].emit('data', data.data.data);
        break;
      case 'close':
        if (!openPorts[data.data.port]) {
          return;
        }

        openPorts[data.data.port].emit('close', data.data.data);
        openPorts[this.serialPort] = null;
        break;
    }
  });

  child.stderr.on('data', data => console.log(data.asciiSlice()));

  return serial;
}
/**
 * Linux Serial Directory path
 * @type {Object}
 */
serial.paths = {
  linux: {
    serial:'/dev/serial/by-id'
  }
};
serial.ports = [];
serial.node = nwjs;
serial.find = require('./find').find.bind(serial);
serial.findById = require('./find').findById.bind(serial);
serial.open = require('./open');
serial.term = require('./term')

module.exports = serial;
