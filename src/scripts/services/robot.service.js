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
        self.recognisedSpeech = [];
        self.confirmSpeech = null;

        self.robot = new Robot(self.scope.$routeParams.robotId);


        self.listenForSpeech();

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
            }, self.cameraSuccess.bind(self),
            function (error) {
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
    },

    listenForSpeech: function () {
        var self = this;
        var recognition = new webkitSpeechRecognition();

        recognition.onend = function () {
            self.listenForSpeech();
        }
        recognition.onerror = function (err) {
            if (err.error != 'no-speech') {
                console.log('speech error', err);
            }
        };
        // recognition.onaudioend        
        // recognition.onaudiostart        
        // recognition.onnomatch        
        // recognition.onsoundend        
        // recognition.onsoundstart        
        // recognition.onspeechend        
        // recognition.onspeechstart        
        // recognition.onstart        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = self.onSpeechRecognition.bind(self);
        recognition.start();
    },

    onSpeechRecognition: function (event) {
        var self = this;
        console.log("speech event", event);
        for (var i = 0; i < event.results.length; i++) {
            var speechRecognitionResult = event.results[i];
            for (var j = 0; j < speechRecognitionResult.length; j++) {
                var speechRecognitionAlternative = speechRecognitionResult[j];

                console.log("speech result", Math.round(speechRecognitionAlternative.confidence * 100) + '%', speechRecognitionAlternative.transcript);

                //Is the user confirming an unsure command?
                if (self.confirmSpeech && speechRecognitionAlternative.transcript == 'yes') {
                    self.runVoiceCommand(self.confirmSpeech);
                    self.confirmSpeech = null;
                } else if (self.confirmSpeech) {
                    var msg = new SpeechSynthesisUtterance('Ok. What did you say then?');
                    window.speechSynthesis.speak(msg);
                    self.confirmSpeech = null;
                } else {
                    //Check command if unsure.
                    if (speechRecognitionAlternative.confidence < .4) {
                        self.confirmSpeech = speechRecognitionAlternative.transcript;
                        var msg = new SpeechSynthesisUtterance('Did you say, ' + speechRecognitionAlternative.transcript + '?');
                        window.speechSynthesis.speak(msg);
                    } else {
                        self.runVoiceCommand(speechRecognitionAlternative.transcript);
                        self.confirmSpeech = null;
                    }
                }
            }
        }
    },

    runVoiceCommand: function (userCommand) {
        var self = this;
        self.recognisedSpeech.unshift({
            transcript: userCommand
        });

        var commands = self.getCommands();

        //Look for a valid command.
        var foundCommand = null;
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];
            var index = command.commands.indexOf(userCommand);
            if (index !== -1) {
                foundCommand = command;
                break;
            }
        }

        if (foundCommand) {
            foundCommand.execute();
            if (foundCommand.blockResponse == false) {
                var msg = new SpeechSynthesisUtterance('OK');
                window.speechSynthesis.speak(msg);
            }
        } else {
            var msg = new SpeechSynthesisUtterance('I don\'t understand ' + userCommand);
            window.speechSynthesis.speak(msg);
        }

        App.scope.$apply();
    },

    getCommands: function () {
        var self = this;

        //lazy cache
        if (!self.commands) {
            self.commands = [{
                commands: ['look for faces', 'follow me', 'where am i'],
                execute: function () {
                    self.trackFaces = true;
                }
            }, {
                commands: ['look for colors', 'look for colours', 'where is the ball', 'where\'s the ball '],
                execute: function () {
                    self.trackColors = true;
                }

            }, {
                commands: ['don\'t look for faces', 'don\'t follow me', 'stop looking for faces', 'stop following me'],
                execute: function () {
                    self.trackFaces = false;
                }
            }, {
                commands: ['don\'t look for colors', 'stop looking for colors'],
                execute: function () {
                    self.trackColors = false;
                }
            }, {
                commands: ['stop looking'],
                execute: function () {
                    self.trackFaces = false;
                    self.trackColors = false;
                }
            }, {
                commands: ['hello', 'hello robot', 'hi there', 'hi robot'],
                execute: function () {
                    var msg = new SpeechSynthesisUtterance('Hello human');
                    window.speechSynthesis.speak(msg);
                },
                blockResponse: true
            }];
        }
        return self.commands;
    },
});