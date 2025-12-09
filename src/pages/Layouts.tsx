import { NavLink, Outlet } from "react-router"

export const Layout = () => {
    return (
        <>
        <header>
            <nav>
                <ul>
                    <li>
                        <NavLink to={"/"}>Hem</NavLink>
                    </li>
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