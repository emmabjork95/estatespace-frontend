const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Mitt Företag</h3>
          <p>Bygger moderna webbappar ✨</p>
        </div>

        <div className="footer-section">
          <h4>Länkar</h4>
          <ul>
            <li><a href="/">Hem</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/contact">Kontakt</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Kontakt</h4>
          <p>email@exempel.se</p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Mitt Företag
      </div>
    </footer>
  );
};

export default Footer;
