import React from 'react'
import './Footer.css'
import LinkedInLogo from "../assets/LinkedIn_logo_initials.png"
import GitHubLogo from "../assets/GitHub-Mark.png"
import ResumeLogo from '../assets/Resume-Logo.png'

const Footer = () => {
    return (
      <footer className="app-footer">   
        <div className = "quote-container">
          <p className="quote">"Dripping in this strange design/None is yours and far less mine" - Anastasio/Marshall, Phish</p>
         </div>
         <div className="social-media-links">
        <a href="https://www.linkedin.com/in/benrosner/"><img class="linkedin-logo" src={LinkedInLogo} alt="LinkedIn Logo"/></a>
        <a href="https://github.com/benrosnerwilliamsburg/"><img class="github-logo" src={GitHubLogo} alt="GitHub Logo"/></a>
        <a href="https://drive.google.com/file/d/1lpltEDNhNYTOHZZIz0LxNr5TJhMLMsm_/view?usp=sharing"><img class="resume-logo" src={ResumeLogo} alt="resume"/></a>
        </div>
      </footer>
    )
  }

export default Footer;