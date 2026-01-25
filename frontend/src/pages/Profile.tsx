import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";
import type { User } from "../api/types";

export default function Profile() {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: user?.email || "",
        companyName: user?.companyName || "",
        siret: user?.siret || "",
        address: user?.address || ""
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await apiFetch<{ user: User }>("/api/users/me", {
                method: "PUT",
                token,
                body: formData
            });
            setMessage("Profil mis à jour avec succès");
        } catch (err: any) {
            setError(err?.message || "Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordMessage(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères");
            return;
        }

        setLoading(true);

        try {
            await apiFetch("/api/users/me/password", {
                method: "POST",
                token,
                body: {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }
            });
            setPasswordMessage("Mot de passe mis à jour");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            setPasswordError(err?.message || "Erreur lors du changement de mot de passe");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await apiFetch("/api/users/me", {
                method: "DELETE",
                token
            });
            logout();
            navigate("/");
        } catch (err: any) {
            setError(err?.message || "Erreur lors de la suppression du compte");
        }
    };

    if (!token) {
        return (
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="text-sm text-slate-600">Veuillez vous connecter pour accéder à votre profil.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-12">
            <h1 className="text-2xl font-semibold text-brand-900">Mon Profil</h1>
            <p className="mt-2 text-sm text-slate-600">Gérez vos informations personnelles et préférences.</p>

            {/* Profile Information */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-brand-900">Informations</h2>

                {message && (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
                        {error}
                    </div>
                )}

                <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleProfileSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="companyName">
                            Nom de l'entreprise
                        </label>
                        <input
                            id="companyName"
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="siret">
                            SIRET
                        </label>
                        <input
                            id="siret"
                            type="text"
                            value={formData.siret}
                            onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700" htmlFor="address">
                            Adresse
                        </label>
                        <textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={2}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-full bg-brand-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
                        >
                            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-brand-900">Changer le mot de passe</h2>

                {passwordMessage && (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                        {passwordMessage}
                    </div>
                )}
                {passwordError && (
                    <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
                        {passwordError}
                    </div>
                )}

                <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handlePasswordSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="currentPassword">
                            Mot de passe actuel
                        </label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            required
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="newPassword">
                            Nouveau mot de passe
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            required
                            minLength={8}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                            Confirmer
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            required
                            minLength={8}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                    </div>

                    <div className="md:col-span-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-full bg-brand-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
                        >
                            Changer le mot de passe
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-rose-900">Zone de danger</h2>
                <p className="mt-2 text-sm text-rose-700">
                    La suppression de votre compte est définitive et irréversible.
                </p>

                {!showDeleteConfirm ? (
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="mt-4 rounded-full border border-rose-600 px-6 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100"
                    >
                        Supprimer mon compte
                    </button>
                ) : (
                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="rounded-full bg-rose-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                        >
                            Confirmer la suppression
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                        >
                            Annuler
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
