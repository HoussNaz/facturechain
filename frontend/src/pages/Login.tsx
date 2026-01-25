import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { t } = useI18n();
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Connexion impossible");
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-brand-900">{t("loginTitle")}</h1>
      <p className="mt-2 text-sm text-slate-600">Entrez vos identifiants pour accéder au tableau de bord.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="w-full rounded-lg bg-brand-900 py-3 text-white" type="submit" disabled={loading}>
          {loading ? "Connexion..." : t("navLogin")}
        </button>
        <div className="text-center">
          <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
      </form>
    </div>
  );
}
