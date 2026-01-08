import { NavLink } from "react-router-dom";
import "./AuthNavbar.css";

import logo from "../../../assets/logos/logo.png";
import navBg from "../../../assets/backgrounds/background.png";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "authNavLink authNavLink--active" : "authNavLink";

export const AuthNavbar = () => {
  return (
    <header className="authHeader">
      <nav className="authNavbar">
        <img src={navBg} alt="" aria-hidden="true" className="authNavbarBg" />

        <NavLink to="/" className="authLogoLink" aria-label="Till startsidan">
          <img src={logo} alt="EstateSpace logo" className="authLogoImg" />
        </NavLink>

        <div className="authNavCenter" />

        <ul className="authNavRight">
          <li>
            <NavLink to="/auth/signup" className={linkClass}>
              Skapa konto
            </NavLink>
          </li>

          <li>
            <NavLink to="/auth/login" className={linkClass}>
              Logga in
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};