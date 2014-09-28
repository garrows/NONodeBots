var modules = require('../modules'),
    service = require('../classes/service.class.js');

exports = module.exports = function () {
    return new exports.Service();
};

exports.Service = service.extend({

    init: function () {
        var self = this;

    }

});