import React, { createContext, useContext, useMemo, useState } from "react";

type Lang = "fr" | "en";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof translations["fr"]) => string;
};

const translations = {
  fr: {
    appName: "FactureChain",
    navDashboard: "Tableau",
    navNewInvoice: "Nouvelle facture",
    navVerify: "Vérifier",
    navLogin: "Connexion",
    navRegister: "Démarrer",
    navProfile: "Profil",
    heroBadge: "Certification blockchain",
    heroTitle: "Prouvez l'authenticité de vos factures en quelques minutes.",
    heroSubtitle: "PDF, cryptographie, Polygon. Un horodatage immuable pour la confiance B2B.",
    heroCtaPrimary: "Créer un compte",
    heroCtaSecondary: "Vérifier une facture",
    sectionWhyTitle: "Pourquoi FactureChain",
    sectionWhyItem1: "Horodatage blockchain certifié",
    sectionWhyItem2: "PDF sécurisé avec QR code",
    sectionWhyItem3: "Vérification publique instantanée",
    sectionWhyItem4: "Confiance B2B et antifraude",
    loginTitle: "Connexion",
    registerTitle: "Créer un compte",
    dashboardTitle: "Tableau de bord",
    invoiceFormTitle: "Nouvelle facture",
    verifyTitle: "Vérification publique",
    verifyHashTab: "Par hash",
    verifyPdfTab: "Par PDF",
    verifyHashCta: "Vérifier",
    verifyPdfCta: "Analyser le PDF",
    statusVerified: "Vérifié",
    statusPending: "Brouillon",
    statusCertified: "Certifié",
    profileTitle: "Mon profil",
    forgotPasswordTitle: "Mot de passe oublié",
    editInvoiceTitle: "Modifier la facture",
    notFoundTitle: "Page introuvable"
  },
  en: {
    appName: "FactureChain",
    navDashboard: "Dashboard",
    navNewInvoice: "New invoice",
    navVerify: "Verify",
    navLogin: "Sign in",
    navRegister: "Get started",
    navProfile: "Profile",
    heroBadge: "Blockchain certification",
    heroTitle: "Prove invoice authenticity in minutes.",
    heroSubtitle: "PDF, cryptography, Polygon. Immutable timestamps for B2B trust.",
    heroCtaPrimary: "Create account",
    heroCtaSecondary: "Verify invoice",
    sectionWhyTitle: "Why FactureChain",
    sectionWhyItem1: "Blockchain timestamp proof",
    sectionWhyItem2: "Secure PDF with QR code",
    sectionWhyItem3: "Instant public verification",
    sectionWhyItem4: "B2B trust and antifraud",
    loginTitle: "Sign in",
    registerTitle: "Create account",
    dashboardTitle: "Dashboard",
    invoiceFormTitle: "New invoice",
    verifyTitle: "Public verification",
    verifyHashTab: "By hash",
    verifyPdfTab: "By PDF",
    verifyHashCta: "Verify",
    verifyPdfCta: "Scan PDF",
    statusVerified: "Verified",
    statusPending: "Draft",
    statusCertified: "Certified",
    profileTitle: "My profile",
    forgotPasswordTitle: "Forgot password",
    editInvoiceTitle: "Edit invoice",
    notFoundTitle: "Page not found"
  }
} as const;

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  const value = useMemo<I18nContextValue>(() => {
    return {
      lang,
      setLang,
      t: (key) => translations[lang][key]
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
