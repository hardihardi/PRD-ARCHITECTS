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
  FileCode,
  LayoutTemplate,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

interface CustomSection {
  title: string;
  content: string;
}

export function CustomTemplate() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const editorRef = React.useRef<HTMLDivElement>(null);

  // Main Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SaaS");
  const [projectType, setProjectType] = useState("");
  const [industry, setIndustry] = useState("");
  const [complexity, setComplexity] = useState(language === "id" ? "Sedang" : "Medium");
  const [timeEstimation, setTimeEstimation] = useState(language === "id" ? "4-6 Minggu" : "4-6 Weeks");
  const [audience, setAudience] = useState("");
  const [techStack, setTechStack] = useState("");
  
  // Lists
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [customSections, setCustomSections] = useState<CustomSection[]>([
    {
      title: "",
      content: ""
    }
  ]);

  // UI States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);

  // Load existing template if editing
  useEffect(() => {
    if (!editId) return;

    const loadTemplate = async () => {
      try {
        const docRef = doc(db, "templates", editId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setDescription(data.description || "");
          setCategory(data.category || "Community");
          setComplexity(data.complexity || "Sedang");
          setTimeEstimation(data.timeEstimation || "");
          setAudience(data.audience || "");
          setTechStack(data.techStack || "");
          if (Array.isArray(data.features)) {
            setFeatures(data.features);
          } else if (typeof data.features === "string") {
            setFeatures(data.features.split("\n").filter(Boolean));
          }
          if (Array.isArray(data.customSections)) {
            setCustomSections(data.customSections);
          }
          } else {
            setError(t("customTemplate.errNotFound"));
          }
        } catch (err: any) {
          console.error("Gagal memuat template kustom:", err);
          setError(t("customTemplate.errLoad"));
        }
      };
  
      loadTemplate();
    }, [editId, t]);
  
    // AI Suggestions function
    const handleGenerateAISuggestions = async () => {
      if (!projectType || !industry) {
        setError(t("customTemplate.errAiInput"));
        return;
      }
  
      setIsAiLoading(true);
      setError("");
      setSuccess("");
      try {
        const storedKeys = loadStoredApiKeysSync();
        const activeApiKey = storedKeys.Gemini?.main || storedKeys.Claude?.main || storedKeys.Chatgpt?.main || "";
        const activeProvider = storedKeys.Gemini?.main ? "Gemini" : storedKeys.Claude?.main ? "Claude" : storedKeys.Chatgpt?.main ? "Chatgpt" : "Gemini";

        const response = await fetch("/api/v1/suggest-custom-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectType,
            industry,
            description: description || "Proyek kustom",
            apiKey: activeApiKey,
            provider: activeProvider,
          })
        });
  
        if (!response.ok) {
          throw new Error(t("customTemplate.errAiFail"));
        }
  
        const data = await response.json();
        
        // Update fields
        if (data.name) setName(data.name);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        if (data.complexity) setComplexity(data.complexity);
        if (data.timeEstimation) setTimeEstimation(data.timeEstimation);
        if (data.audience) setAudience(data.audience);
        if (data.techStack) setTechStack(data.techStack);
        if (Array.isArray(data.features)) setFeatures(data.features);
        if (Array.isArray(data.customSections)) {
          setCustomSections(data.customSections);
          setActiveSectionIdx(0);
        }
  
        setSuccess(t("customTemplate.aiSuccess"));
      } catch (err: any) {
        console.error(err);
        setError(err.message || t("customTemplate.errAiFail"));
      } finally {
        setIsAiLoading(false);
      }
    };
  
    // Features CRUD
    const handleAddFeature = () => {
      if (!newFeature.trim()) return;
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    };
  
    const handleRemoveFeature = (idx: number) => {
      setFeatures(features.filter((_, i) => i !== idx));
    };
  
    // Sections CRUD
    const handleAddSection = () => {
      const newSec: CustomSection = {
        title: `## ${t("customTemplate.newSectionDefault").replace("{num}", String(customSections.length + 1))}`,
        content: t("customTemplate.sectionContentDefault")
      };
      setCustomSections([...customSections, newSec]);
      setActiveSectionIdx(customSections.length);
    };
  
    const handleRemoveSection = (idx: number) => {
      if (customSections.length <= 1) {
        setError(t("customTemplate.errMinSection"));
        return;
      }
      const filtered = customSections.filter((_, i) => i !== idx);
      setCustomSections(filtered);
      setActiveSectionIdx(Math.max(0, idx - 1));
    };
  
    const handleSectionChange = (idx: number, field: keyof CustomSection, val: string) => {
      const updated = [...customSections];
      updated[idx] = {
        ...updated[idx],
        [field]: val
      };
      setCustomSections(updated);
    };
  
    const moveSection = (idx: number, direction: "up" | "down") => {
      if (direction === "up" && idx === 0) return;
      if (direction === "down" && idx === customSections.length - 1) return;
  
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const updated = [...customSections];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
  
      setCustomSections(updated);
      setActiveSectionIdx(targetIdx);
    };
  
    const handleSectionSelect = (idx: number) => {
      setActiveSectionIdx(idx);
      if (window.innerWidth < 768) {
        setTimeout(() => {
          editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    };
  
    // Save/Submit Template
    const handleSaveTemplate = async () => {
      if (!name.trim() || !description.trim()) {
        setError(t("customTemplate.errReqFields"));
        return;
      }
  
      setIsSaving(true);
      setError("");
      setSuccess("");
  
      try {
        const payload = {
          name: name.trim(),
          description: description.trim(),
          category,
          complexity,
          timeEstimation,
          audience,
          techStack,
          features,
          customSections,
          authorName: user?.email || "User Komunitas",
          createdBy: user?.uid || "anonymous",
          updatedAt: serverTimestamp(),
        };
  
        if (editId) {
          // Edit existing doc
          const docRef = doc(db, "templates", editId);
        await updateDoc(docRef, payload);
        setSuccess("Template kustom berhasil diperbarui!");
      } else {
        // Create new doc
        const templatesRef = collection(db, "templates");
        await addDoc(templatesRef, {
          ...payload,
          createdAt: serverTimestamp(),
          rating: 5,
          ratingCount: 1,
          isFeatured: false,
          isCommunity: true
        });
        setSuccess(t("customTemplate.saveSuccess"));
      }

      setTimeout(() => {
        navigate("/templates");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(t("customTemplate.errSave") + " " + (err.message || "Internal error"));
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
            to="/templates"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <LayoutTemplate className="h-8 w-8 text-indigo-600" />
            {editId ? t("customTemplate.editTitle") : t("customTemplate.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            {editId ? t("customTemplate.editSubtitle") : t("customTemplate.subtitle")}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Panel: Setup & AI suggestion */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 self-start">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              {t("customTemplate.aiTitle")}
            </h2>
            
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("customTemplate.aiDesc")}
            </p>

            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplate.typeLabel")} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t("customTemplate.typePlaceholder")}
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplate.industryLabel")} <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t("customTemplate.industryPlaceholder")}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerateAISuggestions}
                disabled={isAiLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t("customTemplate.aiBtn")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Core Metadata */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              {t("customTemplate.genTitle")}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("customTemplate.genDesc")}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplate.nameLabel")}
                </label>
                <Input
                  placeholder={t("customTemplate.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t("customTemplate.descLabel")}
                </label>
                <Textarea
                  placeholder={t("customTemplate.descPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {t("customTemplate.categoryLabel")}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="Retail & E-Commerce">E-Commerce</option>
                    <option value="Financial Services">FinTech</option>
                    <option value="Healthcare & Medtech">Healthcare</option>
                    <option value="EdTech & Education">EdTech</option>
                    <option value="Logistics & Supply Chain">Logistics</option>
                    <option value="On-Demand & Mobility">On-Demand</option>
                    <option value="AI & Productivity">AI Tools</option>
                    <option value="Community">Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {t("customTemplate.complexityLabel")}
                  </label>
                  <select
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={t("customTemplate.complexityLow")}>{t("customTemplate.complexityLow")}</option>
                    <option value={t("customTemplate.complexityMedium")}>{t("customTemplate.complexityMedium")}</option>
                    <option value={t("customTemplate.complexityHigh")}>{t("customTemplate.complexityHigh")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {t("customTemplate.timeLabel")}
                  </label>
                  <Input
                    placeholder={t("customTemplate.timePlaceholder")}
                    value={timeEstimation}
                    onChange={(e) => setTimeEstimation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {t("customTemplate.audienceLabel")}
                  </label>
                  <Input
                    placeholder={t("customTemplate.audiencePlaceholder")}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Rekomendasi Tech Stack
                </label>
                <Input
                  placeholder="Misal: React, Node.js, PostgreSQL"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Features Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              {t("customTemplate.featTitle")}
            </h2>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder={t("customTemplate.featInputPlaceholder")}
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
                className="flex-1"
              />
              <Button onClick={handleAddFeature} variant="outline" className="shrink-0 gap-1 sm:w-auto w-full justify-center">
                <Plus className="w-4 h-4" /> {t("customTemplate.featAddBtn")}
              </Button>
            </div>

            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {features.length === 0 && (
                <li className="text-sm text-gray-400 italic py-2">Belum ada fitur utama.</li>
              )}
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 min-w-0 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Section Blueprint Layout */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {t("customTemplate.secTitle")}
                </h2>
                <p className="text-xs text-gray-400">{t("customTemplate.secDesc")}</p>
              </div>
              <Button onClick={handleAddSection} size="sm" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 gap-1.5 justify-center sm:w-auto w-full">
                <Plus className="w-4 h-4" /> {t("customTemplate.secAddBtn")}
              </Button>
            </div>

            {/* Mobile Dropdown & Quick Control Bar (Visible only on mobile/tablet) */}
            <div className="block md:hidden bg-gray-50 p-3 rounded-xl border border-gray-150 space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Pilih Section yang Ingin Diedit
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={activeSectionIdx}
                  onChange={(e) => handleSectionSelect(Number(e.target.value))}
                  className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {customSections.map((sec, idx) => (
                    <option key={idx} value={idx}>
                      {idx + 1}. {sec.title.replace(/^#+\s*/, "") || "Tanpa Judul"}
                    </option>
                  ))}
                </select>
                
                {/* Mobile direct controls */}
                <div className="flex items-center justify-center gap-1 border border-gray-200 rounded-lg p-1 bg-white shrink-0">
                  <button
                    onClick={() => moveSection(activeSectionIdx, "up")}
                    disabled={activeSectionIdx === 0}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                    title="Geser ke Atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveSection(activeSectionIdx, "down")}
                    disabled={activeSectionIdx === customSections.length - 1}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                    title="Geser ke Bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveSection(activeSectionIdx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Hapus Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Section List Left Sidebar (Visible only on desktop) */}
              <div className="hidden md:block space-y-1 md:col-span-1 border-r border-gray-100 pr-4 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                {customSections.map((sec, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-left text-sm transition-all relative group cursor-pointer ${
                      activeSectionIdx === idx
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 border border-transparent"
                    }`}
                    onClick={() => handleSectionSelect(idx)}
                  >
                    <span className="truncate pr-16 md:pr-8 group-hover:pr-16 transition-all">{sec.title || "(Tanpa Judul)"}</span>
                    
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white md:bg-transparent rounded-md p-0.5 shadow-sm md:shadow-none border md:border-0 gap-0.5 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSection(idx, "up"); }}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-indigo-600 p-1 rounded disabled:opacity-30 transition-colors"
                        title="Geser ke Atas"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSection(idx, "down"); }}
                        disabled={idx === customSections.length - 1}
                        className="text-gray-400 hover:text-indigo-600 p-1 rounded disabled:opacity-30 transition-colors"
                        title="Geser ke Bawah"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveSection(idx); }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                        title="Hapus Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Section Content Editor */}
              <div ref={editorRef} className="col-span-1 md:col-span-2 space-y-4 scroll-mt-6">
                {customSections[activeSectionIdx] ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Mengedit Section {activeSectionIdx + 1} dari {customSections.length}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t("customTemplate.secNameLabel")}
                      </label>
                      <Input
                        value={customSections[activeSectionIdx].title}
                        onChange={(e) => handleSectionChange(activeSectionIdx, "title", e.target.value)}
                        placeholder="Misal: ## 1. Latar Belakang"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t("customTemplate.secContentLabel")}
                      </label>
                      <Textarea
                        value={customSections[activeSectionIdx].content}
                        onChange={(e) => handleSectionChange(activeSectionIdx, "content", e.target.value)}
                        placeholder={t("customTemplate.secContentPlaceholder")}
                        className="min-h-[220px] md:min-h-[280px] font-mono text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[150px] flex items-center justify-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl">
                    Pilih section dari panel kiri atau klik "+ Tambah Section" untuk mendesain template.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:space-y-0 space-y-2">
            <Link to="/templates" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full justify-center">{t("common.cancel")}</Button>
            </Link>
            <Button
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-6 w-full sm:w-auto justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editId ? t("customTemplate.updateBtn") : t("customTemplate.saveDraftBtn")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
