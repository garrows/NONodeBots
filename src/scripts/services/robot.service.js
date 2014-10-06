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

                setInterval(function () {
                    video.play();

                    if (canvas.width != video.videoWidth && video.videoWidth != 0) {
                        canvas.setAttribute('width', video.videoWidth.toString());
                        canvas.setAttribute('height', video.videoHeight.toString());
                    }


                    ctx.drawImage(video, 0, 0);

                    var img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

                    for (var i = 0; i < img.data.length; i += 4) {
                        // img.data[i] = 255 - img.data[i];
                        // img.data[i + 1] = 255 - img.data[i + 1];
                        // img.data[i + 2] = 255 - img.data[i + 2];
                    }

                    var colors = new tracking.ColorTracker(['cyan']);
                    var objects = new tracking.ObjectTracker(['face']);
                    objects.setInitialScale(4);
                    objects.setStepSize(2);
                    objects.setEdgesDensity(0.1);

                    colors.on('track', function (event) {
                        if (event.data.length === 0) {
                            // No colors were detected in this frame.
                        } else {
                            event.data.forEach(function (rect) {
                                // console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
                                ctx.strokeRect(rect.x, rect.y, rect.height, rect.width);
                            });
                        }
                    });

                    objects.on('track', function (event) {
                        if (event.data.length === 0) {
                            // No objects were detected in this frame.
                        } else {
                            event.data.forEach(function (rect) {
                                // rect.x, rect.y, rect.height, rect.width
                                ctx.strokeRect(rect.x, rect.y, rect.height, rect.width);
                            });
                        }
                    });

                    // tracking.track(canvas, colors);
                    tracking.track(canvas, objects);


                    // ctx.putImageData(img, 0, 0);

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