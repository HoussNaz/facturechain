import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { t } = useI18n();
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await register({
        email,
        password,
        companyName: companyName || undefined,
        siret: siret || undefined
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Inscription impossible");
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-brand-900">{t("registerTitle")}</h1>
      <p className="mt-2 text-sm text-slate-600">Creez votre compte pour certifier des factures.</p>
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
        <input
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
          placeholder="Nom de l'entreprise"
          type="text"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
        />
        <input
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
          placeholder="SIRET"
          type="text"
          value={siret}
          onChange={(event) => setSiret(event.target.value)}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="w-full rounded-lg bg-brand-900 py-3 text-white" type="submit" disabled={loading}>
          {loading ? "Creation..." : t("navRegister")}
        </button>
      </form>
    </div>
  );
}
