var fs      = require('fs'),
    sys     = require('sys'),
    tty     = require('tty'),
    events  = require('events');

var serial={
    find:findPorts,
    open:open
};

function findPorts(callback,type){
    if(!callback)
        return;
    
    console.log('to come soon, not yet implemented.')
}

function open(path,callback,delimiter){
    (
        function(path,callback,delimiter){
            fs.open(
                path,
                'r+',
                function(err,fd){
                    term(path,delimiter,callback,fd);
                }
            );
        }
    )(path,callback,delimiter);
}

function term(port,delimiter,callback,fd){
    var out='',
        portRefrence=new events.EventEmitter(),
        port=new tty.ReadStream(fd);
    
    port.setRawMode(true);;
    port.serialPort=port;
    console.log(port)
    port.on(
        'data', 
        function (data) {
            out+=data.asciiSlice();
            if(out.indexOf(delimiter)<0)
                return;
            
            portRefrence.emit(
                'data',
                out
            );
        
            out='';
        }
    );

    port.on(
        'data', 
        function (data) {
            portRefrence.emit(
                'err',
                data
            );
        }
    );

    port.on(
        'close', 
        function (code) {
            console.log('port closed ' + code);
        }  
    );
    
    function sendData(data){
        port.write(data+delimiter);
    }
    
    portRefrence.port=port.serialPort;
    portRefrence.send=sendData;
    portRefrence.close=function(){
        
    };
    
    callback(portRefrence);
}

module.exports=serial;