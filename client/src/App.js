import React from 'react';
import {Route, Routes} from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Marketplace from './components/Marketplace';
import Publish from './components/Publish';


const App = () => {
  return(

 
    <div className='body'>
      <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Marketplace" element={<Marketplace />} />
          <Route path='/Publish' element={<Publish />} />
        </Routes>

    </div>
    

  )
}

export default App;
