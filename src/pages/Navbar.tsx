import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Navbar.css";
import "../styles/Buttons.css";

import logo from "../assets/logo-liggande-single.png";
import spacesIcon from "../assets/folder.svg";
import settingsIcon from "../assets/settings.svg";
import bellIcon from "../assets/bell.svg";

import { NotificationsBell } from "../components/NotificationsBell";

export const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate("/", { replace: true });
    await supabase.auth.signOut();
  };

  return (
    <header className="site-header">
      <nav className="navbar">
        <div className="navbar-overlay" aria-hidden="true" />

        <NavLink to="/dashboard" className="logo-link">
          <img src={logo} alt="EstateSpace logo" className="logo-img" />
        </NavLink>

        <div className="nav-center" />

        <ul className="nav-right">
          <li>
           <NotificationsBell>
            {({ unreadCount, open, toggle }) => (
                <button
                type="button"
                className={`nav-icon-link notif-trigger ${open ? "active" : ""}`}
                onClick={(e) => {
                    e.stopPropagation();
                    toggle();
                }}
                aria-label="Notiser"
                title="Notiser"
                >
                <img src={bellIcon} alt="" className="nav-icon" />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>
            )}
            </NotificationsBell>

          </li>

          <li>
            <NavLink
              to="/dashboard"
              end
              title="Spaces"
              aria-label="Spaces"
              className={({ isActive }) =>
                isActive ? "nav-icon-link active" : "nav-icon-link"
              }
            >
              <img src={spacesIcon} alt="" className="nav-icon" />
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/profile"
              title="Profil"
              aria-label="Profil"
              className={({ isActive }) =>
                isActive ? "nav-icon-link active" : "nav-icon-link"
              }
            >
              <img src={settingsIcon} alt="" className="nav-icon" />
            </NavLink>
          </li>

          <li>
            <button className="btn btn-danger" type="button" onClick={handleLogout}>
              Logga ut
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};
