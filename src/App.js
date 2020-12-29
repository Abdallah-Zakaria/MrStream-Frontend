import React, { useState } from 'react';
import Stream from './Stream';

import { If, Then, Else } from 'react-if'

function App() {
  const [show, setShow] = useState(false)
  return (

    <>
      <If condition={show}>
        <Then>
          <Stream setShowHandler={setShow} />
        </Then>
        <Else>
          <button onClick={() => { setShow(true) }}>Open Meetings</button>
        </Else>
      </If>

    </>
  );
}

export default App;





