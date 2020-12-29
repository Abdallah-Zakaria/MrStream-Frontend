import React, { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";
import Peer from "simple-peer";
import { If, Else, Then } from 'react-if';

import { Container, Row, Col, FormControl, Image, FormCheck, Button } from 'react-bootstrap';
import { CameraVideo, CameraVideoOff, Mic, MicMute, DoorOpen } from 'react-bootstrap-icons';






function Stream(props) {
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [mute, setMute] = useState(false);
  const [videoShow, setVideoShow] = useState(true);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();

  useEffect(() => {
    socket.current = io("http://localhost:8000/");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    })

    socket.current.on("yourID", (id) => {
      setYourID(id);
    })
    socket.current.on("allUsers", (users) => {
      setUsers(users);
    })

    socket.current.on("calling", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    })

  }, []);

  useEffect(() => {
    return () => {
      console.log(caller, yourID)
      socket.current.emit("leave", { userToCall: caller, from: yourID })
    }
  }, [])


  function callPeer(id) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      // config: {
      //   iceServers: [{ 'url': 'stun:custom.stun.server:3478' }]
      // },
      stream: stream,
    });

    peer.on("signal", data => {
      socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID })
    })

    peer.on("stream", stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socket.current.on("callAccepted", signal => {
      setCallAccepted(true);
      peer.signal(signal);
    })

    socket.current.on('endCall', () => {
      peer.destroy();
    })

  }

  function acceptCall() {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", data => {
      socket.current.emit("acceptCall", { signal: data, to: caller })
    })

    peer.on("stream", stream => {
      partnerVideo.current.srcObject = stream;
    });

    socket.current.on('endCall', signal => {
      peer.destroy();
    })

    peer.signal(callerSignal);
  }

  let UserVideo;
  if (stream) {
    UserVideo = (
      <video style={{ width: '100%' }} muted playsInline ref={userVideo} autoPlay />
    );
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = (
      <video style={{ width: '100%' }} muted={mute} playsInline ref={partnerVideo} autoPlay />
    );
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div>
        <h1>{caller} is calling you</h1>
        <button onClick={acceptCall}>Accept</button>
      </div>
    )
  }

  function videoOff() {
    stream.getTracks().forEach(track => track.enabled = !track.enabled);
  }

  return (
    <Container >
      <Row style={{ display: 'flex', justifyContent: 'center' }}>
        <Col style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '0.5px solid blue' }} sm={6}>
          {UserVideo}
        </Col>
        <Col style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '0.5px solid blue' }} sm={6} >
          {PartnerVideo}
          <If condition={!callAccepted}>
            <img style={{ width: '25%' }} src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" alt="thumbnail" className="img-thumbnail" />
          </If>
        </Col>
      </Row>
      <Row >
        {Object.keys(users).map(key => {
          if (key === yourID) {
            return null;
          }
          return (
            <button onClick={() => {
              callPeer(key);
            }}>Call {key}</button>
          );
        })}
      </Row>
      <If condition={!callAccepted}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', color: 'red', transform: 'translate(-50%,-50%)' }}>
          {incomingCall}
        </div>
      </If>
      <Row style={{ display: 'flex', justifyContent: 'space-between', position:'fixed' , bottom:'0' , width : '100%', height: '10vh' , backgroundColor: 'red', alignItems:'center'}}>
        <Col style={{ display: 'flex' , flexDirection : 'row'}}>

          <Col style={{marginRight:'20px' , marginLeft : '20px'}} >
            <If condition={mute}>
              <Then>
                <MicMute color='white' style={{ cursor: 'pointer', alignItems: 'center' }} size='36' onClick={() => { setMute(mute ? false : true) }} />
              </Then>
              <Else>
                <Mic color='white' style={{ cursor: 'pointer' }} size='36' onClick={() => { setMute(mute ? false : true) }} />
              </Else>
            </If>
          </Col>
          <Col >
            <If condition={videoShow}>
              <Then>
                <CameraVideo color='white' style={{ cursor: 'pointer' }} size='36' onClick={() => {
                  videoOff()
                  setVideoShow(false)
                }} />
              </Then>
              <Else>
                <CameraVideoOff color='white' style={{ cursor: 'pointer' }} size='36' onClick={() => {
                  videoOff()
                  setVideoShow(true)
                }} />
              </Else>
            </If>
          </Col>
        </Col>
        <Col style={{ marginRight : '20px'}}>
          <DoorOpen color='white' style={{ cursor: 'pointer' }} size='36' onClick={() => {
            socket.current.emit("leave", { userToCall: caller, from: yourID })
            props.setShowHandler(false)
          }} />
        </Col>
      </Row>
    </Container>
  );
}


export default Stream;