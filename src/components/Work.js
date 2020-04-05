import React from 'react';
import './Work.css';
import GoGoGiphy from '../assets/go_go_giphy.png'
import Revivyl from '../assets/revivyl.png'
import BetterLiving from '../assets/better_living.png'
import ExLibris from '../assets/ex_libris.png'
import Sailors from '../assets/sailors.png'

const Work = () => {
    return (
        <div className = "work-container">
            <div className="image-container">
              <a href="https://asailorslifeforme.org/"><img src={Sailors} alt="Sailors Website" className="project"/></a>
            </div>
            <div className="summary-container">
              <h4 className="summary">Developed an educational Wordpress website for the USS Constitution Museum in Boston, Massachusetts.</h4>
            </div>
            <div className="image-container">
              <a href="https://github.com/benrosnerwilliamsburg/go-go-giphy"><img src={GoGoGiphy} alt="Go Go Giphy App" className="project"/></a>
            </div>
            <div className="summary-container">
              <h4 className="summary">Created a GIF search app using the Giphy.com RESTful API and Javascript with React.</h4>
            </div>
            <div className="image-container">
              <a href="https://github.com/benrosnerwilliamsburg/vivyl-app"><img src={Revivyl} alt="Revivyl App" className="project"/></a>  
            </div>
            <div className="summary-container">
              <h4 className="summary">Created a vinyl record search app using the Discogs.com RESTful API and Javascript with React.</h4>
            </div>
            <div className="image-container">
                <a href="https://github.com/c-kehler/Better-Living"><img src={BetterLiving} alt="Better Living App" className="project"/></a>
            </div>
            <div className="summary-container">
              <h4 className="summary"> Developed a front-end web application to monitor health and wellness using UX concepts.</h4>
            </div>
            <div className="image-container">
                <a href="https://github.com/benrosnerwilliamsburg/ex_libris"><img src={ExLibris} alt="Ex Libris App" className="project"/></a>
            </div>
            <div className="summary-container">
              <h4 className="summary">Designed a full stack sci-fi/fantasy book curation app with a Rails backend and a Javascript with React frontend.</h4>
            </div>
        </div>
    )
  }
export default Work;