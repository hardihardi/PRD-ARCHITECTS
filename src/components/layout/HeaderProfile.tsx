import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../contexts/LanguageContext";
import { User as UserIcon, LogOut, Settings, ChevronDown, UserSquare, Shield, HelpCircle } from "lucide-react";

export function HeaderProfile() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const currentDisplayName = user.displayName || "Pengguna";
  const email = user.email || "No email provided";

  return (
    <div
      className="relative border-l border-[#e4e6e8] pl-3 sm:pl-5 ml-1 sm:ml-3"
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 rounded-xl p-1.5 hover:bg-[#f5f5f9] transition-all duration-200 focus:outline-none w-full cursor-pointer"
        title={t("header.profileMenu")}
      >
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#e7e7ff] flex items-center justify-center text-[#696cff] shrink-0 border border-[#696cff]/20 overflow-hidden shadow-2xs font-bold text-xs">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon className="h-4 w-4" />
          )}
        </div>

        <div className="hidden sm:flex flex-col items-start pr-1">
          <span className="text-xs font-bold text-[#384756] max-w-[120px] lg:max-w-[150px] truncate leading-tight">
            {currentDisplayName}
          </span>
          <span className="text-[10px] text-[#696cff] bg-[#e7e7ff] px-1.5 py-0.2 rounded font-extrabold tracking-wide mt-0.5">
            {t("header.adminMember")}
          </span>
        </div>

        <ChevronDown
          className={`hidden sm:block h-3.5 w-3.5 text-[#a1acb8] transition-transform duration-200 ${isOpen ? "rotate-180 text-[#696cff]" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[280px] sm:w-[300px] rounded-xl bg-white shadow-[0_4px_20px_0_rgba(67,89,113,0.18)] border border-[#e4e6e8] z-50 overflow-hidden transform opacity-100 scale-100 transition-all duration-200">
          <div className="p-4 border-b border-[#e4e6e8] bg-[#f5f5f9]/70">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#e7e7ff] flex items-center justify-center text-[#696cff] border border-[#696cff]/30 shadow-2xs overflow-hidden shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-[#384756] truncate">
                  {currentDisplayName}
                </span>
                <span className="text-xs text-[#7a838b] truncate mt-0.5">
                  {email}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => { setIsOpen(false); navigate("/profile"); }}
                className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-[#696cff] px-3 py-2 text-xs font-bold text-white hover:bg-[#5a5ddb] transition-all shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] cursor-pointer"
              >
                <UserSquare className="h-3.5 w-3.5" />
                {t("header.editProfile")}
              </button>
            </div>
          </div>

          <div className="p-2 space-y-1 bg-white">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-[#566a7f] rounded-lg hover:bg-[#e7e7ff]/60 hover:text-[#696cff] transition-all group"
            >
              <div className="bg-[#f5f5f9] p-1.5 rounded-lg group-hover:bg-[#e7e7ff] text-[#696cff] transition-colors">
                <Settings className="h-4 w-4" />
              </div>
              {t("header.systemSettings")}
            </Link>
            
            <button
              onClick={() => { setIsOpen(false); navigate("/profile"); }}
              className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-[#566a7f] rounded-lg hover:bg-[#e7e7ff]/60 hover:text-[#696cff] transition-all group cursor-pointer"
            >
              <div className="bg-[#f5f5f9] p-1.5 rounded-lg group-hover:bg-[#e7e7ff] text-[#696cff] transition-colors">
                <Shield className="h-4 w-4" />
              </div>
              {t("header.securityAccount")}
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-[#566a7f] rounded-lg hover:bg-[#e7e7ff]/60 hover:text-[#696cff] transition-all group cursor-pointer"
            >
              <div className="bg-[#f5f5f9] p-1.5 rounded-lg group-hover:bg-[#e7e7ff] text-[#696cff] transition-colors">
                <HelpCircle className="h-4 w-4" />
              </div>
              {t("header.helpCenter")}
            </button>
          </div>

          <div className="p-2 bg-[#f5f5f9] border-t border-[#e4e6e8]">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold text-[#ff3e1d] rounded-lg hover:bg-[#ffebe8] transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {t("sidebar.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

