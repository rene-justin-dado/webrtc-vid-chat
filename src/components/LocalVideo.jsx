import React from 'react'

export default React.createClass({
  componentDidMount () {
    const socket = io.connect()

    $('form').submit(() => {
      socket.emit('chat message', $('#m').val())
      $('#m').val('')
      return false
    })

    socket.on('chat message', msg => {
      $('#messages').append($('<li>').text(msg))
    })

    socket.on('on call', msg => {
      if (!peer)
        answerCall()

      if (msg.sdp) {
        peer.setRemoteDescription(new RTCSessionDescription(msg.sdp))
      } else if (msg.candidate) {
        peer.addIceCandidate(new RTCIceCandidate(msg.candidate))
      } else if (msg.closeConnection) {
        endCall()
      }
    })
  },

  render () {
    return (
      <div id="local-video-container">
        <h1>WebRTC Video</h1>
        <video id="localVideo" autoPlay>local</video>
        <video id="remoteVideo" autoPlay>remote</video>
        <div id="local-video-controls">
          <button id="startButton">Start</button>
          <button id="callButton">Call</button>
          <button id="hangupButton">Hang Up</button>
        </div>

        <ul id="messages"></ul>
          <form action="">
          <input id="m" autoComplete="off" /><button>Send</button>
        </form>
      </div>
    )
  }
})
