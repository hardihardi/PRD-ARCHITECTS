import React, { useState, useEffect } from "react";
import { loadStoredApiKeysSync } from "../lib/apiKeyStorage";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Monitor,
  Smartphone,
  Eye,
  Settings,
  Type,
  Layout,
  Layers,
  HeartHandshake
} from "lucide-react";

interface DesignTemplate {
  title: string;
  category: string;
  color: string;
  colorHex: string;
  primaryColor: string;
  borderRadius: string;
  fontTheme: string;
  layoutStyle: string;
  description: string;
  fullDescription: string;
  desktopSpec: string;
  mobileSpec: string;
  typography: string;
  uiComponents: string[];
  accessibility: string[];
  prompt: string;
}

export function CustomTemplateDesign() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  // Main Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("SaaS");
  const [color, setColor] = useState("bg-indigo-600");
  const [colorHex, setColorHex] = useState("#4f46e5");
  const [primaryColor, setPrimaryColor] = useState("indigo");
  const [borderRadius, setBorderRadius] = useState("md");
  const [fontTheme, setFontTheme] = useState("sans");
  const [layoutStyle, setLayoutStyle] = useState("modern");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [desktopSpec, setDesktopSpec] = useState("");
  const [mobileSpec, setMobileSpec] = useState("");
  const [typography, setTypography] = useState("");
  const [prompt, setPrompt] = useState("");

  // Lists
  const [uiComponents, setUiComponents] = useState<string[]>([]);
  const [newUiComponent, setNewUiComponent] = useState("");

  const [accessibility, setAccessibility] = useState<string[]>([]);
  const [newAccessibility, setNewAccessibility] = useState("");

  // AI suggestion input triggers
  const [projectType, setProjectType] = useState("");
  const [industry, setIndustry] = useState("");

  // UI States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Map primary color to Tailwind classes and Hex
  const colorMap: Record<string, { bg: string; hex: string }> = {
    indigo: { bg: "bg-indigo-600", hex: "#4f46e5" },
    blue: { bg: "bg-blue-600", hex: "#2563eb" },
    emerald: { bg: "bg-emerald-600", hex: "#059669" },
    rose: { bg: "bg-rose-500", hex: "#f43f5e" },
    amber: { bg: "bg-amber-500", hex: "#f59e0b" },
    purple: { bg: "bg-purple-600", hex: "#7c3aed" },
    orange: { bg: "bg-orange-500", hex: "#f97316" },
    charcoal: { bg: "bg-slate-800", hex: "#1e293b" },
  };

  const handlePrimaryColorChange = (selected: string) => {
    setPrimaryColor(selected);
    const mapping = colorMap[selected];
    if (mapping) {
      setColor(mapping.bg);
      setColorHex(mapping.hex);
    }
  };

  // Load existing template if editing
  useEffect(() => {
    if (!editId) return;

    const loadTemplate = async () => {
      try {
        const docRef = doc(db, "design_templates", editId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as DesignTemplate;
          setTitle(data.title || "");
          setCategory(data.category || "SaaS");
          setPrimaryColor(data.primaryColor || "indigo");
          setColor(data.color || "bg-indigo-600");
          setColorHex(data.colorHex || "#4f46e5");
          setBorderRadius(data.borderRadius || "md");
          setFontTheme(data.fontTheme || "sans");
          setLayoutStyle(data.layoutStyle || "modern");
          setDescription(data.description || "");
          setFullDescription(data.fullDescription || "");
          setDesktopSpec(data.desktopSpec || "");
          setMobileSpec(data.mobileSpec || "");
          setTypography(data.typography || "");
          setPrompt(data.prompt || "");
          
          if (Array.isArray(data.uiComponents)) {
            setUiComponents(data.uiComponents);
          }
          if (Array.isArray(data.accessibility)) {
            setAccessibility(data.accessibility);
          }
        } else {
          setError(t("customTemplateDesign.errNotFound"));
        }
      } catch (err: any) {
        console.error("Gagal memuat template design:", err);
        setError(t("customTemplateDesign.errLoad"));
      }
    };

    loadTemplate();
  }, [editId, t]);

  // AI Suggestions function
  const handleGenerateAISuggestions = async () => {
    if (!projectType || !industry) {
      setError(t("customTemplate.errAiInput")); // reusing same string
      return;
    }

    setIsAiLoading(true);
    setError("");
    setSuccess("");
    try {
      const storedKeys = loadStoredApiKeysSync();
      const activeApiKey = storedKeys.Gemini?.main || storedKeys.Claude?.main || storedKeys.Chatgpt?.main || "";
      const activeProvider = storedKeys.Gemini?.main ? "Gemini" : storedKeys.Claude?.main ? "Claude" : storedKeys.Chatgpt?.main ? "Chatgpt" : "Gemini";

      const response = await fetch("/api/v1/suggest-custom-design-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType,
          industry,
          description: description || "Desain visual modern responsif",
          apiKey: activeApiKey,
          provider: activeProvider,
        })
      });

      if (!response.ok) {
        throw new Error(t("customTemplateDesign.errAiFail"));
      }

      const data = await response.json();
      
      // Update fields
      if (data.title) setTitle(data.title);
      if (data.category) setCategory(data.category);
      if (data.primaryColor) {
        handlePrimaryColorChange(data.primaryColor);
      }
      if (data.borderRadius) setBorderRadius(data.borderRadius);
      if (data.fontTheme) setFontTheme(data.fontTheme);
      if (data.layoutStyle) setLayoutStyle(data.layoutStyle);
      if (data.description) setDescription(data.description);
      if (data.fullDescription) setFullDescription(data.fullDescription);
      if (data.desktopSpec) setDesktopSpec(data.desktopSpec);
      if (data.mobileSpec) setMobileSpec(data.mobileSpec);
      if (data.typography) setTypography(data.typography);
      if (data.prompt) setPrompt(data.prompt);
      
      if (Array.isArray(data.uiComponents)) setUiComponents(data.uiComponents);
      if (Array.isArray(data.accessibility)) setAccessibility(data.accessibility);

      setSuccess(t("customTemplateDesign.aiSuccess"));
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("customTemplateDesign.errAiFail"));
    } finally {
      setIsAiLoading(false);
    }
  };

  // UI Components lists operations
  const handleAddUiComponent = () => {
    if (!newUiComponent.trim()) return;
    setUiComponents([...uiComponents, newUiComponent.trim()]);
    setNewUiComponent("");
  };

  const handleRemoveUiComponent = (idx: number) => {
    setUiComponents(uiComponents.filter((_, i) => i !== idx));
  };

  // Accessibility list operations
  const handleAddAccessibility = () => {
    if (!newAccessibility.trim()) return;
    setAccessibility([...accessibility, newAccessibility.trim()]);
    setNewAccessibility("");
  };

  const handleRemoveAccessibility = (idx: number) => {
    setAccessibility(accessibility.filter((_, i) => i !== idx));
  };

  // Save/Submit Template
  const handleSaveTemplate = async () => {
    if (!title.trim()) {
      setError("Nama/Judul Template Desain wajib diisi.");
      return;
    }
    if (!description.trim()) {
      setError("Deskripsi singkat wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: title.trim(),
        category,
        primaryColor,
        color,
        colorHex,
        borderRadius,
        fontTheme,
        layoutStyle,
        description: description.trim(),
        fullDescription: fullDescription.trim(),
        desktopSpec: desktopSpec.trim(),
        mobileSpec: mobileSpec.trim(),
        typography: typography.trim(),
        uiComponents,
        accessibility,
        prompt: prompt.trim() || `Rancang design system untuk ${title}. Kategori: ${category}. Warna utama: ${primaryColor}. Corner: ${borderRadius}. Font: ${fontTheme}.`,
        authorName: user?.email || "User Komunitas",
        createdBy: user?.uid || "anonymous",
        updatedAt: serverTimestamp(),
        isCommunity: true
      };

      if (editId) {
        // Edit existing doc
        const docRef = doc(db, "design_templates", editId);
        await updateDoc(docRef, payload);
        setSuccess(t("customTemplateDesign.updateSuccess"));
      } else {
        // Create new doc
        const templatesRef = collection(db, "design_templates");
        await addDoc(templatesRef, {
          ...payload,
          createdAt: serverTimestamp(),
          isFeatured: false
        });
        setSuccess(t("customTemplateDesign.saveSuccess"));
      }

      setTimeout(() => {
        navigate("/template-design");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(t("customTemplateDesign.errSave") + " " + (err.message || "Internal error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div>
          <Link
            to="/template-design"
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Palette className="h-8 w-8 text-indigo-600 animate-pulse-subtle" />
            {editId ? t("customTemplateDesign.editTitle") : t("customTemplateDesign.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            {editId ? t("customTemplateDesign.editSubtitle") : t("customTemplateDesign.subtitle")}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Panel: Setup & AI suggestion (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6 self-start">
          
          {/* AI Generator Trigger */}
          <div className="bg-white text-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden border border-slate-200">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-28 w-28 bg-indigo-500/10 rounded-full blur-2xl" />
            
            <h2 className="text-base font-extrabold flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              {t("customTemplateDesign.aiTitle")}
            </h2>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplate.typeLabel")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("customTemplate.typePlaceholder")}
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplate.industryLabel")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("customTemplate.industryPlaceholder")}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAISuggestions}
                disabled={isAiLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-300 text-white flex items-center justify-center gap-2 py-3 rounded-xl transition font-bold text-xs cursor-pointer shadow-md"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    {t("customTemplateDesign.aiBtn")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Core Metadata */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-slate-400" />
              {t("customTemplateDesign.genTitle")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplateDesign.nameLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("customTemplateDesign.namePlaceholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none border-solid"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplate.categoryLabel")}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none bg-white font-bold text-slate-700 focus:border-indigo-500 border-solid"
                >
                  <option value="SaaS">SaaS & Enterprise</option>
                  <option value="Retail & Fashion">Retail & Fashion</option>
                  <option value="Finance">Financial Services</option>
                  <option value="Health & Care">Healthcare & Biotech</option>
                  <option value="Education">Education & LMS</option>
                  <option value="Logistics">Logistics & Mobility</option>
                  <option value="AI & Productivity">AI & Productivity</option>
                  <option value="Media & Social">Media & Social Community</option>
                  <option value="Community">{t("customTemplateDesign.categoryCommunity")}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Accent Color Token */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Accent Color Token
                  </label>
                  <select
                    value={primaryColor}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-white font-bold text-slate-700 focus:border-indigo-500 border-solid"
                  >
                    <option value="indigo">Indigo Accent</option>
                    <option value="emerald">Emerald Accent</option>
                    <option value="blue">Blue Accent</option>
                    <option value="rose">Rose Accent</option>
                    <option value="amber">Amber Accent</option>
                    <option value="purple">Purple Accent</option>
                    <option value="orange">Orange Accent</option>
                    <option value="charcoal">Charcoal Dark</option>
                  </select>
                </div>

                {/* BorderRadius style */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Corner style Token
                  </label>
                  <select
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-white font-bold text-slate-700 focus:border-indigo-500 border-solid"
                  >
                    <option value="none">Sharp (none)</option>
                    <option value="md">Rounded (md)</option>
                    <option value="lg">Generous (lg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Font Theme */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Font Theme Token
                  </label>
                  <select
                    value={fontTheme}
                    onChange={(e) => setFontTheme(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-white font-bold text-slate-700 focus:border-indigo-500 border-solid"
                  >
                    <option value="sans">Inter Sans</option>
                    <option value="serif">Playfair Serif</option>
                    <option value="mono">JetBrains Mono</option>
                  </select>
                </div>

                {/* Layout Style */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Layout Style Token
                  </label>
                  <select
                    value={layoutStyle}
                    onChange={(e) => setLayoutStyle(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-white font-bold text-slate-700 focus:border-indigo-500 border-solid"
                  >
                    <option value="clean">Minimalist / Clean</option>
                    <option value="modern">Modern Grid / Bento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplateDesign.shortDescLabel")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder={t("customTemplateDesign.shortDescPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[60px] border-solid"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplateDesign.fullDescLabel")}
                </label>
                <textarea
                  placeholder={t("customTemplateDesign.fullDescPlaceholder")}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[90px] border-solid"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Editor Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Layout Specs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layout className="w-4.5 h-4.5 text-indigo-600" />
              {t("customTemplateDesign.layoutTitle")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  {t("customTemplateDesign.desktopSpecLabel")}
                </label>
                <textarea
                  placeholder={t("customTemplateDesign.desktopSpecPlaceholder")}
                  value={desktopSpec}
                  onChange={(e) => setDesktopSpec(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[80px] border-solid font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  {t("customTemplateDesign.mobileSpecLabel")}
                </label>
                <textarea
                  placeholder={t("customTemplateDesign.mobileSpecPlaceholder")}
                  value={mobileSpec}
                  onChange={(e) => setMobileSpec(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[80px] border-solid font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-slate-400" />
                  {t("customTemplateDesign.typographyLabel")}
                </label>
                <textarea
                  placeholder={t("customTemplateDesign.typographyPlaceholder")}
                  value={typography}
                  onChange={(e) => setTypography(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[80px] border-solid font-medium leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Key UI Components Included list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-indigo-600" />
              {t("customTemplateDesign.uiComponentsTitle")}
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("customTemplateDesign.uiComponentsInputPlaceholder")}
                value={newUiComponent}
                onChange={(e) => setNewUiComponent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUiComponent()}
                className="flex-1 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none border-solid"
              />
              <button 
                type="button" 
                onClick={handleAddUiComponent} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> {t("customTemplate.featAddBtn")}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {uiComponents.map((comp, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl"
                >
                  {comp}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveUiComponent(idx)} 
                    className="text-indigo-400 hover:text-indigo-700 transition"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {uiComponents.length === 0 && (
                <p className="text-xs text-slate-400 italic">Belum ada komponen UI utama yang ditambahkan.</p>
              )}
            </div>
          </div>

          {/* Accessibility Standards list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HeartHandshake className="w-4.5 h-4.5 text-emerald-600" />
              {t("customTemplateDesign.accessibilityTitle")}
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("customTemplateDesign.accessibilityInputPlaceholder")}
                value={newAccessibility}
                onChange={(e) => setNewAccessibility(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAccessibility()}
                className="flex-1 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none border-solid"
              />
              <button 
                type="button" 
                onClick={handleAddAccessibility} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> {t("customTemplate.featAddBtn")}
              </button>
            </div>

            <div className="space-y-2">
              {accessibility.map((acc, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-800 font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {acc}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveAccessibility(idx)} 
                    className="text-emerald-400 hover:text-emerald-700 transition px-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {accessibility.length === 0 && (
                <p className="text-xs text-slate-400 italic">Belum ada kriteria aksesibilitas yang ditambahkan.</p>
              )}
            </div>
          </div>

          {/* AI Prompter Template */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Eye className="w-4.5 h-4.5 text-indigo-600" />
              {t("customTemplateDesign.promptTitle")}
            </h2>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {t("customTemplateDesign.promptLabel")}
              </label>
              <textarea
                placeholder={t("customTemplateDesign.promptPlaceholder")}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-3.5 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[140px] border-solid font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Save/Batal buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:space-y-0 space-y-2">
            <Link to="/template-design" className="w-full sm:w-auto">
              <button type="button" className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 px-6 rounded-xl text-xs font-bold transition shadow-2xs border-solid cursor-pointer">
                {t("common.cancel")}
              </button>
            </Link>
            <button
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 py-3 px-8 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editId ? t("customTemplateDesign.updateBtn") : t("customTemplateDesign.saveDraftBtn")}
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
