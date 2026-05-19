import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function App() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-logo">
          FermentLab
        </NavLink>
        <nav className="app-nav">
          <NavLink
            to="/comparisons"
            className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`}
          >
            Comparer
          </NavLink>
          <button className="app-nav-link app-nav-logout" onClick={handleLogout}>
            Déconnexion
          </button>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
