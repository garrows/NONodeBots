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

        // self.canvas = document.getElementById("canvas");
        // self.ctx = self.canvas.getContext("2d");

        self.robot = new Robot(self.scope.$routeParams.robotId);






        var wrapper = document.getElementById('robot-control');

        function createStream(webcamId) {
            var video = document.createElement('video');
            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', '800');
            canvas.setAttribute('height', '800');
            var ctx = canvas.getContext('2d');

            wrapper.appendChild(canvas);

            function successCallback(stream) {
                var domURL = window.URL || window.webkitURL;
                video.src = domURL ? domURL.createObjectURL(stream) : stream;

                var debugOverlay = document.getElementById('debug');

                var htracker = new headtrackr.Tracker({
                    // altVideo: {
                    //     ogv: "./media/capture5.ogv",
                    //     mp4: "./media/capture5.mp4"
                    // },
                    calcAngles: true,
                    ui: false,
                    headPosition: false,
                    debug: debugOverlay,
                    detectionInterval: 16
                });
                htracker.init(video, canvas);
                htracker.start();

                document.addEventListener("facetrackingEvent", function (event) {
                    console.log(
                        'event',
                        event.x,
                        event.y,
                        event.width,
                        event.height,
                        event.angle
                    );
                });

                setInterval(function () {
                    video.play();

                    ctx.drawImage(video, 0, 0);

                    var img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

                    for (var i = 0; i < img.data.length; i += 4) {
                        // img.data[i] = 255 - img.data[i];
                        // img.data[i + 1] = 255 - img.data[i + 1];
                        // img.data[i + 2] = 255 - img.data[i + 2];
                    }





                    ctx.putImageData(img, 0, 0);




                }, 16);


            }

            function errorCallback(error) {
                console.error('An error occurred: [CODE ' + error.code + ']');
                return;
            }

            navigator.getUserMedia({
                // video: {
                //     mandatory: {
                //         sourceId: webcamId
                //     }
                // },
                video: true,
                audio: false
            }, successCallback, errorCallback);
        }


        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        if (navigator.getUserMedia) {

            MediaStreamTrack.getSources(function (sources) {
                for (var i = 0; i < sources.length; i++) {
                    var source = sources[i];
                    if (source.kind == 'video') {
                        console.log(sources[i]);
                        createStream(sources[i].id);
                        return;
                    }
                }
            });

        } else {
            console.log('Native web camera streaming (getUserMedia) is not supported in this browser.');
            return;
        }

    }
});