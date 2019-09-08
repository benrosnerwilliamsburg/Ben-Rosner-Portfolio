import React from 'react';
import './App.css';
import Header from './components/Header'
import Footer from './components/Footer'
import {Link, Route} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Header/>
      <div className="nav-container">
          <nav className="navigation">
            <Link to="/work">Work</Link>
            <Route exact path="/work"></Route>
            <Link to="/about">About</Link>
            <Route exact path="/about"></Route>
          </nav>
        </div>
      <Footer/>
    </div>
  );
}

export default App;