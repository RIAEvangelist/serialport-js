'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  cp = require('child_process'),
  sys = require('util'),
  tty = require('tty'),
  path = require('path'),
  events = require('events');

let serial = new events.EventEmitter();


const paths = {
    linux: {
      serial:'/dev/serial/by-id'
    }
};


const findPorts = () => (

  new Promise((resolve, reject) => {

    fs.readdir(paths.linux.serial, (error, files) => {
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
        const filePath = path.join(paths.linux.serial, files[i]);

        fs.readlink(filePath, (error, link) => {
          if (error) {
            reject(error);
            return;
          }

          serial.ports.push({
            'info': file.replace(/\_/g,' '),
            'port': path.resolve(paths.linux.serial, link)
          });
        });
      }

      resolve(serial.ports);
    });

  })

);

const open = (path, callback, delimiter) => {
  if(!callback){
    return;
  }
  
  (function(path,callback,delimiter){
    fs.open(path, 'r+', function(err, fd){
      term(path, delimiter, callback, fd);
    });
  })(path, callback, delimiter);
};

function term (portPath, delimiter, callback, fd){
    var out = '',
        portRefrence = new events.EventEmitter(),
        port = new tty.ReadStream(fd);
    
    //port.setRawMode(true);
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

    const closed = data => {
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
    
    const sendData = data => {
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

function nwjs() {
    let serial = new events.EventEmitter();
    serial.find = findPorts;
    serial.open = open;
    serial.ports = [];
    
    let callbacks={
      find:[]
    }
    
    let openPorts={};
    
    let child = cp.spawn(
      'node', 
      [__dirname + '/nodeThread.js'],
      {
          stdio: ['pipe', 'pipe', 'pipe']
      }
    );
    
    function findPorts(callback){
        callbacks.find.push(callback);
        child.stdin.write(
            JSON.stringify(
                {
                    type:'find'
                }
            )
        );
    }
    
    function open(path,callback,delimiter){
        if(!callback)
            return;
        
        child.stdin.write(
            JSON.stringify(
                {
                    type: 'connect',
                    data: {
                        port:path,
                        delimiter:delimiter
                    }
                }
            )
        );
        
        var portRefrence=openPorts[path]=new events.EventEmitter();
        portRefrence.serialPort=path;
        portRefrence.send=sendData;
        portRefrence.close=function(){
            child.stdin.write(
                JSON.stringify(
                    {
                        type:'close',
                        data:this.serialPort
                    }
                )
            );
            openPorts[this.serialPort]=null;
            portRefrence=null;
        };
        
        openPorts[path]=portRefrence;
        
        function sendData(data){
            child.stdin.write(
                JSON.stringify(
                    {
                        type: 'data',
                        data: {
                            port:path,
                            data:data
                        }
                    }
                )
            );
        }
        
        //allow connection to happen
        setTimeout(
            function(){
                callback(portRefrence);
            },
            2
        );
    }

    child.stdout.on(
        'data', 
        function (data) {
            try{
                data=JSON.parse(
                    data.asciiSlice()
                );
            }catch(err){
                console.log(err);
                console.log(data.asciiSlice());
            }
            
            switch(data.type){
                case 'portList' :
                    var callback=callbacks.find.shift();
                    if(!callback)
                        return;
                    
                    callback(data.data);
                    
                    break;
                case 'data' :
                    openPorts[data.data.port].emit(
                        'data',
                        data.data.data
                    );
                    break;
                case 'close' :
                    if(!openPorts[data.data.port])
                        return;
                    
                    openPorts[data.data.port].emit(
                        'close',
                        data.data.data
                    );
                    openPorts[this.serialPort]=null;
                    break;
            }
        }
    );

    child.stderr.on(
        'data', 
        function (data) {
            console.log(data.asciiSlice());
        }
    );

    return serial;
}

serial.paths = paths;
serial.find = findPorts;
serial.open = open;
serial.ports = [];
serial.node = nwjs;

module.exports = serial;
