import React from 'react'
import './Header.scss'

const Header = () => {
    return (
      <header className="app-header">   
        <div className = "title-container">
          <h1 className="title">Ben Rosner</h1>
          </div>
        <div className="sub-heading-container">
          <h3 className="sub-heading">Front End Developer</h3>
          </div>
      </header>
    )
  }

export default Header