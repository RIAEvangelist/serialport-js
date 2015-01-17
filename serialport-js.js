var sys     = require('sys'),
    CP      = require('child_process'),
    events  = require('events');

var serial={
    find:findPorts,
    open:term,
    send:push
};

function findPorts(callback,type){
    if(!callback)
        return;
    
    var ports=[];
    var search=[
        '/dev/ttyS',
        '/dev/ttyUSB'
    ];
    
    if(type)
        search=[type];
    
    var remaining=search.length;
    
    function foundPorts(err,data){
        data=data.split('\n');
        for(var i=0; i<data.length;i++){
            if(data[i].indexOf('UART')<0 && data[i].indexOf('undefined')<0)
                continue;
            
            ports.push(
                data[i].split(',')[0]
            );
        }
        remaining--;
        if(remaining)
           return;
       
        callback(ports);
    }
    
    for(var i=0; i<search.length; i++){
        CP.exec(
            'setserial '+search[i]+'*', 
            foundPorts
        );
    }
}

function push(port,data){
    CP.exec(
        'echo "'+data.replace(/\"/g,'\"')+'" > '+port
    )
}

function term(port,delimiter){
    var out='',
        portRefrence=new events.EventEmitter(),
        child=CP.spawn(
            'cat', 
            [port],
            {
                stdio:['pipe','pipe','pipe']
            }
        );
    
    child.serialPort=port;
    
    child.stdout.on(
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

    child.stderr.on(
        'data', 
        function (data) {
            portRefrence.emit(
                'err',
                data
            );
        }
    );

    child.on(
        'close', 
        function (code) {
            console.log('child process exited with code ' + code);
        }  
    );
    
    function sendData(data){
        push(child.serialPort,data);
    }
    
    portRefrence.port=child.serialPort;
    portRefrence.send=sendData;
    portRefrence.close=function(){
        child.close();
    };
    
    return portRefrence;
}

module.exports=serial;