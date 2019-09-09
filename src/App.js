import React from 'react';
import './App.css';
import Header from './components/Header'
import Footer from './components/Footer'
import Work from './components/Work'
import About from './components/About'
import {Link, Route} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Header/>
      <div className="nav-container">
          <nav className="navigation">
          <div className="home-link">
            <Link to="/">Home</Link>
          </div>
            <div className='work-link'>
            <Link to="/work">Work</Link>
            </div>
            <div className="about-link">
            <Link to="/about">About</Link>
            </div>
          </nav>
            <Route exact path="/"></Route>
            <Route exact path="/work" render={() => (<Work/>)}></Route>
            <Route exact path="/about" render={() =>(<About/>)}></Route>
        </div>
       <Footer/>
    </div>
  );
}

export default App;