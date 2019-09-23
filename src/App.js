import React from 'react';
import './App.css';
import Header from './components/Header'
import Footer from './components/Footer'
import Work from './components/Work'
import About from './components/About'
import {Link, Route, Switch} from 'react-router-dom'

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
            <Switch>
            <Route exact path="/"></Route>
            <Route exact path="/work" component={Work}></Route>
            <Route exact path="/about" component={About}></Route>
            </Switch>
        </div>
       <Footer/>
    </div>
  );
}

export default App;