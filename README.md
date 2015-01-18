#serialport-js
-
*a pure javascript serial port implementation for node.js node-webkit and nw.js*  

#ALPHA
####only tested with linux at this time
####only looking for ttyUSB at this time

#requirements
none currently

#Installing serialport-js
` npm install serialport-js `

#Module Methods
-

|method | arguments            | result                           | description |
|-------|----------------------|----------------------------------|-------------|
|find   | callback             | array of ports passed to callback| returns array od ports and info  |
|open   | port, delimiter      | returns reference to port        | open a serial port for bidirectional communication. The returned refrence will have the port info and a send function available on it. Data events will be dispatched on the returned port reference when the delimiter is received |

#Port Events
-

|method | arguments            | description                      |
|-------|----------------------|----------------------------------|
|data   | data                 | array of ports passed to callback|
|error  | errType, data        | an error happened on the port    |
|close  |                      | the port has been closed         |

#Port Methods
-

|method | arguments            | description                      |
|-------|----------------------|----------------------------------|
|send   | data                 | sends data to the port           |
|close  | errType, message     | closes the port                  |


#Examples
-

### basic example 

    var serialjs=require('serialport-js');
    serialjs.open(
        '/dev/ttyUSB0',
        start,
        '\n'
    );

    function start(port){
        port.on(
            'data',
            gotData
        );

        port.send('howdy doody doo!')
    }

    function gotData(data){
        console.log(data);
    }   


### find any available serial ports


    var serialjs=require('serialport-js');

    serialjs.find(
        function(ports){
            console.log('available usb serial : ',ports);
        }
    );

### find, then open serial port and communicate with it bi-directionally.

    var serialjs=require('serialport-js');
    serialjs.find(serialDevicesPopulated);

    function serialDevicesPopulated(ports){
        //ports arg is a refrence to serialjs.ports
        console.log(
            ports
        );

        if(!ports[0])
            return;

        serialjs.open(ports[0].port,start,'\n');
    }

    function start(port){
        port.on(
            'data',
            gotData
        );

        port.send('howdy doody doo');
    }

    function gotData(data){
        console.log(data);
    }

#node-webkit, nw.js, and seperate node.js thread examples
*The only difference with this is that the user must have node installed. It will spawn a node proxy using their local node version and run the pure js serialport implementation. This is great for consumer facing products as there is no need for compilers or dev tools to install the module with your app, users just need node.

    var serialjs=require('serialport-js').node(); //thats the only difference
    //the rest of the implementation is exactly the same.

    serialjs.find(serialDevicesPopulated);

    function serialDevicesPopulated(ports){
        //ports arg is a refrence to serialjs.ports
        console.log(
            ports
        );

        if(!ports[0])
            return;

        serialjs.open(ports[0].port,start,'\n');
    }

    function start(port){
        port.on(
            'data',
            gotData
        );
        
        //if this doesn't show up the port may need a few milliseconds to open
        port.send('howdy doody doo');
    }

    function gotData(data){
        console.log(data);
    }