import React from 'react';
import './Work.scss';
import GoGoGiphy from '../assets/go_go_giphy.png'
import Revivyl from '../assets/revivyl.png'
import BetterLiving from '../assets/better_living.png'
import Sailors from '../assets/sailors.png'

const Work = () => {
    return (
        <div className = "work-container">
            <div className="image-container">
              <a href="https://asailorslifeforme.org/"><img src={Sailors} alt="Sailors Website" className="project" width="713px" height="348px" /></a>
            </div>
            <div className="image-container">
              <a href="https://github.com/benrosnerwilliamsburg/go-go-giphy"><img src={GoGoGiphy} alt="Go Go Giphy App" className="project"/></a>
            </div>
            <div className="image-container">
                <a href="https://github.com/c-kehler/Better-Living"><img src={BetterLiving} alt="Better Living App" className="project"/></a>
            </div>
            <div className="image-container">
              <a href="https://github.com/benrosnerwilliamsburg/vivyl-app"><img src={Revivyl} alt="Revivyl App" className="project"/></a>  
            </div>
        </div>
    )
  }
export default Work;