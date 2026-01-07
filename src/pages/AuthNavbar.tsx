import { NavLink, useLocation } from "react-router-dom";
import "../styles/AuthNavbar.css";

import logo from "../assets/logo-liggande-single.png";
import navBg from "../assets/background-new.png";

export const AuthNavbar = () => {
  const { pathname } = useLocation();
  const onLogin = pathname.startsWith("/auth/login");
  const onSignup = pathname.startsWith("/auth/signup");

  return (
    <header className="authHeader">
      <nav className="authNavbar">
        <img
          src={navBg}
          alt=""
          aria-hidden="true"
          className="authNavbarBg"
        />

        <NavLink to="/" className="authLogoLink" aria-label="Till startsidan">
          <img src={logo} alt="EstateSpace logo" className="authLogoImg" />
        </NavLink>

        <div className="authNavCenter" />

        <ul className="authNavRight">
          {!onSignup && (
            <li>
              <NavLink
                to="/auth/signup"
                className={({ isActive }) =>
                  isActive ? "authNavLink authNavLink--active" : "authNavLink"
                }
              >
                Skapa konto
              </NavLink>
            </li>
          )}

          {!onLogin && (
            <li>
              <NavLink
                to="/auth/login"
                className={({ isActive }) =>
                  isActive ? "authNavLink authNavLink--active" : "authNavLink"
                }
              >
                Logga in
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};
