import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Home.css";
import "../App.css";
import "../index.css"

import pic3 from "../assets/section3.svg";
import ipad from "../assets/estatespace-frontpage.svg";
import logo from "../assets/logo-liggande-single.png";
import step from "../assets/step-by-step2.png";

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  const section2Ref = useRef<HTMLElement | null>(null);
  const section3Ref = useRef<HTMLElement | null>(null);
  const section4Ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) navigate("/dashboard");
      setChecking(false);
    };
    checkUser();
  }, [navigate]);

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (checking) return null;

  return (
    <div className="landing">
      {/* ===== HERO ===== */}
      <section className="panel panel--hero panel--heroClickup">
        <div className="panel-inner">
          <div className="heroRow">
            <div className="heroCopy">
              <img
                src={logo}
                className="logo-frontpage"
                alt="EstateSpace logga"
              />

              <h3 className="slogan">Sort Smart. Share Easy.</h3>

              <p className="heroSub">
                Organisera vinden eller förrådet visuellt. Bjud in familj och
                vänner!
              </p>

              <div className="heroCtas">
                <Link
                  to="/auth/signup"
                  className="btn btn-primary heroBtn heroBtnPrimary"
                >
                  Skapa konto
                </Link>
                <Link to="/auth/login" className="btn btn-secondary heroBtn">
                  Logga in
                </Link>
              </div>
            </div>

            <div className="heroVisual">
              <div className="visualCard">
                <img
                  src={step}
                  alt="Steg-för-steg illustration"
                  className="heroIllustration"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <button
            className="scroll-indicator scroll-indicator--pill"
            onClick={() => scrollTo(section2Ref)}
            aria-label="Scrolla ner"
            type="button"
          >
            <span className="scroll-indicator__arrow" />
          </button>
        </div>
      </section>

      {/* ===== SECTION 2 ===== */}
      <section ref={section2Ref} className="panel panel--pink">
        <div className="panel-inner panel-stack">
          <div className="panel-text panel-text--center">
            <h2>Skapa Space</h2>
            <p>
              Skapa ett space. Lägg till dina föremål. Allt visas i ett
              överskådligt collage.
            </p>
          </div>

          <div className="panel-media">
            <img
              src={ipad}
              alt="Förhandsvisning av EstateSpace"
              className="ipadIMG"
              loading="lazy"
            />
          </div>
        </div>

        <button
          className="scroll-indicator scroll-indicator--pill"
          onClick={() => scrollTo(section3Ref)}
          aria-label="Scrolla ner"
          type="button"
        >
          <span className="scroll-indicator__arrow" />
        </button>
      </section>

      {/* ===== SECTION 3 ===== */}
      <section ref={section3Ref} className="panel panel--lavender">
        <div className="panel-inner panel-split">
          <div className="panel-text">
            <h2>Dela och samarbeta</h2>
            <p>
              Bjud in familj eller vänner, markera <strong>intresserad</strong>/
              <strong>avstår</strong> och håll allt samlat.
            </p>
          </div>

          <div className="panel-media">
            <img
              src={pic3}
              alt="EstateSpace illustration"
              className="panel-image"
              loading="lazy"
            />
          </div>
        </div>

        <button
          className="scroll-indicator scroll-indicator--pill"
          onClick={() => scrollTo(section4Ref)}
          aria-label="Scrolla ner"
          type="button"
        >
          <span className="scroll-indicator__arrow" />
        </button>
      </section>

      {/* ===== SECTION 4 ===== */}
      <section ref={section4Ref} className="panel panel--dark">
        <div className="panel-inner">
          <h2>Redo att komma igång?</h2>
          <p>Skapa ett space på några sekunder och börja strukturera direkt.</p>

          <div className="hero-actions hero-actions--center">
            <button
              className="btn btn-primary heroBtn heroBtnPrimary"
              onClick={() => navigate("/auth/signup")}
            >
              Skapa konto
            </button>
            <button
              className="btn btn-section4 heroBtn"
              onClick={() => navigate("/auth/login")}
            >
              Logga in
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
