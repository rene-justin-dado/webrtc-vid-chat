import React from 'react'

export default React.createClass({
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
      </div>
    )
  }
})
