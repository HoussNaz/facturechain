import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import { apiFetch } from "../api/client";

export default function ForgotPassword() {
    const { t } = useI18n();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await apiFetch("/api/auth/forgot-password", {
                method: "POST",
                body: { email }
            });
            setMessage("Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.");
        } catch (err: any) {
            setError(err?.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md px-6 py-12">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
                <h1 className="text-2xl font-semibold text-brand-900">Mot de passe oublié</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Entrez votre email pour recevoir un lien de réinitialisation.
                </p>

                {message && (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-4 rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
                        {error}
                    </div>
                )}

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            placeholder="vous@exemple.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-brand-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
                    >
                        {loading ? "Envoi..." : "Envoyer le lien"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    <Link to="/login" className="text-brand-600 hover:underline">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}
