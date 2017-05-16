"use strict";

var previewVideo = document.getElementById("previewVideo");
var recordedVideo = document.getElementById("recordedVideo");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var recordedVideos = document.getElementById("recordedVideos");
var magnetLink = document.getElementById("magnetLink");
var remoteVideo = document.getElementById("remoteVideo");
var inputMagnetLink = document.getElementById("inputMagnetLink");
var getRemoteVideoButton = document.getElementById("getRemoteVideoButton");

var deviceId = null;
var height = 300;
var width = 400;
var mediaRecorder = null;
var mediaStream = null;
var videoChunks = [];
var database = null;
var webTorrentClient = null;
var lastVideoBlob = null;

var initialiseVideoStream = function(stream) {
  mediaStream = stream;

  previewVideo.src = URL.createObjectURL(mediaStream);
      recordAVideoClip();

  
};

var videoConstraints = {
  video : {
    width: width,
    height: height,
    deviceId: deviceId
  }
};

var startPreviewVideo = function() {
  navigator.webkitGetUserMedia(
    videoConstraints,
    initialiseVideoStream,
    function(err) { console.err(err); }
  );
};

var devicesCallback = function(devices) {
  var device = devices[0];
  deviceId = device.deviceId;

  startPreviewVideo();
};

var onStart = function() {
  stopButton.disabled = false;
  recordButton.disabled = true;
};

var onStop = function() {
  stopButton.disabled = true;
  recordButton.disabled = false;

  if (videoChunks.length > 0) {
    var videoBlob = new Blob(videoChunks, { type: "video/webm" });
    videoChunks = [];

	var file = new File([videoBlob], 'video_webcam.webm', { type: "video/webm"});
	var link = document.createElement('a');
	link.href = URL.createObjectURL(file);
	link.download = 'video_webcam.webm';
	var evt = new MouseEvent('click', { view: window});//, bubbles: true, 
	link.dispatchEvent(evt);
    pushVideoOntoStack(videoBlob);
    //storeVideo(videoBlob);

    //seedVideo(videoBlob);
  }
};

var recordAVideoClip = function() {
  var options = { mimeType: "video/webm;codecs=vp9" };
  mediaRecorder = new MediaRecorder(mediaStream, options);

  var numberOfSecondsPerVideoChunk = 1;
  mediaRecorder.start(numberOfSecondsPerVideoChunk);

  mediaRecorder.ondataavailable = function(event) {
    videoChunks.push(event.data);
  };

  mediaRecorder.onerror = function(event) {
    console.err("Error: ", event);
  };

  mediaRecorder.onstart = onStart;

  mediaRecorder.onstop = onStop;
};

var stopRecording = function() {
  if (!!mediaRecorder) {
    mediaRecorder.stop();

    mediaRecorder = null;
  }
};

var addButtonListeners = function() {
  recordButton.addEventListener("click", function(event) {
    recordAVideoClip();
    event.preventDefault();
  }, false);

  stopButton.addEventListener("click", function(event) {
    stopRecording();
    event.preventDefault();
  }, false);

 };

var init = function() {
  //setupWebTorrentClient();
  //setupDatabase();
  navigator.mediaDevices.enumerateDevices().then(devicesCallback);
  addButtonListeners();
};

init();
