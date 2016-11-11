document.addEventListener('DOMContentLoaded', initialise)
function initialise () {
  navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia

  if(navigator.getUserMedia) {
    // DOM interactions
    const startButton = document.getElementById('startButton')
    const callButton = document.getElementById('callButton')
    const hangupButton = document.getElementById('hangupButton')
    callButton.disabled = true
    hangupButton.disabled = true
    startButton.onclick = start
    callButton.onclick = call
    hangupButton.onclick = hangup
    let startTime

    const localVideo = document.getElementById('localVideo')
    const remoteVideo = document.getElementById('remoteVideo')
  } else {
    alert('Sorry, your browser does not support WebRTC!')
  }

  localVideo.addEventListener('loadedmetadata', (evt) => {
    trace(`Local video videoWidth: ${evt.target.videoWidth} px, videoHeight: ${evt.target.videoHeight} px`)
  })

  remoteVideo.addEventListener('loadedmetadata', (evt) => {
    trace(`Remote video videoWidth: ${evt.target.videoWidth} px, videoHeight: ${evt.target.videoHeight} px`)
  })

  remoteVideo.onresize = function() {
    trace(`Remote video size changed to ${remoteVideo.videoWidth} x ${remoteVideo.videoHeight}`)
    // We'll use the first onresize callback as an indication that video has started
    // playing out.
    if (startTime) {
      let elapsedTime = window.performance.now() - startTime
      trace(`Setup time: ${elapsedTime.toFixed(3)}ms`)
      startTime = null
    }
  }


  // stun/turn server config
  const servers = {
    'iceServers': [
      {url:'stun:stun01.sipphone.com'},
      {url:'stun:stun.ekiga.net'},
      {url:'stun:stun.fwdnet.net'},
      {url:'stun:stun.ideasip.com'},
      {url:'stun:stun.iptel.org'},
      {url:'stun:stun.rixtelecom.se'},
      {url:'stun:stun.schlund.de'},
      {url:'stun:stun.l.google.com:19302'},
      {url:'stun:stun1.l.google.com:19302'},
      {url:'stun:stun2.l.google.com:19302'},
      {url:'stun:stun3.l.google.com:19302'},
      {url:'stun:stun4.l.google.com:19302'},
      {url:'stun:stunserver.org'},
      {url:'stun:stun.softjoys.com'},
      {url:'stun:stun.voiparound.com'},
      {url:'stun:stun.voipbuster.com'},
      {url:'stun:stun.voipstunt.com'},
      {url:'stun:stun.voxgratia.org'},
      {url:'stun:stun.xten.com'},
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
      }
    ]
  }

  let localStream
  let localPC
  let remotePC
  const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  }

  function getName(pc) {
    return (pc === localPC) ? 'localPC' : 'remotePC'
  }

  function getOtherPc(pc) {
    return (pc === localPC) ? remotePC : localPC
  }

///////////////////////////////////////////////////////////////////////////////
  // Set Up Local Stream upon 'start'
  function gotStream (stream) {
    // Add localStream to global scope so it's accessible from the browser console
    window.localStream = localStream = stream
    trace('Received local stream (this is the result of the success callback of getUserMedia)')

    callButton.disabled = false
    if (window.URL) {
      localVideo.src = window.URL.createObjectURL(stream)
      localVideo.srcObject = stream
    } else {
      localVideo.src = stream
    }
  }

  function start () {
    startButton.disabled=true
    navigator.mediaDevices.getUserMedia({
      audio:true,
      video: {
        width: 320
      }
    })
    .then(gotStream)
    .catch(err => console.error(err.name))
  }

