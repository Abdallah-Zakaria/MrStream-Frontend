import React, { useEffect, useState, useRef } from 'react';
import { Row } from 'react-bootstrap';

import io from "socket.io-client";

import Stream from './Stream';

import { If, Then, Else } from 'react-if'

function Lobby(props) {
  const [show, setShow] = useState(false)

  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [userToCall , setUserToCall] = useState('');
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

  return (

    <>
      <If condition={show && userToCall !== ''}>
        <Then>
          <Stream setShowHandler={setShow} yourID={yourID} userToCall={userToCall} socket={socket.current}  />
        </Then>
        <Else>
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
        </Else>
      </If>

    </>
  );
}

export default Lobby;