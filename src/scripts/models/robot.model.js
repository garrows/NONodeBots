var emitter = require('../classes/emitter.class.js');

module.exports = emitter.extend({

    id: 'GarrowsBot',
    motors: {
        right: {
            speed: 0,
            pins: {
                pwm: 3,
                dir: 12
            }
        },
        left: {
            speed: 0,
            pins: {
                pwm: 11,
                dir: 13
            }
        }
    },

    initialize: function (id) {
        console.log('new robot born');
        this.supr && this.supr();

        this.id = id;
    }

});