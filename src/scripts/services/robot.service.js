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
        self.trackColors = false;
        self.trackFaces = false;

        self.robot = new Robot(self.scope.$routeParams.robotId);


        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        if (navigator.getUserMedia) {

            MediaStreamTrack.getSources(function (sources) {
                for (var i = 0; i < sources.length; i++) {
                    var source = sources[i];
                    if (source.kind == 'video') {
                        console.log(sources[i]);
                        self.createStream(sources[i].id);
                        return;
                    }
                }
            });

        } else {
            console.log('Native web camera streaming (getUserMedia) is not supported in this browser.');
            return;
        }

    },

    createStream: function (webcamId) {
        var self = this;

        navigator.getUserMedia({
            // video: { //Example of specifying id for using multiple cameras.
            //     mandatory: {
            //         sourceId: webcamId
            //     }
            // },
            video: true,
            audio: false
        }, function (stream) {
            self.cameraSuccess(stream);
        }, function (error) {
            console.error('An error occurred: [CODE ' + error.code + ']');
        });
    },

    cameraSuccess: function (stream) {
        var self = this;
        var wrapper = document.getElementById('robot-control');
        var video = document.createElement('video');
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', '800');
        canvas.setAttribute('height', '800');
        var ctx = canvas.getContext('2d');

        wrapper.appendChild(canvas);
        var domURL = window.URL || window.webkitURL;
        video.src = domURL ? domURL.createObjectURL(stream) : stream;

        var faces = [];
        var colors = [];
        var frameCounter = 0;
        setInterval(function () {
            video.play();
            frameCounter++;

            if (canvas.width != video.videoWidth && video.videoWidth != 0) {
                canvas.setAttribute('width', video.videoWidth.toString());
                canvas.setAttribute('height', video.videoHeight.toString());
            }

            ctx.drawImage(video, 0, 0);

            //Only look for items once per second
            if (frameCounter % 60 == 0) {
                self.findFaces(canvas, colors, faces);
            }


            self.drawRects(ctx, faces);
            self.drawRects(ctx, colors);

        }, 16);
    },

    drawRects: function (ctx, rects) {
        for (var i = 0; i < rects.length; i++) {
            var rect = rects[i];
            if (rect.color) {
                ctx.strokeStyle = rect.color;
            } else {
                ctx.strokeStyle = "#000000";
            }
            ctx.strokeRect(rect.x, rect.y, rect.height, rect.width);
        }
    },

    findFaces: function (canvas, colors, faces) {
        var self = this;
        var detectColors = new tracking.ColorTracker(['cyan']); //'magenta', 'cyan', 'yellow'
        var detectFaces = new tracking.ObjectTracker(['face']);
        detectFaces.setInitialScale(4);
        detectFaces.setStepSize(2);
        detectFaces.setEdgesDensity(0.1);

        detectColors.on('track', function (event) {
            colors.splice(0);
            if (event.data.length === 0) {
                // No detectColors were detected in this frame.
            } else {
                event.data.forEach(function (rect) {
                    colors.push(rect);
                });
            }
        });

        detectFaces.on('track', function (event) {
            faces.splice(0);
            if (event.data.length === 0) {
                // No detectFaces were detected in this frame.
            } else {
                event.data.forEach(function (rect) {
                    // rect.x, rect.y, rect.height, rect.width
                    faces.push(rect);
                });
            }
        });

        if (self.trackColors) {
            tracking.track(canvas, detectColors);
        } else {
            colors.splice(0);
        }
        if (self.trackFaces) {
            tracking.track(canvas, detectFaces);
        } else {
            faces.splice(0);
        }
    }
});