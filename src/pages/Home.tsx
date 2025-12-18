import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Home.css";
import logo from "../assets/logo-liggande.png";
import pic3 from "../assets/pic3.png";
import test from "../assets/test.png";

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) navigate("/dashboard");
      setChecking(false);
    };
    checkUser();
  }, [navigate]);

  if (checking) return null;

  return (
    <div className="landing">
      {/* Section 1 */}
      <section className="panel panel--white">
        <div className="panel-inner">
        <div className="logo-home-wrapper">
          <img
            src={logo}
            alt="EstateSpace logo"
            className="logo-img-home"
          />
        </div>
        
          <p>Fota, skapa och dela med vänner och familj. Allt på ett ställe.</p>

          <div className="hero-images">
            <div className="img-card">
                <img src={test} alt="Exempel på space" />
            </div>
             <div className="img-card">
                <img src={test} alt="Exempel på space" />
            </div>
             <div className="img-card">
                <img src={test} alt="Exempel på space" />
            </div>
            
          </div>

        <div className="hero-btns">
            <Link to="/auth/login" className="btn btn-outline">LOG IN</Link>
            <Link to="/auth/signup" className="btn btn-filled">SIGN UP</Link>
        </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="panel panel--pink">
        <div className="panel-inner">
          <h2>Skapa anslagstavlor</h2>
          <p>Varje space får ett collage av dina bilder – precis som Pinterest.</p>
        </div>
      </section>

{/* Section 3 */}
<section className="panel panel--lavender">
  <div className="panel-inner panel-split">
    
    {/* VÄNSTER: text */}
    <div className="panel-text">
      <h2 className="title-se">Dela och samarbeta</h2>
      <p>Bjud in andra, visa intresse och håll allt organiserat på ett ställe.</p>
    </div>

    {/* HÖGER: bild */}
    <div className="panel-media">
      <img
        src={pic3}
        alt="EstateSpace illustration"
        className="panel-image"
      />
    </div>

  </div>
</section>

      {/* Section 4 */}
      <section className="panel panel--dark">
        <div className="panel-inner">
          <h2>Redo?</h2>
          <p>Skapa ditt första space på några sekunder.</p>
          <button className="cta cta--light" onClick={() => navigate("/signup")}>
            Skapa konto
          </button>
        </div>
        
      <footer className="site-footer">
  <div className="footer-content">
    <div className="footer-column">
      <h4>EstateSpace</h4>
      <p>Organisera och strukturera dina spaces.</p>
    </div>

    <div className="footer-column">
      <h4>Navigering</h4>
      <ul>
        <li>Om</li>
        <li>Kontakt</li>
        <li>Estates</li>
      </ul>
    </div>

    <div className="footer-column">
      <h4>Kontakt</h4>
      <p>info@estatespace.se</p>
      <p>Stockholm</p>
    </div>
  </div>

  <div className="footer-bottom">
    © {new Date().getFullYear()} EstateSpace
  </div>
</footer>

      </section>
      
    </div>
  );
}
