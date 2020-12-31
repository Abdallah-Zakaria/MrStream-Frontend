import React, {useState} from 'react';
import Lobby from './Lobby';
import { If, Then, Else } from 'react-if'


function App() {
  const [show, setShow] = useState(false)

  return (

    <>

      <If condition={show}>
        <Then>
          <Lobby setShowHandler={setShow} />
        </Then>
        <Else>
          <h1>Dashboard</h1>
          <button onClick={() => { setShow(true) }}>Open Meetings</button>

        </Else>
      </If>
    </>
  );
}

export default App;
