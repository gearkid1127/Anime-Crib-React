import React from 'react'
import animeLogo from "../assets/anime-logo.svg"
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from 'react';
import { useUI } from "../Context/UIContext.jsx";



const Nav = () => {
const [menuOpen, setMenuOpen] = useState(false);
const { isContactOpen, setIsContactOpen } = useUI();
const location = useLocation();

// Close menu when route changes
useEffect(() => {
  setMenuOpen(false);
}, [location.pathname]);

  return (
    <div>
        <nav className="nav">
        <Link to="/" className='logo__link'><figure className="logo__wrapper">
          <img
            src={animeLogo}
            className="logo-personal"
            alt="AnimeDB logo"
          />
          <h1 className="logo__title">Anime Crib</h1>
        </figure>
        </Link>

          {/* Hamburger button */}
      <button
        className={`hamburger ${menuOpen ? "active" : ""}`}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? (
          <FontAwesomeIcon icon={faXmark} />
        ) : (
          <FontAwesomeIcon icon={faBars} className='hamburger__icon' />
        )}
      </button>

        <ul className={`nav__link--list ${menuOpen ? "open" : ""}`}>
          <li className="nav__link about">
            <Link to="/browse" onClick={() => setMenuOpen(false)} className="nav__link--anchor">Browse</Link>
          </li>
          <li className="nav__link top">
            <Link to="/categories" onClick={() => setMenuOpen(false)} className="nav__link--anchor">Categories</Link>
          </li>
          <li className="nav__link contact">
            <button className='btn' onClick={() => { setIsContactOpen(true); setMenuOpen(false); }}>
              Contact
            </button>
          </li>
        </ul>
      </nav>

    </div>
  )
}

export default Nav