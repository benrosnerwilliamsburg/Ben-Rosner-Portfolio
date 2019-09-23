import React from 'react';
import './About.css';
import Photo from '../assets/ben_photo.jpg';

const About = () => {
    return (
        <div className = "about-container">
            <div className="personal-image-container">
                <img src={Photo} alt="Ben Rosner - Professional Web Developer"></img>
            </div>
            <div className="brand-statement-container">
            <p className="brand-statement">Resourceful and motivated individual targeting 
                opportunities in software engineering. Well organized 
                and capable of balancing multiple tasks in energetic settings. 
                Perspicacious and savvy with various technologies.  Articulate 
                communicator with strong oral, writing, and interpersonal skills; 
                easily connects to all personality styles and cultures. Child of 
                the information age who isn’t afraid to discount the innovations 
                and methodologies of the past.</p>
            </div>
        </div>
    )
  }
export default About;