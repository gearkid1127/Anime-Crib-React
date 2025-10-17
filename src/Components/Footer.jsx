import React from 'react'
import {Link} from 'react-router-dom'
import '../styles/footer.css'
import { useUI } from "../Context/UIContext.jsx";

const Footer = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { isContactOpen, setIsContactOpen } = useUI();

  return (
    <div>
        <footer>
            <div className="footer__link--list">
                <Link to="/">Home</Link>
                <Link to="/browse">Browse</Link>
                <Link to="/categories">Categories</Link>
                <Link onClick={() => setIsContactOpen(!isContactOpen)}>Contact
            </Link>
            </div>
        <p className='copyright'>© 2025 Anime Crib. All rights reserved.</p>
        <h5 className='source'>
          Data sourced from <a href="https://jikan.moe/" className='api' target="_blank" rel="noopener noreferrer">Jikan API</a>
        </h5>

        </footer>
    </div>
  )
}
export default Footer