import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "../../styles/Navbar.css";
import logo from "../../assets/logo-liggande-single.png";
import "../../styles/Footer.css";

export const MainLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate("/", { replace: true });
    await supabase.auth.signOut();
    
  };

  return (
    <>
    <header className="site-header">
  <nav className="navbar">
    {/* VÄNSTER */}
    <NavLink to="/dashboard" className="logo-link">
    <img
      src={logo}
      alt="EstateSpace logo"
      className="logo-img"
    />
  </NavLink>
    

    {/* MITTEN */}
<div className="nav-center">
  
</div>


    {/* HÖGER */}
    <ul className="nav-right">
      <li>
        <NavLink className="nav-link" to="/estates">
          Spaces
        </NavLink>
      </li>
        <li>
        <NavLink className="nav-link" to="/estates">
          Settings
        </NavLink>
      </li>
      <li>
        <button className="logout-btn" type="button" onClick={handleLogout}>
          Log out
        </button>
      </li>
    </ul>
  </nav>
</header>


      <main className="site-main">
        <Outlet />
      </main>

    </>
  );
};
