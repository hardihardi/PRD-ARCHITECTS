import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/LanguageContext";
import { HeaderLanguage } from "../components/layout/HeaderLanguage";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useSettings } from "../contexts/SettingsContext";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const { settings } = useSettings();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("login.authError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(t("login.googleError"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#566a7f] relative overflow-hidden">
      {/* Top Language Selector */}
      <div className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-md rounded-xl p-1 shadow-sm border border-[#e4e6e8]">
        <HeaderLanguage />
      </div>

      {/* Decorative gradient elements */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 bg-[#696cff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-96 w-96 bg-[#71dd37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-14 w-14 rounded-2xl object-contain bg-[#e7e7ff] p-2 border border-[#696cff]/30 shadow-[0_2px_6px_0_rgba(105,108,255,0.3)]"
            />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-[#696cff] flex items-center justify-center text-white font-bold text-2xl shadow-[0_4px_12px_0_rgba(105,108,255,0.4)]">
              PRD
            </div>
          )}
        </div>
        <h2 className="mt-5 text-center text-2xl sm:text-3xl font-bold text-[#384756] tracking-tight">
          {isLogin ? t("login.welcomeBack") : t("login.createAccount")}
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-[#7a838b]">
          {isLogin ? t("login.loginSubtitle") : t("login.registerSubtitle")}
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-[0_4px_16px_0_rgba(67,89,113,0.1)] rounded-2xl sm:px-10 border border-[#e4e6e8]">
          {error && (
            <div className="mb-5 bg-[#ffebe8] p-3.5 rounded-xl flex items-start gap-3 border border-[#ff3e1d]/30 text-[#ff3e1d]">
              <AlertCircle className="h-5 w-5 text-[#ff3e1d] mt-0.5 shrink-0" />
              <p className="text-xs font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleEmailAuth}>
            <div>
              <label
                className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-1.5"
                htmlFor="email"
              >
                {t("login.emailLabel")}
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1acb8]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#d9dee3] text-[#566a7f] placeholder-[#a1acb8] rounded-lg text-xs font-medium focus:outline-none focus:border-[#696cff] focus:ring-4 focus:ring-[#696cff]/10 transition-all"
                  placeholder={t("login.emailPlaceholder")}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider"
                  htmlFor="password"
                >
                  {t("login.passwordLabel")}
                </label>
              </div>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1acb8]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#d9dee3] text-[#566a7f] placeholder-[#a1acb8] rounded-lg text-xs font-medium focus:outline-none focus:border-[#696cff] focus:ring-4 focus:ring-[#696cff]/10 transition-all"
                  placeholder={t("login.passwordPlaceholder")}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] text-xs font-bold text-white bg-[#696cff] hover:bg-[#5a5ddb] active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#696cff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLogin ? (
                  t("login.loginBtn")
                ) : (
                  t("login.registerBtn")
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e4e6e8]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-[#a1acb8] font-medium">
                  {t("login.orContinueWith")}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-[#d9dee3] rounded-lg bg-white text-xs font-bold text-[#566a7f] hover:bg-[#f5f5f9] hover:border-[#696cff]/30 focus:outline-none focus:ring-2 focus:ring-[#696cff]/20 transition-all gap-2.5 items-center cursor-pointer shadow-2xs"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t("login.googleSSO")}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs">
            <span className="text-[#a1acb8]">
              {isLogin ? t("login.dontHaveAccount") : t("login.alreadyHaveAccount")}
            </span>{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-[#696cff] hover:underline focus:outline-none cursor-pointer"
            >
              {isLogin ? t("login.registerLink") : t("login.loginLink")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
