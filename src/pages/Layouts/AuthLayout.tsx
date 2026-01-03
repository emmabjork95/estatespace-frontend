import { Outlet } from "react-router-dom";
import { AuthNavbar } from "../AuthNavbar";
import "../../styles/AuthLayout.css";

export function AuthLayout() {
  return (
    <div className="authLayout">
      <AuthNavbar />
      <main className="authMain">
        <Outlet />
      </main>
    </div>
  );
}
