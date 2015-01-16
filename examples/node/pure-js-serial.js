var serialjs=require('../../serialport-js');

serialjs.find(
    function(ports){
        console.log('available usb serial : ',ports);
        if(ports[0]){
            var term=serialjs.listen(
                ports[0],
                function(data){
                    console.log('data : ',data);
                }
            );

            term.send('hello');
        }
    }
);