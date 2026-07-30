import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLanguage } from "../../contexts/LanguageContext";

type LangOption = {
  id: "id" | "en";
  name: string;
  flag: string;
};

const languages: LangOption[] = [
  { id: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { id: "en", name: "English", flag: "🇬🇧" }
];

export function HeaderLanguage() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (langId: "id" | "en") => {
    setLanguage(langId);
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#7a838b] hover:text-[#696cff] transition-colors focus:outline-none rounded-xl hover:bg-[#f5f5f9] cursor-pointer flex items-center gap-1.5"
        title={t("header.selectLanguage")}
      >
        <Globe className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-48 rounded-xl bg-white shadow-[0_4px_20px_0_rgba(67,89,113,0.18)] border border-[#e4e6e8] z-50 overflow-hidden transform opacity-100 scale-100 transition-all duration-200">
          <div className="p-2 space-y-1">
            {languages.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleSelect(lang.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[#e7e7ff] text-[#696cff]"
                      : "text-[#566a7f] hover:bg-[#f5f5f9]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
