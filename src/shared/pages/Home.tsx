import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

import "./Home.css";


import logo from "../../assets/logos/logo.png";
import slogan from "../../assets/logos/slogan.svg";
import heroBg from "../../assets/backgrounds/hero-background.png";
import storage from "../../assets/home-assets/messy-storage.svg";
import camera from "../../assets/home-assets/camera.svg";
import ipad from "../../assets/home-assets/ipad.svg";
import interested from "../../assets/home-assets/interested.svg";



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
    <div className="home">
      {/* ===== HERO ===== */}
      <header
        className="homeHero"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="homeHeroInner">
          <img className="slogan" src={slogan} alt="Sort smart. Share easily" />
          <img className="homeHeroLogo" src={logo} alt="EstateSpace" />

          <div className="homeHeroActions">
            <Link to="/auth/login" className="homeBtn homeBtnOutline">
              Logga in
            </Link>
            <Link to="/auth/signup" className="homeBtn homeBtnOutline">
              Skapa konto
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HOW IT WORKS ===== */}
      <section className="homeSection homeHow">
        <div className="homeContainer">
          <h2 className="homeH2">Hur det funkar</h2>

          <ol className="howSteps">
            <li className="howStep">
              <div className="howIcon howIcon--img" aria-hidden="true">
                <img src={storage} alt="" />
              </div>
              <p className="howText">
                <span className="howNr">1.</span> Lokalisera vad du vill rensa
              </p>
              <p className="howStep-desc">
                Ta fram saker från vinden, förrådet eller dödsboet som du vill strukturera.
              </p>
            </li>

            <li className="howStep">
              <div className="howIcon howIcon--img" aria-hidden="true">
                <img src={camera} alt="" />
              </div>
              <p className="howText">
                <span className="howNr">2.</span> Fota föremålet
              </p>
                    <p className="howStep-desc">
                Fotografera föremålet direkt med mobilen om du inte redan har ett foto som du vill använda.
              </p>
            </li>

            <li className="howStep">
              <div className="howIcon howIcon--img" aria-hidden="true">
                <img src={ipad} alt="" />
              </div>
              <p className="howText">
                <span className="howNr">3.</span> Lägg upp i EstateSpace
              </p>
                           <p className="howStep-desc">
                Skapa ett Space på EstateSpace, ladda sedan upp bilden och en titel. Välj om du vill donera, slänga, spara eller fortfarande Osorterad. 
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ===== SHARE ===== */}
<section className="homeSection homeShare">
  <div className="homeContainer">
    <div className="shareRow">
      <div className="shareCopy">
        <h2 className="homeH2 shareTitle">Dela ditt Space!</h2>
        <p className="shareDesc">
          Du kan även dela ditt Space med vänner och familj för att se om någon
          är intresserad av att ärva dina gamla saker.
        </p>
      </div>

      <img className="shareImg" src={interested} alt="" loading="lazy" />
    </div>
  </div>
</section>



      {/* ===== CTA FOOTER ===== */}
      <footer className="homeFooter">
        <div className="homeFooterInner">
          <h2 className="homeH2 homeH2--footer">Redo att komma igång?</h2>
          <p className="homeFooterP">
            Skapa ett space på några sekunder och börja strukturera direkt
          </p>

          <div className="homeHeroActions homeHeroActions--footer">
            <Link to="/auth/login" className="homeBtn homeBtnOutline">
              Logga in
            </Link>
            <Link to="/auth/signup" className="homeBtn homeBtnOutline">
              Skapa konto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
