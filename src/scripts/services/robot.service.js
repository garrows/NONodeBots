var modules = require('../modules'),
    service = require('../classes/service.class.js'),
    config = require('../config.js'),
    async = require('async'),
    Robot = require('../models/robot.model');


exports = module.exports = function () {
    return new exports.Service();
};

exports.Service = service.extend({

    //State of the camera screen for menu control.
    STATES: {
        AUTO: 'AUTO',
        REMOTE: 'REMOTE',
        LOCAL: 'LOCAL'
    },

    init: function () {
        console.log('robot.service.init()');

        var self = this;

        self.state = self.STATES.AUTO;

        self.robot = new Robot(self.scope.$routeParams.robotId);

    }
});