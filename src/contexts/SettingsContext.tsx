import React, { createContext, useContext, useState, useEffect } from "react";

interface AppSettings {
  appName: string;
  logoUrl: string;
  faviconUrl: string;
  // SEO Meta properties
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaAuthor?: string;
  metaRobots?: string; // e.g. "index, follow" vs "noindex, nofollow"
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

const defaultSettings: AppSettings = {
  appName: "PRD Architect",
  logoUrl: "", // Empty string implies default icon
  faviconUrl: "/vite.svg", // Default Vite favicon or whatever default there is
  metaTitle: "PRD Architect - AI-Powered PRD & Design System Blueprint Generator",
  metaDescription: "Generate professional, exhaustive, and visually beautiful Product Requirement Documents (PRD) and interactive Figma-ready design blueprints with AI.",
  metaKeywords: "PRD Generator, AI Product Management, Design System Generator, UI Kit Blueprint, Product Requirements, Agile PM Tool",
  metaAuthor: "PRD Architect AI Team",
  metaRobots: "index, follow",
  ogTitle: "PRD Architect - AI-Powered PRD & Design System Blueprint Generator",
  ogDescription: "Design, build, and document specifications with our lightning-fast AI PRD Generator.",
  ogImageUrl: "",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem("app_white_labeling");
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem("app_white_labeling", JSON.stringify(newSettings));
  };

  useEffect(() => {
    // Update document title
    document.title = settings.metaTitle || settings.appName;

    // Update favicon
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    const faviconHref = settings.faviconUrl || "/vite.svg";
    if (link) {
      // Create new link element if one exists, to force refresh in some browsers
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = faviconHref;

      // Copy other attributes like type if they exist
      if (link.type) newLink.type = link.type;

      document.head.removeChild(link);
      document.head.appendChild(newLink);
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = faviconHref;
      document.head.appendChild(newLink);
    }

    // Helper for meta tags
    const setMetaTag = (nameOrProperty: string, content: string | undefined, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}='${nameOrProperty}']`);
      if (!content) {
        if (element) {
          document.head.removeChild(element);
        }
        return;
      }
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Inject/Update Standard SEO tags
    setMetaTag("description", settings.metaDescription);
    setMetaTag("keywords", settings.metaKeywords);
    setMetaTag("author", settings.metaAuthor);
    setMetaTag("robots", settings.metaRobots);

    // Inject/Update Open Graph tags (Facebook/Linkedin/Slack)
    setMetaTag("og:title", settings.ogTitle || settings.appName, true);
    setMetaTag("og:description", settings.ogDescription || settings.metaDescription, true);
    setMetaTag("og:image", settings.ogImageUrl, true);
    setMetaTag("og:type", "website", true);
    setMetaTag("og:url", window.location.origin, true);

    // Inject/Update Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", settings.ogTitle || settings.appName);
    setMetaTag("twitter:description", settings.ogDescription || settings.metaDescription);
    setMetaTag("twitter:image", settings.ogImageUrl);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
