import { Outlet } from "react-router-dom";
import { AuthNavbar } from "../../shared/components/AuthNavbar/AuthNavbar";

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