///////////////////////////////////////////////////////////////////////////////
  // Handle Remote stream
  function call () {
    // Add localPC to global scope so it's accessible from the browser console
    window.localPC = localPC = new webkitRTCPeerConnection(servers)
    trace('Created local peer connection object for localPC (available in global scope)')
    localPC.onicecandidate = evt => {
      onIceCandidate(localPC, evt)
    }

    // Add remotePC to global scope so it's accessible from the browser console
    window.remotePC = remotePC = new webkitRTCPeerConnection(servers)
    trace('Created remote peer connection object for remotePC (available in global scope)')
    remotePC.onicecandidate = evt => {
      onIceCandidate(remotePC, evt)
    }

    callButton.disabled = true
    hangupButton.disabled = false
    trace('Starting call')
    startTime = window.performance.now()
    const videoTracks = localStream.getVideoTracks()
    const audioTracks = localStream.getAudioTracks()
    if (videoTracks.length > 0) {
      trace('Using video device: ' + videoTracks[0].label)
    }
    if (audioTracks.length > 0) {
      trace('Using audio device: ' + audioTracks[0].label)
    }

    localPC.oniceconnectionstatechange = evt => {
      onIceStateChange(localPC, evt)
    }
    remotePC.oniceconnectionstatechange = evt => {
      onIceStateChange(remotePC, evt)
    }
    remotePC.onaddstream = gotRemoteStream

    localPC.addStream(localStream)
    trace('Added local stream to localPC\n')

    trace('localPC createOffer start')
    localPC.createOffer(offerOptions)
           .then(onCreateOfferSuccess)
           .catch(onCreateSessionDescriptionError)
  }

  function onIceCandidate (pc, evt) {
    if (evt.candidate) {
      getOtherPc(pc).addIceCandidate(new RTCIceCandidate(evt.candidate))
      .then(() => onAddIceCandidateSuccess)
      .catch(err => onAddIceCandidateError(pc, err))
    }
  }
///////////////////////////////////////////////////////////////////////////////

  function gotRemoteStream(e) {
    // Add remoteStream to global scope so it's accessible from the browser console
    window.remoteStream = remoteVideo.srcObject = e.stream
    trace('remotePC received remote stream')
  }

///////////////////////////////////////////////////////////////////////////////
  function onAddIceCandidateSuccess(pc) {
    trace(`${getName(pc)} addIceCandidate success`)
  }

  function onAddIceCandidateError(pc, error) {
    trace(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`)
  }

  function onCreateSessionDescriptionError(err) {
    trace(`Failed to create session description: ${err.toString()}`)
  }

  function onCreateAnswerSuccess(desc) {
    trace(`Answer from remotePC:\n${desc.sdp}`)
    trace('remotePC setLocalDescription start')
    remotePC.setLocalDescription(desc)
    .then(onSetLocalSuccess(remotePC))
    .catch(onSetSessionDescriptionError)

    trace('localPC setRemoteDescription start')
    localPC.setRemoteDescription(desc)
    .then(onSetRemoteSuccess(localPC))
    .catch(onSetSessionDescriptionError)
  }

  function onCreateOfferSuccess(desc) {
    trace(`Offer from localPC\n${desc.sdp}`)
    trace('localPC setLocalDescription start')
    localPC.setLocalDescription(desc)
           .then(onSetLocalSuccess(localPC))
           .catch(onSetSessionDescriptionError)

    trace('remotePC setRemoteDescription start')
    remotePC.setRemoteDescription(desc)
            .then(onSetRemoteSuccess(remotePC))
            .catch(onSetSessionDescriptionError)
    trace('remotePC createAnswer start')

    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    remotePC.createAnswer()
            .then(onCreateAnswerSuccess)
            .catch(onCreateSessionDescriptionError)
  }

  function onSetLocalSuccess(pc) {
    trace(`${getName(pc)} setLocalDescription complete`)
  }

  function onSetSessionDescriptionError(err) {
    trace(`Failed to set session description:  ${err.toString()}`)
  }
  function onSetRemoteSuccess(pc) {
    trace(`${getName(pc)} setRemoteDescription complete`)
  }

  function onIceStateChange(pc, evt) {
    if (pc) {
      trace(`${getName(pc)} ICE state: ${pc.iceConnectionState}`)
      trace('ICE state change event: ', evt)
    }
  }
///////////////////////////////////////////////////////////////////////////////

  function hangup() {
    trace('Ending call')
    localPC.close()
    remotePC.close()
    localPC = null
    remotePC = null
    hangupButton.disabled = true
    callButton.disabled = false
  }

  function trace (text) {
    if (text[text.length - 1] === '\n') {
      text = text.substring(0, text.length - 1)
    }
    if (window.performance) {
      let now = (window.performance.now() / 1000).toFixed(3)
      console.log(`${now}: ${text}`)
    } else {
      console.log(text)
    }
  }
///////////////////////////////////////////////////////////////////////////////
}
