const socket = io();
const peerConnection = new RTCPeerConnection({
  iceServers: [
    'turn:turn01.hubl.in?transport=udp',
    'turn:turn02.hubl.in?transport=tcp',
    {
      url: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
    },
    {
      url: 'turn:192.158.29.39:3478?transport=udp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
    },
    {
      url: 'turn:192.158.29.39:3478?transport=tcp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
    },
    {
      url: 'turn:turn.bistri.com:80',
      credential: 'homeo',
      username: 'homeo'
    },
    {
      url: 'turn:turn.anyfirewall.com:443?transport=tcp',
      credential: 'webrtc',
      username: 'webrtc'
    }
  ]
});


socket.emit('join', '1111');
socket.on('connection-success', (success) => {
  console.log(success)
})
socket.on('peer-joined', (data) => {
  if (document.location.pathname === '/client') {
    document.getElementById('callBtn').disabled = false;
  }

})
socket.on('sdp', (data) => {
  console.log('Received', data.sdp.type)
  console.log(JSON.stringify(data.sdp))
  peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
  createAnswer()
})

socket.on('candidate', (data) => {
  console.log(data)
  peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
})

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
    video.setAttribute = 'autoplay';
    video.id = 'myVideo'
    video.controls = true;
    video.muted = false;
    video.height = 240; // in px
    video.width = 320; // in px
    video.srcObject = e.streams[0]
    video.play = true
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
  navigator.mediaDevices
    .getDisplayMedia({ audio: false, video: true })
    .then(stream => {
      stream.getTracks().forEach(t => peerConnection.addTrack(t, stream));
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
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
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