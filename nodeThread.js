var serialjs=require(__dirname+'/serialport-js');
var openPorts={};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on(
    'data', 
    function(data) {
        try{
            var data=JSON.parse(data);
        }catch(err){
            process.stdout.write(
                JSON.stringify(
                    { 
                        type    : 'error', 
                        data    : {
                            err:'Malformed JSON',
                            JSON:data
                        }
                    }
                )
            );
        }
        switch(data.type){
            case 'find' :
                serialjs.find(updatePorts);
                break;
            case 'connect' :
                setPort(data.data.port,data.data.delimiter);
                break;
            case 'data' :
                openPorts[data.data.port].send(data.data.data);
                break;
            case 'close' :
                if(!openPorts[data.data])
                    return;
                
                openPorts[data.data].removeListener(
                    'data',
                    gotData
                );
                openPorts[data.data].close();
                openPorts[data.data]=null;
                break;
        }
    }
);

function updatePorts(ports){
    process.stdout.write(
        JSON.stringify(
            { 
                type    : 'portList', 
                data    : ports 
            }
        )
    );
}

function start(port){
    openPorts[port.serialPort]=port;
    
    port.on(
        'data',
        gotData
    );

    port.on(
        'close',
        closePort
    );
}

function closePort(data){
    process.stdout.write(
        JSON.stringify(
            { 
                type    : 'close', 
                data    : {
                    data:data,
                    port:this.serialPort
                }
            }
        )
    );
    openPorts[data.port]=null;
}

function gotData(data){
    process.stdout.write(
        JSON.stringify(
            { 
                type    : 'data', 
                data    : {
                    data:data,
                    port:this.serialPort
                }
            }
        )
    );
}

function setPort(port,delimiter){
    serialjs.open(port,start,delimiter);
}