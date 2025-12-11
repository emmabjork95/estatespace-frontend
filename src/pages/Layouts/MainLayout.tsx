import { NavLink, Outlet } from "react-router-dom"

export const MainLayout = () => {
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