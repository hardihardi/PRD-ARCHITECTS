import {
  FileText,
  Home,
  LayoutTemplate,
  Library,
  Database,
  Users,
  Settings,
  Activity,
  X,
  LogOut,
  PenTool,
  Palette,
  Layers,
  Globe,
  History,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useTranslation } from "../../contexts/LanguageContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { settings } = useSettings();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { name: t("sidebar.dashboard"), icon: Home, route: "/" },
    { name: t("sidebar.generatePRD"), icon: FileText, route: "/generate" },
    { name: t("sidebar.templatePRD"), icon: LayoutTemplate, route: "/templates" },
    { name: t("sidebar.libraryPRD"), icon: Library, route: "/library" },
    { name: t("sidebar.generateDesign"), icon: PenTool, route: "/generate-design" },
    { name: t("sidebar.templateDesign"), icon: Palette, route: "/template-design" },
    { name: t("sidebar.libraryDesign"), icon: Layers, route: "/library-design" },
    { name: t("sidebar.webExtractor"), icon: Globe, route: "/web-extractor" },
    { name: t("sidebar.libraryExtractor"), icon: History, route: "/library-extractor" },
    { name: t("sidebar.users"), icon: Users, route: "/users" },
    { name: t("sidebar.logs"), icon: Activity, route: "/logs" },
    { name: t("sidebar.settings"), icon: Settings, route: "/settings" },
  ];

  // Close sidebar on mobile when route changes
  useEffect(() => {
    onClose();
  }, [currentPath, onClose]);

  useEffect(() => {
    // Prevent scrolling on the body when the sidebar is open on mobile
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/80 transition-opacity lg:hidden flex touch-none"
          onClick={onClose}
          aria-hidden="true"
          style={{ overscrollBehavior: "contain" }}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-white border-r border-[#e4e6e8] text-[#566a7f] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-[#e4e6e8]/80">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-[#e7e7ff] p-1 border border-[#696cff]/20" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-[#696cff] flex items-center justify-center text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
                <Database className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-[#384756] text-sm tracking-tight truncate max-w-[140px]">
                {settings.appName || "PRD Architect"}
              </span>
              <span className="text-[10px] font-semibold text-[#696cff] bg-[#e7e7ff] px-2 py-0.5 rounded-full w-max">
                {t("sidebar.adminTag")}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-[#a1acb8] hover:text-[#566a7f] p-1 rounded-lg hover:bg-[#f5f5f9]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-5">
          <div className="px-3 mb-2 text-[10px] font-bold text-[#a1acb8] uppercase tracking-wider">
            {t("sidebar.mainMenu")}
          </div>
          <ul className="flex flex-1 flex-col space-y-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.route;
              return (
                <li key={item.route}>
                  <Link
                    to={item.route}
                    className={cn(
                      isActive
                        ? "bg-[#696cff] text-white shadow-[0_2px_6px_0_rgba(105,108,255,0.4)] font-semibold"
                        : "text-[#566a7f] hover:text-[#696cff] hover:bg-[#e7e7ff]/60 font-medium",
                      "group flex text-left w-full items-center gap-x-3 rounded-lg px-3.5 py-2.5 text-xs transition-all duration-150 cursor-pointer",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-[#696cff]"
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-4 border-t border-[#e4e6e8]/80 bg-[#f5f5f9]/50">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-x-3 px-3.5 py-2.5 cursor-pointer hover:bg-rose-50 rounded-lg transition-all text-[#566a7f] hover:text-[#ff3e1d] font-semibold text-xs border border-transparent hover:border-rose-100"
          >
            <LogOut className="h-4 w-4 shrink-0 text-[#ff3e1d]" />
            <span>{t("sidebar.logout")}</span>
          </button>
        </div>
      </div>
    </>
  );
}
