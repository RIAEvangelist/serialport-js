#serialport-js
-
*a pure javascript serial port implementation for node.js node-webkit and nw.js*  

#ALPHA
####only tested with linux at this time
####only looking for ttyUSB at this time

#requirements
` setserial ` is required at this point to determine the available serial ports on a machine.

if installing into a project dir, as I suggest you do, ` setserial ` will be installed automatically if not present.

if installing with ` npm install -g ` make sure to have ` setserial ` pre installed or it will hang with the current package.

#Installing serialport-js
` npm install serialport-js `

#Module Methods
-

|method | arguments            | result                           | description |
|-------|----------------------|----------------------------------|-------------|
|find   | callback, port type  | array of ports passed to callback| if no port type specified returns  |
|send   | port, data           |                                  | sends data to the specified serial port |
|open   | port, delimiter      | returns reference to port        | open a serial port for bidirectional communication. The returned refrence will have the port info and a send function available on it. Data events will be dispatched on the returned port reference when the delimiter is received |

#Port Events
-

|method | arguments            | description                      |
|-------|----------------------|----------------------------------|
|data   | data                 | array of ports passed to callback|
|err    | errType, message     | an error happened on the port    |
|close  |                      | the port has been closed         |

#Port Methods
-

|method | arguments            | description                      |
|-------|----------------------|----------------------------------|
|send   | data                 | sends data to the port           |
|close  | errType, message     | closes the port                  |


#Examples
-

### find any available serial ports
    
    var serialjs=require('serialport-js');

    serialjs.find(
        function(ports){
            console.log('available usb serial : ',ports);
        }
    );

### find an available serial USB port
    
    var serialjs=require('serialport-js');

    serialjs.find(
        function(ports){
            console.log('available usb serial : ',ports);
        },
        '/dev/ttyUSB'
    );

### find a specific serial USB port
    
    var serialjs=require('serialport-js');

    serialjs.find(
        function(ports){
            console.log('available usb serial : ',ports);
        },
        '/dev/ttyUSB0'
    );

### send a message to a specific serial USB port without opening it for bi-directional communication.
    
    var serialjs=require('serialport-js');

    serialjs.send(
        '/dev/ttyUSB0',
        'hello'
    );

### find, then open serial port and communicate with it bi-directionally.

    var serialjs=require('serialport-js');

    serialjs.find(
        function(ports){
            console.log('available usb serial : ',ports);
            if(ports[0]){
                var term=serialjs.open(ports[0],'\n');
                
                term.on(
                    'data',
                    function(data){
                        console.log(data);
                    }
                );

                term.send('hello');
            }
        }
    );



