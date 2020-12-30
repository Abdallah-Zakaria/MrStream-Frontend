import React, { useEffect, useState, useRef } from 'react';
import { Row } from 'react-bootstrap';

import io from "socket.io-client";

import Stream from './Stream';

import { If, Then, Else } from 'react-if'

function Lobby(props) {
  const [show, setShow] = useState(false)

  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [userToCall, setUserToCall] = useState('');
  const [initalCall, setInitalCall] = useState(false);
  const socket = useRef();

  useEffect(() => {

    socket.current = io("http://localhost:8000/");

    socket.current.on("yourID", (id) => {
      setYourID(id);
    })
    socket.current.on("allUsers", (users) => {
      setUsers(users);
    })
  }, []);

  useEffect(() => {
    return () => {
      socket.current.emit("leaveMeeting")
    }
  }, [])

  // let incomingCall;
  // if (receivingCall) {
  //   incomingCall = (
  //     <div>
  //       <h1>{caller} is calling you</h1>
  //       <button onClick={acceptCall}>Accept</button>
  //     </div>
  //   )
  // }

  return (

    <>
      <If condition={show && userToCall !== ''}>
        <Then>
          <Stream setShowHandler={setShow} yourID={yourID} userToCall={userToCall} socket={socket.current} initalCall={initalCall} />
        </Then>
        <Else>
          <input type='checkbox' name='test' onClick={() => { setInitalCall(initalCall ? false : true) }} />
          {console.log(initalCall)}
          <h1>Meetings Room</h1>
          <button onClick={() => {
            socket.current.emit("leaveMeeting")
            props.setShowHandler(false)
          }}>Close Meetings</button>
          <Row >
            {Object.keys(users).map(id => {
              if (id === yourID) {
                return null;
              }
              return (
                <button key={id} onClick={() => {
                  setUserToCall(id)
                  setShow(true)
                }}>Call {id}</button>
              );
            })}
          </Row>
          {/* <If condition={!callAccepted}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', color: 'red', transform: 'translate(-50%,-50%)' }}>
              {incomingCall}
            </div>
          </If> */}
        </Else>
      </If>

    </>
  );
}

export default Lobby;