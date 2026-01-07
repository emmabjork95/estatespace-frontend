import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Navbar.css";
import "../styles/Buttons.css";

import logo from "../assets/logo-liggande-single.png";
import settingsIcon from "../assets/settings.svg";
import bellIcon from "../assets/bell.svg";
import homeIcon from "../assets/homeIcon2.png";

import { NotificationsBell } from "../components/NotificationsBell";

export const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    navigate("/", { replace: true });
    await supabase.auth.signOut();
  };

  // Stäng meny med ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="site-header">
      <nav className="navbar" onClick={() => setMenuOpen(false)}>
        <div className="navbar-overlay" aria-hidden="true" />

        <NavLink
          to="/dashboard"
          className="logo-link"
          onClick={() => setMenuOpen(false)}
        >
          <img src={logo} alt="EstateSpace logo" className="logo-img" />
        </NavLink>

        <div className="nav-center" />

        <div className="nav-actions" onClick={(e) => e.stopPropagation()}>
          <NotificationsBell>
            {({ unreadCount, open, toggle }) => (
              <button
                type="button"
                className={`nav-icon-link notif-trigger ${open ? "active" : ""}`}
                onClick={toggle}
                aria-label="Notiser"
                title="Notiser"
              >
                <img src={bellIcon} alt="" className="nav-icon" />
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>
            )}
          </NotificationsBell>

          <button
            type="button"
            className="nav-burger"
            aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            ☰
          </button>
        </div>

        <ul className="nav-right">
          <li>
            <NotificationsBell>
              {({ unreadCount, open, toggle }) => (
                <button
                  type="button"
                  className={`nav-icon-link notif-trigger ${
                    open ? "active" : ""
                  }`}
                  onClick={toggle}
                  aria-label="Notiser"
                  title="Notiser"
                >
                  <img src={bellIcon} alt="" className="nav-icon" />
                  {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                  )}
                </button>
              )}
            </NotificationsBell>
          </li>

          <li>
            <NavLink
              to="/dashboard"
              end
              title="Hem"
              aria-label="Spaces"
              className={({ isActive }) =>
                isActive ? "nav-icon-link active" : "nav-icon-link"
              }
            >
              <img src={homeIcon} alt="" className="nav-icon" />
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/profile"
              title="Inställningar"
              aria-label="Profil"
              className={({ isActive }) =>
                isActive ? "nav-icon-link active" : "nav-icon-link"
              }
            >
              <img src={settingsIcon} alt="" className="nav-icon" />
            </NavLink>
          </li>

          <li>
            <button
              className="btn btn-danger"
              type="button"
              onClick={handleLogout}
            >
              Logga ut
            </button>
          </li>
        </ul>

  
        {menuOpen && (
          <button
            type="button"
            className="nav-menuOverlay"
            aria-label="Stäng meny"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
          />
        )}

  
        {menuOpen && (
          <div
            className="nav-mobileMenu"
            role="menu"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="CTA-btn"
              onClick={() => {
                navigate("/dashboard");
                setMenuOpen(false);
              }}
            >
              Spaces
            </button>

            <button
              type="button"
              className="CTA-btn"
              onClick={() => {
                navigate("/profile");
                setMenuOpen(false);
              }}
            >
              Profil
            </button>

            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logga ut
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};
