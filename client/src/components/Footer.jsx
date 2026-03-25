import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">


          <div className="footer__links">
            <Link to="/about" className="footer__link">About Us</Link>
            <Link to="/support" className="footer__link">Help & Support</Link>
            <Link to="/contact" className="footer__link">Contact</Link>
          </div>

          <p className="footer__copy">© 2026 ZeroByte. All rights reserved.</p>

        </div>
      </div>
    </footer>
  )
}

export default Footer