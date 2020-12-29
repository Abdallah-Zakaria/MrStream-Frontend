import React, { useState } from 'react';
import Stream from './Stream';

import { If, Else, Then } from 'react-if'




function App() {
  const [show, setShow] = useState(false)
  return (

    <>
      <If condition={show}>
        <Stream setShowHandler={setShow} />
      </If>
      <button  onClick={()=>{setShow(true)}}>Hello</button>
    </>
  );
}

export default App;





