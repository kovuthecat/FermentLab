import { Outlet, NavLink } from "react-router-dom";

export default function App() {
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
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
