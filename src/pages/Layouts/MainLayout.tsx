import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { supabase } from "../../supabaseClient";

export const MainLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };
    return (
        <>
        <header>
            <nav>
                <ul>
    
                    <li>
                        <NavLink to={"/about"}>Om</NavLink>
                    </li>
                    <li>
                        <NavLink to={"/contact"}>Kontakt</NavLink>
                    </li>
                    <li>
                        <NavLink to={"/estates"}>Estates</NavLink>
                    </li>
                     <li>
              <button type="button" onClick={handleLogout}>
                Logga ut
              </button>
            </li>
                </ul>
            </nav>
        </header>
        <main>
            <Outlet />
        </main>
        <footer>
            <div>Sociala media</div>
            <div>Karta</div>
            <div>Kontaktinfo</div>
        </footer>
        </>
    );
};