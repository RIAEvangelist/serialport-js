var serialjs=require('../../../serialport-js');

    serialjs.find(
        function(ports){
            console.log('available usb serial : ',ports);
            if(ports[0]){
                var term=serialjs.open(ports[0],'\n');
                
                term.on(
                    'data',
                    function(data){
                        console.log(data);
                    }
                );

                term.send('hello');
            }
        }
    );