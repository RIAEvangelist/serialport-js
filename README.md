#serialport-js
-
*a pure javascript serial port implementation for node.js node-webkit and nw.js*  

#ALPHA
####only tested with linux at this time
####only looking for ttyUSB at this time

#Methods
-

|method | arguments | functionality |
|-------|-----------|---------------|
|find   | callback  | finds all available USB serial interfaces |
|send   | port, msg | sends a message to the specified serial port |
|listen | port      | open a serial port for bidirectional communication |


#Examples
-

### find available serial ports
    
    var serialjs=require('serialport-js');

    serialjs.find(
        function(ports){
            console.log('available usb serial : ',ports);
        }
    );

### send a message to a serial port
    
    var serialjs=require('serialport-js');

    serialjs.send(
        '/dev/ttyUSB0',
        'hello'
    );

### find an open serial port and interact with it.

    var serialjs=require('serialport-js');

    serialjs.find(
        function(ports){
            console.log('available usb serial : ',ports);
            if(ports[0]){
                var term=serialjs.listen(
                    ports[0],
                    function(data){
                        console.log('data : ',data);
                    }
                );

                term.send('hello');
            }
        }
    );



