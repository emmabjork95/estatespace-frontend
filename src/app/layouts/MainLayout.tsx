import { Outlet } from "react-router-dom";
import { Navbar } from "../../shared/components/Navbar/Navbar";

export const MainLayout = () => {
  return (
    <> 
   <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
    </>
  );
};