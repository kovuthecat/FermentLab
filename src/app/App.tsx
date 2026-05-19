import { Outlet, NavLink } from "react-router-dom";

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-logo">
          FermentLab
        </NavLink>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
