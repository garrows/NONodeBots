# NONodeBots  - ROBOTICS IN YOUR BROWSER

NodeBots are great but they are even better when they have a UI and you can publish your app on the Chrome Web Store for others to install and use.

NoNodeBots takes the Node out of Nodebots and will show you how you can run Johnny-Five in your browser using browserify and Chrome Apps without having to run a node instance.

This approach unleashes powerful HTML5 tech like:

* Video processing using the webcam
* p2p remote control using the dataChannel/webRTC
* Telepresense using webRTC
* Speech recognition using the Web Speech API
* Speech synthesis using the Web Speech Synthesis API
* Mesh networking & hive-mind intelligence using dataChannel/webRTC


This was done for a talk at http://campjs.com/#nonodebots-robotics-in-your-browser. Hopefully there will be a video soon.



# Development as a Webpage

For speed, you might want to develop as a webserver (as opposed to Chrome App). You can do this but you need https/ssl for speech recognition to work. 

```
mkdir server/ssl
cd server/ssl
openssl genrsa -out localhost-key.pem 1024 
openssl req -new -key localhost-key.pem -out certrequest.csr
openssl x509 -req -in certrequest.csr -signkey localhost-key.pem -out localhost-cert.pem
```
