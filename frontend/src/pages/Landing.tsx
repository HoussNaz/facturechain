import { Link } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function Landing() {
  const { t } = useI18n();

  return (
    <div className="px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-900 shadow-sm">
              {t("heroBadge")}
            </div>
            <h1 className="mt-6 text-4xl font-semibold text-brand-900 md:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 text-lg text-slate-700">{t("heroSubtitle")}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link className="rounded-full bg-brand-900 px-6 py-3 text-white" to="/register">
                {t("heroCtaPrimary")}
              </Link>
              <Link className="rounded-full border border-brand-900 px-6 py-3 text-brand-900" to="/verify">
                {t("heroCtaSecondary")}
              </Link>
            </div>
            <div className="mt-8 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
                <p className="text-lg font-semibold text-brand-900">48h</p>
                <p>Temps moyen de certification.</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
                <p className="text-lg font-semibold text-brand-900">0.01 EUR</p>
                <p>Frais moyen Polygon.</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
                <p className="text-lg font-semibold text-brand-900">100%</p>
                <p>Historique immuable.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-white/80 p-8 shadow-xl fade-up" style={{ animationDelay: "80ms" }}>
              <h2 className="text-lg font-semibold text-brand-900">{t("sectionWhyTitle")}</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>{t("sectionWhyItem1")}</li>
                <li>{t("sectionWhyItem2")}</li>
                <li>{t("sectionWhyItem3")}</li>
                <li>{t("sectionWhyItem4")}</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-brand-900 p-8 text-white shadow-xl fade-up" style={{ animationDelay: "140ms" }}>
              <h3 className="text-lg font-semibold">Verification publique</h3>
              <p className="mt-2 text-sm text-brand-100">
                Partagez un lien unique ou scannez le QR code. Chaque verif est journalisee.
              </p>
              <Link className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm" to="/verify">
                Ouvrir la page publique
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
