var serialjs=require('../../serialport-js').node(),
    list=false,
    terminal=false,
    openPort=false,
    input=false,
    button=false;

console.log(serialjs);

var gui = require('nw.gui');
gui.App.setCrashDumpDir('/home/bmiller/git/serialport-js/examples/nwjs-node-webkit/');


setInterval(
    function(){
        serialjs.find(updatePorts);
    },
    2000 //this low just to show plug and unplug
);

window.addEventListener(
    'DOMContentLoaded',
    initUI
);

function initUI(){
    list=document.getElementById('portList');
    terminal=document.getElementById('terminal');
    button=document.querySelector('button');
    input=document.querySelector('input');
    serialjs.find(updatePorts);
    list.addEventListener(
        'click',
        setPort
    );
}

function updatePorts(ports){
    var portEls=list.querySelectorAll('li');
    var portData=JSON.stringify(ports);
    console.log(portData)
    
    for(var i=0; i<portEls.length; i++){
        var port=portEls[i].getAttribute('port');
        if(portData.indexOf(port)<0)
            list.removeChild(portEls[i]);
    }
    
    for(var i=0; i<ports.length; i++){
        if(list.querySelector('li[port="'+ports[i].port+'"]'))
            continue;
        
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
    
    sendStuff('Port opened!');
}

function gotData(data){
    console.log(data);
    var li=document.createElement('li');
    li.innerHTML=data;
    terminal.appendChild(li);
    sendStuff('howdy doody doo');
}

function sendStuff(data){
    openPort.send(data);
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