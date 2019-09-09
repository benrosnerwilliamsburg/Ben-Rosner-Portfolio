import React from 'react';
import './Work.css';
import Revivyl from '../assets/revivyl.png'
import ClassAct from '../assets/class_act.png'
import BetterLiving from '../assets/better_living.png'

const Work = () => {
    return (
        <div className = "work-container">
            <div className="image-container">
              <a href="https://github.com/benrosnerwilliamsburg/vivyl-app"><img src={Revivyl} alt="Revivyl App" className="revivyl"/></a>  
            </div>
            <div className="image-container">
              <a href="https://github.com/destinc/class-act"><img src={ClassAct} alt="Class Act App" className="class-act"/></a>
            </div>
            <div className="image-container">
                <a href="https://github.com/c-kehler/Better-Living"><img src={BetterLiving} alt="Better Living App" className="better-living"/></a>
            </div>
        </div>
    )
  }
export default Work;