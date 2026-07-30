/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { GenerateWizard } from "./pages/GenerateWizard";
import { Templates } from "./pages/Templates";
import { TemplateDetail } from "./pages/TemplateDetail";
import { Library } from "./pages/Library";
import { LibraryDetail } from "./pages/LibraryDetail";
import { GenerateDesign } from "./pages/GenerateDesign";
import { TemplateDesign } from "./pages/TemplateDesign";
import { LibraryDesign } from "./pages/LibraryDesign";
import { Login } from "./pages/Login";
import { Users } from "./pages/Users";
import { Logs } from "./pages/Logs";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { CustomTemplate } from "./pages/CustomTemplate";
import { CustomTemplateDesign } from "./pages/CustomTemplateDesign";
import {
  Search,
  Menu,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "./lib/utils";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { LanguageProvider, useTranslation } from "./contexts/LanguageContext";
import { HeaderProfile } from "./components/layout/HeaderProfile";
import { HeaderNotifications } from "./components/layout/HeaderNotifications";
import { HeaderLanguage } from "./components/layout/HeaderLanguage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathName = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Cmd/Ctrl + N
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        navigate("/generate");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  if (pathName === "/login") {
    if (!user) {
      return <Login />;
    }
    return <Navigate to="/" replace />;
  }

  const getPageName = () => {
    if (pathName === "/") return t("sidebar.dashboard");
    if (pathName === "/generate") return t("sidebar.generatePRD");
    if (pathName === "/templates") return t("sidebar.templatePRD");
    if (pathName.startsWith("/library")) return t("sidebar.libraryPRD");
    if (pathName === "/generate-design") return t("sidebar.generateDesign");
    if (pathName === "/template-design") return t("sidebar.templateDesign");
    if (pathName === "/library-design") return t("sidebar.libraryDesign");
    if (pathName === "/users") return t("sidebar.users");
    if (pathName === "/logs") return t("sidebar.logs");
    if (pathName === "/settings") return t("sidebar.settings");
    if (pathName === "/profile") return t("header.editProfile");
    return t("sidebar.dashboard");
  };

  return (
    <div className="flex h-[100dvh] w-full font-sans antialiased bg-[#f5f5f9] text-[#566a7f] overflow-hidden relative">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#e4e6e8] bg-white px-4 sm:px-8 z-40 relative shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#566a7f] hover:text-[#696cff] p-2 rounded-lg hover:bg-[#f5f5f9]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#566a7f]">
              <span className="text-[#a1acb8]">{t("common.apps")}</span>
              <span className="text-[#a1acb8]">/</span>
              <span className="text-[#696cff] font-bold bg-[#e7e7ff] px-2.5 py-1 rounded-md">{getPageName()}</span>
            </div>
            {/* Mobile Title */}
            <div className="sm:hidden text-xs font-bold text-[#384756]">
              {getPageName()}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1acb8]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("header.searchPlaceholder")}
                className="h-9 w-48 lg:w-64 rounded-lg bg-[#f5f5f9] border border-[#e4e6e8] pl-9 pr-4 text-xs text-[#566a7f] placeholder-[#a1acb8] outline-none focus:bg-white focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20 transition-all font-medium"
              />
            </div>
            <Link
              to="/generate"
              className="rounded-lg bg-[#696cff] text-white hover:bg-[#5a5ddb] px-4 py-2 text-xs font-semibold shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all whitespace-nowrap hidden sm:flex items-center gap-1.5 active:scale-98"
            >
              <span>{t("common.newProject")}</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              <HeaderLanguage />
              <HeaderNotifications />
              <HeaderProfile />
            </div>
          </div>
        </header>

        {/* Main Content Area - Full Width responsive container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate"
              element={
                <ProtectedRoute>
                  <GenerateWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate-design"
              element={
                <ProtectedRoute>
                  <GenerateDesign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <Templates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/custom"
              element={
                <ProtectedRoute>
                  <CustomTemplate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/template-design"
              element={
                <ProtectedRoute>
                  <TemplateDesign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/template-design/custom"
              element={
                <ProtectedRoute>
                  <CustomTemplateDesign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/:id"
              element={
                <ProtectedRoute>
                  <TemplateDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library-design"
              element={
                <ProtectedRoute>
                  <LibraryDesign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library/:id"
              element={
                <ProtectedRoute>
                  <LibraryDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logs"
              element={
                <ProtectedRoute>
                  <Logs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </SettingsProvider>
    </LanguageProvider>
  );
}
