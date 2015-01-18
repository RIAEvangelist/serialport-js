var serialjs=require('../../serialport-js').node(),
    list=false,
    terminal=false,
    openPort=false;

console.log(serialjs);

var gui = require('nw.gui');
gui.App.setCrashDumpDir('/home/bmiller/git/serialport-js/examples/nwjs-node-webkit/');

/*
setInterval(
    function(){
        serialjs.find(updatePorts);
    },
    8000
);
*/

window.addEventListener(
    'DOMContentLoaded',
    initUI
);

function initUI(){
    list=document.getElementById('portList');
    terminal=document.getElementById('terminal');
    serialjs.find(updatePorts);
    
    list.addEventListener(
        'click',
        setPort
    );
}

function updatePorts(ports){
    var list=document.getElementById('portList');
    list.innerHTML='';
    
    for(var i=0; i<ports.length; i++){
        var li=document.createElement('li');
        li.setAttribute('port',ports[i].port);
        li.innerHTML=ports[i].port+'<br>'+ports[i].info;
        
        list.appendChild(li);
    }
}

function start(port){
    console.log(port);
    
    port.on(
        'data',
        gotData
    );

    openPort=port;
}

function gotData(data){
    console.log(data);
    var li=document.createElement('li');
    li.innerHTML=data;
    terminal.appendChild(li);
}

function setPort(e){
    if(openPort){
        openPort.removeListener(
            'data',
            gotData
        );
    
        openPort.close();
    }
    
    var port=e.target.getAttribute('port');
    console.log(port);
    if(!port)
        return;
    
    e.target.classList.add('activePort');
    serialjs.open(port,start,'\n');
}