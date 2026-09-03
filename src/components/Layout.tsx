import {
  Boxes,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Search,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "../lib/utils";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/users", label: "Users", icon: Users },
];

const titles: Record<string, string> = {
  "/": "Overview",
  "/products": "Products",
  "/categories": "Categories",
  "/orders": "Orders",
  "/users": "Users",
};

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <span>
            <Leaf />
          </span>
          <div>
            <strong>Verdant</strong>
            <small>Commerce admin</small>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileOpen(false)}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="logout-btn" onClick={logout}>
            <LogOut />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main-area">
        <div className="topbar">
          <div className="topbar-title">
            <button className="menu-btn" onClick={() => setMobileOpen(true)}>
              <Menu />
            </button>
            <span>{titles[location.pathname] ?? "Admin"}</span>
          </div>
          <div className="topbar-actions">
            <div className="profile">
              <span className="avatar">{initials(user?.name)}</span>
              <div>
                <strong>{user?.name}</strong>
                <small>Administrator</small>
              </div>
              <ChevronDown />
            </div>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
