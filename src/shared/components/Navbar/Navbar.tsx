import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "./Navbar.css";
import "../ui/Buttons.css";

import logo from "../../../assets/logos/logo.png";
import settingsIcon from "../../../assets/icons/settings.svg";
import bellIcon from "../../../assets/icons/bell.svg";
import homeIcon from "../../../assets/icons/home.png";

import { NotificationsBell } from "../NotificationsBell/NotificationsBell";

export const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    navigate("/", { replace: true });
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const NotifButton = ({
    unreadCount,
    open,
    toggle,
  }: {
    unreadCount: number;
    open: boolean;
    toggle: () => void;
  }) => (
    <button
      type="button"
      className={`nav-icon-link notif-trigger ${open ? "active" : ""}`}
      onClick={toggle}
      aria-label="Notiser"
      title="Notiser"
    >
      <img src={bellIcon} alt="Notissymbol" className="nav-icon" />
      {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
    </button>
  );

  return (
    <header className="site-header">
      <nav className="navbar" onClick={closeMenu}>
        <div className="navbar-overlay" aria-hidden="true" />

        <NavLink to="/dashboard" className="logo-link" onClick={closeMenu}>
          <img src={logo} alt="EstateSpace logo" className="logo-img" />
        </NavLink>

        <div className="nav-center" />

        <div className="nav-actions" onClick={(e) => e.stopPropagation()}>
          <NotificationsBell>
            {({ unreadCount, open, toggle }) => (
              <NotifButton unreadCount={unreadCount} open={open} toggle={toggle} />
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
                <NotifButton unreadCount={unreadCount} open={open} toggle={toggle} />
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
              <img src={homeIcon} alt="Hemsymbol" className="nav-icon" />
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
              <img src={settingsIcon} alt="Inställningssymbol" className="nav-icon" />
            </NavLink>
          </li>

          <li>
            <button className="btn btn-danger" type="button" onClick={handleLogout}>
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
              closeMenu();
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
                closeMenu();
              }}
            >
              Spaces
            </button>

            <button
              type="button"
              className="CTA-btn"
              onClick={() => {
                navigate("/profile");
                closeMenu();
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