import React from 'react';
import './Work.scss';
import GoGoGiphy from '../assets/go_go_giphy.png'
import Sailors from '../assets/sailors.png'

const Work = () => {
    return (
        <div className="work-container">
            <div className="image-container">
              <a href="https://asailorslifeforme.org/"><img src={Sailors} alt="Sailors Website" className="project" width="713px" height="348px" /></a>
            </div>
          <div className='desc'>
            <p>Developed educational Wordpress website for noteworthy museum in Boston, Massachusetts.</p>
          </div>
            <div className="image-container">
              <a href="https://go-go-giphy.surge.sh/"><img src={GoGoGiphy} alt="Go Go Giphy App" className="project"/></a>
            </div>
            <div className='desc'>
              <p>Created a GIF search app using the Giphy.com RESTful API and JavaScript with React.</p>
          </div> 
        </div>
    )
  }
export default Work;