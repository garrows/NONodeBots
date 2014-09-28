var klass = require('klass');

module.exports = klass({

    initialize: function () {
        this.eventListeners = {};
    },

    on: function (eventName, callback) {
        if (this.eventListeners[eventName] == undefined) {
            this.eventListeners[eventName] = [];
        }
        if (typeof callback == "function") {
            this.eventListeners[eventName].push(callback);
        } else {
            throw "can not subscribe with a non function callback";
        }
    },

    unsubscribeAll: function (eventName) {
        if (this.eventListeners[eventName] != undefined) {
            for (var i = 0; i < this.eventListeners[eventName].length; i++) {

                this.eventListeners[eventName].splice(i, 1);
            }
        }
    },

    publishEvent: function (eventName, data) {
        if (this.eventListeners[eventName] != undefined) {
            for (var i = 0; i < this.eventListeners[eventName].length; i++) {
                this.eventListeners[eventName][i](data);
            }
        }
    },

    getDate: function (dateString) {
        var d = new moment(this.date);
        return d.calendar();
    }


});