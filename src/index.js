const socket = io();
const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });


socket.emit('join', '1111');
socket.on('connection-success', (success) => {
  console.log(success)
})
socket.on('sdp', (data) => {
  console.log('Received', data.sdp.type)
  console.log(JSON.stringify(data.sdp))
  peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
})

socket.on('candidate', (data) => {
  console.log(data)
  peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
})
if (document.location.pathname === '/client') {
  navigator.mediaDevices
    .getDisplayMedia({ audio: false, video: true })
    .then(stream => {
      stream.getTracks().forEach(t => peerConnection.addTrack(t, stream));
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
}

peerConnection.onicecandidate = (e) => {
  if (e.candidate) {
    console.log('candidate', JSON.stringify(e.candidate))
    socket.emit('candidate', { candidate: e.candidate })
  }
}
peerConnection.oniceconnectionstatechange = (e) => {
  console.log(e)
}
peerConnection.ontrack = (e) => {
  if (document.location.pathname === '/support') {
    const video = document.createElement('video');
    video.autoplay= true;
    video.controls = true;
    video.muted = false;
    video.height = 240; // in px
    video.width = 320; // in px
    video.srcObject = e.streams[0]
    const box = document.getElementById('video');
    box.appendChild(video);
  }
}

peerConnection.addEventListener('icecandidate', event => {
  if (event.candidate) {
    console.log('Sending ICE candidate'); // This line is never reached.
    socket.emit('icecandidate', event.candidate);
  }
});

const sendToPeer = (eventType, payload) => {
  socket.emit(eventType, payload)
}

const processSDP = (sdp) => {
  console.log(JSON.stringify(sdp))
  peerConnection.setLocalDescription(sdp)
  sendToPeer('sdp', { sdp })
}

const createOffer = () => {
  peerConnection.createOffer({
    offerToReceiveVideo: 1,
    offerToReceiveAudio: 0
  }).then(sdp => {
    // created offer send sdp to the server
    processSDP(sdp)
    console.log(JSON.stringify(sdp))
  }).catch(err => {
    console.log(err)
  })
}

const createAnswer = () => {
  peerConnection.createAnswer({
    offerToReceiveVideo: 1,
    offerToReceiveAudio: 0
  }).then(sdp => {
    // created answer send sdp to the server
    processSDP(sdp)
    console.log(JSON.stringify(sdp))
  }).catch(err => {
    console.log(err)
  })
}