import React, { useState, useEffect } from "react";
import {
  PenTool,
  Wand2,
  RefreshCcw,
  Download,
  Copy,
  Check,
  FileDown,
  Share,
  Loader2,
  Smartphone,
  Monitor,
  Layout,
  Palette,
  Type,
  Settings as SettingsIcon,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  Code,
  FileText,
  Plus,
  Trash2,
  ChevronRight,
  Compass,
  CheckCircle2,
  Search,
  Bell,
  Menu,
  X,
  CheckSquare,
  Square,
  TrendingUp,
  CreditCard,
  Award,
  Users,
  RefreshCw,
  BarChart2,
  ShieldAlert,
  Sliders,
  ChevronDown,
  Save,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { ShareTemplateModal } from "../components/prd/ShareTemplateModal";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export function GenerateDesign() {
  const location = useLocation();
  const navigate = useNavigate();

  // Load draft from localStorage if present
  const getDraftData = () => {
    try {
      const saved = localStorage.getItem("design_generator_draft");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse design draft from localStorage:", e);
    }
    return null;
  };

  const draft = getDraftData();

  const [draftRestored, setDraftRestored] = useState(() => !!draft);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => draft?.timestamp || null);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [hideBanner, setHideBanner] = useState(false);
  const [manualDraftSaved, setManualDraftSaved] = useState(false);

  const [prompt, setPrompt] = useState(() => draft?.prompt || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(() => draft?.result || null);
  const [aiModel, setAiModel] = useState(() => draft?.aiModel || "gemini-3.5-flash");
  
  // Custom design configurations to stitch into prompt
  const [primaryColor, setPrimaryColor] = useState(() => draft?.primaryColor || "sneat");
  const [borderRadius, setBorderRadius] = useState(() => draft?.borderRadius || "md");
  const [fontTheme, setFontTheme] = useState(() => draft?.fontTheme || "sans");
  const [layoutStyle, setLayoutStyle] = useState(() => draft?.layoutStyle || "modern");

  // Template Selector States
  const [communityDesignTemplates, setCommunityDesignTemplates] = useState<any[]>([]);
  const [designImportedSuccessMsg, setDesignImportedSuccessMsg] = useState<string | null>(null);

  // Auto-save debounced effect for design generator
  useEffect(() => {
    const hasContent = prompt || result;
    if (!hasContent) return;

    setAutoSaveState("saving");

    const timer = setTimeout(() => {
      try {
        const timestamp = new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const draftData = {
          prompt,
          result,
          aiModel,
          primaryColor,
          borderRadius,
          fontTheme,
          layoutStyle,
          timestamp,
        };

        localStorage.setItem("design_generator_draft", JSON.stringify(draftData));
        setLastSavedTime(timestamp);
        setAutoSaveState("saved");
      } catch (err) {
        console.error("Auto-save design failed:", err);
        setAutoSaveState("idle");
      }
    }, 1500); // 1.5-second debounce

    return () => clearTimeout(timer);
  }, [prompt, result, aiModel, primaryColor, borderRadius, fontTheme, layoutStyle]);

  const handleStartFresh = () => {
    try {
      localStorage.removeItem("design_generator_draft");
    } catch (e) {}

    setPrompt("");
    setResult(null);
    setPrimaryColor("sneat");
    setBorderRadius("md");
    setFontTheme("sans");
    setLayoutStyle("modern");
    setAiModel("gemini-3.5-flash");
    setDraftRestored(false);
    setAutoSaveState("idle");
    setLastSavedTime(null);
  };

  const handleSaveManualDraft = () => {
    try {
      const timestamp = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const draftData = {
        prompt,
        result,
        aiModel,
        primaryColor,
        borderRadius,
        fontTheme,
        layoutStyle,
        timestamp,
      };

      localStorage.setItem("design_generator_draft", JSON.stringify(draftData));
      setLastSavedTime(timestamp);
      setAutoSaveState("saved");
      setManualDraftSaved(true);
      setTimeout(() => {
        setManualDraftSaved(false);
      }, 4000);
    } catch (err) {
      console.error("Manual save design draft failed:", err);
    }
  };

  useEffect(() => {
    const fetchCommunityDesignTemplates = async () => {
      try {
        const q = query(collection(db, "design_templates"), orderBy("updatedAt", "desc"));
        const snapshot = await getDocs(q);
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setCommunityDesignTemplates(list);
      } catch (e) {
        console.warn("Failed to fetch community design templates:", e);
      }
    };
    fetchCommunityDesignTemplates();
  }, []);

  const handleApplyDesignTemplate = (templateId: string, templateName: string) => {
    setDesignImportedSuccessMsg(null);
    if (templateId === "neobrutalist") {
      setPrompt("Sebuah aplikasi dashboard manajemen keuangan neo-brutalisme dengan border hitam tebal 3px, bayangan solid, layout bento grid dinamis, dan warna aksen kuning neon cerah. Setiap card memiliki kontras warna ekstrim dan menggunakan font monospaced tebal.");
      setPrimaryColor("yellow");
      setBorderRadius("none");
      setFontTheme("mono");
      setLayoutStyle("bento");
    } else if (templateId === "minimaldark") {
      setPrompt("Sebuah dashboard minimalis SaaS dark mode kelas dunia dengan latar belakang abu-abu arang sangat gelap (#090a0f) dan teks putih murni. Menggunakan aksen border tipis berkilau (glow), layout yang bernafas bebas dengan spasi lebar, dan grafik modern berwarna indigo lembut.");
      setPrimaryColor("slate");
      setBorderRadius("lg");
      setFontTheme("sans");
      setLayoutStyle("dashboard");
    } else if (templateId === "warmeditorial") {
      setPrompt("Platform butik e-commerce editorial hangat dengan latar belakang cream organik lembut, tipografi judul serif klasik yang anggun, tombol bulat anggun berwarna rosewood, dan galeri produk asimetris bersuasana tenang.");
      setPrimaryColor("rose");
      setBorderRadius("md");
      setFontTheme("serif");
      setLayoutStyle("minimalist");
    } else if (templateId === "cleantech") {
      setPrompt("Konsol pengembang bertema teknologi bersih (Clean Tech) dengan panel samping abu-abu slate tipis, skema warna biru elektrik yang profesional, indikator status online berdenyut, dan area log monospaced dengan rendering baris demi baris.");
      setPrimaryColor("blue");
      setBorderRadius("md");
      setFontTheme("mono");
      setLayoutStyle("console");
    } else if (templateId === "glassfintech") {
      setPrompt("Sistem e-wallet fintech futuristik dengan kartu kredit kaca transparan (glassmorphism), efek backdrop-blur tingkat tinggi, gradasi warna ungu-pink neon yang menawan, serta statistik alur kas mengambang dalam panel melayang.");
      setPrimaryColor("violet");
      setBorderRadius("xl");
      setFontTheme("sans");
      setLayoutStyle("modern");
    } else if (templateId === "corporate") {
      setPrompt("Dashboard portal B2B enterprise yang mengutamakan kepatuhan tinggi dan rasa aman. Menggunakan kombinasi warna putih bersih dan hijau emerald gelap, navigasi samping terstruktur rapi, tabel data padat dengan sorting intuitif.");
      setPrimaryColor("emerald");
      setBorderRadius("sm");
      setFontTheme("sans");
      setLayoutStyle("corporate");
    } else if (templateId === "playful") {
      setPrompt("Portal edukasi anak interaktif (EdTech) dengan tombol-tombol bulat penuh berwarna pastel amber ceria, card berisi tantangan mingguan dengan sudut tumpul berukuran ekstrim, serta lencana reward berwarna-warni yang menggemaskan.");
      setPrimaryColor("amber");
      setBorderRadius("full");
      setFontTheme("rounded");
      setLayoutStyle("playful");
    } else if (templateId === "cyberpunk") {
      setPrompt("Sistem konsol gaming cyberpunk geometris dengan sudut-sudut tajam miring, border neon berwarna magenta merah muda, teks grid berkedip acak, serta panel status reaktor daya fusi nuklir visual.");
      setPrimaryColor("pink");
      setBorderRadius("none");
      setFontTheme("mono");
      setLayoutStyle("cyberpunk");
    } else if (templateId === "wellness") {
      setPrompt("Aplikasi meditasi dan kesehatan holistik bertema organik segar dengan gradasi warna daun mint lembut, kartu riwayat tidur dengan sudut membulat lebar, serta layout asimetris santai yang bebas stres.");
      setPrimaryColor("green");
      setBorderRadius("lg");
      setFontTheme("sans");
      setLayoutStyle("cards");
    } else if (templateId === "aicopilot") {
      setPrompt("Workspace AI Copilot tercanggih dengan area chat mengalir yang bersih, gelembung balon responsif berwarna ungu gradasi, kolom input serbaguna bertabur partikel magis, dan feedback instan dari model bahasa.");
      setPrimaryColor("purple");
      setBorderRadius("lg");
      setFontTheme("sans");
      setLayoutStyle("ai-chat");
    } else {
      // Find inside communityDesignTemplates
      const matched = communityDesignTemplates.find(c => c.id === templateId);
      if (matched) {
        setPrompt(matched.prompt || matched.description || "");
        if (matched.primaryColor) setPrimaryColor(matched.primaryColor);
        if (matched.borderRadius) setBorderRadius(matched.borderRadius);
        if (matched.fontTheme) setFontTheme(matched.fontTheme);
        if (matched.layoutStyle) setLayoutStyle(matched.layoutStyle);
      }
    }
    setDesignImportedSuccessMsg(`Berhasil meng-import template design: "${templateName}"!`);
    setTimeout(() => setDesignImportedSuccessMsg(null), 4000);
  };

  // Interactive Simulator states
  const [simulatedTab, setSimulatedTab] = useState<"overview" | "features" | "settings">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [simulatedItems, setSimulatedItems] = useState<any[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modul 5x2 Interactive States
  const [profitVal, setProfitVal] = useState(12628);
  const [recentPayments, setRecentPayments] = useState<Array<{id: number, desc: string, val: string, isNegative: boolean}>>([
    { id: 1, desc: "Sistem GCP Cloud", val: "$850", isNegative: true },
    { id: 2, desc: "Gemini Pro API", val: "$156", isNegative: true },
    { id: 3, desc: "Stripe Gateway", val: "$42", isNegative: true },
  ]);
  const [salesVal, setSalesVal] = useState(4850);
  const [activeUsersVal, setActiveUsersVal] = useState(12480);
  const [latencyVal, setLatencyVal] = useState(12);
  const [isLatencyPinging, setIsLatencyPinging] = useState(false);
  const [todoTasks, setTodoTasks] = useState([
    { id: 1, text: "Kirim Dokumen PRD", completed: true },
    { id: 2, text: "Gunakan Warna Indigo Accent", completed: true },
    { id: 3, text: "Uji Grid 5x2 Responsif", completed: false },
  ]);
  const [activeAiModel, setActiveAiModel] = useState("Gemini 1.5 Flash");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [complianceLevel, setComplianceLevel] = useState("Sertifikasi AAA");
  const [isAuditingCompliance, setIsAuditingCompliance] = useState(false);

  // Helper to derive high fidelity mock content based on prompt input
  const getMockMetadata = () => {
    const p = (prompt || "").toLowerCase();
    
    let appName = "SaaS Workspace";
    let subtitle = "Pusat Kontrol Desain Sistem";
    let metricLabel = "Kunjungan Pengguna";
    let metricValue = "12,480 User";
    let metricSub = "▲ +18.4% bulan ini";
    let featureTitle = "Modul Desain";
    let defaultItems: Array<{ id: number, title: string, desc: string, completed: boolean, status: string, amount?: string }> = [
      { id: 1, title: "Sistem Integrasi Token", desc: "Mengikat token desain global secara realtime.", completed: true, status: "Selesai" },
      { id: 2, title: "Penjajakan Breakpoint", desc: "Menjamin presisi visual mobile-first.", completed: false, status: "Proses" },
      { id: 3, title: "Uji WCAG AAA", desc: "Kontras warna terjamin otomatis.", completed: true, status: "Selesai" }
    ];

    if (p.includes("sehat") || p.includes("mental") || p.includes("health") || p.includes("meditasi") || p.includes("tidur") || p.includes("psikolog") || p.includes("mood") || p.includes("tenang")) {
      appName = "AuraCare AI";
      subtitle = "Pelacak Kesehatan Mental & Meditasi";
      metricLabel = "Skor Ketenangan Pikiran";
      metricValue = "88 / 100";
      metricSub = "▲ Membaik 8% minggu ini";
      featureTitle = "Latihan Mental & Mood";
      defaultItems = [
        { id: 1, title: "Metode Bernapas 4-7-8", desc: "Latihan pernapasan dalam penurun kecemasan.", completed: true, status: "Selesai" },
        { id: 2, title: "Analisis Siklus Tidur REM", desc: "Pelacak tidur malam dengan sensor akselerometer.", completed: false, status: "Proses" },
        { id: 3, title: "Jurnal Mood & Emosi Harian", desc: "Analisis emosi harian berbasis NLP cerdas.", completed: true, status: "Selesai" }
      ];
    } else if (p.includes("sneat") || p.includes("bootstrap") || p.includes("admin") || p.includes("dashboard") || p.includes("panel")) {
      appName = "Admin Workspace";
      subtitle = "Sistem Desain Admin & Dashboard";
      metricLabel = "Total Keuntungan Bersih";
      metricValue = "Rp 126.480.000";
      metricSub = "▲ +72.8% dari minggu lalu";
      featureTitle = "Riwayat Transaksi Terkini";
      defaultItems = [
        { id: 1, title: "Pembayaran Keanggotaan Pro", desc: "John Doe • Credit Card", completed: true, status: "Selesai", amount: "+$120.00" },
        { id: 2, title: "Pembelian Lisensi Cloud ERP", desc: "Acme Corp • Bank Transfer", completed: true, status: "Selesai", amount: "+$2,450.00" },
        { id: 3, title: "Biaya Server Multi-Region", desc: "Vercel / GCP Infrastructure", completed: false, status: "Proses", amount: "-$850.00" }
      ];
    } else if (p.includes("uang") || p.includes("duit") || p.includes("finance") || p.includes("budget") || p.includes("dompet") || p.includes("bank") || p.includes("saham") || p.includes("invest")) {
      appName = "FinoFlow";
      subtitle = "Manajemen Keuangan & Budgeting";
      metricLabel = "Total Saldo Tersimpan";
      metricValue = "Rp 14.250.000";
      metricSub = "▼ Pengeluaran hemat 12.5%";
      featureTitle = "Alokasi Finansial Terakhir";
      defaultItems = [
        { id: 1, title: "Langganan Cloud Server VPS", desc: "Tagihan bulanan otomatis dari saldo utama.", completed: true, status: "Selesai" },
        { id: 2, title: "Alokasi Dana Darurat Mingguan", desc: "Reksadana pasar uang berisiko rendah.", completed: false, status: "Proses" },
        { id: 3, title: "Laporan Arus Kas Bulanan", desc: "PDF rekapitulasi pengeluaran Juni.", completed: true, status: "Selesai" }
      ];
    } else if (p.includes("tugas") || p.includes("kerja") || p.includes("todo") || p.includes("task") || p.includes("project") || p.includes("kanban") || p.includes("jadwal") || p.includes("tim")) {
      appName = "TaskForge";
      subtitle = "Kolaborasi Kerja & Kanban Board";
      metricLabel = "Tugas Terselesaikan";
      metricValue = "18 / 24 Tugas";
      metricSub = "▲ Produktivitas kerja naik 15.2%";
      featureTitle = "Papan Tugas Utama";
      defaultItems = [
        { id: 1, title: "Desain High-Fidelity Mockup", desc: "Revisi layout navigasi responsive mobile.", completed: true, status: "Selesai" },
        { id: 2, title: "Review Kode API Router Server", desc: "Optimasi endpoint server dan middleware.", completed: false, status: "Proses" },
        { id: 3, title: "Presentasi Klien Utama", desc: "Pitching deck prototipe visual interaktif.", completed: true, status: "Selesai" }
      ];
    } else if (p.includes("toko") || p.includes("shop") || p.includes("jual") || p.includes("ecommerce") || p.includes("barang") || p.includes("market") || p.includes("produk") || p.includes("kasir")) {
      appName = "MerchUp Store";
      subtitle = "E-Commerce & Inventaris Toko";
      metricLabel = "Omset Penjualan Bersih";
      metricValue = "Rp 45.890.000";
      metricSub = "▲ Produk terlaris: Hoodie Minimalis";
      featureTitle = "Manajemen Produk & Katalog";
      defaultItems = [
        { id: 1, title: "Hoodie Fleece Over-Sized", desc: "Kain katun tebal, warna charcoal premium.", completed: true, status: "Selesai" },
        { id: 2, title: "Tumbler Vakum Stainless Steel", desc: "Tahan panas 12 jam, finishing doff.", completed: false, status: "Proses" },
        { id: 3, title: "Totebag Kanvas Organik", desc: "Sablon logo presisi tinggi.", completed: true, status: "Selesai" }
      ];
    }

    return { appName, subtitle, metricLabel, metricValue, metricSub, featureTitle, defaultItems };
  };

  const getPrimaryClasses = () => {
    switch (primaryColor) {
      case "sneat":
        return {
          bg: "bg-[#696cff]",
          bgHover: "hover:bg-[#5a5dcc]",
          text: "text-[#696cff]",
          textDark: "text-[#4d4fb8]",
          border: "border-[#e7e7ff]",
          borderFocus: "focus:border-[#696cff]",
          ring: "focus:ring-[#696cff]",
          bgLight: "bg-[#e7e7ff]",
          accentBg: "bg-[#f5f5f9]",
        };
      case "indigo":
        return {
          bg: "bg-indigo-600",
          bgHover: "hover:bg-indigo-700",
          text: "text-indigo-600",
          textDark: "text-indigo-800",
          border: "border-indigo-200",
          borderFocus: "focus:border-indigo-500",
          ring: "focus:ring-indigo-500",
          bgLight: "bg-indigo-50",
          accentBg: "bg-indigo-100",
        };
      case "emerald":
        return {
          bg: "bg-emerald-600",
          bgHover: "hover:bg-emerald-700",
          text: "text-emerald-600",
          textDark: "text-emerald-800",
          border: "border-emerald-200",
          borderFocus: "focus:border-emerald-500",
          ring: "focus:ring-emerald-500",
          bgLight: "bg-emerald-50",
          accentBg: "bg-emerald-100",
        };
      case "blue":
        return {
          bg: "bg-blue-600",
          bgHover: "hover:bg-blue-700",
          text: "text-blue-600",
          textDark: "text-blue-800",
          border: "border-blue-200",
          borderFocus: "focus:border-blue-500",
          ring: "focus:ring-blue-500",
          bgLight: "bg-blue-50",
          accentBg: "bg-blue-100",
        };
      case "rose":
        return {
          bg: "bg-rose-600",
          bgHover: "hover:bg-rose-700",
          text: "text-rose-600",
          textDark: "text-rose-800",
          border: "border-rose-200",
          borderFocus: "focus:border-rose-500",
          ring: "focus:ring-rose-500",
          bgLight: "bg-rose-50",
          accentBg: "bg-rose-100",
        };
      case "amber":
        return {
          bg: "bg-amber-500",
          bgHover: "hover:bg-amber-600",
          text: "text-amber-500",
          textDark: "text-amber-700",
          border: "border-amber-200",
          borderFocus: "focus:border-amber-500",
          ring: "focus:ring-amber-500",
          bgLight: "bg-amber-50",
          accentBg: "bg-amber-100",
        };
      case "charcoal":
        return {
          bg: "bg-slate-800",
          bgHover: "hover:bg-slate-900",
          text: "text-slate-800",
          textDark: "text-slate-900",
          border: "border-slate-300",
          borderFocus: "focus:border-slate-600",
          ring: "focus:ring-slate-500",
          bgLight: "bg-slate-100",
          accentBg: "bg-slate-200",
        };
      default:
        return {
          bg: "bg-indigo-600",
          bgHover: "hover:bg-indigo-700",
          text: "text-indigo-600",
          textDark: "text-indigo-800",
          border: "border-indigo-200",
          borderFocus: "focus:border-indigo-500",
          ring: "focus:ring-indigo-500",
          bgLight: "bg-indigo-50",
          accentBg: "bg-indigo-100",
        };
    }
  };

  const handleToggleItem = (id: number) => {
    setSimulatedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed, status: !item.completed ? "Selesai" : "Proses" } : item
      )
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now(),
      title: newItemText,
      desc: "Komponen interaktif hasil kustomisasi langsung pengguna.",
      completed: false,
      status: "Proses"
    };
    setSimulatedItems(prev => [newItem, ...prev]);
    setNewItemText("");
    setSuccessToast("Item berhasil ditambahkan ke simulator!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleRemoveItem = (id: number) => {
    setSimulatedItems(prev => prev.filter(item => item.id !== id));
    setSuccessToast("Item berhasil dihapus dari simulator.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Populate mock data initially
  useEffect(() => {
    const meta = getMockMetadata();
    setSimulatedItems(meta.defaultItems);
  }, [prompt]);

  // Stitch API Key status
  const [stitchKey, setStitchKey] = useState("");
  const [apiKeysData, setApiKeysData] = useState<any>(null);
  const [customStitchKeyInput, setCustomStitchKeyInput] = useState("");
  const [showStitchInput, setShowStitchInput] = useState(false);

  // Output view control
  const [activeTab, setActiveTab] = useState<"markdown" | "preview" | "raw">("markdown");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [isCopied, setIsCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Load API keys to detect Stitch Key
  const loadApiKeys = () => {
    try {
      const savedKeys = localStorage.getItem("app_api_keys_detailed");
      if (savedKeys) {
        const parsed = JSON.parse(savedKeys);
        setApiKeysData(parsed);
        // Find if there's any active stitch key
        let currentStitch = "";
        Object.keys(parsed).forEach((prov) => {
          if (parsed[prov]?.stitch && !currentStitch) {
            currentStitch = parsed[prov].stitch;
          }
        });
        if (!currentStitch) {
          currentStitch = parsed["Gemini"]?.stitch || parsed["Claude"]?.stitch || parsed["Chatgpt"]?.stitch || "";
        }
        setStitchKey(currentStitch);
        if (currentStitch) {
          setCustomStitchKeyInput(currentStitch);
        }
      } else {
        const simpleKeys = localStorage.getItem("app_api_keys");
        if (simpleKeys) {
          try {
            const parsedSimple = JSON.parse(simpleKeys);
            if (parsedSimple.stitchKey) {
              setStitchKey(parsedSimple.stitchKey);
              setCustomStitchKeyInput(parsedSimple.stitchKey);
            }
          } catch (err) {}
        }
      }
    } catch (e) {
      console.warn("Error reading api keys for stitch integration:", e);
    }
  };

  useEffect(() => {
    loadApiKeys();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "app_api_keys_detailed" || e.key === "app_api_keys") {
        loadApiKeys();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    if (location.state) {
      if (location.state.prompt) setPrompt(location.state.prompt);
      if (location.state.primaryColor) setPrimaryColor(location.state.primaryColor);
      if (location.state.borderRadius) setBorderRadius(location.state.borderRadius);
      if (location.state.fontTheme) setFontTheme(location.state.fontTheme);
      if (location.state.layoutStyle) setLayoutStyle(location.state.layoutStyle);
    }

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [location.state]);

  const handleSaveStitchKeyInline = () => {
    try {
      const updatedKeys = apiKeysData || {
        Gemini: { main: "", context7: "", stitch: "" },
        Claude: { main: "", context7: "", stitch: "" },
        Chatgpt: { main: "", context7: "", stitch: "" },
        "Z.ai": { main: "", context7: "", stitch: "" },
        "Xiaomi.ai": { main: "", context7: "", stitch: "" },
      };

      // Set for all providers so global stitch key stays synchronized
      Object.keys(updatedKeys).forEach((prov) => {
        if (!updatedKeys[prov]) {
          updatedKeys[prov] = { main: "", context7: "", stitch: "" };
        }
        updatedKeys[prov].stitch = customStitchKeyInput.trim();
      });

      localStorage.setItem("app_api_keys_detailed", JSON.stringify(updatedKeys));
      localStorage.setItem("app_api_keys", JSON.stringify({ stitchKey: customStitchKeyInput.trim() }));
      
      setStitchKey(customStitchKeyInput.trim());
      setApiKeysData(updatedKeys);
      setShowStitchInput(false);
      
      // Auto save logs to database
      addDoc(collection(db, "logs"), {
        action: "Updated Stitch API Key",
        details: "User updated Stitch API Key inline from Generate Design page.",
        createdAt: serverTimestamp(),
      }).catch(console.error);

    } catch (err) {
      console.error("Failed to save stitch key inline:", err);
      alert("Gagal menyimpan Stitch API Key");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);

    // Map aiModel to Provider
    let providerName = "Gemini";
    if (aiModel.includes("claude")) providerName = "Claude";
    if (aiModel.includes("gpt")) providerName = "Chatgpt";
    
    const preferredKey = apiKeysData?.[providerName]?.main || "";
    const activeStitch = apiKeysData?.[providerName]?.stitch || stitchKey || "";

    // Build enhanced prompt using style selections if Stitch is used
    const enhancedPrompt = `
Desain Aplikasi: ${prompt}
[Styling Preferences]:
- Warna Utama: ${primaryColor}
- Sudut Komponen (Radius): border-radius-${borderRadius}
- Tema Font: ${fontTheme}
- Gaya Layout: ${layoutStyle}
    `;

    try {
      const response = await fetch("/api/v1/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          apiKey: preferredKey,
          stitchKey: activeStitch,
          provider: providerName,
          aiModel: aiModel,
        }),
      });

      let data;
      let rawText = "";
      try {
        rawText = await response.text();
        data = JSON.parse(rawText);
      } catch (jsonErr) {
        if (!response.ok) {
           throw new Error(`Server returned an error (${response.status}). Please try again.`);
        }
        throw new Error(`Invalid response received from server. Response was not JSON.`);
      }

      if (!response.ok || data?.error) {
        throw new Error(data?.error || `Failed to generate design (${response.status})`);
      }

      const generatedContent = data.markdown;
      setResult(generatedContent);
      setActiveTab("markdown"); // default view

      try {
        const titleMatch = generatedContent.match(/# (.*?)\n/) || generatedContent.match(/## 1\. \*\*Design Concept & Vibe\*\*/);
        const title = titleMatch ? (titleMatch[1] ? titleMatch[1].trim() : "Design System") : "Design System";
        
        await addDoc(collection(db, "designs"), {
          title: title.length > 50 ? title.substring(0, 50) + '...' : title,
          prompt: prompt,
          content: generatedContent,
          type: "Design System",
          status: "Final",
          createdAt: serverTimestamp(),
          color: "bg-indigo-100 text-indigo-700"
        });
      } catch (err) {
        console.error("Error auto-saving design:", err);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat meng-generate panduan desain.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const exportToPdf = () => {
    const element = document.getElementById("design-export-content");
    if (element) {
      element.classList.add("print-target");
      document.body.classList.add("printing-element-active");
      const originalTitle = document.title;
      document.title = `Design-System-${prompt.substring(0, 20).replace(/\s+/g, "-")}`;
      
      window.print();
      
      document.title = originalTitle;
      document.body.classList.remove("printing-element-active");
      element.classList.remove("print-target");
    }
  };

  // Styles dynamically derived for responsive visual preview simulator
  const getPrimaryHexColor = () => {
    switch (primaryColor) {
      case "indigo": return "#4f46e5";
      case "emerald": return "#10b981";
      case "blue": return "#3b82f6";
      case "rose": return "#f43f5e";
      case "amber": return "#f59e0b";
      case "charcoal": return "#374151";
      default: return "#4f46e5";
    }
  };

  const getPrimaryTailwindBg = () => {
    switch (primaryColor) {
      case "indigo": return "bg-indigo-600 hover:bg-indigo-700 text-white";
      case "emerald": return "bg-emerald-600 hover:bg-emerald-700 text-white";
      case "blue": return "bg-blue-600 hover:bg-blue-700 text-white";
      case "rose": return "bg-rose-600 hover:bg-rose-700 text-white";
      case "amber": return "bg-amber-500 hover:bg-amber-600 text-white";
      case "charcoal": return "bg-slate-800 hover:bg-slate-900 text-white";
      default: return "bg-indigo-600 hover:bg-indigo-700 text-white";
    }
  };

  const getPrimaryTailwindText = () => {
    switch (primaryColor) {
      case "indigo": return "text-indigo-600";
      case "emerald": return "text-emerald-600";
      case "blue": return "text-blue-600";
      case "rose": return "text-rose-600";
      case "amber": return "text-amber-500";
      case "charcoal": return "text-slate-800";
      default: return "text-indigo-600";
    }
  };

  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case "none": return "rounded-none";
      case "sm": return "rounded-sm";
      case "md": return "rounded-lg";
      case "lg": return "rounded-2xl";
      case "full": return "rounded-full";
      default: return "rounded-lg";
    }
  };

  const getFontFamilyClass = () => {
    if (primaryColor === "sneat") return "font-public-sans";
    switch (fontTheme) {
      case "sans": return "font-sans";
      case "serif": return "font-serif";
      case "mono": return "font-mono";
      default: return "font-sans";
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Draft Recovery Alert Banner */}
      <AnimatePresence>
        {draftRestored && !hideBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 text-amber-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-amber-950">Draf Desain Terdeteksi & Dipulihkan Otomatis</h4>
                <p className="text-xs text-amber-800 mt-1">
                  Progres konfigurasi sistem desain terakhir Anda ({lastSavedTime || "baru saja"}) telah dipulihkan. Auto-save melacak setiap pilihan warna dan prompt Anda secara real-time.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={handleStartFresh}
                className="text-xs font-semibold px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 rounded-lg shadow-sm transition-colors"
              >
                Mulai Baru
              </button>
              <button
                onClick={() => setHideBanner(true)}
                className="text-xs font-medium px-3 py-1.5 hover:bg-amber-200/50 text-amber-900 rounded-lg transition-colors"
              >
                Abaikan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex-shrink-0">
            <PenTool className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Generate Design</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Desain sistem, wireframe UI, dan panduan layout yang terintegrasi langsung dengan preferensi visual.
            </p>
          </div>
        </div>

        {/* Auto-save Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full self-start sm:self-center shadow-xs">
          {autoSaveState === "saving" && (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>Menyimpan draf...</span>
            </>
          )}
          {autoSaveState === "saved" && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Draf disimpan ({lastSavedTime || "baru saja"})</span>
            </>
          )}
          {autoSaveState === "idle" && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              <span>Auto-save Aktif</span>
            </>
          )}
        </div>
      </div>



      {/* Inline Stitch API Key Modifying Box */}
      {showStitchInput && (
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-md space-y-4 animate-scale-up">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Konfigurasi API Key Stitch (Tersinkronisasi ke Pengaturan)
            </h3>
            <button
              onClick={() => setShowStitchInput(false)}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            API Key Stitch ini tersimpan secara aman di browser local storage Anda dan otomatis terhubung dengan modul Pengaturan Aplikasi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={customStitchKeyInput}
              onChange={(e) => setCustomStitchKeyInput(e.target.value)}
              placeholder="Masukkan Stitch API Key (misal: st_live_...)"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
            />
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveStitchKeyInline}
                className="bg-indigo-600 text-white px-4 py-2.5 text-xs font-semibold rounded-xl hover:bg-indigo-700 transition active:scale-98 cursor-pointer"
              >
                Simpan & Sinkronkan
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomStitchKeyInput("");
                  setShowStitchInput(false);
                }}
                className="bg-slate-100 text-slate-600 px-3 py-2.5 text-xs font-semibold rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form & Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input prompt & style selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
              <Palette className="h-4.5 w-4.5 text-indigo-500" />
              1. Parameter Desain
            </h2>

            {/* Elegant Template Selector for Design */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/20 rounded-2xl border border-indigo-100/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full -mr-3 -mt-3 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-[10px] font-bold text-indigo-950 tracking-wider uppercase flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-500" />
                    Preset & Template Desain
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Import cetak biru visual pra-konfigurasi untuk memuat kombinasi warna, border, layout, dan prompt instan.
                  </p>
                </div>

                {/* Responsive Styled Dropdown Menu & Catalog Action */}
                <div className="flex flex-col gap-2 relative">
                  <div className="relative w-full">
                    <select
                      id="design-template-dropdown"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        let name = "";
                        if (val === "neobrutalist") name = "Neo-Brutalist Dashboard";
                        else if (val === "minimaldark") name = "Minimalist Dark Mode";
                        else if (val === "warmeditorial") name = "Warm Editorial";
                        else if (val === "cleantech") name = "Clean Tech";
                        else if (val === "glassfintech") name = "Glassmorphism Fintech";
                        else if (val === "corporate") name = "Corporate Trust";
                        else if (val === "playful") name = "Playful Learning";
                        else if (val === "cyberpunk") name = "Geometric Cyberpunk";
                        else if (val === "wellness") name = "Organic Health";
                        else if (val === "aicopilot") name = "Sleek AI Copilot";
                        else {
                          const matched = communityDesignTemplates.find(c => c.id === val);
                          name = matched ? (matched.name || "Template Kustom") : "Template Kustom";
                        }
                        handleApplyDesignTemplate(val, name);
                        e.target.value = "";
                      }}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-indigo-200 text-indigo-950 rounded-xl text-xs font-semibold shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer pr-10 hover:border-indigo-300 transition-all"
                    >
                      <option value="">🎯 Quick Select Preset...</option>
                      <optgroup label="✨ Preset Bawaan">
                        <option value="neobrutalist">⚡ Neo-Brutalist Dashboard</option>
                        <option value="minimaldark">🌙 Minimalist Dark Mode</option>
                        <option value="warmeditorial">🌸 Warm Editorial</option>
                        <option value="cleantech">🛡️ Clean Tech Developer</option>
                        <option value="glassfintech">🔮 Glassmorphism Fintech</option>
                        <option value="corporate">💼 Corporate Trust Enterprise</option>
                        <option value="playful">🎈 Playful Learning</option>
                        <option value="cyberpunk">👾 Geometric Cyberpunk</option>
                        <option value="wellness">🍃 Organic Wellness</option>
                        <option value="aicopilot">🤖 Sleek AI Copilot</option>
                      </optgroup>
                      {communityDesignTemplates.length > 0 && (
                        <optgroup label="👥 Preset Komunitas">
                          {communityDesignTemplates.map(t => (
                            <option key={t.id} value={t.id}>
                              👥 {t.name || "Preset Komunitas"}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-indigo-500">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>

                  </div>
                </div>
              </div>

            {/* Toast Feedback */}
            {designImportedSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 animate-scale-up">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium">{designImportedSuccessMsg}</span>
              </div>
            )}
            
            {/* Project Idea Textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Deskripsi / Ide Desain Aplikasi
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Aplikasi pelacak kesehatan mental dengan nuansa tenang, menu minimalis, sidebar kiri di desktop, dan tab-bar bawah di mobile..."
                className="w-full h-32 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-xs outline-none bg-slate-50/50"
              />
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                AI Engine
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer text-slate-800"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Tercepat & Cerdas)</option>
                <option value="gemini-flash-latest">Gemini Flash Latest</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Hemat Kuota)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Sangat Presisi)</option>
                <option value="gpt-4o">GPT-4o (Lengkap & Terstruktur)</option>
              </select>
            </div>

            {/* Color Palette Choice */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Warna Utama (Primary Accent)
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {[
                  { id: "sneat", colorBg: "bg-[#696cff]", label: "Indigo UI" },
                  { id: "indigo", colorBg: "bg-indigo-600", label: "Indigo" },
                  { id: "emerald", colorBg: "bg-emerald-500", label: "Emerald" },
                  { id: "blue", colorBg: "bg-blue-500", label: "Blue" },
                  { id: "rose", colorBg: "bg-rose-500", label: "Rose" },
                  { id: "amber", colorBg: "bg-amber-500", label: "Amber" },
                  { id: "charcoal", colorBg: "bg-slate-700", label: "Dark" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(item.id);
                      if (item.id === "sneat") {
                        setFontTheme("sneat"); // Custom trigger for Public Sans
                        setBorderRadius("md"); // Standard Sneat rounded level
                      }
                    }}
                    title={item.label}
                    className={cn(
                      "h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105 active:scale-95",
                      primaryColor === item.id 
                        ? "border-slate-900 ring-2 ring-slate-200" 
                        : "border-slate-200"
                    )}
                  >
                    <span className={cn("h-4 w-4 rounded-full", item.colorBg)} />
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Style (Border Radius) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Sudut Komponen (Corners)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "none", label: "Tajam" },
                  { id: "md", label: "Rounded" },
                  { id: "lg", label: "Super Round" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBorderRadius(item.id)}
                    className={cn(
                      "py-1.5 px-2 text-[10px] sm:text-xs font-semibold rounded-lg border transition",
                      borderRadius === item.id
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Theme */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Gaya Tipografi (Typography)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "sans", label: "Sederhana" },
                  { id: "serif", label: "Klasik" },
                  { id: "mono", label: "Teknikal" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFontTheme(item.id)}
                    className={cn(
                      "py-1.5 px-2 text-[10px] sm:text-xs font-semibold rounded-lg border transition",
                      fontTheme === item.id
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSaveManualDraft}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-semibold focus:ring-4 focus:ring-slate-100 transition-all text-xs sm:text-sm shadow-xs"
              >
                <Save className="h-4 w-4 text-slate-500" />
                Simpan Draft
              </button>
              
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex-[2] flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Meng-generate...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4.5 w-4.5" />
                    Generate Design
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel with Responsive Mock Frame and Markdown Output */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
              
              {/* Header Tab Actions */}
              <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                
                {/* Mode Selectors */}
                <div className="flex bg-slate-200/60 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab("markdown")}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition",
                      activeTab === "markdown"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Panduan Desain
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition",
                      activeTab === "preview"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview Simulasi
                  </button>
                  <button
                    onClick={() => setActiveTab("raw")}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition",
                      activeTab === "raw"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Code className="h-3.5 w-3.5" />
                    Raw Code
                  </button>
                </div>

                {/* Toolbar Export Options */}
                <div className="flex items-center gap-1.5 justify-end w-full sm:w-auto flex-wrap">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-white border border-slate-200 p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition shadow-2xs"
                    title="Bagikan ke Komunitas"
                  >
                    <Share className="h-4 w-4" />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="bg-white border border-slate-200 p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition shadow-2xs"
                    title="Salin Markdown"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([result], { type: "text/markdown" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `Design-System.md`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-white border border-slate-200 p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition shadow-2xs"
                    title="Download Markdown"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={exportToPdf}
                    className="bg-white border border-slate-200 p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition shadow-2xs"
                    title="Cetak PDF"
                  >
                    <FileDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Viewport content area */}
              <div className="flex-1 p-5 bg-slate-50/50 overflow-y-auto">
                
                {/* Tab 1: Markdown Rendered */}
                {activeTab === "markdown" && (
                  <div
                    id="design-export-content"
                    className="prose prose-sm prose-slate prose-indigo max-w-none p-5 sm:p-7 bg-white rounded-xl border border-slate-200 shadow-2xs text-left"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                  </div>
                )}

                {/* Tab 2: Highly Interactive Simulator Sandbox with Desktop & Mobile frames */}
                {activeTab === "preview" && (
                  <div className="space-y-4">
                    {/* Viewport switch tool */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Simulator Desain Ter-Stitch ({primaryColor.toUpperCase()} Theme)
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Visualisasi interaktif real-time yang secara otomatis menyesuaikan dengan prompt, warna utama, sudut, dan font yang Anda pilih.
                        </p>
                      </div>
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                        <button
                          onClick={() => setPreviewViewport("desktop")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition",
                            previewViewport === "desktop"
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-500 hover:text-slate-950"
                          )}
                        >
                          <Monitor className="h-3.5 w-3.5" />
                          Desktop View
                        </button>
                        <button
                          onClick={() => setPreviewViewport("mobile")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition",
                            previewViewport === "mobile"
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-500 hover:text-slate-950"
                          )}
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                          Mobile View
                        </button>
                      </div>
                    </div>

                    {/* Interactive Toast Notification inside Simulator */}
                    {successToast && (
                      <div className={cn("p-2 px-3 text-xs font-semibold rounded-lg flex items-center gap-2 animate-scale-up text-white shadow-xs", getPrimaryClasses().bg)}>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>{successToast}</span>
                      </div>
                    )}

                    {/* Interactive Frame Box */}
                    <div className="flex items-center justify-center py-4 bg-slate-100/60 rounded-xl border border-dashed border-slate-300 min-h-[460px] p-2">
                      
                      {/* Desktop Frame Mock */}
                      {previewViewport === "desktop" && (
                        <div className={cn("w-full max-w-[720px] bg-white shadow-lg border border-slate-200 overflow-hidden text-left flex flex-col h-[400px] transition-all duration-300", getFontFamilyClass(), getBorderRadiusClass())}>
                          {/* Top browser bar */}
                          <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between shrink-0">
                            <div className="flex gap-1.5">
                              <span className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                              <span className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">https://{getMockMetadata().appName.toLowerCase().replace(/\s+/g, '')}.workspace.io</span>
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[8px] text-slate-500 font-mono font-bold uppercase">Stitched</span>
                            </div>
                          </div>

                          <div className="flex flex-1 overflow-hidden">
                            {/* Desktop Sidebar Left */}
                            <aside className={cn(
                              "w-40 p-3.5 flex flex-col justify-between text-[10px] shrink-0 border-r transition-all duration-300",
                              primaryColor === "sneat" 
                                ? "bg-white border-[#e4e6e8] text-[#646e78]" 
                                : "bg-slate-900 text-slate-400 border-transparent"
                            )}>
                              <div className="space-y-4">
                                <div className={cn(
                                  "font-bold flex items-center gap-1.5 text-xs pb-2 border-b",
                                  primaryColor === "sneat" ? "border-slate-100 text-[#646e78]" : "border-slate-800 text-white"
                                )}>
                                  <div className={cn(
                                    "w-4 h-4 rounded-md flex items-center justify-center text-white text-[9px] font-black", 
                                    primaryColor === "sneat" ? "bg-[#696cff]" : getPrimaryClasses().bg
                                  )}>
                                    {getMockMetadata().appName[0]}
                                  </div>
                                  <span className={cn(
                                    "tracking-wide font-bold", 
                                    primaryColor === "sneat" ? "text-[#566a7f]" : "text-slate-100"
                                  )}>
                                    {primaryColor === "sneat" ? "Admin Workspace" : getMockMetadata().appName}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <button
                                    onClick={() => setSimulatedTab("overview")}
                                    className={cn(
                                      "w-full text-left p-2 rounded-lg font-medium transition flex items-center gap-1.5",
                                      primaryColor === "sneat"
                                        ? simulatedTab === "overview" 
                                          ? "bg-[#e7e7ff] text-[#696cff] font-bold" 
                                          : "hover:bg-[#f5f5f9] text-[#646e78] hover:text-[#566a7f]"
                                        : simulatedTab === "overview" 
                                          ? "bg-slate-800 text-white" 
                                          : "hover:bg-slate-800/50 hover:text-slate-200"
                                    )}
                                  >
                                    <Layout className="h-3 w-3" />
                                    <span>Ringkasan</span>
                                  </button>
                                  <button
                                    onClick={() => setSimulatedTab("features")}
                                    className={cn(
                                      "w-full text-left p-2 rounded-lg font-medium transition flex items-center gap-1.5",
                                      primaryColor === "sneat"
                                        ? simulatedTab === "features" 
                                          ? "bg-[#e7e7ff] text-[#696cff] font-bold" 
                                          : "hover:bg-[#f5f5f9] text-[#646e78] hover:text-[#566a7f]"
                                        : simulatedTab === "features" 
                                          ? "bg-slate-800 text-white" 
                                          : "hover:bg-slate-800/50 hover:text-slate-200"
                                    )}
                                  >
                                    <PenTool className="h-3 w-3" />
                                    <span>{getMockMetadata().featureTitle}</span>
                                  </button>
                                  <button
                                    onClick={() => setSimulatedTab("settings")}
                                    className={cn(
                                      "w-full text-left p-2 rounded-lg font-medium transition flex items-center gap-1.5",
                                      primaryColor === "sneat"
                                        ? simulatedTab === "settings" 
                                          ? "bg-[#e7e7ff] text-[#696cff] font-bold" 
                                          : "hover:bg-[#f5f5f9] text-[#646e78] hover:text-[#566a7f]"
                                        : simulatedTab === "settings" 
                                          ? "bg-slate-800 text-white" 
                                          : "hover:bg-slate-800/50 hover:text-slate-200"
                                    )}
                                  >
                                    <SettingsIcon className="h-3 w-3" />
                                    <span>Konfigurasi Token</span>
                                  </button>
                                </div>
                              </div>
                              <div className={cn(
                                "text-[8px] p-1.5 rounded-lg border font-mono",
                                primaryColor === "sneat"
                                  ? "bg-[#f5f5f9] text-[#7a838b] border-[#e4e6e8]"
                                  : "bg-slate-950 text-slate-600 border-slate-800"
                              )}>
                                Primary: {primaryColor === "sneat" ? "#696CFF" : getPrimaryClasses().bg.replace("bg-", "").toUpperCase()}<br/>
                                Corners: {borderRadius.toUpperCase()}<br/>
                                Font: {primaryColor === "sneat" ? "PUBLIC SANS" : fontTheme.toUpperCase()}
                              </div>
                            </aside>

                            {/* Main Desktop Container */}
                            <main className={cn("flex-1 p-4 overflow-y-auto space-y-4", primaryColor === "sneat" ? "bg-[#f5f5f9]" : "bg-slate-50")}>
                              
                              {/* View 1: Overview Dashboard */}
                              {simulatedTab === "overview" && (
                                <div className="space-y-4 animate-scale-up">
                                  {primaryColor === "sneat" ? (
                                    /* Sneat Special Dashboard Layout */
                                    <div className="space-y-4">
                                      {/* App Title Header */}
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h4 className="text-sm font-bold text-[#646e78]">{getMockMetadata().appName}</h4>
                                          <p className="text-[9px] text-[#7a838b]">{getMockMetadata().subtitle}</p>
                                        </div>
                                        <span className="px-2 py-0.5 text-[8px] font-extrabold rounded-full bg-[#e8f5e9] text-[#71dd37] border border-[#c8e6c9] uppercase tracking-wider">
                                          Indigo UI System
                                        </span>
                                      </div>

                                      {/* Sneat Row 1: Congratulations Banner & Mini Metrics */}
                                      <div className="grid grid-cols-12 gap-3.5">
                                        {/* Left: Congratulation Card (Spatially wider, 7 cols) */}
                                        <div className="col-span-7 bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex justify-between items-center relative overflow-hidden">
                                          <div className="space-y-2.5 max-w-[65%] z-10">
                                            <h5 className="text-xs font-bold text-[#696cff]">Congratulations John! 🎉</h5>
                                            <p className="text-[9px] text-[#646e78] leading-relaxed">
                                              You have won the <span className="font-bold text-[#696cff]">Gold Badge</span> of Certified Developers. Your template conversion rate increased by <span className="font-bold text-[#71dd37]">72.8%</span> today.
                                            </p>
                                            <button 
                                              onClick={() => { setSuccessToast("Lencana Emas diaktifkan!"); setTimeout(() => setSuccessToast(null), 3000); }} 
                                              className="h-8 px-3 rounded-lg bg-[#696cff] hover:bg-[#5a5dcc] text-white text-[9px] font-semibold transition-all duration-150 shadow-xs cursor-pointer"
                                            >
                                              View Badges
                                            </button>
                                          </div>
                                          {/* Right Illustration container */}
                                          <div className="w-[30%] flex justify-center items-center z-10">
                                            <div className="p-2 bg-[#e7e7ff] rounded-full border border-[#d0d0ff] flex items-center justify-center animate-bounce-subtle">
                                              <Award className="h-8 w-8 text-[#696cff]" />
                                            </div>
                                          </div>
                                          {/* Accent circular background decoration */}
                                          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#e7e7ff]/30 pointer-events-none" />
                                        </div>

                                        {/* Right: Premium Overview Details Card (5 cols) */}
                                        <div className="col-span-5 bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-[#566a7f]">Sistem Integrasi AI</span>
                                            <span className="px-1.5 py-0.5 rounded-full text-[7px] font-extrabold bg-[#e7e7ff] text-[#696cff] uppercase">V2.0 Active</span>
                                          </div>
                                          <p className="text-[9px] text-[#646e78] leading-relaxed">
                                            Semua token design, warna primer <span className="font-mono text-[#696cff]">#696CFF</span>, dan font <span className="font-bold">Public Sans</span> telah diintegrasikan dengan sempurna ke layout desktop & mobile.
                                          </p>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => { setSuccessToast("Warna Indigo disalin ke clipboard!"); setTimeout(() => setSuccessToast(null), 3000); }}
                                              className="flex-1 py-1 px-2 border border-[#696cff] text-[#696cff] hover:bg-[#f2f2ff] rounded-md text-[8px] font-semibold transition"
                                            >
                                              Copy Color Code
                                            </button>
                                            <button
                                              onClick={() => { setSuccessToast("Skema Typografi disalin!"); setTimeout(() => setSuccessToast(null), 3000); }}
                                              className="flex-1 py-1 px-2 bg-[#696cff] hover:bg-[#5a5dcc] text-white rounded-md text-[8px] font-semibold transition"
                                            >
                                              Font Info
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* App Section Label: 5x2 Grid Matrix */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-4 pb-2 gap-2">
                                        <div className="space-y-0.5">
                                          <span className="text-[11px] font-extrabold text-[#566a7f] uppercase tracking-wider block">MATRIKS MODUL UTAMA (5x2 INTEGRASI PRESISI)</span>
                                          <p className="text-[9px] text-[#7a838b]">Sistem simulasi panel admin dengan data interaktif dinamis yang responsif di mobile & desktop.</p>
                                        </div>
                                        <div className="flex items-center gap-2 self-start sm:self-auto">
                                          <span className="text-[9px] font-semibold text-[#696cff] bg-[#e7e7ff] px-2 py-0.5 rounded-full">Total 10 Modul Aktif</span>
                                        </div>
                                      </div>

                                      {/* Sneat 5x2 Grid Layout containing exactly 10 premium detailed modules */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        
                                        {/* Modul 1: Profitabilitas */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#e8f5e9] flex items-center justify-center text-[#71dd37]">
                                                <TrendingUp className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-[#71dd37] bg-[#e8f5e9] px-2 py-0.5 rounded-md">+72.8%</span>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Profitabilitas</span>
                                              <span className="text-sm font-extrabold text-[#566a7f] block font-mono">
                                                ${profitVal.toLocaleString()} USD
                                              </span>
                                            </div>
                                            {/* Micro-Progress Bar */}
                                            <div className="space-y-1">
                                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-[#71dd37] h-full rounded-full transition-all duration-300" style={{ width: "72.8%" }} />
                                              </div>
                                              <div className="flex justify-between text-[7.5px] text-[#a1acb8]">
                                                <span>Target: $15,000</span>
                                                <span>72.8%</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50">
                                            <button 
                                              onClick={() => {
                                                setProfitVal(prev => prev + 250);
                                                setSuccessToast("Simulasi Profit ditambah $250!");
                                                setTimeout(() => setSuccessToast(null), 2500);
                                              }}
                                              className="flex-1 py-1 text-[8px] font-bold bg-[#e8f5e9] hover:bg-[#d4f2d6] text-[#71dd37] rounded transition"
                                            >
                                              + Profit
                                            </button>
                                            <button 
                                              onClick={() => {
                                                setProfitVal(prev => Math.max(0, prev - 150));
                                              }}
                                              className="px-1.5 py-1 text-[8px] text-[#7a838b] hover:bg-slate-100 rounded transition"
                                            >
                                              Reset
                                            </button>
                                          </div>
                                        </div>

                                        {/* Modul 2: Pembayaran */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#ffe0d6] flex items-center justify-center text-[#ff3e1d]">
                                                <CreditCard className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-[#ff3e1d] bg-[#ffe0d6] px-2 py-0.5 rounded-md">Billing</span>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Pembayaran</span>
                                              <span className="text-[11px] font-bold text-[#ff3e1d] block">3 Biaya Aktif</span>
                                            </div>
                                            {/* Small list of payments */}
                                            <div className="space-y-1 text-[7.5px] border-t border-dashed border-slate-100 pt-1.5">
                                              {recentPayments.map(pay => (
                                                <div key={pay.id} className="flex justify-between items-center text-[#566a7f]">
                                                  <span className="truncate max-w-[65px]">{pay.desc}</span>
                                                  <span className="font-mono text-red-500 font-semibold">{pay.val}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="pt-2 border-t border-slate-50">
                                            <button
                                              onClick={() => {
                                                const id = recentPayments.length + 1;
                                                const newBill = { id, desc: "API AI Request", val: `$${Math.floor(Math.random() * 50) + 10}`, isNegative: true };
                                                setRecentPayments(prev => [...prev.slice(-2), newBill]);
                                                setSuccessToast("Simulasi transaksi baru ditambahkan!");
                                                setTimeout(() => setSuccessToast(null), 2500);
                                              }}
                                              className="w-full py-1 text-[8px] font-bold bg-[#ffe0d6] hover:bg-[#ffd1c4] text-[#ff3e1d] rounded transition"
                                            >
                                              Tambah Tagihan
                                            </button>
                                          </div>
                                        </div>

                                        {/* Modul 3: Volume Penjualan */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#e1f5fe] flex items-center justify-center text-[#03c3ec]">
                                                <Award className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-[#03c3ec] bg-[#e1f5fe] px-2 py-0.5 rounded-md">+24.5%</span>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Volume Penjualan</span>
                                              <span className="text-sm font-extrabold text-[#566a7f] block font-mono">{salesVal.toLocaleString()} Pcs</span>
                                            </div>
                                            <p className="text-[7.5px] text-[#a1acb8] leading-tight">Total lisensi template yang sukses terdistribusi.</p>
                                          </div>
                                          <div className="flex items-center gap-1 pt-2 border-t border-slate-50">
                                            <button 
                                              onClick={() => {
                                                setSalesVal(prev => prev + 100);
                                                setSuccessToast("Simulasi Penjualan bertambah +100!");
                                                setTimeout(() => setSuccessToast(null), 2000);
                                              }}
                                              className="flex-1 py-1 text-[8px] font-bold bg-[#e1f5fe] hover:bg-[#caeffd] text-[#03c3ec] rounded transition"
                                            >
                                              +100 Pcs
                                            </button>
                                            <button 
                                              onClick={() => setSalesVal(4850)}
                                              className="px-1.5 py-1 text-[8px] text-[#a1acb8] hover:bg-slate-50 rounded transition"
                                            >
                                              Reset
                                            </button>
                                          </div>
                                        </div>

                                        {/* Modul 4: Sesi Pengguna */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#e7e7ff] flex items-center justify-center text-[#696cff]">
                                                <Users className="h-4 w-4" />
                                              </div>
                                              <span className="flex items-center gap-1 text-[9px] font-bold text-[#696cff] bg-[#e7e7ff] px-2 py-0.5 rounded-md">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Live
                                              </span>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Sesi Pengguna</span>
                                              <span className="text-sm font-extrabold text-[#566a7f] block font-mono">{activeUsersVal.toLocaleString()} Aktif</span>
                                            </div>
                                            <p className="text-[7.5px] text-[#a1acb8] leading-tight">Jumlah user aktif saat ini yang mengakses dasbor.</p>
                                          </div>
                                          <div className="pt-2 border-t border-slate-50">
                                            <button 
                                              onClick={() => {
                                                const change = Math.floor(Math.random() * 200) - 80;
                                                setActiveUsersVal(prev => Math.max(1000, prev + change));
                                                setSuccessToast(`Arus lalu lintas disimulasikan: ${change >= 0 ? "+" : ""}${change} User`);
                                                setTimeout(() => setSuccessToast(null), 2500);
                                              }}
                                              className="w-full py-1 text-[8px] font-bold bg-[#e7e7ff] hover:bg-[#d0d0ff] text-[#696cff] rounded transition"
                                            >
                                              Simulasikan Trafik
                                            </button>
                                          </div>
                                        </div>

                                        {/* Modul 5: Keandalan API */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#e8f5e9] flex items-center justify-center text-[#71dd37]">
                                                <RefreshCw className={cn("h-4 w-4", isLatencyPinging ? "animate-spin" : "")} />
                                              </div>
                                              <span className="text-[9px] font-bold text-[#71dd37] bg-[#e8f5e9] px-2 py-0.5 rounded-md">99.98% SLA</span>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Keandalan API</span>
                                              <span className="text-sm font-extrabold text-[#566a7f] block font-mono">
                                                {isLatencyPinging ? "Mengukur..." : `${latencyVal}ms Latency`}
                                              </span>
                                            </div>
                                            <p className="text-[7.5px] text-[#a1acb8] leading-tight">Waktu respons server utama terhadap simulasi AI generator.</p>
                                          </div>
                                          <div className="pt-2 border-t border-slate-50">
                                            <button 
                                              disabled={isLatencyPinging}
                                              onClick={() => {
                                                setIsLatencyPinging(true);
                                                setTimeout(() => {
                                                  setLatencyVal(Math.floor(Math.random() * 10) + 6);
                                                  setIsLatencyPinging(false);
                                                  setSuccessToast("Uji ping server selesai!");
                                                  setTimeout(() => setSuccessToast(null), 2000);
                                                }, 600);
                                              }}
                                              className="w-full py-1 text-[8px] font-bold bg-[#e8f5e9] hover:bg-[#d4f2d6] text-[#71dd37] rounded transition disabled:opacity-50"
                                            >
                                              {isLatencyPinging ? "Memproses..." : "Uji Latency Server"}
                                            </button>
                                          </div>
                                        </div>

                                        {/* Modul 6: Tugas Utama */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#e7e7ff] flex items-center justify-center text-[#696cff]">
                                                <CheckSquare className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-[#696cff] bg-[#e7e7ff] px-2 py-0.5 rounded-md">
                                                Selesai {todoTasks.filter(t => t.completed).length}/3
                                              </span>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Tugas Integrasi</span>
                                              <span className="text-[11px] font-bold text-[#566a7f] block">Checklist Kesiapan</span>
                                            </div>
                                            {/* Micro Tasks list */}
                                            <div className="space-y-1.5 text-[7.5px]">
                                              {todoTasks.map(task => (
                                                <div 
                                                  key={task.id} 
                                                  onClick={() => {
                                                    setTodoTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                                                  }}
                                                  className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-0.5 rounded transition"
                                                >
                                                  <div className="shrink-0 text-[#696cff]">
                                                    {task.completed ? (
                                                      <span className="w-3 h-3 flex items-center justify-center border border-[#696cff] bg-[#e7e7ff] rounded-xs font-bold text-[8px]">✓</span>
                                                    ) : (
                                                      <div className="w-3 h-3 border border-slate-300 bg-white rounded-xs" />
                                                    )}
                                                  </div>
                                                  <span className={cn("truncate max-w-[85px]", task.completed ? "line-through text-slate-400" : "text-slate-600 font-medium")}>
                                                    {task.text}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="pt-2 border-t border-slate-50 flex gap-1">
                                            <button 
                                              onClick={() => setTodoTasks(todoTasks.map(t => ({ ...t, completed: true })))}
                                              className="flex-1 py-1 text-[7.5px] font-semibold text-[#696cff] bg-[#e7e7ff] hover:bg-[#d0d0ff] rounded transition"
                                            >
                                              Semua
                                            </button>
                                            <button 
                                              onClick={() => setTodoTasks(todoTasks.map(t => ({ ...t, completed: false })))}
                                              className="px-1 py-1 text-[7.5px] text-[#a1acb8] hover:bg-slate-50 rounded transition"
                                            >
                                              Clear
                                            </button>
                                          </div>
                                        </div>

                                        {/* Modul 7: Konfigurasi Model */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#e1f5fe] flex items-center justify-center text-[#03c3ec]">
                                                <Sliders className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-[#03c3ec] bg-[#e1f5fe] px-2 py-0.5 rounded-md">Pro Active</span>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Konfigurasi Model</span>
                                              <span className="text-xs font-extrabold text-[#566a7f] block">{activeAiModel}</span>
                                            </div>
                                            <div className="text-[7.5px] text-[#a1acb8] space-y-0.5 bg-slate-50 p-1 rounded">
                                              <div>Limit: {activeAiModel.includes("Flash") ? "1,000,000" : "2,000,000"} tokens</div>
                                              <div>Kecepatan: {activeAiModel.includes("Flash") ? "Sangat Cepat" : "Akurasi Tinggi"}</div>
                                            </div>
                                          </div>
                                          <div className="pt-2 border-t border-slate-50">
                                            <select 
                                              value={activeAiModel}
                                              onChange={(e) => {
                                                setActiveAiModel(e.target.value);
                                                setSuccessToast(`Model dialihkan ke ${e.target.value}!`);
                                                setTimeout(() => setSuccessToast(null), 2500);
                                              }}
                                              className="w-full text-[8.5px] font-bold border border-slate-200 rounded px-1.5 py-1 text-[#566a7f] focus:outline-none focus:border-[#03c3ec] cursor-pointer bg-white"
                                            >
                                              <option value="Gemini 1.5 Flash">Gemini 1.5 Flash</option>
                                              <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                                              <option value="Gemini 2.0 Flash">Gemini 2.0 Flash</option>
                                            </select>
                                          </div>
                                        </div>

                                        {/* Modul 8: Modul Responsif */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#ffe0d6] flex items-center justify-center text-[#ff3e1d]">
                                                <Smartphone className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-[#ff3e1d] bg-[#ffe0d6] px-2 py-0.5 rounded-md">Auto Fit</span>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Modul Responsif</span>
                                              <span className="text-xs font-extrabold text-[#566a7f] block">Responsive 5x2</span>
                                            </div>
                                            <p className="text-[7.5px] text-[#a1acb8] leading-tight">Presisi layout di semua ukuran layar desktop maupun ponsel.</p>
                                          </div>
                                          <div className="pt-2 border-t border-slate-50 flex gap-1">
                                            <div className="flex-1 py-1 bg-slate-50 rounded text-center text-[7.5px] text-[#566a7f] font-mono border">
                                              Desktop & HP OK
                                            </div>
                                          </div>
                                        </div>

                                        {/* Modul 9: Tren Grafik */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#e8f5e9] flex items-center justify-center text-[#71dd37]">
                                                <BarChart2 className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-[#71dd37] bg-[#e8f5e9] px-2 py-0.5 rounded-md">Analisis</span>
                                            </div>
                                            <div className="space-y-0.5">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Tren Grafik harian</span>
                                              <span className="text-[8px] font-bold text-[#696cff] block">
                                                {hoveredBarIndex !== null ? `Hari ke-${hoveredBarIndex + 1}: ${[35, 75, 45, 90, 60][hoveredBarIndex]}%` : "Sentuh bar grafik"}
                                              </span>
                                            </div>
                                            <div className="h-7 flex items-end gap-1.5 pt-1">
                                              {[35, 75, 45, 90, 60].map((val, idx) => (
                                                <div 
                                                  key={idx} 
                                                  className="flex-1 bg-slate-100 h-full rounded flex flex-col justify-end cursor-pointer"
                                                  onMouseEnter={() => setHoveredBarIndex(idx)}
                                                  onMouseLeave={() => setHoveredBarIndex(null)}
                                                  onClick={() => {
                                                    setHoveredBarIndex(idx);
                                                    setSuccessToast(`Nilai Hari ke-${idx + 1} terpilih: ${val}%`);
                                                    setTimeout(() => setSuccessToast(null), 2000);
                                                  }}
                                                >
                                                  <div 
                                                    style={{ height: `${val}%` }} 
                                                    className={cn(
                                                      "w-full rounded-xs transition-all duration-150", 
                                                      hoveredBarIndex === idx ? "bg-[#696cff]" : "bg-[#e7e7ff]"
                                                    )} 
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="pt-2 border-t border-slate-50 text-center text-[7px] text-[#a1acb8]">
                                            Klik bar untuk periksa detail harian
                                          </div>
                                        </div>

                                        {/* Modul 10: Sertifikasi Sistem */}
                                        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-xs flex flex-col justify-between hover:border-[#696cff]/40 hover:shadow-md transition-all duration-300 min-h-[175px]">
                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 rounded-lg bg-[#e7e7ff] flex items-center justify-center text-[#696cff]">
                                                <ShieldAlert className="h-4 w-4" />
                                              </div>
                                              <span className="text-[9px] font-bold text-[#696cff] bg-[#e7e7ff] px-2 py-0.5 rounded-md">Patuh AAA</span>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-[#7a838b] font-semibold uppercase tracking-wider block">Sertifikasi Sistem</span>
                                              <span className="text-xs font-extrabold text-[#566a7f] block">{complianceLevel}</span>
                                            </div>
                                            <p className="text-[7.5px] text-[#a1acb8] leading-tight">Kontras warna, rasio spasi, dan standarisasi visual dipatuhi.</p>
                                          </div>
                                          <div className="pt-2 border-t border-slate-50">
                                            <button 
                                              disabled={isAuditingCompliance}
                                              onClick={() => {
                                                setIsAuditingCompliance(true);
                                                setTimeout(() => {
                                                  setIsAuditingCompliance(false);
                                                  setComplianceLevel("Certified AAA (100% Lolos)");
                                                  setSuccessToast("Sistem memenuhi standar aksesibilitas AAA!");
                                                  setTimeout(() => setSuccessToast(null), 3000);
                                                }, 800);
                                              }}
                                              className="w-full py-1 text-[8px] font-bold bg-[#e7e7ff] hover:bg-[#d0d0ff] text-[#696cff] rounded transition disabled:opacity-50"
                                            >
                                              {isAuditingCompliance ? "Mengaudit..." : "Jalankan Audit Visual"}
                                            </button>
                                          </div>
                                        </div>

                                      </div>
                                    </div>
                                  ) : (
                                    /* Standard Desktop Dashboard Layout */
                                    <>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h4 className="text-sm font-bold text-slate-900">{getMockMetadata().appName}</h4>
                                          <p className="text-[9px] text-slate-500">{getMockMetadata().subtitle}</p>
                                        </div>
                                        <span className={cn("px-2 py-0.5 text-[8px] font-extrabold rounded-full bg-white border uppercase tracking-wider", getPrimaryClasses().text, getPrimaryClasses().border)}>
                                          Desktop Workspace
                                        </span>
                                      </div>

                                      {/* Stats Grid */}
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                          <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">{getMockMetadata().metricLabel}</div>
                                          <div className="text-base font-black text-slate-900">{getMockMetadata().metricValue}</div>
                                          <div className="text-[8px] text-emerald-600 font-bold flex items-center gap-0.5">
                                            {getMockMetadata().metricSub}
                                          </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                          <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Metrik Penyelesaian</div>
                                          <div className="text-base font-black text-slate-900">
                                            {simulatedItems.filter(i => i.completed).length} / {simulatedItems.length} Selesai
                                          </div>
                                          <div className="text-[8px] text-slate-500 font-medium">
                                            Rasio produktivitas saat ini {simulatedItems.length ? Math.round((simulatedItems.filter(i => i.completed).length / simulatedItems.length) * 100) : 0}%
                                          </div>
                                        </div>
                                      </div>

                                      {/* Quick Preview list */}
                                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                          <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wide">{getMockMetadata().featureTitle}</span>
                                          <button onClick={() => setSimulatedTab("features")} className={cn("text-[8px] font-extrabold hover:underline", getPrimaryClasses().text)}>Lihat Semua</button>
                                        </div>
                                        <div className="space-y-1.5">
                                          {simulatedItems.slice(0, 2).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-[9px] bg-slate-50 p-2 rounded-md border border-slate-200/60">
                                              <div className="flex items-center gap-2">
                                                <button onClick={() => handleToggleItem(item.id)} className={getPrimaryClasses().text}>
                                                  {item.completed ? (
                                                    <CheckSquare className="h-3.5 w-3.5 stroke-[2.5]" />
                                                  ) : (
                                                    <Square className="h-3.5 w-3.5 stroke-[2]" />
                                                  )}
                                                </button>
                                                <span className={cn("font-semibold text-slate-800", item.completed && "line-through text-slate-400")}>{item.title}</span>
                                              </div>
                                              <span className={cn("px-1.5 py-0.5 text-[7px] font-extrabold rounded-md", item.completed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                                                {item.status}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}

                              {/* View 2: Feature Manager (Highly Interactive Grid + Adder) */}
                              {simulatedTab === "features" && (
                                <div className="space-y-3 animate-scale-up">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h4 className="text-xs font-bold text-slate-800">{getMockMetadata().featureTitle} Panel</h4>
                                    
                                    {/* Search Bar */}
                                    <div className="relative">
                                      <Search className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
                                      <input
                                        type="text"
                                        placeholder="Cari modul..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-7 pr-2.5 py-1 text-[9px] w-full sm:w-36 border border-slate-300 rounded-lg outline-none bg-white focus:border-indigo-500"
                                      />
                                    </div>
                                  </div>

                                  {/* Add item form */}
                                  <form onSubmit={handleAddItem} className="flex gap-1.5 bg-slate-100 p-2 rounded-lg border border-slate-200">
                                    <input
                                      type="text"
                                      value={newItemText}
                                      onChange={(e) => setNewItemText(e.target.value)}
                                      placeholder="Nama fitur/komponen baru..."
                                      className="flex-1 text-[9px] px-2.5 py-1.5 border border-slate-300 rounded-md outline-none bg-white focus:ring-1 focus:ring-slate-400"
                                    />
                                    <button type="submit" className={cn("px-3 py-1.5 text-[9px] font-extrabold rounded-md shadow-2xs transition flex items-center gap-1 text-white", getPrimaryClasses().bg, getPrimaryClasses().bgHover)}>
                                      <Plus className="h-3 w-3 stroke-[2.5]" />
                                      <span>Tambah</span>
                                    </button>
                                  </form>

                                  {/* Items list */}
                                  <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                                    {simulatedItems.filter(item => 
                                      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map((item) => (
                                      <div key={item.id} className="flex items-start justify-between bg-white p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition shadow-3xs">
                                        <div className="flex gap-2.5 items-start">
                                          <button onClick={() => handleToggleItem(item.id)} className={cn("mt-0.5", getPrimaryClasses().text)}>
                                            {item.completed ? (
                                              <CheckSquare className="h-4 w-4 stroke-[2.5]" />
                                            ) : (
                                              <Square className="h-4 w-4 stroke-[2]" />
                                            )}
                                          </button>
                                          <div className="space-y-0.5">
                                            <span className={cn("text-[10px] font-bold text-slate-800 block", item.completed && "line-through text-slate-400")}>
                                              {item.title}
                                            </span>
                                            <span className="text-[8px] text-slate-500 block leading-tight">{item.desc}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className={cn("px-1.5 py-0.5 text-[7px] font-black rounded-md uppercase", item.completed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                                            {item.status}
                                          </span>
                                          <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500 p-1 rounded-md transition hover:bg-slate-50">
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    {simulatedItems.length === 0 && (
                                      <p className="text-[9px] text-slate-400 text-center py-4">Belum ada item dalam simulasi. Tambahkan di atas!</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* View 3: Design Tokens Config / Settings */}
                              {simulatedTab === "settings" && (
                                <div className="space-y-3 animate-scale-up">
                                  <h4 className="text-xs font-bold text-slate-800">Spesifikasi Token Desain</h4>
                                  <p className="text-[9px] text-slate-500 leading-relaxed">
                                    Token-token ini dijahit secara real-time ke dalam simulator. Perubahan di panel kiri akan segera tercermin secara visual di sini.
                                  </p>

                                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                                    <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                                      <span className="font-bold text-slate-500 block">Warna Utama (Primary)</span>
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <span className={cn("h-3 w-3 rounded-full", getPrimaryClasses().bg)} />
                                        <span className="font-mono text-slate-800">{primaryColor.toUpperCase()} ({getPrimaryClasses().bg})</span>
                                      </div>
                                    </div>
                                    <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                                      <span className="font-bold text-slate-500 block">Corners (Borders)</span>
                                      <span className="font-mono text-slate-800 mt-1 block uppercase">{borderRadius} ({getBorderRadiusClass()})</span>
                                    </div>
                                    <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                                      <span className="font-bold text-slate-500 block">Gaya Font (Typography)</span>
                                      <span className="font-mono text-slate-800 mt-1 block uppercase">{fontTheme} ({getFontFamilyClass()})</span>
                                    </div>
                                    <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                                      <span className="font-bold text-slate-500 block">Stitch API Sync</span>
                                      <span className="font-mono text-emerald-600 mt-1 block uppercase font-bold">{stitchKey ? "SYNCHRONIZED" : "STANDALONE"}</span>
                                    </div>
                                  </div>

                                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] font-bold text-amber-900">Contrast Compliance</span>
                                      <p className="text-[8px] text-amber-700 leading-relaxed">Semua kombinasi warna di atas telah diuji kontras secara otomatis agar memenuhi standar WCAG AAA.</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                            </main>
                          </div>
                        </div>
                      )}

                      {/* Mobile Phone Mock Viewport */}
                      {previewViewport === "mobile" && (
                        <div className={cn("w-[280px] bg-slate-950 p-2.5 shadow-2xl rounded-[36px] border-4 border-slate-800 text-left h-[430px] flex flex-col justify-between overflow-hidden relative transition-all duration-300", getFontFamilyClass())}>
                          {/* Top notch bar */}
                          <div className="flex justify-between items-center px-4 py-1 text-white text-[8px] tracking-wide shrink-0">
                            <span>09:41</span>
                            <div className="w-16 h-3.5 bg-slate-950 rounded-b-lg flex justify-center items-center">
                              <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                            </div>
                            <span className="text-[8px] opacity-75">100%</span>
                          </div>

                          {/* Mobile Screen Container */}
                          <div className={cn("flex-1 overflow-hidden flex flex-col justify-between mt-1.5 relative", primaryColor === "sneat" ? "bg-[#f5f5f9]" : "bg-slate-50", getBorderRadiusClass())}>
                            
                            {/* Navigation Top Header */}
                            <header className="bg-white px-3 py-2 border-b border-slate-150 flex items-center justify-between shrink-0">
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 hover:text-slate-900">
                                  <Menu className="h-4 w-4" />
                                </button>
                                <span className="text-[10px] font-extrabold text-slate-900">{getMockMetadata().appName}</span>
                              </div>
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                            </header>

                            {/* Mobile Sidebar Left Sliding Menu Overlay */}
                            {mobileMenuOpen && (
                              <div className="absolute inset-0 bg-black/40 z-20 flex animate-fade-in">
                                <div className={cn(
                                  "w-44 p-4 flex flex-col justify-between animate-slide-right border-r",
                                  primaryColor === "sneat"
                                    ? "bg-white text-[#646e78] border-[#e4e6e8]"
                                    : "bg-slate-900 text-slate-300 border-transparent"
                                )}>
                                  <div className="space-y-4">
                                    <div className={cn(
                                      "flex items-center justify-between pb-2 border-b",
                                      primaryColor === "sneat" ? "border-slate-100" : "border-slate-800"
                                    )}>
                                      <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wide",
                                        primaryColor === "sneat" ? "text-[#566a7f]" : "text-white"
                                      )}>{primaryColor === "sneat" ? "Indigo UI" : getMockMetadata().appName}</span>
                                      <button onClick={() => setMobileMenuOpen(false)} className={primaryColor === "sneat" ? "text-slate-400 hover:text-slate-600" : "text-slate-400 hover:text-white"}>
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <div className="space-y-1 text-[9px]">
                                      <button
                                        onClick={() => { setSimulatedTab("overview"); setMobileMenuOpen(false); }}
                                        className={cn(
                                          "w-full text-left p-2 rounded-lg font-bold flex items-center gap-1.5",
                                          primaryColor === "sneat"
                                            ? simulatedTab === "overview" 
                                              ? "bg-[#e7e7ff] text-[#696cff]" 
                                              : "text-[#646e78] hover:bg-[#f5f5f9]"
                                            : simulatedTab === "overview" 
                                              ? "bg-slate-800 text-white" 
                                              : "text-slate-400"
                                        )}
                                      >
                                        <Layout className="h-3 w-3" />
                                        Ringkasan
                                      </button>
                                      <button
                                        onClick={() => { setSimulatedTab("features"); setMobileMenuOpen(false); }}
                                        className={cn(
                                          "w-full text-left p-2 rounded-lg font-bold flex items-center gap-1.5",
                                          primaryColor === "sneat"
                                            ? simulatedTab === "features" 
                                              ? "bg-[#e7e7ff] text-[#696cff]" 
                                              : "text-[#646e78] hover:bg-[#f5f5f9]"
                                            : simulatedTab === "features" 
                                              ? "bg-slate-800 text-white" 
                                              : "text-slate-400"
                                         )}
                                      >
                                        <PenTool className="h-3 w-3" />
                                        {getMockMetadata().featureTitle}
                                      </button>
                                      <button
                                        onClick={() => { setSimulatedTab("settings"); setMobileMenuOpen(false); }}
                                        className={cn(
                                          "w-full text-left p-2 rounded-lg font-bold flex items-center gap-1.5",
                                          primaryColor === "sneat"
                                            ? simulatedTab === "settings" 
                                              ? "bg-[#e7e7ff] text-[#696cff]" 
                                              : "text-[#646e78] hover:bg-[#f5f5f9]"
                                            : simulatedTab === "settings" 
                                              ? "bg-slate-800 text-white" 
                                              : "text-slate-400"
                                        )}
                                      >
                                        <SettingsIcon className="h-3 w-3" />
                                        Konfigurasi Token
                                      </button>
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "text-[7px] font-mono",
                                    primaryColor === "sneat" ? "text-slate-400" : "text-slate-600"
                                  )}>Mobile Navigation Overlay</div>
                                </div>
                                <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
                              </div>
                            )}

                            {/* Scrollable Mobile Feed */}
                            <main className="flex-1 p-3 overflow-y-auto space-y-3">
                              
                              {/* View 1: Overview Tab */}
                              {simulatedTab === "overview" && (
                                <div className="space-y-3 animate-scale-up">
                                  {primaryColor === "sneat" ? (
                                    /* Mobile Sneat Special Layout */
                                    <div className="space-y-3 font-['Public_Sans']">
                                      {/* Mobile Congratulation Card */}
                                      <div className="p-3 bg-white border border-[#e4e6e8] rounded-xl shadow-xs flex flex-col gap-2 relative overflow-hidden">
                                        <div className="space-y-1 z-10">
                                          <h5 className="text-xs font-bold text-[#696cff]">Congratulations John! 🎉</h5>
                                          <p className="text-[9px] text-[#646e78] leading-relaxed">
                                            Lencana Emas aktif. Tingkat konversi meningkat <span className="font-bold text-[#71dd37]">72.8%</span> hari ini.
                                          </p>
                                        </div>
                                        <button 
                                          onClick={() => { setSuccessToast("Lencana Emas diaktifkan!"); setTimeout(() => setSuccessToast(null), 3000); }} 
                                          className="h-9 w-full rounded-lg bg-[#696cff] hover:bg-[#5a5dcc] text-white text-[9px] font-semibold transition shadow-xs z-10 cursor-pointer"
                                        >
                                          View Badges
                                        </button>
                                        <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-[#e7e7ff]/30 pointer-events-none" />
                                      </div>

                                      {/* Mobile Revenue & System Info */}
                                      <div className="bg-white p-3 rounded-xl border border-[#e4e6e8] shadow-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] font-bold text-[#566a7f]">Revenue & Integrasi AI</span>
                                          <span className="px-1.5 py-0.5 rounded-full text-[6px] font-extrabold bg-[#e7e7ff] text-[#696cff] uppercase">V2.0 Active</span>
                                        </div>
                                        <div className="h-10 flex items-end justify-between px-2 pt-1 bg-slate-50/50 rounded-lg">
                                          {[30, 60, 45, 80, 50, 95, 70].map((h, i) => (
                                            <div key={i} className="w-3 bg-[#696cff]/20 rounded-t-xs h-full flex flex-col justify-end">
                                              <div style={{ height: `${h}%` }} className="w-full bg-[#696cff] rounded-t-xs" />
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* App Section Label: 10 Modules Stream */}
                                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                        <span className="text-[8px] font-bold text-[#566a7f] uppercase tracking-wider">Matriks Utama (10 Modul)</span>
                                        <span className="text-[7px] font-mono text-[#7a838b]">Responsive Grid</span>
                                      </div>

                                      {/* 10 Modules in a beautiful compact mobile 2-column grid */}
                                      <div className="grid grid-cols-2 gap-2">
                                        {/* Modul 1: Profit */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5">
                                          <div className="flex justify-between items-start">
                                            <div className="w-6 h-6 rounded bg-[#e8f5e9] flex items-center justify-center text-[#71dd37]">
                                              <TrendingUp className="h-3 w-3" />
                                            </div>
                                            <span className="text-[6px] font-bold text-[#71dd37] bg-[#e8f5e9] px-1 py-0.5 rounded">+72.8%</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Profitabilitas</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">$12,628</span>
                                          </div>
                                        </div>

                                        {/* Modul 2: Payments */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5">
                                          <div className="flex justify-between items-start">
                                            <div className="w-6 h-6 rounded bg-[#ffe0d6] flex items-center justify-center text-[#ff3e1d]">
                                              <CreditCard className="h-3 w-3" />
                                            </div>
                                            <span className="text-[6px] font-bold text-[#ff3e1d] bg-[#ffe0d6] px-1 py-0.5 rounded">-14.8%</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Pembayaran</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">$2,456</span>
                                          </div>
                                        </div>

                                        {/* Modul 3: Sales Volume */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5">
                                          <div className="flex justify-between items-start">
                                            <div className="w-6 h-6 rounded bg-[#e1f5fe] flex items-center justify-center text-[#03c3ec]">
                                              <Award className="h-3 w-3" />
                                            </div>
                                            <span className="text-[6px] font-bold text-[#03c3ec] bg-[#e1f5fe] px-1 py-0.5 rounded">+24.5%</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Penjualan</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">4,850 Pcs</span>
                                          </div>
                                        </div>

                                        {/* Modul 4: Active Users */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5">
                                          <div className="flex justify-between items-start">
                                            <div className="w-6 h-6 rounded bg-[#e7e7ff] flex items-center justify-center text-[#696cff]">
                                              <Users className="h-3 w-3" />
                                            </div>
                                            <span className="text-[6px] font-bold text-[#696cff] bg-[#e7e7ff] px-1 py-0.5 rounded">+18.4%</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Sesi Aktif</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">12.4K</span>
                                          </div>
                                        </div>

                                        {/* Modul 5: Latency & SLA */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5">
                                          <div className="flex justify-between items-start">
                                            <div className="w-6 h-6 rounded bg-[#e8f5e9] flex items-center justify-center text-[#71dd37]">
                                              <RefreshCw className="h-3 w-3 animate-spin-slow" />
                                            </div>
                                            <span className="text-[6px] font-bold text-[#71dd37] bg-[#e8f5e9] px-1 py-0.5 rounded">99.9%</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Keandalan API</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">12ms SLA</span>
                                          </div>
                                        </div>

                                        {/* Modul 6: PRD & AI Tasks */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5">
                                          <div className="flex justify-between items-start">
                                            <div className="w-6 h-6 rounded bg-[#e7e7ff] flex items-center justify-center text-[#696cff]">
                                              <CheckSquare className="h-3 w-3" />
                                            </div>
                                            <span className="text-[6px] font-bold text-[#696cff] bg-[#e7e7ff] px-1 py-0.5 rounded">3/3</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Tugas Utama</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">PRD Done</span>
                                          </div>
                                        </div>

                                        {/* Modul 7: Model & Sliders */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5">
                                          <div className="flex justify-between items-start">
                                            <div className="w-6 h-6 rounded bg-[#e1f5fe] flex items-center justify-center text-[#03c3ec]">
                                              <Sliders className="h-3 w-3" />
                                            </div>
                                            <span className="text-[6px] font-bold text-[#03c3ec] bg-[#e1f5fe] px-1 py-0.5 rounded">AI</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Model</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">Gemini Flash</span>
                                          </div>
                                        </div>

                                        {/* Modul 8: Responsive Grid */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5">
                                          <div className="flex justify-between items-start">
                                            <div className="w-6 h-6 rounded bg-[#ffe0d6] flex items-center justify-center text-[#ff3e1d]">
                                              <Smartphone className="h-3 w-3" />
                                            </div>
                                            <span className="text-[6px] font-bold text-[#ff3e1d] bg-[#ffe0d6] px-1 py-0.5 rounded">Grid</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Responsif</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">Mobile UI</span>
                                          </div>
                                        </div>

                                        {/* Modul 9: Trend & Bar Analytics */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5 col-span-2 flex items-center justify-between gap-3">
                                          <div className="space-y-0.5 flex-1">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Tren Analitik Grafik</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">Real-Time Bar</span>
                                          </div>
                                          <div className="h-6 flex items-end gap-1 w-20 shrink-0">
                                            {[35, 75, 45, 90, 60].map((val, idx) => (
                                              <div key={idx} className="flex-1 bg-[#e7e7ff] h-full rounded-xs flex flex-col justify-end">
                                                <div style={{ height: `${val}%` }} className="bg-[#696cff] w-full rounded-xs" />
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Modul 10: Shield AAA Certification */}
                                        <div className="bg-white p-2.5 rounded-xl border border-[#e4e6e8] shadow-xs space-y-1.5 col-span-2 flex items-center justify-between gap-3">
                                          <div className="space-y-0.5">
                                            <span className="text-[7px] text-[#7a838b] font-medium block leading-tight">Sertifikasi & Kontras</span>
                                            <span className="text-[9px] font-extrabold text-[#566a7f] block">Aksesibilitas AAA</span>
                                          </div>
                                          <span className="text-[6px] font-bold text-[#696cff] bg-[#e7e7ff] px-1.5 py-0.5 rounded shrink-0">AAA Certified</span>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Standard Mobile Dashboard Layout */
                                    <>
                                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-3xs space-y-1">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Desain Token Ber-Stitch</span>
                                        <h5 className="text-[10px] font-bold text-slate-800">Mobile Navigation Mode</h5>
                                        <p className="text-[9px] text-slate-500 leading-relaxed">
                                          Layout otomatis disesuaikan menggunakan bottom navigation bar, optimal untuk genggaman satu tangan.
                                        </p>
                                      </div>

                                      {/* Mobile Card Metrics */}
                                      <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-3xs flex items-center justify-between">
                                        <div className="space-y-0.5">
                                          <span className="text-[8px] font-bold text-slate-400 uppercase block">{getMockMetadata().metricLabel}</span>
                                          <span className="text-sm font-black text-slate-950 block">{getMockMetadata().metricValue}</span>
                                        </div>
                                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-[7px] font-bold text-emerald-700">{getMockMetadata().metricSub}</span>
                                      </div>

                                      {/* Styled components mock */}
                                      <div className="space-y-1.5">
                                        <span className="text-[8px] font-bold text-slate-400 block">Uji Tombol Touch Target (Min 44px)</span>
                                        <div className="flex gap-2">
                                          <button onClick={() => { setSuccessToast("Tombol Primary di-tap!"); setTimeout(() => setSuccessToast(null), 2500); }} className={cn("flex-1 text-[9px] h-[44px] font-bold rounded-lg shadow-3xs transition text-white active:scale-95", getPrimaryClasses().bg, getPrimaryClasses().bgHover)}>
                                            Primary CTA
                                          </button>
                                          <button onClick={() => setSimulatedTab("features")} className="flex-1 text-[9px] h-[44px] font-bold rounded-lg border border-slate-300 bg-white text-slate-700 active:scale-95 hover:bg-slate-50 transition text-center flex items-center justify-center">
                                            Lihat Fitur
                                          </button>
                                        </div>
                                      </div>

                                      {/* Informational Alert */}
                                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex gap-1.5">
                                        <AlertCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                          <span className="text-[8px] font-bold text-amber-900 block">Contrast Checked</span>
                                          <p className="text-[7px] text-amber-700 leading-normal">Telah memenuhi kelayakan WCAG AAA.</p>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}

                              {/* View 2: Mobile Features tab */}
                              {simulatedTab === "features" && (
                                <div className="space-y-3 animate-scale-up">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-800">{getMockMetadata().featureTitle} ({simulatedItems.length})</span>
                                  </div>

                                  {/* Add item simple mobile inline */}
                                  <form onSubmit={handleAddItem} className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                                    <input
                                      type="text"
                                      value={newItemText}
                                      onChange={(e) => setNewItemText(e.target.value)}
                                      placeholder="Fitur baru..."
                                      className="flex-1 text-[9px] px-2 py-1 outline-none font-sans"
                                    />
                                    <button type="submit" className={cn("px-2.5 py-1 text-[8px] font-extrabold rounded-md text-white", getPrimaryClasses().bg)}>
                                      Tambah
                                    </button>
                                  </form>

                                  <div className="space-y-1.5 max-h-[170px] overflow-y-auto">
                                    {simulatedItems.map((item) => (
                                      <div key={item.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-3xs">
                                        <div className="flex gap-2 items-center">
                                          <button onClick={() => handleToggleItem(item.id)} className={getPrimaryClasses().text}>
                                            {item.completed ? (
                                              <CheckSquare className="h-3.5 w-3.5 stroke-[2.5]" />
                                            ) : (
                                              <Square className="h-3.5 w-3.5 stroke-[2]" />
                                            )}
                                          </button>
                                          <span className={cn("text-[9px] font-semibold text-slate-800 block", item.completed && "line-through text-slate-400")}>
                                            {item.title}
                                          </span>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500 p-0.5">
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* View 3: Mobile settings tab */}
                              {simulatedTab === "settings" && (
                                <div className="space-y-2 animate-scale-up text-[9px]">
                                  <h4 className="font-bold text-slate-800 font-sans">Spesifikasi Token Desain</h4>
                                  <div className="space-y-1.5">
                                    <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                                      <span className="font-bold text-slate-500">Warna Utama</span>
                                      <span className={cn("h-3 w-3 rounded-full", getPrimaryClasses().bg)} />
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                                      <span className="font-bold text-slate-500">Sudut (Border Radius)</span>
                                      <span className="font-mono font-bold text-slate-700 uppercase">{borderRadius}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                                      <span className="font-bold text-slate-500">Gaya Font</span>
                                      <span className="font-mono font-bold text-slate-700 uppercase">{fontTheme}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                            </main>

                            {/* Sticky bottom mobile navigation tab */}
                            <nav className="bg-white border-t border-slate-200 py-1.5 px-3 flex justify-around text-[9px] text-slate-400 shrink-0">
                              <button
                                onClick={() => setSimulatedTab("overview")}
                                className={cn("flex flex-col items-center gap-0.5 font-bold transition", simulatedTab === "overview" ? getPrimaryClasses().text : "text-slate-400")}
                              >
                                <Layout className="h-3.5 w-3.5" />
                                <span className="text-[7px]">Overview</span>
                              </button>
                              <button
                                onClick={() => setSimulatedTab("features")}
                                className={cn("flex flex-col items-center gap-0.5 font-bold transition", simulatedTab === "features" ? getPrimaryClasses().text : "text-slate-400")}
                              >
                                <PenTool className="h-3.5 w-3.5" />
                                <span className="text-[7px]">Modul</span>
                              </button>
                              <button
                                onClick={() => setSimulatedTab("settings")}
                                className={cn("flex flex-col items-center gap-0.5 font-bold transition", simulatedTab === "settings" ? getPrimaryClasses().text : "text-slate-400")}
                              >
                                <SettingsIcon className="h-3.5 w-3.5" />
                                <span className="text-[7px]">Token</span>
                              </button>
                            </nav>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {/* Tab 3: Raw Markdown Source */}
                {activeTab === "raw" && (
                  <div className="bg-white border border-slate-200 text-slate-800 p-4 rounded-xl font-mono text-[11px] overflow-x-auto text-left whitespace-pre-wrap max-h-[500px] shadow-2xs">
                    {result}
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* Standby / Initial State Box */
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[450px]">
              <div className="w-16 h-16 bg-slate-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Menunggu Input Blueprint</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Gunakan panel parameter di sebelah kiri untuk menentukan preferensi visual, lalu klik tombol generate untuk melihat hasilnya secara lengkap dalam model responsive.
              </p>
            </div>
          )}
        </div>

      </div>

      {showShareModal && result && (
        <ShareTemplateModal
          onClose={() => setShowShareModal(false)}
          prd={{
            projectName: `Design System - ${prompt.substring(0, 30)}...`,
            projectDescription: `System Desain yang digenerate dengan warna utama ${primaryColor}, sudut ${borderRadius}, dan ter-stich secara premium.`,
            content: result,
          }}
        />
      )}

      {/* Floating Save Draft Toast Alert (Highly Responsive Mobile & Desktop) */}
      <AnimatePresence>
        {manualDraftSaved && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500 max-w-sm"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-100 shrink-0" />
            <div className="text-left">
              <p className="font-bold text-xs sm:text-sm text-emerald-50">Draf Desain Berhasil Disimpan!</p>
              <p className="text-[10px] text-emerald-100/80 mt-0.5">Parameter dan preferensi desain Anda telah disimpan dengan aman di penyimpanan lokal.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
