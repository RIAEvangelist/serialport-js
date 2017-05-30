// Require
const serialjs = require('../../serialport-js');

// Find serial ports
const init = async () => {
    const delimiter = '\n';
    const ports = await serialjs.find();
    if (ports.length) {
        let port = serialjs.open(ports[0].port, delimiter);

        port.on('data', (data) => {
            console.log(data);
        });
        port.on('error', (error) => {
            console.error(error);
        });
        port.send('foo bar');
    }
};

init();
