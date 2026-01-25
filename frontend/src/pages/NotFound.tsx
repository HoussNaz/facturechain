import { Link } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function NotFound() {
    const { t } = useI18n();

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
            <div className="relative">
                {/* Large 404 Background */}
                <span className="absolute -top-20 left-1/2 -translate-x-1/2 text-[200px] font-bold text-slate-100 select-none">
                    404
                </span>

                {/* Content */}
                <div className="relative z-10 text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg">
                        <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-brand-900">Page introuvable</h1>
                    <p className="mt-4 max-w-md text-slate-600">
                        La page que vous recherchez n'existe pas ou a été déplacée.
                        Vérifiez l'URL ou retournez à l'accueil.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            to="/"
                            className="rounded-full bg-brand-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800"
                        >
                            Retour à l'accueil
                        </Link>
                        <Link
                            to="/dashboard"
                            className="rounded-full border border-brand-900 px-6 py-3 text-sm font-medium text-brand-900 transition-colors hover:bg-brand-50"
                        >
                            Tableau de bord
                        </Link>
                        <Link
                            to="/verify"
                            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                        >
                            Vérifier une facture
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
