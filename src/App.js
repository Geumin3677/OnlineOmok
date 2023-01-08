import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Components/Login.js';
import Main from './Components/Main';
import Signup from './Components/Signup';

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Main />}/>
          <Route path='/Login' element={<Login/>}/>
          <Route path='/Signup' element={<Signup />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
