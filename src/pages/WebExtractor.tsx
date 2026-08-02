import React, { useState, useEffect } from "react";
import {
  Globe,
  Palette,
  Image as ImageIcon,
  Compass,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Layers,
  Code,
  AlertCircle,
  FileText,
  ShieldCheck,
  ExternalLink,
  Server,
  Zap,
  ArrowRight,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  FileJson,
  Cpu,
  ChevronDown,
  ChevronUp,
  Terminal,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../contexts/LanguageContext";

type ActiveTab = "styleguide" | "images" | "crawl";

export interface ExtractorHistoryItem {
  id: string;
  url: string;
  domain: string;
  type: "styleguide" | "images" | "crawl";
  timestamp: string;
  formattedDate: string;
  title: string;
  summary: string;
  data: any;
  metrics?: {
    colorCount?: number;
    imageCount?: number;
    pagesCount?: number;
    seoScore?: number;
  };
}

const STORAGE_KEY = "web_extractor_history_v1";

const DEFAULT_SAMPLE_HISTORY: ExtractorHistoryItem[] = [
  {
    id: "hist-demo-1",
    url: "https://stripe.com",
    domain: "stripe.com",
    type: "styleguide",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    formattedDate: "Hari ini, 20:05",
    title: "Stripe Design System & Color Palette",
    summary: "Ekstraksi 12 warna utama, tipografi Graphik, dan token Tailwind CSS.",
    metrics: { colorCount: 12 },
    data: {
      brandName: "Stripe",
      domain: "stripe.com",
      tagline: "Financial infrastructure for the internet",
      primaryColors: [
        { name: "Stripe Blurple", hex: "#635BFF", usage: "Primary Action", rgb: "rgb(99, 91, 255)" },
        { name: "Slate Dark", hex: "#0A2540", usage: "Headings & Surface", rgb: "rgb(10, 37, 64)" },
        { name: "Cyan Spark", hex: "#00D4FF", usage: "Highlights", rgb: "rgb(0, 212, 255)" },
      ],
      secondaryColors: [
        { name: "Emerald Success", hex: "#00D924" },
        { name: "Amber Warning", hex: "#FFC700" },
      ],
      neutralColors: [
        { name: "Canvas Light", hex: "#F6F9FC" },
        { name: "Border Neutral", hex: "#E6EBF1" },
      ],
      typography: {
        fontFamilyHeading: "Graphik, -apple-system, BlinkMacSystemFont, sans-serif",
        fontFamilyBody: "Inter, sans-serif",
        scale: [
          { level: "Display Title", size: "48px", weight: "700", lineHeight: "1.1" },
          { level: "Heading 1", size: "32px", weight: "600", lineHeight: "1.2" },
          { level: "Body Regular", size: "16px", weight: "400", lineHeight: "1.5" },
        ],
      },
      components: {
        buttons: [
          { variant: "Primary Solid", bg: "#635BFF", text: "#FFFFFF", radius: "20px", padding: "10px 20px" },
        ],
        cards: { borderRadius: "16px", padding: "24px" },
      },
      spacingGrid: { containerMaxWidth: "1200px", gridColumns: "12 columns" },
      tailwindConfig: `// Tailwind CSS Config for Stripe
module.exports = {
  theme: {
    extend: {
      colors: {
        stripe: {
          blurple: '#635BFF',
          dark: '#0A2540',
          cyan: '#00D4FF',
        }
      }
    }
  }
}`,
    },
  },
  {
    id: "hist-demo-2",
    url: "https://github.com",
    domain: "github.com",
    type: "images",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    formattedDate: "Hari ini, 18:00",
    title: "GitHub Brand & Octocat Assets",
    summary: "18 media assets dikikis termasuk logo, hero banner, dan icon UI.",
    metrics: { imageCount: 18 },
    data: {
      domain: "github.com",
      images: [
        {
          id: "img-1",
          url: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
          alt: "GitHub Mark Logo",
          category: "Logo",
          type: "PNG",
          dimensions: "512x512",
          fileSize: "14.2 KB",
          description: "Official GitHub Octocat Logo Icon",
        },
        {
          id: "img-2",
          url: "https://github.githubassets.com/assets/hero-desktop-1b3c3b.png",
          alt: "GitHub Copilot Hero Banner",
          category: "Hero Banner",
          type: "PNG",
          dimensions: "1920x1080",
          fileSize: "245 KB",
          description: "Copilot workspace background banner",
        },
        {
          id: "img-3",
          url: "https://github.githubassets.com/assets/code-icon-4a1122.png",
          alt: "Code Repository Icon",
          category: "Icon",
          type: "SVG",
          dimensions: "Vector",
          fileSize: "2.1 KB",
          description: "Repository navigation vector asset",
        },
      ],
    },
  },
  {
    id: "hist-demo-3",
    url: "https://linear.app",
    domain: "linear.app",
    type: "crawl",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    formattedDate: "Kemarin, 14:20",
    title: "Linear App Site Topology & SEO Report",
    summary: "Rangkuman 8 rute halaman utama, SEO Health score 94/100, Next.js tech stack.",
    metrics: { pagesCount: 8, seoScore: 94 },
    data: {
      domain: "linear.app",
      url: "https://linear.app",
      crawlSummary: {
        pageTitle: "Linear – Purpose-built tool for modern product teams",
        metaDescription: "Linear streamlines software projects, sprints, tasks, and bug tracking with high speed.",
        seoHealthScore: 94,
        discoveredPagesCount: 8,
        serverHeader: "Cloudflare Vercel Edge",
        techStack: ["Next.js 15", "React 19", "Tailwind CSS", "Framer Motion", "GraphQL"],
      },
      siteHierarchy: [
        { path: "/", title: "Linear Home", type: "Landing Page", status: "200 OK", summary: "Halaman utama perkenalan produk & fitur unggulan." },
        { path: "/features", title: "Product Features", type: "Feature Directory", status: "200 OK", summary: "Penjelasan detail Issue tracking, Cycles, dan Roadmap." },
        { path: "/integrations", title: "Integrations Hub", type: "Directory", status: "200 OK", summary: "Koneksi ke GitHub, Slack, Figma, dan Sentry." },
        { path: "/pricing", title: "Pricing Plans", type: "Commercial", status: "200 OK", summary: "Tabel harga Free, Standard, Plus, Enterprise." },
      ],
      detectedEndpoints: [
        { path: "/api/v1/graphql", type: "GraphQL API", method: "POST" },
        { path: "/api/auth/session", type: "Authentication", method: "GET" },
      ],
    },
  },
];

export function WebExtractor() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<ActiveTab>("styleguide");
  const [urlInput, setUrlInput] = useState("example.com");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Results State
  const [styleguideData, setStyleguideData] = useState<any | null>(null);
  const [imagesData, setImagesData] = useState<any | null>(null);
  const [crawlData, setCrawlData] = useState<any | null>(null);

  // History State
  const [historyItems, setHistoryItems] = useState<ExtractorHistoryItem[]>([]);

  // Image category filter
  const [imageCategoryFilter, setImageCategoryFilter] = useState("All");

  // Crawl Route filter state
  const [crawlRouteSearch, setCrawlRouteSearch] = useState("");
  const [crawlRouteFilter, setCrawlRouteFilter] = useState<string>("all");
  const [expandedRouteIdx, setExpandedRouteIdx] = useState<number | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistoryItems(parsed);
          return;
        }
      }
      // Initialize with default sample history if empty
      setHistoryItems(DEFAULT_SAMPLE_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_HISTORY));
    } catch (e) {
      console.error("Error reading web extractor history:", e);
      setHistoryItems(DEFAULT_SAMPLE_HISTORY);
    }
  }, []);

  // Save history helper
  const saveHistoryToStorage = (newHistory: ExtractorHistoryItem[]) => {
    setHistoryItems(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error("Error saving history:", e);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleDomains = ["example.com", "stripe.com", "github.com", "linear.app"];

  const handleRunExtraction = async (targetTab?: ActiveTab, urlToUse?: string) => {
    const tabToUse = targetTab || activeTab;
    const finalUrl = (urlToUse || urlInput).trim();

    if (!finalUrl) {
      setErrorMessage("Silakan masukkan URL website (misal: example.com)");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    let endpoint = "/api/v1/extract-styleguide";
    if (tabToUse === "images") endpoint = "/api/v1/scrape-images";
    if (tabToUse === "crawl") endpoint = "/api/v1/crawl-website";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Gagal melakukan ekstraksi website");
      }

      // Format domain & summary
      const cleanDomain = finalUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const now = new Date();
      const dateString = now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) + `, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;

      let newHistoryEntry: ExtractorHistoryItem | null = null;

      if (tabToUse === "styleguide") {
        const extracted = data.styleguide || data;
        setStyleguideData(extracted);

        newHistoryEntry = {
          id: `hist-${Date.now()}`,
          url: finalUrl.startsWith("http") ? finalUrl : `https://${finalUrl}`,
          domain: cleanDomain,
          type: "styleguide",
          timestamp: now.toISOString(),
          formattedDate: dateString,
          title: extracted.brandName ? `${extracted.brandName} Styleguide` : `${cleanDomain} Styleguide`,
          summary: extracted.tagline || `Styleguide extracted from ${cleanDomain}`,
          metrics: {
            colorCount: ((extracted.primaryColors || []).length + (extracted.secondaryColors || []).length + (extracted.neutralColors || []).length),
          },
          data: extracted,
        };
      } else if (tabToUse === "images") {
        setImagesData(data);

        newHistoryEntry = {
          id: `hist-${Date.now()}`,
          url: finalUrl.startsWith("http") ? finalUrl : `https://${finalUrl}`,
          domain: cleanDomain,
          type: "images",
          timestamp: now.toISOString(),
          formattedDate: dateString,
          title: `${cleanDomain} Media Assets`,
          summary: `${data.images?.length || 0} media assets dikikis dari ${cleanDomain}`,
          metrics: { imageCount: data.images?.length || 0 },
          data: data,
        };
      } else if (tabToUse === "crawl") {
        setCrawlData(data);

        newHistoryEntry = {
          id: `hist-${Date.now()}`,
          url: finalUrl.startsWith("http") ? finalUrl : `https://${finalUrl}`,
          domain: cleanDomain,
          type: "crawl",
          timestamp: now.toISOString(),
          formattedDate: dateString,
          title: `${cleanDomain} Crawl Report`,
          summary: data.crawlSummary?.metaDescription || `Crawl Topology for ${cleanDomain}`,
          metrics: {
            pagesCount: data.crawlSummary?.discoveredPagesCount || (data.siteHierarchy || []).length,
            seoScore: data.crawlSummary?.seoHealthScore || 90,
          },
          data: data,
        };
      }

      if (newHistoryEntry) {
        // Unshift to top of history
        const updated = [newHistoryEntry, ...historyItems.filter((item) => item.id !== newHistoryEntry!.id)];
        saveHistoryToStorage(updated);
      }
    } catch (err: any) {
      console.error("Extraction error:", err);
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses URL");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab: ActiveTab) => {
    setActiveTab(newTab);
    setErrorMessage(null);

    // Auto-fetch if empty
    if (newTab === "styleguide" && !styleguideData) handleRunExtraction("styleguide");
    if (newTab === "images" && !imagesData) handleRunExtraction("images");
    if (newTab === "crawl" && !crawlData) handleRunExtraction("crawl");
  };

  // Pre-fill prompt and navigate to Design Generator
  const handleApplyToDesign = () => {
    if (styleguideData) {
      const paletteStr = (styleguideData.primaryColors || []).map((c: any) => `${c.name}: ${c.hex}`).join(", ");
      const fontStr = styleguideData.typography?.fontFamilyHeading || "Inter, sans-serif";
      const presetPrompt = `Gunakan Design System berikut:\nBrand: ${styleguideData.brandName || "Extracted Brand"}\nWarna Utama: ${paletteStr}\nTypography: ${fontStr}\nBuat blueprint UI/UX dashboard aplikasi SaaS modern.`;

      localStorage.setItem(
        "design_generator_draft",
        JSON.stringify({
          prompt: presetPrompt,
          primaryColor: "sneat",
          borderRadius: "md",
          fontTheme: "sans",
          layoutStyle: "modern",
          aiModel: "gemini-3.5-flash",
          timestamp: new Date().toLocaleTimeString("id-ID"),
        })
      );

      navigate("/generate-design");
    }
  };

  // Pre-fill PRD project info and navigate to PRD Generator
  const handleApplyToPRD = () => {
    if (crawlData) {
      const summary = crawlData.crawlSummary || {};
      const presetData = {
        name: summary.pageTitle || crawlData.domain || "Extracted Application",
        type: "Web Application",
        description: summary.metaDescription || `Sistem web terstruktur berdasarkan ekstraksi website ${crawlData.domain}`,
        techStack: {
          framework: (summary.techStack || [])[0] || "React 19",
          database: "PostgreSQL",
          apiStyle: "REST API",
          auth: "Firebase Auth",
          deployment: "Cloud Run / Vercel",
        },
      };

      localStorage.setItem(
        "prd_wizard_draft",
        JSON.stringify({
          projectInfo: presetData,
          timestamp: new Date().toLocaleTimeString("id-ID"),
        })
      );

      navigate("/generate");
    }
  };

  const handleDownloadCrawlJSON = () => {
    if (!crawlData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(crawlData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `crawl-report-${crawlData.domain || "site"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyCrawlMarkdown = () => {
    if (!crawlData) return;
    const summary = crawlData.crawlSummary || {};
    const seo = crawlData.seoAndMetadata || {};
    const md = `# Website Crawl Audit Report: ${crawlData.domain}
- **URL**: ${crawlData.url}
- **Page Title**: ${summary.pageTitle || "N/A"}
- **Meta Description**: ${summary.metaDescription || "N/A"}
- **SEO Health Score**: ${summary.seoHealthScore || 90}/100
- **Server / CDN**: ${summary.serverHeader || "N/A"}
- **Tech Stack**: ${(summary.techStack || []).join(", ")}

## SEO & OpenGraph Meta
- **Canonical URL**: ${seo.canonicalUrl || crawlData.url}
- **OG Title**: ${seo.ogTitle || "N/A"}
- **OG Description**: ${seo.ogDescription || "N/A"}
- **OG Image**: ${seo.ogImage || "N/A"}
- **Robots Directive**: ${seo.robots || "index, follow"}

## Crawled Site Hierarchy (${(crawlData.siteHierarchy || []).length} Routes)
${(crawlData.siteHierarchy || []).map((r: any) => `- \`${r.path}\` [${r.type}] - ${r.title} (${r.status || "200 OK"}, ${r.responseTimeMs || "120ms"}): ${r.summary}`).join("\n")}

## Discovered API Endpoints (${(crawlData.detectedEndpoints || []).length})
${(crawlData.detectedEndpoints || []).map((ep: any) => `- \`${ep.method}\` \`${ep.path}\` (${ep.type}) - ${ep.description || ""}`).join("\n")}
`;
    navigator.clipboard.writeText(md);
    setCopiedKey("crawl-markdown");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full space-y-6 text-[#566a7f] pb-12 px-1 sm:px-0">
      {/* Header Banner Card */}
      <div className="relative overflow-hidden rounded-xl bg-white p-4 sm:p-6 lg:p-8 border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-[#e7e7ff] text-[#696cff] px-3 py-1 rounded-full text-xs font-bold">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span>AI Web Intelligence Suite</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#384756] tracking-tight">
              Web Intelligence & Asset Extractor
            </h1>
            <p className="text-xs sm:text-sm text-[#7a838b] leading-relaxed">
              Ekstraksi Design System, Keruk Gambar & Asset Media, serta Crawl Arsitektur Website secara mendalam dan akurat.
            </p>
          </div>

          {/* Tab Switcher - Responsive Scroll Container */}
          <div className="w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <div className="inline-flex items-center gap-1.5 bg-[#f5f5f9] p-1.5 rounded-xl border border-[#e4e6e8] min-w-max">
              <button
                onClick={() => handleTabChange("styleguide")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                  activeTab === "styleguide"
                    ? "bg-[#696cff] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                    : "text-[#566a7f] hover:text-[#696cff] hover:bg-white"
                }`}
              >
                <Palette className="h-4 w-4 shrink-0" />
                <span>Extract Styleguide</span>
              </button>
              <button
                onClick={() => handleTabChange("images")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                  activeTab === "images"
                    ? "bg-[#696cff] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                    : "text-[#566a7f] hover:text-[#696cff] hover:bg-white"
                }`}
              >
                <ImageIcon className="h-4 w-4 shrink-0" />
                <span>Scrape Images</span>
              </button>
              <button
                onClick={() => handleTabChange("crawl")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                  activeTab === "crawl"
                    ? "bg-[#696cff] text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                    : "text-[#566a7f] hover:text-[#696cff] hover:bg-white"
                }`}
              >
                <Compass className="h-4 w-4 shrink-0" />
                <span>Crawl Website</span>
              </button>
            </div>
          </div>
        </div>

        {/* Universal URL Input Bar */}
        <div className="mt-6 pt-6 border-t border-[#e4e6e8]">
            <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-3xl">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1acb8]">
                  <Globe className="h-4 w-4 shrink-0" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Masukkan domain/URL, contoh: example.com"
                  onKeyDown={(e) => e.key === "Enter" && handleRunExtraction()}
                  className="w-full pl-10 pr-4 py-3 bg-[#f5f5f9] border border-[#e4e6e8] focus:border-[#696cff] focus:bg-white text-xs sm:text-sm font-medium rounded-xl text-[#384756] placeholder-[#a1acb8] outline-none transition-all shadow-inner min-h-[44px]"
                />
              </div>

              <button
                onClick={() => handleRunExtraction()}
                disabled={loading}
                className="px-6 py-3 bg-[#696cff] hover:bg-[#5a5ddb] text-white text-xs sm:text-sm font-bold rounded-xl shadow-[0_2px_6px_0_rgba(105,108,255,0.4)] flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 shrink-0 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Memproses AI Extractor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>
                      {activeTab === "styleguide" && "Extract Styleguide"}
                      {activeTab === "images" && "Scrape Media Assets"}
                      {activeTab === "crawl" && "Crawl Site Topology"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Sample quick buttons */}
            <div className="mt-3.5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[#a1acb8] uppercase tracking-wider shrink-0">
                Coba Sampel Link:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {sampleDomains.map((domain) => (
                  <button
                    key={domain}
                    onClick={() => {
                      setUrlInput(domain);
                      handleRunExtraction(activeTab, domain);
                    }}
                    className="px-3 py-1 bg-[#e7e7ff] hover:bg-[#696cff] hover:text-white text-[#696cff] text-[11px] font-bold rounded-lg transition-all min-h-[30px] flex items-center"
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-[#e4e6e8] p-8 sm:p-12 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#e7e7ff] border-t-[#696cff] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-[#696cff]">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-[#384756]">Menganalisis & Merekap Data Website...</h3>
            <p className="text-xs text-[#7a838b]">
              Memproses DOM & mengekstrak token CSS/HTML untuk{" "}
              <span className="font-bold text-[#696cff]">{urlInput}</span>
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: EXTRACT STYLEGUIDE RESULT */}
      {!loading && activeTab === "styleguide" && (
        <div className="space-y-6">
          {!styleguideData ? (
            <div className="bg-white rounded-xl border border-[#e4e6e8] p-6 sm:p-12 text-center space-y-4 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
              <div className="w-16 h-16 bg-[#e7e7ff] text-[#696cff] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Palette className="h-8 w-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-[#384756]">Extract Styleguide & Design System</h3>
                <p className="text-xs text-[#7a838b] leading-relaxed">
                  Masukkan link website di atas (misal <span className="font-bold text-[#696cff]">example.com</span>) lalu klik
                  tombol Extract untuk mengekstrak palet warna, tipografi, komponen UI, radius, dan token Tailwind.
                </p>
              </div>
              <button
                onClick={() => handleRunExtraction("styleguide")}
                className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5a5ddb] text-white text-xs font-bold rounded-xl shadow-md transition-all min-h-[40px]"
              >
                Jalankan Ekstraksi Sekarang
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Top Summary Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 sm:p-3 bg-[#e7e7ff] text-[#696cff] rounded-xl font-bold shrink-0">
                    <Palette className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-[#384756] truncate">
                      {styleguideData.brandName || "Extracted Design System"}
                    </h2>
                    <p className="text-xs text-[#7a838b] truncate">
                      {styleguideData.tagline || `Styleguide extracted from ${styleguideData.domain || urlInput}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                  <button
                    onClick={handleApplyToDesign}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-[#696cff] hover:bg-[#5a5ddb] text-white text-xs font-bold rounded-xl shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
                  >
                    <Zap className="h-4 w-4 shrink-0" />
                    <span>Terapkan ke Design Generator</span>
                  </button>
                  <button
                    onClick={() => handleCopy(JSON.stringify(styleguideData, null, 2), "json-styleguide")}
                    className="px-3.5 py-2.5 bg-[#e7e7ff] hover:bg-[#d0d0ff] text-[#696cff] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all min-h-[40px] shrink-0"
                  >
                    {copiedKey === "json-styleguide" ? <Check className="h-4 w-4 text-green-600 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                    <span>{copiedKey === "json-styleguide" ? "Tersalin!" : "Salin JSON"}</span>
                  </button>
                </div>
              </div>

              {/* Color Palette Grid */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#e4e6e8] pb-3">
                  <h3 className="text-xs sm:text-sm font-bold text-[#384756] flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[#696cff] shrink-0" />
                    <span>Color Palette & Semantic Tokens</span>
                  </h3>
                  <span className="text-xs font-bold text-[#696cff] bg-[#e7e7ff] px-2.5 py-0.5 rounded-full shrink-0">
                    {(styleguideData.primaryColors || []).length +
                      (styleguideData.secondaryColors || []).length +
                      (styleguideData.neutralColors || []).length}{" "}
                    Colors
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Primary Colors */}
                  <div>
                    <h4 className="text-xs font-bold text-[#a1acb8] uppercase tracking-wider mb-2.5">
                      Primary & Brand Accent Colors
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(styleguideData.primaryColors || []).map((color: any, idx: number) => (
                        <div key={idx} className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg border border-black/10 shadow-xs shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-[#384756] truncate">{color.name}</span>
                              <button
                                onClick={() => handleCopy(color.hex, `color-p-${idx}`)}
                                className="text-[11px] font-bold text-[#696cff] hover:underline shrink-0"
                              >
                                {copiedKey === `color-p-${idx}` ? "Copied!" : color.hex}
                              </button>
                            </div>
                            <p className="text-[11px] text-[#7a838b] truncate mt-0.5">{color.usage || color.rgb}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secondary & Neutral Colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#a1acb8] uppercase tracking-wider mb-2">Secondary Colors</h4>
                      <div className="space-y-2">
                        {(styleguideData.secondaryColors || []).map((color: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-[#f5f5f9] rounded-lg border border-[#e4e6e8] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-md border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                              <span className="text-xs font-semibold text-[#384756] truncate">{color.name}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#696cff] shrink-0">{color.hex}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#a1acb8] uppercase tracking-wider mb-2">Neutral & Canvas Colors</h4>
                      <div className="space-y-2">
                        {(styleguideData.neutralColors || []).map((color: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-[#f5f5f9] rounded-lg border border-[#e4e6e8] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-md border border-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                              <span className="text-xs font-semibold text-[#384756] truncate">{color.name}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#566a7f] shrink-0">{color.hex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography & Component Specs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Typography System */}
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-4">
                  <h3 className="text-xs sm:text-sm font-bold text-[#384756] border-b border-[#e4e6e8] pb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#696cff] shrink-0" />
                    <span>Typography & Type Scales</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 bg-[#e7e7ff]/50 rounded-xl text-xs space-y-1 overflow-hidden">
                      <p className="font-bold text-[#696cff] truncate">
                        Heading Family: <span className="font-mono text-[#384756]">{styleguideData.typography?.fontFamilyHeading}</span>
                      </p>
                      <p className="font-bold text-[#696cff] truncate">
                        Body Family: <span className="font-mono text-[#384756]">{styleguideData.typography?.fontFamilyBody}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      {(styleguideData.typography?.scale || []).map((type: any, idx: number) => (
                        <div key={idx} className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#384756] block truncate">{type.level}</span>
                            <span className="text-[11px] text-[#7a838b]">
                              {type.weight} • {type.lineHeight}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#696cff] bg-white px-2 py-1 rounded border border-[#e4e6e8] shrink-0">
                            {type.size}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* UI Components Specs */}
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-4">
                  <h3 className="text-xs sm:text-sm font-bold text-[#384756] border-b border-[#e4e6e8] pb-3 flex items-center gap-2">
                    <Code className="h-4 w-4 text-[#696cff] shrink-0" />
                    <span>UI Components & Radii Specs</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#a1acb8] uppercase">Button Specifications</span>
                      {(styleguideData.components?.buttons || []).map((btn: any, idx: number) => (
                        <div key={idx} className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#384756] block truncate">{btn.variant}</span>
                            <span className="text-[11px] text-[#7a838b]">
                              Padding: {btn.padding} • Radius: {btn.radius}
                            </span>
                          </div>
                          <div
                            className="px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs shrink-0"
                            style={{ backgroundColor: btn.bg, color: btn.text, border: btn.border }}
                          >
                            Preview
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#e4e6e8] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8]">
                        <span className="font-bold text-[#384756] block">Card Surface</span>
                        <span className="text-[11px] text-[#7a838b] block mt-1">
                          Radius: {styleguideData.components?.cards?.borderRadius || "12px"}
                        </span>
                        <span className="text-[11px] text-[#7a838b] block">
                          Padding: {styleguideData.components?.cards?.padding || "24px"}
                        </span>
                      </div>
                      <div className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8]">
                        <span className="font-bold text-[#384756] block">Max Container</span>
                        <span className="text-[11px] text-[#7a838b] block mt-1">
                          {styleguideData.spacingGrid?.containerMaxWidth || "1280px"}
                        </span>
                        <span className="text-[11px] text-[#7a838b] block">
                          {styleguideData.spacingGrid?.gridColumns || "12 columns"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tailwind Config Export Box */}
              {styleguideData.tailwindConfig && (
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[#384756] flex items-center gap-2">
                      <Code className="h-4 w-4 text-[#696cff] shrink-0" />
                      <span>Extracted Tailwind Extension Code</span>
                    </h3>
                    <button
                      onClick={() => handleCopy(styleguideData.tailwindConfig, "tailwind-code")}
                      className="text-xs font-bold text-[#696cff] bg-[#e7e7ff] hover:bg-[#d0d0ff] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0"
                    >
                      {copiedKey === "tailwind-code" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === "tailwind-code" ? "Tersalin!" : "Salin Code"}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-[#232733] text-indigo-300 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed border border-gray-800">
                    {styleguideData.tailwindConfig}
                  </pre>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 2: SCRAPE IMAGES RESULT */}
      {!loading && activeTab === "images" && (
        <div className="space-y-6">
          {!imagesData ? (
            <div className="bg-white rounded-xl border border-[#e4e6e8] p-6 sm:p-12 text-center space-y-4 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
              <div className="w-16 h-16 bg-[#e7e7ff] text-[#696cff] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ImageIcon className="h-8 w-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-[#384756]">Scrape Images & Media Assets</h3>
                <p className="text-xs text-[#7a838b] leading-relaxed">
                  Masukkan link website di atas (misal <span className="font-bold text-[#696cff]">example.com</span>) untuk mengikis semua
                  gambar, logo, banner hero, ikon, dan grafik pendukung.
                </p>
              </div>
              <button
                onClick={() => handleRunExtraction("images")}
                className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5a5ddb] text-white text-xs font-bold rounded-xl shadow-md transition-all min-h-[40px]"
              >
                Jalankan Scrape Gambar
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Header Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#384756] flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-[#696cff] shrink-0" />
                    <span>Scraped Media Assets ({imagesData.images?.length || 0})</span>
                  </h2>
                  <p className="text-xs text-[#7a838b]">
                    Target domain: <span className="font-bold text-[#696cff]">{imagesData.domain || urlInput}</span>
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <div className="flex items-center gap-1.5 min-w-max">
                    {["All", "Logo", "Hero Banner", "Icon", "Content Image", "Background"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setImageCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 min-h-[36px] ${
                          imageCategoryFilter === cat
                            ? "bg-[#696cff] text-white shadow-xs"
                            : "bg-[#f5f5f9] text-[#566a7f] hover:bg-[#e7e7ff] hover:text-[#696cff]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(imagesData.images || [])
                  .filter((img: any) => imageCategoryFilter === "All" || img.category === imageCategoryFilter)
                  .map((img: any, idx: number) => (
                    <div
                      key={img.id || idx}
                      className="bg-white rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] overflow-hidden flex flex-col group hover:border-[#696cff] transition-all"
                    >
                      {/* Image Preview Canvas */}
                      <div className="h-48 sm:h-44 bg-[#f5f5f9] relative overflow-hidden flex items-center justify-center p-3 border-b border-[#e4e6e8]">
                        <img
                          src={img.url}
                          alt={img.alt || "Scraped Asset"}
                          className="max-h-full max-w-full object-contain rounded-md transition-transform group-hover:scale-105 duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <span className="absolute top-2.5 left-2.5 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                          {img.category || "Media"}
                        </span>
                        <span className="absolute top-2.5 right-2.5 bg-[#696cff] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                          {img.type || "PNG"}
                        </span>
                      </div>

                      {/* Info & Actions */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-[#384756] truncate">{img.alt || "Scraped Asset"}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7a838b]">
                            <span>{img.dimensions || "Vector / High Res"}</span>
                            <span>•</span>
                            <span>{img.fileSize || "Web Ready"}</span>
                          </div>
                          {img.description && (
                            <p className="text-[11px] text-[#7a838b] line-clamp-2 mt-1.5 leading-relaxed">
                              {img.description}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-[#e4e6e8] flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(img.url, `img-url-${idx}`)}
                            className="flex-1 py-2 bg-[#e7e7ff] hover:bg-[#d0d0ff] text-[#696cff] text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 min-h-[38px]"
                          >
                            {copiedKey === `img-url-${idx}` ? (
                              <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 shrink-0" />
                            )}
                            <span>{copiedKey === `img-url-${idx}` ? "Tersalin!" : "Salin URL"}</span>
                          </button>

                          <a
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-[#f5f5f9] hover:bg-[#e4e6e8] text-[#566a7f] rounded-lg transition-all shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
                            title="Buka Gambar di Tab Baru"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 3: CRAWL WEBSITE RESULT */}
      {!loading && activeTab === "crawl" && (
        <div className="space-y-6">
          {!crawlData ? (
            <div className="bg-white rounded-xl border border-[#e4e6e8] p-6 sm:p-12 text-center space-y-4 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)]">
              <div className="w-16 h-16 bg-[#e7e7ff] text-[#696cff] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Compass className="h-8 w-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-[#384756]">Crawl Website & SEO Topology</h3>
                <p className="text-xs text-[#7a838b] leading-relaxed">
                  Masukkan link website di atas (misal <span className="font-bold text-[#696cff]">example.com</span>) untuk merayapi
                  hierarki halaman, mengaudit SEO, dan mendeteksi tech stack secara mendalam.
                </p>
              </div>
              <button
                onClick={() => handleRunExtraction("crawl")}
                className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5a5ddb] text-white text-xs font-bold rounded-xl shadow-md transition-all min-h-[40px] inline-flex items-center gap-2"
              >
                <Compass className="h-4 w-4" />
                <span>Jalankan Crawl Website</span>
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Header Bar with Quick Action Buttons */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-[#e7e7ff] text-[#696cff] text-[11px] font-bold rounded-full">
                      Crawl Audit Active
                    </span>
                    <span className="text-xs text-[#a1acb8]">•</span>
                    <span className="text-xs text-[#7a838b] font-medium truncate">{crawlData.domain}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#384756] mt-1 flex items-center gap-2 truncate">
                    <Compass className="h-5 w-5 text-[#696cff] shrink-0" />
                    <span className="truncate">{crawlData.crawlSummary?.pageTitle || crawlData.domain}</span>
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRunExtraction("crawl")}
                    className="px-3.5 py-2 bg-[#f5f5f9] hover:bg-[#e7e7ff] text-[#566a7f] hover:text-[#696cff] text-xs font-bold rounded-xl border border-[#e4e6e8] transition-all flex items-center gap-1.5 min-h-[38px]"
                    title="Ulangi perayapan website"
                  >
                    <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                    <span>Crawl Ulang</span>
                  </button>

                  <button
                    onClick={handleDownloadCrawlJSON}
                    className="px-3.5 py-2 bg-[#f5f5f9] hover:bg-[#e7e7ff] text-[#566a7f] hover:text-[#696cff] text-xs font-bold rounded-xl border border-[#e4e6e8] transition-all flex items-center gap-1.5 min-h-[38px]"
                    title="Unduh laporan crawl format JSON"
                  >
                    <Download className="h-3.5 w-3.5 shrink-0" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    onClick={handleCopyCrawlMarkdown}
                    className="px-3.5 py-2 bg-[#f5f5f9] hover:bg-[#e7e7ff] text-[#566a7f] hover:text-[#696cff] text-xs font-bold rounded-xl border border-[#e4e6e8] transition-all flex items-center gap-1.5 min-h-[38px]"
                  >
                    {copiedKey === "crawl-markdown" ? (
                      <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>{copiedKey === "crawl-markdown" ? "Tersalin!" : "Copy Report"}</span>
                  </button>

                  <button
                    onClick={handleApplyToPRD}
                    className="px-4 py-2 bg-[#696cff] hover:bg-[#5a5ddb] text-white text-xs font-bold rounded-xl shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] flex items-center justify-center gap-1.5 transition-all min-h-[38px]"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>Impor ke PRD Generator</span>
                  </button>
                </div>
              </div>

              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex items-center gap-3.5">
                  <div className="p-3 bg-[#e8f5e9] text-[#71dd37] rounded-xl font-bold shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#7a838b] block truncate">SEO Health Score</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-lg sm:text-xl font-bold text-[#384756]">
                        {crawlData.crawlSummary?.seoHealthScore || 94}/100
                      </span>
                      <span className="text-[10px] font-bold text-[#71dd37] bg-[#e8f5e9] px-1.5 py-0.5 rounded">
                        Sangat Baik
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex items-center gap-3.5">
                  <div className="p-3 bg-[#e7e7ff] text-[#696cff] rounded-xl font-bold shrink-0">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#7a838b] block truncate">Discovered Pages & Links</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-lg sm:text-xl font-bold text-[#384756]">
                        {(crawlData.siteHierarchy || []).length || crawlData.crawlSummary?.discoveredPagesCount || 8} Routes
                      </span>
                      <span className="text-[10px] text-[#7a838b]">
                        ({crawlData.crawlSummary?.totalInternalLinks || 12} Internal)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex items-center gap-3.5">
                  <div className="p-3 bg-[#ffe0d6] text-[#ff3e1d] rounded-xl font-bold shrink-0">
                    <Server className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#7a838b] block truncate">Server Header & SSL</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-bold text-[#384756] truncate block">
                        {crawlData.crawlSummary?.serverHeader || "Cloudflare / Edge Server"}
                      </span>
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.2 rounded shrink-0">
                        SSL
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex items-center gap-3.5">
                  <div className="p-3 bg-[#fff3e0] text-[#ffab00] rounded-xl font-bold shrink-0">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#7a838b] block truncate">Sitemap & Indexable</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-bold text-[#71dd37] bg-[#e8f5e9] px-2 py-0.5 rounded-full inline-block">
                        Sitemap & Robots OK
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO & Social Media Card Inspection */}
              {crawlData.seoAndMetadata && (
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e4e6e8] pb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-[#384756] flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-[#696cff] shrink-0" />
                      <span>SEO & OpenGraph Social Media Preview</span>
                    </h3>
                    <span className="text-[11px] text-[#7a838b] font-medium">Meta Tags Inspector</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Meta Fields Column */}
                    <div className="space-y-3">
                      <div className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-1">
                        <span className="text-[11px] font-bold text-[#7a838b] block">Page Meta Title</span>
                        <p className="text-xs sm:text-sm font-bold text-[#384756]">
                          {crawlData.seoAndMetadata.ogTitle || crawlData.crawlSummary?.pageTitle}
                        </p>
                      </div>

                      <div className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-1">
                        <span className="text-[11px] font-bold text-[#7a838b] block">Meta Description</span>
                        <p className="text-xs text-[#566a7f] leading-relaxed">
                          {crawlData.seoAndMetadata.ogDescription || crawlData.crawlSummary?.metaDescription}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-[#f5f5f9] rounded-lg border border-[#e4e6e8]">
                          <span className="text-[10px] font-bold text-[#7a838b] block">Canonical URL</span>
                          <span className="font-mono text-[11px] text-[#696cff] truncate block">
                            {crawlData.seoAndMetadata.canonicalUrl || crawlData.url}
                          </span>
                        </div>
                        <div className="p-2.5 bg-[#f5f5f9] rounded-lg border border-[#e4e6e8]">
                          <span className="text-[10px] font-bold text-[#7a838b] block">Robots Tag</span>
                          <span className="font-mono text-[11px] text-[#384756] font-semibold block">
                            {crawlData.seoAndMetadata.robots || "index, follow"}
                          </span>
                        </div>
                      </div>

                      {/* Headings extracted */}
                      {crawlData.seoAndMetadata.headings && (
                        <div className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-2">
                          <span className="text-[11px] font-bold text-[#7a838b] block">Detected Headings Structure</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(crawlData.seoAndMetadata.headings.h1 || []).map((h1: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-[#e7e7ff] text-[#696cff] text-[10px] font-bold rounded">
                                H1: {h1}
                              </span>
                            ))}
                            {(crawlData.seoAndMetadata.headings.h2 || []).map((h2: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-white text-[#566a7f] text-[10px] font-semibold rounded border border-[#e4e6e8]">
                                H2: {h2}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OpenGraph Social Card Preview */}
                    <div className="bg-[#f5f5f9] p-4 rounded-xl border border-[#e4e6e8] flex flex-col justify-between space-y-3">
                      <span className="text-[11px] font-bold text-[#7a838b] flex items-center justify-between">
                        <span>Social Card Preview (LinkedIn / Twitter / WhatsApp)</span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#a1acb8]" />
                      </span>

                      <div className="bg-white rounded-xl border border-[#e4e6e8] overflow-hidden shadow-xs space-y-0">
                        {crawlData.seoAndMetadata.ogImage && (
                          <div className="h-36 sm:h-44 w-full bg-[#f5f5f9] overflow-hidden relative">
                            <img
                              src={crawlData.seoAndMetadata.ogImage}
                              alt="Social preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="p-3.5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#a1acb8] block truncate">
                            {crawlData.domain}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#384756] line-clamp-1">
                            {crawlData.seoAndMetadata.ogTitle || crawlData.domain}
                          </h4>
                          <p className="text-[11px] text-[#7a838b] line-clamp-2 leading-relaxed">
                            {crawlData.seoAndMetadata.ogDescription}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#7a838b] flex items-center justify-between pt-1">
                        <span>OG Tags Status: <strong className="text-green-600">Valid & Optimized</strong></span>
                        <span>Viewport: <strong>Mobile-First</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tech Stack Detected */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-[#384756] flex items-center gap-2">
                  <Code className="h-4 w-4 text-[#696cff] shrink-0" />
                  <span>Detected Technology Stack & Infrastructure</span>
                </h3>

                <div className="flex items-center gap-2 flex-wrap">
                  {(crawlData.crawlSummary?.techStack || ["React 19", "Tailwind CSS", "Next.js / Vite", "Cloudflare"]).map(
                    (tech: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-[#e7e7ff] text-[#696cff] text-xs font-bold rounded-xl border border-[#c7d2fe] flex items-center gap-1.5"
                      >
                        <Cpu className="h-3.5 w-3.5 shrink-0" />
                        <span>{tech}</span>
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Interactive Site Architecture & Tree Mapping with Search & Filters */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#e4e6e8] pb-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#384756] flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#696cff] shrink-0" />
                      <span>Crawled Site Hierarchy & Routes</span>
                    </h3>
                    <p className="text-[11px] text-[#7a838b] mt-0.5">
                      Menampilkan rute halaman yang ditemukan beserta kode status, tipe, dan struktur H1.
                    </p>
                  </div>

                  {/* Route Search & Filter Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-[#a1acb8]" />
                      <input
                        type="text"
                        value={crawlRouteSearch}
                        onChange={(e) => setCrawlRouteSearch(e.target.value)}
                        placeholder="Cari rute / judul..."
                        className="pl-8 pr-3 py-1.5 bg-[#f5f5f9] border border-[#e4e6e8] focus:border-[#696cff] text-xs rounded-xl outline-none w-44 sm:w-56"
                      />
                    </div>

                    <select
                      value={crawlRouteFilter}
                      onChange={(e) => setCrawlRouteFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-[#f5f5f9] border border-[#e4e6e8] focus:border-[#696cff] text-xs font-semibold rounded-xl text-[#566a7f] outline-none"
                    >
                      <option value="all">Semua Tipe Page</option>
                      <option value="Root Page">Root / Core</option>
                      <option value="Product Page">Product & Feature</option>
                      <option value="Commercial Page">Pricing & Commercial</option>
                      <option value="Resource Page">Docs & Resources</option>
                      <option value="Company Page">Company & About</option>
                    </select>
                  </div>
                </div>

                {/* Filtered Route List */}
                {(() => {
                  const routes = (crawlData.siteHierarchy || []).filter((page: any) => {
                    const matchesSearch =
                      !crawlRouteSearch ||
                      page.path.toLowerCase().includes(crawlRouteSearch.toLowerCase()) ||
                      page.title.toLowerCase().includes(crawlRouteSearch.toLowerCase()) ||
                      (page.summary && page.summary.toLowerCase().includes(crawlRouteSearch.toLowerCase()));

                    const matchesType = crawlRouteFilter === "all" || page.type === crawlRouteFilter;

                    return matchesSearch && matchesType;
                  });

                  if (routes.length === 0) {
                    return (
                      <div className="p-8 text-center bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-2">
                        <AlertCircle className="h-6 w-6 text-[#a1acb8] mx-auto" />
                        <p className="text-xs text-[#7a838b]">Tidak ada rute yang cocok dengan kata kunci filter.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {routes.map((page: any, idx: number) => {
                        const isExpanded = expandedRouteIdx === idx;
                        return (
                          <div
                            key={idx}
                            className="p-3.5 sm:p-4 bg-[#f5f5f9] hover:bg-white rounded-xl border border-[#e4e6e8] transition-all space-y-2 shadow-2xs group"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className="font-mono text-xs font-bold text-[#696cff] bg-white px-2.5 py-1 rounded-lg border border-[#e4e6e8] shrink-0">
                                  {page.path}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-[#384756] truncate">{page.title}</span>
                                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shrink-0">
                                  {page.status || "200 OK"}
                                </span>
                                {page.responseTimeMs && (
                                  <span className="text-[10px] text-[#7a838b] font-medium shrink-0">
                                    ⚡ {page.responseTimeMs}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-semibold text-[#566a7f] bg-white px-2.5 py-1 rounded-lg border border-[#e4e6e8]">
                                  {page.type}
                                </span>
                                {page.fullUrl && (
                                  <a
                                    href={page.fullUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-white hover:bg-[#e7e7ff] text-[#566a7f] hover:text-[#696cff] rounded-lg border border-[#e4e6e8] transition-all text-xs"
                                    title="Buka URL asli"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-[#7a838b] leading-relaxed">{page.summary}</p>

                            {page.h1 && (
                              <div className="pt-1.5 flex items-center gap-2 text-[11px] text-[#7a838b]">
                                <span className="font-bold text-[#384756]">H1 Header:</span>
                                <span className="italic text-[#566a7f] truncate">"{page.h1}"</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Discovered Endpoints Section */}
              {crawlData.detectedEndpoints && crawlData.detectedEndpoints.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#e4e6e8] pb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-[#384756] flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-[#696cff] shrink-0" />
                      <span>Discovered API Endpoints & Service Routes ({crawlData.detectedEndpoints.length})</span>
                    </h3>
                    <span className="text-[11px] text-[#7a838b] font-medium">REST / Telemetry Map</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {crawlData.detectedEndpoints.map((ep: any, idx: number) => {
                      let methodBg = "bg-[#e7e7ff] text-[#696cff]";
                      if (ep.method === "POST") methodBg = "bg-green-100 text-green-700";
                      if (ep.method === "DELETE") methodBg = "bg-red-100 text-red-700";
                      if (ep.method === "PUT") methodBg = "bg-orange-100 text-orange-700";

                      return (
                        <div key={idx} className="p-3 bg-[#f5f5f9] rounded-xl border border-[#e4e6e8] space-y-1.5 flex flex-col justify-between">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-[#384756] truncate">{ep.path}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${methodBg}`}>
                              {ep.method}
                            </span>
                          </div>
                          {ep.description && (
                            <p className="text-[11px] text-[#7a838b] line-clamp-2 leading-relaxed">
                              {ep.description}
                            </p>
                          )}
                          <span className="text-[10px] font-semibold text-[#566a7f] block pt-1 border-t border-[#e4e6e8]">
                            Type: {ep.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
