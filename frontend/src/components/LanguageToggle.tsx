import { useI18n } from "../context/I18nContext";

const toggleBase = "rounded-full border px-3 py-1 text-xs font-semibold";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1">
      <button
        className={`${toggleBase} ${lang === "fr" ? "bg-brand-900 text-white" : "text-slate-500"}`}
        onClick={() => setLang("fr")}
        aria-pressed={lang === "fr"}
        type="button"
      >
        FR
      </button>
      <button
        className={`${toggleBase} ${lang === "en" ? "bg-brand-900 text-white" : "text-slate-500"}`}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        type="button"
      >
        EN
      </button>
    </div>
  );
}
