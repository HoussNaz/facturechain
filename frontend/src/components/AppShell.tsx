import { NavLink, Link } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";
import Logo from "./Logo";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";

const linkBase = "rounded-full px-4 py-2 text-sm transition";
const activeLink = "bg-brand-900 text-white";
const inactiveLink = "text-slate-600 hover:text-brand-900";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold text-brand-900">{t("appName")}</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? activeLink : inactiveLink}`
              }
            >
              {t("navDashboard")}
            </NavLink>
            <NavLink
              to="/invoices/new"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? activeLink : inactiveLink}`
              }
            >
              {t("navNewInvoice")}
            </NavLink>
            <NavLink
              to="/verify"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? activeLink : inactiveLink}`
              }
            >
              {t("navVerify")}
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-slate-500 sm:block">
                  {user.companyName || user.email}
                </span>
                <button
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600"
                  type="button"
                  onClick={logout}
                >
                  Deconnexion
                </button>
              </div>
            ) : (
              <>
                <Link className="rounded-full border border-brand-900 px-4 py-2 text-sm text-brand-900" to="/login">
                  {t("navLogin")}
                </Link>
                <Link className="rounded-full bg-brand-900 px-4 py-2 text-sm text-white" to="/register">
                  {t("navRegister")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500">
          <span>FactureChain MVP</span>
          <span>Polygon ready. PDF hash ready.</span>
        </div>
      </footer>
    </div>
  );
}
