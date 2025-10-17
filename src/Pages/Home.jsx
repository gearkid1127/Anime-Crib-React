import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile, faHandshake } from "@fortawesome/free-regular-svg-icons";
import { faInfinity } from "@fortawesome/free-solid-svg-icons";
import animeCrib from '../assets/anime-crib.png'
import '../styles/Home.css'

const Home = () => {
  return (
    <div>
        <section id="landing-page">
          <div className="container">
            <div className="row home__content">
              <div className="call__to--action">
                <h1>What are you waiting for? start browsing now! ... or else</h1>
              </div>
              <figure className="crib">
                <img src={animeCrib} className='baby' alt="crib" />
              </figure>
              <ul className="highlights">
                <li className="highlight__item">
                  <FontAwesomeIcon icon={faFaceSmile} alt="easy to use" />
                  <p>EASY TO USE</p>
                </li>
                <li className="highlight__item">
                  <FontAwesomeIcon icon={faHandshake} alt="secure" />
                  <p>TOTALLY FREE</p>
                </li>
                <li className="highlight__item">
                  <FontAwesomeIcon icon={faInfinity} alt="free" />
                  <p>THOUSANDS OF TITLES</p>
                </li>
              </ul>
            </div>
          </div>
        </section>
    </div>
  )
}

export default Home