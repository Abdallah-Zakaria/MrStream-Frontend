import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Calendar from 'react-calendar'
import io from "socket.io-client";

import Stream from './Stream';

import { If, Then, Else } from 'react-if'

import './Lobby.scss'


let data = {
  '11/29/2020': { '12:00:00 AM': 'omar', ' 5:00:00 PM': 'ali' },
  '12/30/2020': { '12:00:00 AM': 'abdallah', ' 1:00:00 PM': 'zatar' },
  '12/31/2020': { '12:00:00 AM': 'sara', ' 6:00:00 PM': 'rami' },
  '1/1/2021': { '12:00:00 AM': 'sara', ' 6:00:00 PM': 'rami' }
}

function Lobby(props) {
  const [show, setShow] = useState(false)

  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [userToCall, setUserToCall] = useState('');
  const [initalCall, setInitalCall] = useState(false);

  const [value, onChange] = useState(new Date());

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

    <Container >
      <Row style={{ display: 'flex', flexDirection: 'row' }}>
        <Col sm={3} style={{ width: '20%', height: '100vh', backgroundColor: 'green' }}>
          <input type='checkbox' name='test' onClick={() => { setInitalCall(initalCall ? false : true) }} />
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
          <Row style={{flexDirection : 'column'}}>
            {
              Object.keys(data).map(date => {
                if (date === value.toLocaleString().split(',')[0]) {
                  return Object.keys(data[date]).map((meeting, index) => {
                    if (meeting.split(' ')[2] === new Date().toLocaleString().split(',')[1].split(' ')[2] && meeting.split(' ')[1] > new Date().toLocaleString().split(',')[1].split(' ')[1] && (Number(date.split('/')[2]) >= Number(new Date().toLocaleString().split(',')[0].split('/')[2]) && Number(date.split('/')[0]) >= Number(new Date().toLocaleString().split(',')[0].split('/')[0]) && Number(date.split('/')[1]) >= Number(new Date().toLocaleString().split(',')[0].split('/')[1]))) {
                      return (
                        <Col>{meeting} , {Object.values(data[date])[index]}</Col>
                      )
                    } else {
                      return (
                        <Col style={{ color: 'red' }}>{meeting} , {Object.values(data[date])[index]}</Col>
                      )
                    }
                  })
                }
              })
            }
          </Row>
        </Col>
        <Col sm={9} style={{ width: '80%' }}>
          <If condition={show && userToCall !== ''}>
            <Then>
              <Stream setShowHandler={setShow} yourID={yourID} userToCall={userToCall} socket={socket.current} initalCall={initalCall} />
            </Then>
            <Else>
              <Container style={{ height: '100vh' }}>
                <Calendar className="react-calendar" onChange={onChange}
                  value={value} />
              </Container >
            </Else>
          </If>
        </Col>
      </Row>
    </Container >
  );
}

export default Lobby;