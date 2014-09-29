var modules = require('../modules'),
    service = require('../classes/service.class.js'),
    config = require('../config.js'),
    async = require('async'),
    headtrackr = require('headtrackr'),
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

        self.canvas = document.getElementById("canvas");
        self.ctx = self.canvas.getContext("2d");

        self.robot = new Robot(self.scope.$routeParams.robotId);





        var video = document.createElement('video');
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        if (navigator.getUserMedia) {
            function successCallback(stream) {
                var domURL = window.URL || window.webkitURL;
                video.src = domURL ? domURL.createObjectURL(stream) : stream;

                setInterval(function () {
                    video.play();

                    ctx.drawImage(video, 0, 0);

                    var img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

                    for (var i = 0; i < img.data.length; i += 4) {
                        // img.data[i] = 255 - img.data[i];
                        // img.data[i + 1] = 255 - img.data[i + 1];
                        // img.data[i + 2] = 255 - img.data[i + 2];
                    }

                    // var htracker = new headtrackr.Tracker();
                    // htracker.init(video, canvas);
                    // htracker.start();

                    // ctx.putImageData(img, 0, 0);


                }, 16);


            }

            function errorCallback(error) {
                console.error('An error occurred: [CODE ' + error.code + ']');
                return;
            }

            navigator.getUserMedia({
                video: true,
                audio: false
            }, successCallback, errorCallback);
        } else {
            console.log('Native web camera streaming (getUserMedia) is not supported in this browser.');
            return;
        }

    }
});