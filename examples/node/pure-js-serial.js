var serialjs=require('../../serialport-js');
serialjs.open('/dev/ttyUSB0',start,'\n');

function start(port){
    port.on(
        'data',
        function(data){
            console.log(data);
        }
    );

    port.send('howdy doody doo')
}