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
            <div className='work-link'>
            <Link to="/work">Work</Link>
            </div>
            <div className="about-link">
            <Link to="/about">About</Link>
            </div>
            <Route exact path="/work" render={() => (<Work/>)}></Route>
            <Route exact path="/about" render={() =>(<About/>)}></Route>
          </nav>
        </div>
       <Footer/>
    </div>
  );
}

export default App;