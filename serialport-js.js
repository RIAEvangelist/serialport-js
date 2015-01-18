var fs      = require('fs'),
    cp      = require('child_process'),
    sys     = require('sys'),
    tty     = require('tty'),
    path    = require('path'),
    events  = require('events');

var serial=new events.EventEmitter();
serial.find=findPorts;
serial.open=open;
serial.ports=[];
serial.node=nwjs;

var paths={
    linux:{
        serial:'/dev/serial/by-id'
    }
};

function findPorts(callback){
    fs.readdir(
        paths.linux.serial, 
        function (err, files) {
            if (err) {
                //handle error
                return;
            }
            
            var fileCount=files.length;
            
            serial.ports=[];
            
            for(var i=0; i<files.length; i++){
                fileName=path.join(
                    paths.linux.serial, 
                    files[i]
                );
                
                (
                    function(portID,fileCount,callback){
                        fs.readlink(
                            fileName, 
                            function (err, link) {
                                if (err) {
                                    //handle error
                                    return;
                                }

                                var link = path.resolve(
                                    paths.linux.serial, 
                                    link
                                );
                            
                                serial.ports.push(
                                    {
                                        info:portID.replace(/\_/g,' '),
                                        port:link
                                    }
                                );
                                
                                fileCount--;
                                
                                if(fileCount)
                                    return;
                                
                                if(callback)
                                    callback(serial.ports);
                            }
                        );
                    }
                )(files[i],fileCount,callback);
            
            }
        }
    );
}

function open(path,callback,delimiter){
    if(!callback)
        return;
    
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

function term(portPath,delimiter,callback,fd){
    var out='',
        portRefrence=new events.EventEmitter(),
        port=new tty.ReadStream(fd);
    
    //port.setRawMode(true);;
    port.on(
        'data', 
        function (data) {
            out+=data.asciiSlice();
            if(delimiter){
                if(out.indexOf(delimiter)<0)
                    return;
                
                out=out.replace(delimiter,'');
            }
            
            portRefrence.emit(
                'data',
                out
            );
        
            out='';
        }
    );

    port.on(
        'error', 
        function (data) {
            portRefrence.emit(
                'error',
                data
            );
        }
    );

    port.on(
        'close', 
        closed  
    );

    port.on(
        'end', 
        closed  
    );

    port.on(
        'exit', 
        closed  
    );

    function closed(data){
        try{
            portRefrence.emit(
                'closed',
                data
            );
        }catch(err){
            //already removed from memory
        }
    }
    
    function sendData(data){
        port.write(data+delimiter);
    }
    
    portRefrence.serialPort=portPath;
    portRefrence.send=sendData;
    portRefrence.close=function(){
        port.end();
        port=null;
        portRefrence=null;
    };
    
    callback(portRefrence);
}

function nwjs(){
    var serial=new events.EventEmitter();
    serial.find=findPorts;
    serial.open=open;
    serial.ports=[];
    
    var callbacks={
        find:[]
    }
    
    var openPorts={};
    
    var child=cp.spawn(
        'node', 
        [__dirname + '/nodeThread.js'],
        {
            stdio:['pipe','pipe','pipe']
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
        
        callback(portRefrence);
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

module.exports=serial;