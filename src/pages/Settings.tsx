import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Bell,
  Shield,
  Database,
  Key,
  GitMerge,
  UserSquare,
  Camera,
  Mail,
  Globe,
  Eye,
  Share2,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  Upload,
  Smartphone,
  Monitor,
  Info,
  Lock,
  KeyRound,
  ShieldAlert,
  Laptop,
  Copy,
  Download,
  Trash2,
  Languages,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Activity,
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/LanguageContext";
import { db, auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ApiSettings } from "../components/settings/ApiSettings";
import { IntegrationsSettings } from "../components/settings/IntegrationsSettings";

export function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("app-settings");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Custom interactive preview states for Logo, Favicon, & SEO
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [seoTab, setSeoTab] = useState<"serp" | "social">("serp");

  const [preferencesData, setPreferencesData] = useState({
    emailNotif: true,
    darkTheme: false,
    autoSave: true,
    defaultAiProvider: "Gemini",
    generationDepth: "standard",
    themeColor: "indigo",
    language: "id",
    fontSize: "base",
  });

  // Security Interactive States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem("security_2fa_enabled") === "true";
  });
  const [twoFactorStep, setTwoFactorStep] = useState<"idle" | "verify" | "active">(() => {
    return localStorage.getItem("security_2fa_enabled") === "true" ? "active" : "idle";
  });
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [backupCodes] = useState([
    "AB8R-FD92-8812", "C99A-BD82-1142", "72DA-893C-3381", "12AC-28DE-99AC",
    "DE99-CC81-1250", "883B-772D-EF71", "1122-8899-AABB", "FFAA-7733-8822",
    "9922-CC77-11AA", "8823-3344-55D2"
  ]);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Password reset state
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [passwordResetSuccess, setPasswordResetSuccess] = useState("");
  const [passwordResetError, setPasswordResetError] = useState("");

  // Keep email sync'ed
  useEffect(() => {
    if (user?.email) {
      setPasswordResetEmail(user.email);
    }
  }, [user]);

  // Simulated session list
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "Windows 11 PC", browser: "Google Chrome", location: "Jakarta, Indonesia (ID)", ip: "182.253.141.52", isCurrent: true, date: "Aktif Sekarang" },
    { id: 2, device: "iPhone 15 Pro", browser: "Safari Mobile", location: "Bandung, Indonesia (ID)", ip: "36.72.190.221", isCurrent: false, date: "Terakhir aktif: 2 jam yang lalu" },
    { id: 3, device: "MacBook Pro M3", browser: "Arc Browser", location: "Surabaya, Indonesia (ID)", ip: "114.79.12.83", isCurrent: false, date: "Terakhir aktif: 3 hari yang lalu" }
  ]);

  // Modal confirm clear drafts
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [appSettingsData, setAppSettingsData] = useState({
    appName: settings.appName,
    logoUrl: settings.logoUrl || "",
    faviconUrl: settings.faviconUrl || "",
    metaTitle: settings.metaTitle || "",
    metaDescription: settings.metaDescription || "",
    metaKeywords: settings.metaKeywords || "",
    metaAuthor: settings.metaAuthor || "",
    metaRobots: settings.metaRobots || "index, follow",
    ogTitle: settings.ogTitle || "",
    ogDescription: settings.ogDescription || "",
    ogImageUrl: settings.ogImageUrl || "",
  });

  // Keep state in sync if settings context values change
  useEffect(() => {
    setAppSettingsData({
      appName: settings.appName,
      logoUrl: settings.logoUrl || "",
      faviconUrl: settings.faviconUrl || "",
      metaTitle: settings.metaTitle || "",
      metaDescription: settings.metaDescription || "",
      metaKeywords: settings.metaKeywords || "",
      metaAuthor: settings.metaAuthor || "",
      metaRobots: settings.metaRobots || "index, follow",
      ogTitle: settings.ogTitle || "",
      ogDescription: settings.ogDescription || "",
      ogImageUrl: settings.ogImageUrl || "",
    });
  }, [settings]);

  useEffect(() => {
    // Load local settings if any
    const savedPrefs = localStorage.getItem("app_prefs");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferencesData(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (err) {
        console.error("Failed to parse local preferences:", err);
      }
    }
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");

    try {
      localStorage.setItem("app_prefs", JSON.stringify(preferencesData));

      await new Promise((resolve) => setTimeout(resolve, 800));

      await addDoc(collection(db, "logs"), {
        action: "Updated preferences",
        details: "User updated application preferences.",
        createdAt: serverTimestamp(),
      });

      setSuccessMsg("Preferensi berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan preferensi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");

    try {
      updateSettings(appSettingsData);

      await new Promise((resolve) => setTimeout(resolve, 800));

      await addDoc(collection(db, "logs"), {
        action: "Updated App Settings",
        details: "User updated white-labeling configurations.",
        createdAt: serverTimestamp(),
      });

      setSuccessMsg("Pengaturan Aplikasi berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan Pengaturan Aplikasi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError("");

    if (twoFactorCode.trim().length !== 6) {
      setTwoFactorError("Kode OTP harus berupa 6 digit angka.");
      return;
    }

    setTwoFactorEnabled(true);
    setTwoFactorStep("active");
    localStorage.setItem("security_2fa_enabled", "true");
    
    addDoc(collection(db, "logs"), {
      action: "Enabled 2FA",
      details: "User successfully configured and activated Two-Factor Authentication.",
      createdAt: serverTimestamp(),
    }).catch(console.error);
  };

  const handleDisable2FA = () => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan Autentikasi Dua Faktor? Keamanan akun Anda akan berkurang.")) {
      setTwoFactorEnabled(false);
      setTwoFactorStep("idle");
      setTwoFactorCode("");
      localStorage.removeItem("security_2fa_enabled");
      
      addDoc(collection(db, "logs"), {
        action: "Disabled 2FA",
        details: "User deactivated Two-Factor Authentication.",
        createdAt: serverTimestamp(),
      }).catch(console.error);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordResetSuccess("");
    setPasswordResetError("");

    if (!passwordResetEmail) {
      setPasswordResetError("Mohon masukkan alamat email Anda.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, passwordResetEmail);
      setPasswordResetSuccess(`Tautan reset sandi berhasil dikirim ke ${passwordResetEmail}! Mohon periksa folder masuk atau spam email Anda.`);
      
      await addDoc(collection(db, "logs"), {
        action: "Requested Password Reset",
        details: `User requested password reset link for ${passwordResetEmail}`,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error(err);
      setPasswordResetError(err.message || "Gagal mengirim link reset password. Pastikan format email sudah benar.");
    }
  };

  const handleRevokeSession = (id: number) => {
    setActiveSessions(activeSessions.filter(s => s.id !== id));
    setSuccessMsg("Sesi perangkat eksternal berhasil dikeluarkan!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleRevokeAllOtherSessions = () => {
    setActiveSessions(activeSessions.filter(s => s.isCurrent));
    setSuccessMsg("Seluruh sesi perangkat lain berhasil dikeluarkan secara aman.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleResetAllData = () => {
    try {
      localStorage.removeItem("app_prefs");
      localStorage.removeItem("security_2fa_enabled");
      setPreferencesData({
        emailNotif: true,
        darkTheme: false,
        autoSave: true,
        defaultAiProvider: "Gemini",
        generationDepth: "standard",
        themeColor: "indigo",
        language: "id",
        fontSize: "base",
      });
      setTwoFactorEnabled(false);
      setTwoFactorStep("idle");
      setTwoFactorCode("");
      
      alert("Seluruh draf data lokal dan preferensi berhasil di-reset ke pengaturan awal!");
      setShowClearConfirm(false);
    } catch (e) {
      alert("Gagal mereset data lokal");
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {t("settings.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("settings.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-4 md:pb-0">
            <button
              onClick={() => setActiveTab("app-settings")}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors shrink-0 ${activeTab === "app-settings" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <SettingsIcon
                className={`h-5 w-5 mr-3 hidden sm:block ${activeTab === "app-settings" ? "text-indigo-600" : "text-gray-400"}`}
              />
              {t("settings.tabs.app")}
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors shrink-0 ${activeTab === "preferences" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <SettingsIcon
                className={`h-5 w-5 mr-3 hidden sm:block ${activeTab === "preferences" ? "text-indigo-600" : "text-gray-400"}`}
              />
              {t("settings.tabs.preferences")}
            </button>
            <button
              onClick={() => setActiveTab("api-keys")}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors shrink-0 ${activeTab === "api-keys" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Key
                className={`h-5 w-5 mr-3 hidden sm:block ${activeTab === "api-keys" ? "text-indigo-600" : "text-gray-400"}`}
              />
              {t("settings.tabs.apiKeys")}
            </button>
            <button
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors shrink-0 ${activeTab === "integrations" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <GitMerge
                className={`h-5 w-5 mr-3 hidden sm:block ${activeTab === "integrations" ? "text-indigo-600" : "text-gray-400"}`}
              />
              {t("settings.tabs.integrations")}
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors shrink-0 ${activeTab === "security" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Shield
                className={`h-5 w-5 mr-3 hidden sm:block ${activeTab === "security" ? "text-indigo-600" : "text-gray-400"}`}
              />
              {t("settings.tabs.security")}
            </button>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium">
                {successMsg}
              </div>
            )}

            {activeTab === "app-settings" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <Globe className="h-5.5 w-5.5 text-indigo-600" />
                    {t("settings.headerWhiteLabel")}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("settings.headerWhiteLabelDesc")}
                  </p>
                </div>

                <form onSubmit={handleSaveAppSettings} className="space-y-8">
                  {/* BRAND PRESETS PANEL */}
                  <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/30 border border-indigo-100/80 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm mb-3">
                      <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                      <span>{t("settings.presetTitle")}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                      {t("settings.presetDesc")}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          name: "Blue Tech Spark",
                          primary: "#4f46e5",
                          logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>')}`,
                          faviconUrl: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>')}`,
                        },
                        {
                          name: "Emerald Growth",
                          primary: "#059669",
                          logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/><path d="M12 18V12"/><path d="M12 12L15 9"/><path d="M12 12L9 9"/></svg>')}`,
                          faviconUrl: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16V12"/><path d="M12 12L14 10"/><path d="M12 12L10 10"/></svg>')}`,
                        },
                        {
                          name: "Amber Creative",
                          primary: "#d97706",
                          logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>')}`,
                          faviconUrl: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/></svg>')}`,
                        },
                        {
                          name: "Rose Modern",
                          primary: "#e11d48",
                          logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.886H3.88l5.056 3.674L7.022 18.45 12 14.773l4.978 3.674-1.914-5.89 5.056-3.674h-6.208L12 3z"/></svg>')}`,
                          faviconUrl: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>')}`,
                        }
                      ].map((preset, idx) => {
                        const isSelected = appSettingsData.logoUrl === preset.logoUrl && appSettingsData.faviconUrl === preset.faviconUrl;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setAppSettingsData({
                                ...appSettingsData,
                                logoUrl: preset.logoUrl,
                                faviconUrl: preset.faviconUrl,
                              });
                            }}
                            className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all cursor-pointer bg-white shadow-2xs ${isSelected ? "border-indigo-600 ring-2 ring-indigo-100" : "border-gray-200 hover:border-indigo-200"}`}
                          >
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100 mb-2"
                              dangerouslySetInnerHTML={{ __html: decodeURIComponent(preset.logoUrl.replace("data:image/svg+xml;utf8,", "")) }}
                            />
                            <span className="text-[11px] font-bold text-gray-800 truncate w-full">{preset.name}</span>
                            <span className="text-[9px] text-gray-400 mt-0.5">Preset {idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: EDITOR FORM */}
                    <div className="space-y-6">
                      {/* Application General Name */}
                      <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-3xs space-y-4">
                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                          <SettingsIcon className="h-4.5 w-4.5 text-gray-400" />
                          <span>{t("settings.baseIdentity")}</span>
                        </div>
                        <div>
                          <label htmlFor="appName" className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                            {t("settings.appNameLabel")}
                          </label>
                          <input
                            type="text"
                            name="appName"
                            id="appName"
                            value={appSettingsData.appName}
                            onChange={(e) =>
                              setAppSettingsData({
                                ...appSettingsData,
                                appName: e.target.value,
                              })
                            }
                            className="block w-full rounded-xl border border-gray-200 py-2.5 px-3.5 text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition"
                            placeholder="e.g. PRD Architect Generator"
                          />
                          <p className="mt-1.5 text-[11px] text-gray-500">
                            {t("settings.appNameDesc")}
                          </p>
                        </div>
                      </div>

                      {/* Brand Logo Upload & Customizer */}
                      <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-3xs space-y-4">
                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                          <Camera className="h-4.5 w-4.5 text-gray-400" />
                          <span>{t("settings.baseIdentity")}</span>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                            {t("settings.logoHeaderSidebar")}
                          </label>

                          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                            {appSettingsData.logoUrl ? (
                              <div className="h-20 w-20 rounded-xl bg-white border border-gray-200 shadow-2xs overflow-hidden flex items-center justify-center p-2.5">
                                {appSettingsData.logoUrl.startsWith("data:image/svg+xml") ? (
                                  <div 
                                    className="w-full h-full"
                                    dangerouslySetInnerHTML={{ __html: decodeURIComponent(appSettingsData.logoUrl.replace("data:image/svg+xml;utf8,", "")) }}
                                  />
                                ) : (
                                  <img
                                    src={appSettingsData.logoUrl}
                                    alt="Logo preview"
                                    className="h-full w-full object-contain"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="h-20 w-20 rounded-xl border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400">
                                <Upload className="h-6 w-6 text-gray-300 mb-1" />
                                <span className="text-[9px] font-bold">Default</span>
                              </div>
                            )}

                            <div className="flex-1 space-y-2 text-center sm:text-left">
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <label className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                                  <Upload className="h-3.5 w-3.5" />
                                  <span>{t("settings.logoUploadBtn")}</span>
                                  <input
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setAppSettingsData({
                                            ...appSettingsData,
                                            logoUrl: reader.result as string,
                                          });
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                                {appSettingsData.logoUrl && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAppSettingsData({
                                        ...appSettingsData,
                                        logoUrl: "",
                                      })
                                    }
                                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition"
                                  >
                                    {t("settings.logoRemoveBtn")}
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 leading-normal">
                                {t("settings.logoHint")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Favicon Upload & Web Browser simulation preview */}
                      <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-3xs space-y-4">
                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                          <Globe className="h-4.5 w-4.5 text-gray-400" />
                          <span>{t("settings.faviconTabLabel")}</span>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                            {t("settings.faviconTabLabel")}
                          </label>

                          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                            {appSettingsData.faviconUrl ? (
                              <div className="h-14 w-14 rounded-lg bg-white border border-gray-200 shadow-2xs overflow-hidden flex items-center justify-center p-2">
                                {appSettingsData.faviconUrl.startsWith("data:image/svg+xml") ? (
                                  <div 
                                    className="w-full h-full"
                                    dangerouslySetInnerHTML={{ __html: decodeURIComponent(appSettingsData.faviconUrl.replace("data:image/svg+xml;utf8,", "")) }}
                                  />
                                ) : (
                                  <img
                                    src={appSettingsData.faviconUrl}
                                    alt="Favicon preview"
                                    className="h-full w-full object-contain"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="h-14 w-14 rounded-lg border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400">
                                <Globe className="h-5 w-5 text-gray-300" />
                                <span className="text-[8px] font-bold mt-0.5">Vite</span>
                              </div>
                            )}

                            <div className="flex-1 space-y-2 text-center sm:text-left">
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <label className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                                  <Upload className="h-3.5 w-3.5" />
                                  <span>{t("settings.faviconUploadBtn")}</span>
                                  <input
                                    type="file"
                                    className="sr-only"
                                    accept="image/x-icon,image/png,image/svg+xml"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setAppSettingsData({
                                            ...appSettingsData,
                                            faviconUrl: reader.result as string,
                                          });
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                                {appSettingsData.faviconUrl && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAppSettingsData({
                                        ...appSettingsData,
                                        faviconUrl: "",
                                      })
                                    }
                                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition"
                                  >
                                    {t("settings.faviconRemoveBtn")}
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 leading-normal">
                                {t("settings.faviconHint")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SEO AND METADATA SUITE */}
                      <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-3xs space-y-5">
                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                          <Globe className="h-4.5 w-4.5 text-indigo-600" />
                          <span>{t("settings.seoSectionTitle")}</span>
                        </div>

                        {/* Meta Title */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label htmlFor="metaTitle" className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                              {t("settings.metaTitleLabel")}
                            </label>
                            <span className={`text-[11px] font-bold ${appSettingsData.metaTitle.length <= 60 ? "text-emerald-600" : "text-amber-500"}`}>
                              {appSettingsData.metaTitle.length}/60 Karakter
                            </span>
                          </div>
                          <input
                            type="text"
                            id="metaTitle"
                            value={appSettingsData.metaTitle}
                            onChange={(e) => setAppSettingsData({ ...appSettingsData, metaTitle: e.target.value })}
                            className="block w-full rounded-xl border border-gray-200 py-2.5 px-3.5 text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition"
                            placeholder="e.g. PRD Architect - AI-Powered PRD & Design System Blueprint Generator"
                          />
                          <p className="text-[11px] text-gray-500 leading-normal">
                            {t("settings.metaTitleHint")}
                          </p>
                        </div>

                        {/* Meta Description */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label htmlFor="metaDescription" className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                              {t("settings.metaDescLabel")}
                            </label>
                            <span className={`text-[11px] font-bold ${appSettingsData.metaDescription.length <= 160 ? "text-emerald-600" : "text-amber-500"}`}>
                              {appSettingsData.metaDescription.length}/160 Karakter
                            </span>
                          </div>
                          <textarea
                            id="metaDescription"
                            rows={3}
                            value={appSettingsData.metaDescription}
                            onChange={(e) => setAppSettingsData({ ...appSettingsData, metaDescription: e.target.value })}
                            className="block w-full rounded-xl border border-gray-200 py-2.5 px-3.5 text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition resize-none"
                            placeholder="Sebutkan deskripsi singkat mengenai kegunaan aplikasi..."
                          />
                          <p className="text-[11px] text-gray-500 leading-normal">
                            {t("settings.metaDescHint")}
                          </p>
                        </div>

                        {/* Meta Keywords */}
                        <div className="space-y-1.5">
                          <label htmlFor="metaKeywords" className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                            {t("settings.metaKeywordsLabel")}
                          </label>
                          <input
                            type="text"
                            id="metaKeywords"
                            value={appSettingsData.metaKeywords}
                            onChange={(e) => setAppSettingsData({ ...appSettingsData, metaKeywords: e.target.value })}
                            className="block w-full rounded-xl border border-gray-200 py-2.5 px-3.5 text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition"
                            placeholder="e.g. PRD Generator, AI Product, Design Blueprint, Agile Tool"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Meta Author */}
                          <div className="space-y-1.5">
                            <label htmlFor="metaAuthor" className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                              {t("settings.metaAuthorLabel")}
                            </label>
                            <input
                              type="text"
                              id="metaAuthor"
                              value={appSettingsData.metaAuthor}
                              onChange={(e) => setAppSettingsData({ ...appSettingsData, metaAuthor: e.target.value })}
                              className="block w-full rounded-xl border border-gray-200 py-2.5 px-3.5 text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition"
                              placeholder="e.g. PRD Architect Team"
                            />
                          </div>

                          {/* Robots meta tag index */}
                          <div className="space-y-1.5">
                            <label htmlFor="metaRobots" className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                              {t("settings.metaRobotsLabel")}
                            </label>
                            <select
                              id="metaRobots"
                              value={appSettingsData.metaRobots}
                              onChange={(e) => setAppSettingsData({ ...appSettingsData, metaRobots: e.target.value })}
                              className="block w-full rounded-xl border border-gray-200 py-2.5 px-3.5 text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition bg-white"
                            >
                              <option value="index, follow">Index, Follow</option>
                              <option value="noindex, follow">Noindex, Follow</option>
                              <option value="index, nofollow">Index, Nofollow</option>
                              <option value="noindex, nofollow">Noindex, Nofollow</option>
                            </select>
                          </div>
                        </div>

                        {/* Open Graph Social Sharing Section */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                          <span className="block text-xs font-extrabold uppercase text-slate-700 tracking-wide">
                            {t("settings.socialSectionTitle")}
                          </span>
                          
                          <div className="space-y-3">
                            <div>
                              <label htmlFor="ogTitle" className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                {t("settings.socialTitleLabel")}
                              </label>
                              <input
                                type="text"
                                id="ogTitle"
                                value={appSettingsData.ogTitle}
                                onChange={(e) => setAppSettingsData({ ...appSettingsData, ogTitle: e.target.value })}
                                className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition bg-white"
                              />
                            </div>

                            <div>
                              <label htmlFor="ogDescription" className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                {t("settings.socialDescLabel")}
                              </label>
                              <input
                                type="text"
                                id="ogDescription"
                                value={appSettingsData.ogDescription}
                                onChange={(e) => setAppSettingsData({ ...appSettingsData, ogDescription: e.target.value })}
                                className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition bg-white"
                              />
                            </div>

                            <div>
                              <label htmlFor="ogImageUrl" className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                {t("settings.socialImageLabel")}
                              </label>
                              <input
                                type="text"
                                id="ogImageUrl"
                                value={appSettingsData.ogImageUrl}
                                onChange={(e) => setAppSettingsData({ ...appSettingsData, ogImageUrl: e.target.value })}
                                className="block w-full rounded-lg border border-gray-200 py-2 px-3 text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition bg-white"
                                placeholder="e.g. https://domain.com/og-image.jpg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: REALTIME INTERACTIVE PREVIEW PANEL */}
                    <div className="space-y-6">
                      {/* BRAND IDENTITY PREVIEW MOCKUP */}
                      <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-3xs space-y-4 sticky top-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                          <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                            <Eye className="h-4.5 w-4.5 text-indigo-500" />
                            <span>Live Branding Simulator Preview</span>
                          </span>
                          
                          {/* Device Switcher */}
                          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                            <button
                              type="button"
                              onClick={() => setPreviewDevice("desktop")}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${previewDevice === "desktop" ? "bg-white text-indigo-600 shadow-2xs" : "text-gray-400 hover:text-gray-700"}`}
                              title="Tampilan Desktop"
                            >
                              <Monitor className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewDevice("mobile")}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${previewDevice === "mobile" ? "bg-white text-indigo-600 shadow-2xs" : "text-gray-400 hover:text-gray-700"}`}
                              title="Tampilan Mobile"
                            >
                              <Smartphone className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* DESKTOP VIEW SIMULATOR */}
                        {previewDevice === "desktop" ? (
                          <div className="space-y-4">
                            {/* Browser Tab Preview Card */}
                            <div className="bg-gray-100/80 border border-gray-200/60 rounded-xl overflow-hidden shadow-2xs">
                              {/* Browser chrome header bar */}
                              <div className="bg-gray-200/80 px-3 py-2 border-b border-gray-300/50 flex items-center gap-2">
                                <div className="flex gap-1">
                                  <span className="h-2 w-2 rounded-full bg-red-400" />
                                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                                  <span className="h-2 w-2 rounded-full bg-green-400" />
                                </div>
                                {/* Chromes tab preview */}
                                <div className="ml-3 bg-white px-3 py-1.5 rounded-t-lg border-t border-x border-gray-300/30 text-[10px] font-bold text-gray-700 flex items-center gap-1.5 max-w-[150px] shadow-3xs relative -mb-[9px] z-10">
                                  {appSettingsData.faviconUrl ? (
                                    appSettingsData.faviconUrl.startsWith("data:image/svg+xml") ? (
                                      <div 
                                        className="h-3 w-3 shrink-0"
                                        dangerouslySetInnerHTML={{ __html: decodeURIComponent(appSettingsData.faviconUrl.replace("data:image/svg+xml;utf8,", "")) }}
                                      />
                                    ) : (
                                      <img src={appSettingsData.faviconUrl} alt="Fav" className="h-3 w-3 object-contain shrink-0" />
                                    )
                                  ) : (
                                    <Globe className="h-3 w-3 text-indigo-500 shrink-0" />
                                  )}
                                  <span className="truncate">{appSettingsData.appName || "PRD Architect"}</span>
                                  <span className="text-[8px] text-gray-400 hover:text-gray-600 cursor-pointer ml-1">×</span>
                                </div>
                                <div className="flex-1 bg-white/60 rounded-md h-5 ml-2 border border-gray-300/40 text-[9px] text-gray-400 flex items-center px-2">
                                  https://yourdomain.com/dashboard
                                </div>
                              </div>
                              <div className="bg-white p-4 h-24 flex items-center justify-center text-center">
                                <span className="text-xs font-medium text-gray-400 italic">Simulasi Tab Browser Desktop</span>
                              </div>
                            </div>

                            {/* Desktop Sidebar Preview Card */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                              <div className="bg-slate-50 border-b border-slate-200 text-slate-800 p-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {appSettingsData.logoUrl ? (
                                    appSettingsData.logoUrl.startsWith("data:image/svg+xml") ? (
                                      <div 
                                        className="h-6 w-6 shrink-0 bg-white border border-slate-200 rounded p-0.5"
                                        dangerouslySetInnerHTML={{ __html: decodeURIComponent(appSettingsData.logoUrl.replace("data:image/svg+xml;utf8,", "")) }}
                                      />
                                    ) : (
                                      <img src={appSettingsData.logoUrl} alt="Logo" className="h-6 w-6 object-contain rounded bg-white border border-slate-200" />
                                    )
                                  ) : (
                                    <Database className="h-5 w-5 text-indigo-600 shrink-0" />
                                  )}
                                  <span className="text-xs font-extrabold text-slate-800 truncate max-w-[120px]">
                                    {appSettingsData.appName || "PRD Architect"}
                                  </span>
                                </div>
                                <span className="text-[8px] uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded-full font-extrabold">Sidebar</span>
                              </div>
                              <div className="bg-white p-4 flex gap-4 text-xs text-gray-400">
                                <div className="w-1/4 space-y-1.5 border-r border-gray-100 pr-2">
                                  <div className="h-2 bg-indigo-100 rounded w-full" />
                                  <div className="h-2 bg-gray-100 rounded w-5/6" />
                                  <div className="h-2 bg-gray-100 rounded w-2/3" />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                                  <div className="h-2 bg-gray-100 rounded w-full" />
                                  <div className="h-2 bg-gray-100 rounded w-5/6" />
                                </div>
                               </div>
                            </div>
                          </div>
                        ) : (
                          /* MOBILE VIEW SIMULATOR */
                          <div className="flex justify-center py-4 bg-gray-50 border border-gray-200/60 rounded-2xl">
                            <div className="w-64 bg-white border-4 border-slate-300 rounded-[2rem] shadow-md overflow-hidden flex flex-col min-h-[280px]">
                              {/* Smartphone Status Bar */}
                              <div className="bg-slate-100 border-b border-slate-200 text-slate-700 px-5 py-1 text-[8px] font-mono flex justify-between items-center">
                                <span>09:41</span>
                                <div className="flex items-center gap-1">
                                  <span>🔋 100%</span>
                                </div>
                              </div>
                              
                              {/* Simulated Mobile Header */}
                              <div className="h-12 border-b border-gray-100 px-4 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                  {appSettingsData.logoUrl ? (
                                    appSettingsData.logoUrl.startsWith("data:image/svg+xml") ? (
                                      <div 
                                        className="h-5 w-5 shrink-0"
                                        dangerouslySetInnerHTML={{ __html: decodeURIComponent(appSettingsData.logoUrl.replace("data:image/svg+xml;utf8,", "")) }}
                                      />
                                    ) : (
                                      <img src={appSettingsData.logoUrl} alt="Logo" className="h-5 w-5 object-contain" />
                                    )
                                  ) : (
                                    <Database className="h-4 w-4 text-indigo-500 shrink-0" />
                                  )}
                                  <span className="text-[10px] font-black text-gray-800 truncate max-w-[100px]">
                                    {appSettingsData.appName || "PRD Architect"}
                                  </span>
                                </div>
                                <div className="h-4 w-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px]">☰</div>
                              </div>

                              {/* Mobile Body Content */}
                              <div className="p-3 flex-1 bg-gray-50 flex flex-col justify-center items-center text-center space-y-2">
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Mobile UI</span>
                                <p className="text-[9px] text-gray-400 font-medium leading-relaxed">Logo dan Favicon secara otomatis menyesuaikan aspek rasio layar mobile.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* INTERACTIVE SEO PREVIEW CENTER WITH MOCK SERP & SOCIAL CHIPS */}
                        <div className="border-t border-gray-100 pt-5 space-y-4">
                          <div className="flex border-b border-gray-100 p-0.5 gap-2">
                            <button
                              type="button"
                              onClick={() => setSeoTab("serp")}
                              className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${seoTab === "serp" ? "bg-indigo-50 text-indigo-700" : "text-gray-400 hover:text-gray-700"}`}
                            >
                              Google SERP Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => setSeoTab("social")}
                              className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${seoTab === "social" ? "bg-indigo-50 text-indigo-700" : "text-gray-400 hover:text-gray-700"}`}
                            >
                              Sosial Media Preview
                            </button>
                          </div>

                          {/* SEO GOOGLE SERP SIMULATION */}
                          {seoTab === "serp" ? (
                            <div className="p-4 border border-gray-200 bg-white rounded-xl shadow-2xs space-y-2 text-left">
                              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                <Globe className="h-3 w-3 text-emerald-600" />
                                <span>https://yourdomain.com</span>
                                <span className="text-gray-300">›</span>
                                <span className="text-[10px] text-gray-400">home</span>
                              </div>
                              <h3 className="text-sm font-semibold text-blue-800 hover:underline leading-snug cursor-pointer">
                                {appSettingsData.metaTitle || appSettingsData.appName || "PRD Architect - AI-Powered PRD & Design System Blueprint Generator"}
                              </h3>
                              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                {appSettingsData.metaDescription || "Silahkan tulis meta description untuk memicu preview deskripsi cuplikan Google Search di sini secara dinamis."}
                              </p>
                              <div className="flex gap-1.5 items-center text-[10px] text-indigo-600 font-bold bg-indigo-50/50 px-2.5 py-1 rounded-lg w-fit">
                                <Check className="h-3.5 w-3.5 text-indigo-600" />
                                <span>Sesuai Kriteria Perayapan Google</span>
                              </div>
                            </div>
                          ) : (
                            /* SOCIAL MEDIA CARD SIMULATION */
                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs text-left">
                              {appSettingsData.ogImageUrl ? (
                                <img src={appSettingsData.ogImageUrl} alt="OG" className="w-full h-32 object-cover border-b border-gray-100" />
                              ) : (
                                <div className="h-32 bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex flex-col justify-center items-center p-4 text-center border-b border-gray-100">
                                  {appSettingsData.logoUrl ? (
                                    appSettingsData.logoUrl.startsWith("data:image/svg+xml") ? (
                                      <div 
                                        className="h-10 w-10 shrink-0 bg-white shadow-xs border border-gray-200 rounded p-1"
                                        dangerouslySetInnerHTML={{ __html: decodeURIComponent(appSettingsData.logoUrl.replace("data:image/svg+xml;utf8,", "")) }}
                                      />
                                    ) : (
                                      <img src={appSettingsData.logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded bg-white shadow-xs border border-gray-200" />
                                    )
                                  ) : (
                                    <Database className="h-8 w-8 text-indigo-600 shrink-0" />
                                  )}
                                  <span className="text-xs font-black text-slate-800 mt-1.5 uppercase tracking-wide">
                                    {appSettingsData.appName || "PRD Architect"}
                                  </span>
                                </div>
                              )}
                              <div className="p-3 space-y-1">
                                <span className="text-[9px] uppercase tracking-wider text-gray-400 block">YOURDOMAIN.COM</span>
                                <span className="text-xs font-bold text-gray-800 block truncate">
                                  {appSettingsData.ogTitle || appSettingsData.metaTitle || appSettingsData.appName}
                                </span>
                                <span className="text-[11px] text-gray-500 block leading-tight truncate">
                                  {appSettingsData.ogDescription || appSettingsData.metaDescription || "Tambahkan deskripsi media sosial agar terlihat bagus di WhatsApp, Facebook, Slack."}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="flex justify-end pt-5 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition"
                    >
                      <Save className="h-4.5 w-4.5" />
                      {isSaving ? t("settings.saveAppSettingsSaving") : t("settings.saveAppSettingsBtn")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <SettingsIcon className="h-5.5 w-5.5 text-indigo-600" />
                    {t("settings.prefTitle")}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("settings.prefSubtitle")}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* FORM PREFERENCES (7/12 width) */}
                  <form onSubmit={handleSavePreferences} className="lg:col-span-7 space-y-6">
                    {/* NOTIFIKASI & SISTEM */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs space-y-4">
                      <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <Bell className="h-4 w-4 text-indigo-500" />
                        {t("settings.prefNotifTitle")}
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id="emailNotif"
                              checked={preferencesData.emailNotif}
                              onChange={(e) =>
                                setPreferencesData({
                                  ...preferencesData,
                                  emailNotif: e.target.checked,
                                })
                              }
                              className="h-4.5 w-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-0.5 cursor-pointer"
                            />
                            <label htmlFor="emailNotif" className="ml-3 block cursor-pointer">
                              <span className="text-sm font-semibold text-gray-900">{t("settings.prefEmailNotif")}</span>
                              <span className="block text-xs text-gray-500 mt-0.5">
                                {t("settings.prefEmailNotifDesc")}
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-start justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id="autoSave"
                              checked={preferencesData.autoSave}
                              onChange={(e) =>
                                setPreferencesData({
                                  ...preferencesData,
                                  autoSave: e.target.checked,
                                })
                              }
                              className="h-4.5 w-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-0.5 cursor-pointer"
                            />
                            <label htmlFor="autoSave" className="ml-3 block cursor-pointer">
                              <span className="text-sm font-semibold text-gray-900">{t("settings.prefAutoSaveTitle")}</span>
                              <span className="block text-xs text-gray-500 mt-0.5">
                                {t("settings.prefAutoSaveDesc")}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI ENGINE & DEPTH */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs space-y-4">
                      <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        {t("settings.prefAiTitle")}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="defaultAiProvider" className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                            {t("settings.prefAiProviderTitle")}
                          </label>
                          <select
                            id="defaultAiProvider"
                            value={preferencesData.defaultAiProvider}
                            onChange={(e) =>
                              setPreferencesData({
                                ...preferencesData,
                                defaultAiProvider: e.target.value,
                              })
                            }
                            className="block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                          >
                            <option value="Gemini">Gemini API (Google)</option>
                            <option value="Claude">Claude API (Anthropic)</option>
                            <option value="Chatgpt">ChatGPT API (OpenAI)</option>
                            <option value="Z.ai">Z.ai Engine (Custom)</option>
                            <option value="Xiaomi.ai">Xiaomi.ai Enterprise</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="language" className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                            {t("settings.prefDocLangLabel")}
                          </label>
                          <select
                            id="language"
                            value={preferencesData.language}
                            onChange={(e) =>
                              setPreferencesData({
                                ...preferencesData,
                                language: e.target.value,
                              })
                            }
                            className="block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                          >
                            <option value="id">Bahasa Indonesia (ID)</option>
                            <option value="en">English (US/UK)</option>
                          </select>
                        </div>
                      </div>

                      {/* GENERATION DEPTH OPTIONS */}
                      <div className="space-y-2 pt-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                          {t("settings.prefDepthTitle")}
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { id: "quick", label: t("settings.depthQuick"), desc: "1-2 hal" },
                            { id: "standard", label: t("settings.depthStandard"), desc: "3-5 hal" },
                            { id: "exhaustive", label: t("settings.depthExhaustive"), desc: "Mendalam" },
                          ].map((depth) => (
                            <button
                              key={depth.id}
                              type="button"
                              onClick={() =>
                                setPreferencesData({
                                  ...preferencesData,
                                  generationDepth: depth.id,
                                })
                              }
                              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                                preferencesData.generationDepth === depth.id
                                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-3xs"
                                  : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                              }`}
                            >
                              <span className="text-xs">{depth.label}</span>
                              <span className="text-[10px] opacity-75 font-normal mt-0.5">{depth.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* INTERFACE COLOR ACCENT & TYPOGRAPHY */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs space-y-4">
                      <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-500" />
                        {t("settings.prefStyleTitle")}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fontSize" className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                            {t("settings.prefFontSizeLabel")}
                          </label>
                          <select
                            id="fontSize"
                            value={preferencesData.fontSize}
                            onChange={(e) =>
                              setPreferencesData({
                                ...preferencesData,
                                fontSize: e.target.value,
                              })
                            }
                            className="block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                          >
                            <option value="sm">Kecil (Fine Print)</option>
                            <option value="base">Sedang (Standard)</option>
                            <option value="lg">Besar (High-Readability)</option>
                          </select>
                        </div>

                        {/* ACCENT THEME PICKER */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                            {t("settings.prefThemeColorLabel")}
                          </label>
                          <div className="flex gap-2.5 pt-1.5">
                            {[
                              { id: "indigo", bg: "bg-indigo-600", border: "ring-indigo-300" },
                              { id: "emerald", bg: "bg-emerald-600", border: "ring-emerald-300" },
                              { id: "amber", bg: "bg-amber-600", border: "ring-amber-300" },
                              { id: "rose", bg: "bg-rose-600", border: "ring-rose-300" },
                              { id: "slate", bg: "bg-slate-700", border: "ring-slate-400" },
                            ].map((theme) => (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() =>
                                  setPreferencesData({
                                    ...preferencesData,
                                    themeColor: theme.id,
                                  })
                                }
                                className={`h-7 w-7 rounded-full cursor-pointer transition ${theme.bg} ${
                                  preferencesData.themeColor === theme.id
                                    ? `ring-4 ${theme.border} scale-110 shadow-sm`
                                    : "hover:scale-105"
                                }`}
                                title={`Gaya ${theme.id}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex justify-center items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-extrabold text-white shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition cursor-pointer"
                      >
                        <Save className="h-4.5 w-4.5" />
                        {isSaving ? t("settings.savePrefsSaving") : t("settings.savePrefsBtn")}
                      </button>
                    </div>
                  </form>

                  {/* PREVIEW COL (5/12 width) */}
                  <div className="lg:col-span-5">
                    <div className="bg-gray-50 border border-gray-200/80 p-5 rounded-2xl space-y-4 sticky top-4">
                      <div className="flex items-center justify-between border-b border-gray-200/50 pb-2.5">
                        <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                          <Eye className="h-4 w-4 text-indigo-500" />
                          <span>{t("settings.docSimTitle")}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 font-bold">
                          {t("settings.docSimDynamic")}
                        </span>
                      </div>

                      {/* SIMULATED DOCUMENT */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-3xs space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase">
                            {t("settings.simAiLabel")}: {preferencesData.defaultAiProvider}
                          </span>
                          <span className="text-[9px] text-gray-400 font-medium">
                            {t("settings.simDepthLabel")}: {preferencesData.generationDepth.toUpperCase()}
                          </span>
                        </div>

                        {/* Title of doc */}
                        <div className="space-y-1">
                          <h4 className={`font-black tracking-tight leading-snug text-gray-900 ${
                            preferencesData.fontSize === "sm" ? "text-xs" : preferencesData.fontSize === "lg" ? "text-base" : "text-sm"
                          }`}>
                            {t("settings.simPrdTitle")}
                          </h4>
                          <p className="text-[10px] text-gray-400">{t("settings.simLastEdited")}</p>
                        </div>

                        {/* Theme Banner Accent */}
                        <div className={`p-2.5 rounded-lg border text-left space-y-1 ${
                          preferencesData.themeColor === "indigo" ? "bg-indigo-50/50 border-indigo-100 text-indigo-900" :
                          preferencesData.themeColor === "emerald" ? "bg-emerald-50/50 border-emerald-100 text-emerald-900" :
                          preferencesData.themeColor === "amber" ? "bg-amber-50/50 border-amber-100 text-amber-900" :
                          preferencesData.themeColor === "rose" ? "bg-rose-50/50 border-rose-100 text-rose-900" :
                          "bg-slate-50 border-slate-200 text-slate-900"
                        }`}>
                          <div className="text-[10px] font-extrabold uppercase tracking-wide">
                            {t("settings.simReportAccent")} {preferencesData.themeColor.toUpperCase()}
                          </div>
                          <p className="text-[9px] opacity-80">
                            {t("settings.simAccentDesc")}
                          </p>
                        </div>

                        {/* Sample Sections with selected font size */}
                        <div className={`space-y-2 text-gray-700 leading-relaxed ${
                          preferencesData.fontSize === "sm" ? "text-[10px]" : preferencesData.fontSize === "lg" ? "text-xs" : "text-[11px]"
                        }`}>
                          <div>
                            <span className={`font-bold block ${
                              preferencesData.themeColor === "indigo" ? "text-indigo-600" :
                              preferencesData.themeColor === "emerald" ? "text-emerald-600" :
                              preferencesData.themeColor === "amber" ? "text-amber-600" :
                              preferencesData.themeColor === "rose" ? "text-rose-600" :
                              "text-slate-700"
                            }`}>
                              {t("settings.simSection1Title")}
                            </span>
                            <p className="mt-0.5">
                              {t("settings.simSection1Desc")}
                            </p>
                          </div>

                          <div>
                            <span className={`font-bold block ${
                              preferencesData.themeColor === "indigo" ? "text-indigo-600" :
                              preferencesData.themeColor === "emerald" ? "text-emerald-600" :
                              preferencesData.themeColor === "amber" ? "text-amber-600" :
                              preferencesData.themeColor === "rose" ? "text-rose-600" :
                              "text-slate-700"
                            }`}>
                              {t("settings.simSection2Title")}
                            </span>
                            <ul className="list-disc pl-3 mt-0.5 space-y-0.5">
                              <li>{t("settings.simFeature1")}</li>
                              <li>{t("settings.simFeature2")}</li>
                            </ul>
                          </div>
                        </div>

                        {/* Decorative signature info */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 font-mono">
                          <span>{t("settings.simFormat")}</span>
                          <span>{t("settings.simStitch")}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-800 leading-relaxed flex items-start gap-2">
                        <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <p>
                          {t("settings.productivityTip")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "api-keys" && (
              <ApiSettings setSuccessMsg={setSuccessMsg} />
            )}

            {activeTab === "integrations" && (
              <IntegrationsSettings setSuccessMsg={setSuccessMsg} />
            )}

            {activeTab === "security" && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <Shield className="h-5.5 w-5.5 text-indigo-600" />
                    {t("settings.secTitle")}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("settings.secSubtitle")}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* LEFT SECURITY COLUMN (7/12 width) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* TWO FACTOR AUTHENTICATION CARD */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-indigo-600" />
                          <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                            {t("settings.2faTitle")}
                          </h3>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          twoFactorEnabled ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {twoFactorEnabled ? t("settings.2faStatusActive") : t("settings.2faStatusInactive")}
                        </span>
                      </div>

                      {twoFactorStep === "idle" && (
                        <div className="space-y-4">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {t("settings.2faDesc")}
                          </p>
                          <div className="flex justify-start">
                            <button
                              type="button"
                              onClick={() => setTwoFactorStep("verify")}
                              className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-xl hover:bg-indigo-100/70 transition cursor-pointer flex items-center gap-2"
                            >
                              <Shield className="h-4 w-4" />
                              {t("settings.2faSetupBtn")}
                            </button>
                          </div>
                        </div>
                      )}

                      {twoFactorStep === "verify" && (
                        <form onSubmit={handleVerify2FA} className="space-y-4 pt-2 border-t border-gray-100 animate-fadeIn">
                          <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {/* Simulated QR Code matrix */}
                            <div className="p-2 border border-gray-200 bg-white rounded-xl shadow-2xs flex-shrink-0">
                              <div className="h-28 w-28 bg-indigo-50/80 border border-indigo-100 rounded flex flex-col justify-center items-center relative overflow-hidden">
                                <div className="absolute inset-1.5 border border-dashed border-indigo-400 opacity-80 rounded flex items-center justify-center">
                                  <KeyRound className="h-10 w-10 text-indigo-600 animate-pulse" />
                                </div>
                                <div className="text-[7px] text-indigo-900 font-mono absolute bottom-2 tracking-widest font-black">MOCK QR CODE</div>
                              </div>
                            </div>

                            <div className="text-left space-y-2">
                              <p className="text-xs font-bold text-gray-800">{t("settings.2faScanPrompt")}</p>
                              <p className="text-[11px] text-gray-500 leading-relaxed">
                                {t("settings.2faManualKeyPrompt")}
                              </p>
                              <code className="block bg-gray-100 p-2 rounded-lg text-xs font-mono text-indigo-700 tracking-wider font-extrabold select-all text-center sm:text-left">
                                PRDARCHITECTSTITCH2FAKEY
                              </code>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="otpCode" className="block text-xs font-bold text-gray-600 uppercase">
                              {t("settings.2faOtpInputLabel")}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                id="otpCode"
                                maxLength={6}
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="e.g. 123456"
                                className="block w-full max-w-[150px] rounded-xl border border-gray-200 py-2.5 px-3 text-center text-sm font-mono tracking-widest text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                              />
                              <button
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                              >
                                {t("settings.2faVerifyBtn")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setTwoFactorStep("idle");
                                  setTwoFactorCode("");
                                  setTwoFactorError("");
                                }}
                                className="px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 transition cursor-pointer"
                              >
                                {t("settings.2faCancelBtn")}
                              </button>
                            </div>
                            {twoFactorError && (
                              <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {twoFactorError}
                              </p>
                            )}
                          </div>
                        </form>
                      )}

                      {twoFactorStep === "active" && (
                        <div className="space-y-4 pt-2 border-t border-gray-100 animate-fadeIn">
                          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-extrabold">{t("settings.2faActiveSuccessTitle")}</p>
                              <p className="opacity-90 mt-0.5">{t("settings.2faActiveSuccessDesc")}</p>
                            </div>
                          </div>

                          {/* BACKUP CODES ZONE */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                <KeyRound className="h-4 w-4 text-slate-500" />
                                {t("settings.backupCodesTitle")}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(backupCodes.join("\n"));
                                  setCopiedBackup(true);
                                  setTimeout(() => setCopiedBackup(false), 2000);
                                }}
                                className="text-[10px] text-indigo-600 hover:underline font-bold flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                {copiedBackup ? t("settings.copiedText") : t("settings.copyAllText")}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              {t("settings.backupCodesDesc")}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                              {backupCodes.map((code, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                  <span className="text-slate-300 font-sans">{index + 1}.</span>
                                  <span>{code}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const text = "EMERGENCY BACKUP CODES - PRD ARCHITECT\n\n" + backupCodes.join("\n");
                                  const blob = new Blob([text], { type: "text/plain" });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = "prd-architect-backup-codes.txt";
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                                className="text-[10px] bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-extrabold flex items-center gap-1 cursor-pointer shadow-3xs"
                              >
                                <Download className="h-3 w-3" />
                                {t("settings.downloadTxtBtn")}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleDisable2FA}
                              className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShieldAlert className="h-4 w-4" />
                              {t("settings.2faDisableBtn")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PASSWORD RESET ZONE */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs space-y-4">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-indigo-600" />
                        <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                          {t("settings.pwdResetTitle")}
                        </h3>
                      </div>

                      <form onSubmit={handleSendResetEmail} className="space-y-4">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {t("settings.pwdResetDesc")}
                        </p>

                        {passwordResetSuccess && (
                          <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-semibold leading-relaxed animate-fadeIn">
                            {passwordResetSuccess}
                          </div>
                        )}

                        {passwordResetError && (
                          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold leading-relaxed animate-fadeIn">
                            {passwordResetError}
                          </div>
                        )}

                        <div className="space-y-2">
                          <label htmlFor="resetEmail" className="block text-xs font-bold text-gray-600 uppercase">
                            {t("settings.userEmailLabel")}
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="email"
                              id="resetEmail"
                              required
                              value={passwordResetEmail}
                              onChange={(e) => setPasswordResetEmail(e.target.value)}
                              placeholder="e.g. name@domain.com"
                              className="block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-gray-900 shadow-3xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                            <button
                              type="submit"
                              className="sm:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-500 font-extrabold text-xs text-white px-5 py-2.5 rounded-xl transition shadow-3xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Mail className="h-4 w-4" />
                              {t("settings.sendResetLinkBtn")}
                            </button>
                          </div>
                          <span className="block text-[10px] text-gray-400 mt-1 leading-normal">
                            {t("settings.pwdResetHint")}
                          </span>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* RIGHT ACTIVE SESSIONS COLUMN (5/12 width) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* SESI AKTIF MONITOR */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                          <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                          {t("settings.activeSessionsTitle")}
                        </h3>
                        {activeSessions.length > 1 && (
                          <button
                            type="button"
                            onClick={handleRevokeAllOtherSessions}
                            className="text-[9px] text-red-600 hover:underline font-extrabold"
                          >
                            {t("settings.revokeAllOthers")}
                          </button>
                        )}
                      </div>

                      <p className="text-[10px] text-gray-500 leading-normal">
                        {t("settings.activeSessionsDesc")}
                      </p>

                      <div className="space-y-3 pt-1">
                        {activeSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-3 rounded-xl border flex items-start gap-2.5 transition ${
                              session.isCurrent ? "bg-indigo-50/20 border-indigo-100" : "bg-white border-gray-100"
                            }`}
                          >
                            {session.device.includes("iPhone") ? (
                              <Smartphone className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
                            ) : session.device.includes("Mac") ? (
                              <Laptop className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                            ) : (
                              <Monitor className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                            )}

                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-gray-800 truncate block">
                                  {session.device}
                                </span>
                                {session.isCurrent && (
                                  <span className="text-[7px] font-extrabold uppercase px-1 py-0.2 bg-indigo-100 text-indigo-800 rounded">
                                    {t("settings.currentSessionBadge")}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 block">
                                {session.browser} • {session.ip}
                              </span>
                              <span className="text-[9px] text-gray-400 block mt-0.5 leading-none">
                                {session.location} • {session.date}
                              </span>
                            </div>

                            {!session.isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleRevokeSession(session.id)}
                                className="text-[9px] text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg shrink-0 transition"
                                title="Keluarkan Perangkat"
                              >
                                {t("settings.revokeSessionBtn")}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DANGER LOCKDOWN ZONE */}
                    <div className="bg-red-50/50 border border-red-200 rounded-2xl p-5 shadow-3xs space-y-4">
                      <h3 className="text-sm font-extrabold text-red-900 uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert className="h-4.5 w-4.5 text-red-600" />
                        {t("settings.dangerZoneTitle")}
                      </h3>
                      <p className="text-[10px] text-red-800 leading-relaxed">
                        {t("settings.dangerZoneDesc")}
                      </p>

                      <div className="pt-2">
                        {!showClearConfirm ? (
                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(true)}
                            className="w-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 py-2.5 px-4 rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("settings.dangerResetBtn")}
                          </button>
                        ) : (
                          <div className="bg-white border border-red-200 p-3.5 rounded-xl space-y-3 text-left animate-fadeIn shadow-2xs">
                            <span className="text-xs font-black text-red-800 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                              {t("settings.dangerConfirmTitle")}
                            </span>
                            <p className="text-[10px] text-gray-600 leading-normal">
                              {t("settings.dangerConfirmDesc")}
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleResetAllData}
                                className="flex-1 text-[10px] font-black text-white bg-red-600 hover:bg-red-700 py-2 rounded-lg text-center cursor-pointer"
                              >
                                {t("settings.dangerConfirmYes")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 text-[10px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 py-2 rounded-lg text-center cursor-pointer"
                              >
                                {t("settings.dangerConfirmCancel")}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
