var sys     = require('sys'),
    CP    = require('child_process');

var serial={
    find:findPorts,
    listen:term,
    send:push
};

function findPorts(callback){
    CP.exec(
        'setserial /dev/ttyUSB*', 
        (
            function(){
                return function(err,data,stderr){
                    if(!callback)
                        return;
                    var ports=[];
                    data=data.split('\n');
                    for(var i=0; i<data.length;i++){
                        var port=data[i].split(',');
                        if(port[0].indexOf('tty')<0)
                            continue;
                        
                        ports.push(port[0]);
                    }
                    
                    callback(ports);
                }
            }
        )(callback)
    );
}

function push(port,msg){
    console.log('echo "'+msg.replace('\"','"').replace('"','\"')+'" > '+port)
    CP.exec(
        'echo "'+msg.replace('\"','"').replace('"','\"')+'" > '+port
    )
}

function term(port){
    var child=CP.spawn(
        'cat', 
        [port],
        {
            stdio:['pipe','pipe','pipe']
        }
    );
    
    var out='';
    
    child.stdout.on(
        'data', 
        function (data) {
            out+=data.asciiSlice();
            if(out.indexOf('\n')<0)
                return;
            
            console.log('>', out);
            out='';
        }
    );

    child.stderr.on(
        'data', 
        function (data) {
            console.log('err>', data.asciiSlice());
        }
    );

    child.on(
        'close', 
        function (code) {
            console.log('child process exited with code ' + code);
        }  
    );
    
    child.serialPort=port;
    
    child.echo=function(msg){
        push(child.serialPort,msg);
    };

    return {
        port:child.serialPort,
        send:child.echo
    }
}

module.exports=serial;