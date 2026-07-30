import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowRight,
  Smartphone,
  Monitor,
  Check,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  X,
  ChevronRight,
  Sliders,
  Trash2,
  Maximize2,
  Eye,
  Zap,
  BarChart3,
  ShoppingBag,
  CreditCard,
  Bell,
  User,
  ShieldCheck,
  Menu,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

interface DesignTemplate {
  id: string;
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
  isCustom?: boolean;
  authorName?: string;
}

const STATIC_TEMPLATES: DesignTemplate[] = [
  {
    id: "sneat-dashboard",
    title: "Modern Admin Dashboard System",
    category: "SaaS & Enterprise",
    color: "bg-[#696cff]",
    colorHex: "#696cff",
    primaryColor: "sneat",
    borderRadius: "md",
    fontTheme: "sans",
    layoutStyle: "modern",
    description: "Sistem admin dashboard modern dengan estetika Functional Minimalism, palet indigo ikonik, dan bento grid.",
    fullDescription: "Sistem desain admin panel profesional dengan estetika Functional Minimalism. Menggunakan warna utama indigo cerah (#696cff), sudut melengkung modern, visualisasi data interaktif, dan navigasi yang sangat responsif.",
    desktopSpec: "Sidebar kiri lebar 260px (fixed) dengan navigasi utama ber-radius 0.75rem. Bagian konten utama menggunakan gutter 24px, diisi grid bento-box multi-kolom.",
    mobileSpec: "Sidebar navigasi otomatis collapse menjadi hamburger menu. Top header ringkas dan susunan card data 1-kolom penuh.",
    typography: "Public Sans sebagai satu-satunya typeface. Memberikan kejelasan geometris dan keterbacaan yang luar biasa.",
    uiComponents: ["Congratulations Card", "Metric Card", "Interactive Balance Chart", "Latest Transactions Table"],
    accessibility: ["Kontras warna teks WCAG AA 4.5:1", "Touch target interaktif minimal 44px pada mobile", "Label ARIA deskriptif untuk diagram"],
    prompt: "Rancang sistem desain admin dashboard berdasarkan standar modern. Gunakan warna utama indigo (#696cff), secondary green (#71dd37), dan tertiary red (#ff3e1d). Terapkan font Public Sans, layout sidebar 260px, serta bento grid layout."
  },
  {
    id: "minimalist-ecommerce",
    title: "Minimalist E-commerce & Retail",
    category: "Retail & Fashion",
    color: "bg-blue-600",
    colorHex: "#2563eb",
    primaryColor: "blue",
    borderRadius: "none",
    fontTheme: "serif",
    layoutStyle: "clean",
    description: "Desain UI kit ritel bersih dan minimalis berfokus pada fotografi produk besar, visual premium, dan checkout linear.",
    fullDescription: "Sistem desain berorientasi kenyamanan belanja visual berkelas tinggi (premium retail). Sangat mengutamakan ruang negatif untuk menyoroti produk dan garis pembatas tipis.",
    desktopSpec: "Sticky top navigation + Left filter sidebar collapsible (240px) + 4-column product card bento grid.",
    mobileSpec: "Sticky bottom navigation tab-bar + Collapsible filter drawer + full screen product card single column.",
    typography: "Playfair Display untuk Headings (serif); Inter untuk body text (sans-serif).",
    uiComponents: ["Product Grid Card", "Collapsible Filters Drawer", "Sticky Add-to-Cart Bar", "Multi-stage Checkout Form"],
    accessibility: ["Kontras tinggi WCAG AAA hitam-putih", "Touch target interaktif minimal 44px pada mobile", "Aria-labels lengkap untuk keranjang"],
    prompt: "Buatkan panduan desain sistem ritel fashion minimalis berorientasi high-end dengan fotografi produk besar dan border-radius minimal."
  },
  {
    id: "fintech-dashboard",
    title: "Fintech Wealth & Trading Dashboard",
    category: "Finance",
    color: "bg-[#71dd37]",
    colorHex: "#71dd37",
    primaryColor: "emerald",
    borderRadius: "lg",
    fontTheme: "sans",
    layoutStyle: "modern",
    description: "Sistem dashboard finansial padat data dengan grafik multi-period, mutasi transaksi, dan visualisasi aset.",
    fullDescription: "Kerangka UI/UX berkinerja tinggi untuk mengelola keuangan pribadi maupun korporasi secara intuitif dengan kontras warna emerald.",
    desktopSpec: "Double-sidebar layout: Sidebar kiri sempit (64px) + panel kanan untuk riwayat transfer. Pusat layar diisi multi-period chart.",
    mobileSpec: "Top header dengan info saldo berukuran besar + swipeable horizontal cards untuk akun tabungan.",
    typography: "Public Sans / Inter dengan font-weight 700+ untuk visualisasi angka tabular.",
    uiComponents: ["Bento Asset Cards", "Line Charts Canvas Wrapper", "Transaction List Group", "Quick Action Floating Buttons"],
    accessibility: ["Kontras warna indikator untung/rugi ramah buta warna", "Dukungan navigasi keyboard untuk form transfer"],
    prompt: "Rancang blueprint UI/UX lengkap untuk dashboard Fintech Wealth Management dengan palet hijau zamrud dan bento box grid."
  },
  {
    id: "healthcare-telemedicine",
    title: "Healthcare App & Telemedicine",
    category: "Health & Care",
    color: "bg-[#ff3e1d]",
    colorHex: "#ff3e1d",
    primaryColor: "rose",
    borderRadius: "lg",
    fontTheme: "sans",
    layoutStyle: "modern",
    description: "Desain sistem berorientasi aksesibilitas, menenangkan, dan ramah pengguna untuk konsultasi medis online.",
    fullDescription: "Desain UI/UX humanis dan menenangkan dengan sudut melengkung lembut (rounded-2xl) dan palet rose-teal hangat.",
    desktopSpec: "Dashboard utama menampilkan profil dokter + calendar jadwal mingguan interaktif + riwayat resep.",
    mobileSpec: "Akses cepat 'Hubungi Dokter Sekarang' via floating call button + video call 16:9.",
    typography: "Public Sans / Outfit dengan kerning lebar untuk kejelasan dosis obat.",
    uiComponents: ["Doctor Profile Cards", "Weekly Calendar Scheduler", "Video Consultation Frame", "Prescription Tracker"],
    accessibility: ["WCAG AAA untuk lansia", "Teks info dosis dapat di-zoom secara dinamis", "Tombol SOS touch target 56px"],
    prompt: "Buat panduan Design System lengkap untuk aplikasi telemedicine dengan aksesibilitas tinggi dan warna menenangkan."
  },
  {
    id: "saas-admin-panel",
    title: "B2B SaaS Analytics & Admin Panel",
    category: "SaaS & Enterprise",
    color: "bg-indigo-600",
    colorHex: "#4f46e5",
    primaryColor: "indigo",
    borderRadius: "md",
    fontTheme: "sans",
    layoutStyle: "modern",
    description: "Template panel admin tangguh untuk visualisasi log, audit trails, dan kontrol sistem yang komprehensif.",
    fullDescription: "Sistem desain berdensitas tinggi yang efisien bagi profesional TI dan manajer sistem B2B SaaS.",
    desktopSpec: "Persistent left sidebar (256px) + top header global search (Ctrl+K) + dashboard multi-kolom.",
    mobileSpec: "Sidebar terlipat penuh ke hamburger menu + tabel data bertransisi menjadi card layout vertikal.",
    typography: "JetBrains Mono untuk ID transaksi dan logs; Public Sans untuk metrik utama.",
    uiComponents: ["Data Table with Filters", "Logs List with Status Badges", "API Key Generator Card", "Bento Grid System Cards"],
    accessibility: ["Labeling status log sangat jelas", "Kombinasi warna border tegas untuk fokus input", "Alt text dinamis untuk grafik"],
    prompt: "Buatkan panduan desain sistem komprehensif B2B SaaS Admin Panel dengan log audit dan tabel data besar."
  },
  {
    id: "creator-social-media",
    title: "Vibrant Social Media & Community App",
    category: "Media & Social",
    color: "bg-purple-600",
    colorHex: "#7c3aed",
    primaryColor: "indigo",
    borderRadius: "full",
    fontTheme: "sans",
    layoutStyle: "modern",
    description: "Layout dinamis untuk pembuatan konten, interaksi sosial, feed multimedia, dan sistem perpesanan.",
    fullDescription: "Sistem desain interaktif dengan warna-warna energik gradien yang menstimulasi keterlibatan pengguna.",
    desktopSpec: "3 kolom seimbang: Menu & Profil (Kiri), Feed Multimedia (Tengah), Trending Topics & Online Friends (Kanan).",
    mobileSpec: "Top story bar horizontal + feed 1-kolom penuh + Floating Action Button (FAB) pembuatan konten.",
    typography: "Public Sans / Outfit modern dan berjiwa muda.",
    uiComponents: ["Dynamic Media Feed Card", "Horizontal Story Circles", "Inline Comment Drawer", "Engagement Counters"],
    accessibility: ["Aria live regions untuk pembaruan pesan real-time", "Alt text media diintegrasikan pada draf postingan"],
    prompt: "Rancang Design System bertema dinamis untuk aplikasi media sosial dengan warna ungu gradien dan tombol capsule."
  },
  {
    id: "edtech-gamified",
    title: "Gamified Learning & EdTech Platform",
    category: "Education",
    color: "bg-amber-500",
    colorHex: "#f59e0b",
    primaryColor: "amber",
    borderRadius: "lg",
    fontTheme: "sans",
    layoutStyle: "modern",
    description: "Sistem edukasi kreatif dengan pelacakan pencapaian (gamifikasi), progress bar interaktif, dan kuis cerdas.",
    fullDescription: "UI/UX ramah anak dan dewasa untuk meningkatkan retensi belajar melalui isyarat visual menyenangkan.",
    desktopSpec: "Map belajar linier (Kiri) + panel instruksi teori (Tengah) + papan pencapaian lencana (Kanan).",
    mobileSpec: "Sistem kuis layar penuh berdesain kartu geser + progress bar mengambang + pilihan jawaban tebal.",
    typography: "Public Sans Rounded yang bersahabat dan sangat terbaca.",
    uiComponents: ["Gamified Milestone Map", "Interactive Quiz Choice Card", "Achievements Badges Grid", "Learning Progress Bar"],
    accessibility: ["Umpan balik audio-visual untuk kuis", "Kompatibilitas screen reader penuh", "Contrast rasio teks 4.5:1+"],
    prompt: "Rancang Design System EdTech berbasis gamifikasi interaktif dengan lencana, progress bar, dan kuis kartu besar."
  },
  {
    id: "ai-workspace",
    title: "AI Workspace & Block Editor",
    category: "AI & Productivity",
    color: "bg-violet-600",
    colorHex: "#7c3aed",
    primaryColor: "indigo",
    borderRadius: "md",
    fontTheme: "mono",
    layoutStyle: "modern",
    description: "Sistem dokumentasi kolaboratif dipersenjatai editor berbasis blok (block-editor) dan asisten AI chat inline.",
    fullDescription: "Antarmuka produktivitas masa depan yang menggabungkan kreativitas menulis dengan kecerdasan buatan.",
    desktopSpec: "Split-pane layout: Editor tulisan modular 60% + Panel Asisten AI 40%.",
    mobileSpec: "Mode fokus penuh dokumen + floating AI assistant button yang membuka drawer slide-up.",
    typography: "JetBrains Mono untuk kode/prompts; Public Sans untuk teks narasi.",
    uiComponents: ["Rich Block Editor Workspace", "AI Chat Bubble Component", "Contextual Formatting Toolbar", "Inline AI Suggester"],
    accessibility: ["Voice feedback status AI sedang mengetik", "Aria-autocomplete pada suggest perintah", "Keyboard shortcuts clear"],
    prompt: "Rancang blueprint UI/UX AI-integrated document workspace dengan layout split-screen dan mode fokus mobile."
  }
];

export function TemplateDesign() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customTemplates, setCustomTemplates] = useState<DesignTemplate[]>([]);

  const templates = useMemo(() => {
    return [...customTemplates, ...STATIC_TEMPLATES];
  }, [customTemplates]);

  const [activeTemplate, setActiveTemplate] = useState<DesignTemplate>(STATIC_TEMPLATES[0]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"desktop" | "mobile" | "customizer" | "specs">("desktop");

  useEffect(() => {
    if (templates.length > 0 && !templates.some(t => t.id === activeTemplate?.id)) {
      setActiveTemplate(templates[0]);
    }
  }, [templates, activeTemplate]);

  useEffect(() => {
    const q = query(collection(db, "design_templates"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isCustom: true,
      })) as DesignTemplate[];
      setCustomTemplates(parsed);
    }, (err) => {
      console.warn("Gagal memuat template kustom:", err);
    });
    return () => unsubscribe();
  }, []);
  
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>("sneat");
  const [customBorderRadius, setCustomBorderRadius] = useState<string>("md");
  const [customFontTheme, setCustomFontTheme] = useState<string>("sans");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (activeTemplate) {
      setCustomPrimaryColor(activeTemplate.primaryColor || "sneat");
      setCustomBorderRadius(activeTemplate.borderRadius || "md");
      setCustomFontTheme(activeTemplate.fontTheme || "sans");
    }
  }, [activeTemplate]);

  const categories = useMemo(() => {
    const list = new Set(templates.map((t) => t.category));
    return ["all", ...Array.from(list)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchCategory = selectedCategory === "all" || t.category === selectedCategory;
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery, templates]);

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Apakah Anda yakin ingin menghapus template kustom ini?")) return;
    try {
      await deleteDoc(doc(db, "design_templates", id));
      triggerToast("Template kustom berhasil dihapus.");
      if (activeTemplate?.id === id) {
        setActiveTemplate(STATIC_TEMPLATES[0]);
      }
    } catch (err: any) {
      console.error("Gagal menghapus template:", err);
      triggerToast("Gagal menghapus template.");
    }
  };

  const handleLaunchTemplate = (template?: DesignTemplate) => {
    const target = template || activeTemplate;
    navigate("/generate-design", {
      state: {
        prompt: target.prompt,
        primaryColor: customPrimaryColor,
        borderRadius: customBorderRadius,
        fontTheme: customFontTheme,
        layoutStyle: target.layoutStyle,
      },
    });
  };

  const handleOpenDetailModal = (template: DesignTemplate) => {
    setActiveTemplate(template);
    setIsDetailModalOpen(true);
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case "emerald":
        return {
          bg: "bg-[#71dd37]",
          hoverBg: "hover:bg-[#62c42f]",
          text: "text-[#71dd37]",
          border: "border-[#71dd37]",
          badgeBg: "bg-[#e8f5e9]",
          badgeText: "text-[#71dd37]",
          accentHex: "#71dd37"
        };
      case "rose":
        return {
          bg: "bg-[#ff3e1d]",
          hoverBg: "hover:bg-[#e63214]",
          text: "text-[#ff3e1d]",
          border: "border-[#ff3e1d]",
          badgeBg: "bg-[#ffebe8]",
          badgeText: "text-[#ff3e1d]",
          accentHex: "#ff3e1d"
        };
      case "blue":
        return {
          bg: "bg-blue-600",
          hoverBg: "hover:bg-blue-700",
          text: "text-blue-600",
          border: "border-blue-600",
          badgeBg: "bg-blue-50",
          badgeText: "text-blue-600",
          accentHex: "#2563eb"
        };
      case "amber":
        return {
          bg: "bg-[#ffab00]",
          hoverBg: "hover:bg-[#e09600]",
          text: "text-[#ffab00]",
          border: "border-[#ffab00]",
          badgeBg: "bg-[#fff3e0]",
          badgeText: "text-[#ffab00]",
          accentHex: "#ffab00"
        };
      case "charcoal":
        return {
          bg: "bg-[#22303e]",
          hoverBg: "hover:bg-[#1a2530]",
          text: "text-[#22303e]",
          border: "border-[#22303e]",
          badgeBg: "bg-slate-100",
          badgeText: "text-slate-800",
          accentHex: "#22303e"
        };
      case "sneat":
      case "indigo":
      default:
        return {
          bg: "bg-[#696cff]",
          hoverBg: "hover:bg-[#5a5ddb]",
          text: "text-[#696cff]",
          border: "border-[#696cff]",
          badgeBg: "bg-[#e7e7ff]",
          badgeText: "text-[#696cff]",
          accentHex: "#696cff"
        };
    }
  };

  const getRadiusClass = (r: string) => {
    if (r === "none") return "rounded-none";
    if (r === "lg") return "rounded-2xl";
    if (r === "full") return "rounded-full";
    return "rounded-xl";
  };

  const getFontThemeClass = (f: string) => {
    if (f === "serif") return "font-serif";
    if (f === "mono") return "font-mono";
    return "font-sans";
  };

  const activeColorTheme = getColorClasses(customPrimaryColor);

  return (
    <div className="w-full space-y-6 pb-16 text-[#566a7f]">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-white text-[#384756] px-4 py-3 rounded-xl shadow-[0_4px_16px_rgba(67,89,113,0.2)] border border-[#e4e6e8] flex items-center gap-2 animate-scale-up text-xs font-bold">
          <CheckCircle2 className="h-4 w-4 text-[#71dd37] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Hero Header Banner Style */}
      <div className="relative overflow-hidden bg-white rounded-xl p-5 sm:p-7 text-[#566a7f] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] border border-[#e4e6e8] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-[#e7e7ff] text-[#696cff] px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Workspace Blueprint UI Kit & Design System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#384756] tracking-tight">
            Katalog Design System & Template UI
          </h1>
          <p className="text-xs sm:text-sm text-[#7a838b] leading-relaxed">
            Pilih template, sesuaikan token visual (warna, radius, tipografi), dan jalankan generator UI AI secara instan. Kompatibel penuh untuk versi Desktop dan Mobile.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => navigate("/template-design/custom")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#696cff] hover:bg-[#5a5ddb] text-white rounded-lg text-xs font-bold shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span>+ Buat Template Kustom</span>
          </button>
        </div>
      </div>

      {/* Main Grid Area - Full Width */}
      <div className="space-y-5">
        
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1acb8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari gaya desain, ritel, dashboard, kesehatan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e4e6e8] focus:border-[#696cff] focus:ring-1 focus:ring-[#696cff] text-xs font-semibold outline-none bg-[#f5f5f9]"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-[#7a838b] bg-[#f5f5f9] px-3 py-2 rounded-lg border border-[#e4e6e8]">
                {filteredTemplates.length} Template
              </span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition cursor-pointer",
                  selectedCategory === cat
                    ? "bg-[#696cff] text-white shadow-2xs"
                    : "bg-[#f5f5f9] text-[#566a7f] hover:bg-[#e7e7ff]/60"
                )}
              >
                {cat === "all" ? "Semua Kategori" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid - 3 Columns on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const isSelected = activeTemplate.id === template.id;
            return (
              <div
                key={template.id}
                onClick={() => setActiveTemplate(template)}
                className={cn(
                  "group bg-white rounded-xl border transition-all duration-200 flex flex-col cursor-pointer relative overflow-hidden shadow-[0_2px_6px_0_rgba(67,89,113,0.08)] hover:shadow-[0_4px_16px_0_rgba(67,89,113,0.16)] hover:-translate-y-0.5",
                  isSelected
                    ? "border-[#696cff] ring-2 ring-[#696cff]/20"
                    : "border-[#e4e6e8]"
                )}
              >
                {/* Top Color Strip Accent */}
                <div className={cn("h-2.5 w-full", template.color)} />

                {/* Card Content */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold text-[#696cff] bg-[#e7e7ff] px-2.5 py-0.5 rounded-full uppercase truncate">
                      {template.category}
                    </span>
                    {template.isCustom ? (
                      <span className="text-[9px] font-extrabold bg-[#ffab00] text-white px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5 shrink-0">
                        <Sparkles className="w-2.5 h-2.5" /> AI Custom
                      </span>
                    ) : isSelected && (
                      <span className="text-[10px] font-extrabold text-[#71dd37] bg-[#e8f5e9] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" /> Terpilih
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-[#384756] group-hover:text-[#696cff] transition-colors text-sm sm:text-base line-clamp-1">
                      {template.title}
                    </h3>
                    <p className="text-xs text-[#7a838b] mt-1.5 leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Features Badges */}
                  <div className="pt-2 border-t border-[#f5f5f9] flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#566a7f] bg-[#f5f5f9] border border-[#e4e6e8] px-2 py-0.5 rounded">
                      <Monitor className="h-3 w-3 text-[#696cff]" /> Desktop
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#566a7f] bg-[#f5f5f9] border border-[#e4e6e8] px-2 py-0.5 rounded">
                      <Smartphone className="h-3 w-3 text-[#71dd37]" /> Mobile
                    </span>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-3 border-t border-[#e4e6e8] flex items-center justify-between gap-2 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetailModal(template);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f5f5f9] hover:bg-[#e7e7ff] text-xs font-bold text-[#696cff] transition cursor-pointer"
                      title="Lihat Simulasi Desktop & Mobile"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Simulasi & Detail</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {template.isCustom && (
                        <button
                          onClick={(e) => handleDeleteTemplate(template.id, e)}
                          className="p-1.5 text-[#a1acb8] hover:text-[#ff3e1d] rounded-lg hover:bg-[#ffebe8] transition cursor-pointer"
                          title="Hapus template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchTemplate(template);
                        }}
                        className="px-3.5 py-1.5 bg-[#696cff] hover:bg-[#5a5ddb] text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-98"
                      >
                        <span>Gunakan</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full bg-white border border-[#e4e6e8] rounded-xl p-10 text-center text-xs font-semibold text-[#7a838b]">
              Tidak ada template yang cocok dengan kata kunci pencarian Anda.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMULATION MODAL DIALOG */}
      {/* ========================================================================= */}
      {isDetailModalOpen && activeTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-xl border border-[#e4e6e8] shadow-[0_8px_32px_0_rgba(67,89,113,0.25)] flex flex-col overflow-hidden text-[#566a7f]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#e4e6e8] bg-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("p-2 rounded-lg text-white shrink-0 shadow-2xs", activeTemplate.color)}>
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-[#696cff] bg-[#e7e7ff] px-2 py-0.5 rounded-full uppercase">
                      {activeTemplate.category}
                    </span>
                    {activeTemplate.isCustom && (
                      <span className="text-[9px] font-extrabold bg-[#ffab00] text-white px-2 py-0.5 rounded-full uppercase">
                        AI Custom
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#384756] truncate mt-0.5">
                    {activeTemplate.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-[#a1acb8] hover:text-[#ff3e1d] rounded-lg hover:bg-[#ffebe8] transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center gap-1 p-2 bg-[#f5f5f9] border-b border-[#e4e6e8] overflow-x-auto shrink-0 scrollbar-thin">
              {[
                { id: "desktop", label: "💻 Simulasi Desktop", icon: Monitor },
                { id: "mobile", label: "📱 Simulasi Mobile", icon: Smartphone },
                { id: "customizer", label: "🎨 Token Visual", icon: Sliders },
                { id: "specs", label: "📋 Spesifikasi & WCAG", icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer",
                    modalTab === tab.id
                      ? "bg-white text-[#696cff] shadow-2xs border border-[#e4e6e8]"
                      : "text-[#7a838b] hover:text-[#384756] hover:bg-white/50"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#f5f5f9]/50 space-y-4 scrollbar-thin">
              
              {/* TAB 1: DESKTOP SIMULATION */}
              {modalTab === "desktop" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#384756] uppercase tracking-wide">
                        Simulasi UI Kit - Desktop View
                      </h4>
                      <p className="text-[11px] text-[#7a838b]">
                        Left Sidebar (260px) dan Bento Grid Metrik.
                      </p>
                    </div>
                  </div>

                  <div className={cn("bg-white rounded-xl border border-[#e4e6e8] shadow-2xs overflow-hidden", getFontThemeClass(customFontTheme))}>
                    <div className="bg-[#e4e6e8]/80 px-3 py-1.5 flex items-center gap-2 border-b border-[#e4e6e8]">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#ff3e1d]" />
                        <span className="w-2 h-2 rounded-full bg-[#ffab00]" />
                        <span className="w-2 h-2 rounded-full bg-[#71dd37]" />
                      </div>
                      <div className="flex-1 bg-white px-2.5 py-0.5 rounded text-[10px] font-mono text-[#7a838b] border border-[#e4e6e8] truncate">
                        https://app.internal/dashboard/{activeTemplate.id}
                      </div>
                    </div>

                    <div className="flex min-h-[300px] bg-[#f5f5f9]">
                      <div className="w-44 bg-white border-r border-[#e4e6e8] p-3 hidden sm:block space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-6 h-6 rounded text-white flex items-center justify-center font-bold text-[10px]", activeColorTheme.bg)}>
                            W
                          </div>
                          <span className="text-xs font-bold text-[#384756] truncate">Workspace Blueprint</span>
                        </div>
                        <div className="space-y-1">
                          {["Dashboard", "Analitik", "Pelanggan", "Transaksi"].map((item, i) => (
                            <div key={i} className={cn("px-2 py-1 rounded text-xs font-semibold", i === 0 ? `${activeColorTheme.badgeBg} ${activeColorTheme.badgeText}` : "text-[#566a7f]")}>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-[#e4e6e8]">
                          <div className="flex items-center gap-1.5 text-xs text-[#7a838b]">
                            <Search className="h-3.5 w-3.5" />
                            <span>Cari fitur, laporan...</span>
                          </div>
                          <div className={cn("w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[10px]", activeColorTheme.bg)}>
                            A
                          </div>
                        </div>

                        <div className={cn("p-3 bg-white border border-[#e4e6e8] space-y-1", getRadiusClass(customBorderRadius))}>
                          <span className={cn("text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase", activeColorTheme.badgeBg, activeColorTheme.badgeText)}>
                            🎉 Dashboard Active
                          </span>
                          <h4 className="text-xs font-bold text-[#384756]">
                            {activeTemplate.title}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { label: "Pendapatan", val: "Rp 48.250.000", change: "+18.4%" },
                            { label: "Pengguna", val: "2.840 Users", change: "+12.1%" },
                            { label: "Konversi", val: "4.85%", change: "-0.5%" },
                          ].map((s, i) => (
                            <div key={i} className={cn("p-2.5 bg-white border border-[#e4e6e8]", getRadiusClass(customBorderRadius))}>
                              <span className="text-[9px] font-semibold text-[#7a838b] uppercase block">{s.label}</span>
                              <div className="text-xs font-extrabold text-[#384756] mt-0.5">{s.val}</div>
                              <span className="text-[9px] text-[#71dd37] font-bold">{s.change}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MOBILE SIMULATION */}
              {modalTab === "mobile" && (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="text-center">
                    <h4 className="text-xs font-bold text-[#384756] uppercase">
                      Simulasi UI Kit - Smartphone View
                    </h4>
                    <p className="text-[11px] text-[#7a838b]">
                      Touch target 44px+ & Bottom Tab Navigation.
                    </p>
                  </div>

                  <div className={cn("w-full max-w-[320px] bg-white border-4 border-[#384756] rounded-[24px] shadow-lg overflow-hidden flex flex-col min-h-[420px]", getFontThemeClass(customFontTheme))}>
                    <div className="bg-[#384756] text-white px-4 py-1 flex items-center justify-between text-[9px] font-bold">
                      <span>09:41</span>
                      <div className="w-12 h-2.5 bg-black/40 rounded-full" />
                      <span>100% 🔋</span>
                    </div>

                    <div className="bg-white p-2.5 border-b border-[#e4e6e8] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Menu className="h-3.5 w-3.5 text-[#566a7f]" />
                        <span className="text-xs font-bold text-[#384756] truncate">{activeTemplate.title}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#f5f5f9] flex-1 space-y-2 overflow-y-auto">
                      <div className={cn("p-3 bg-white border border-[#e4e6e8] space-y-1", getRadiusClass(customBorderRadius))}>
                        <span className={cn("text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase", activeColorTheme.badgeBg, activeColorTheme.badgeText)}>
                          Mobile View
                        </span>
                        <h5 className="text-xs font-bold text-[#384756]">
                          Responsif & Ergonomis
                        </h5>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { title: "Kirim", icon: ArrowRight },
                          { title: "Statistik", icon: BarChart3 },
                          { title: "Belanja", icon: ShoppingBag },
                          { title: "Tagihan", icon: CreditCard },
                        ].map((act, idx) => (
                          <div key={idx} className={cn("p-2 bg-white border border-[#e4e6e8] flex items-center gap-1.5 min-h-[40px]", getRadiusClass(customBorderRadius))}>
                            <act.icon className={cn("h-3.5 w-3.5", activeColorTheme.text)} />
                            <span className="text-xs font-bold text-[#384756]">{act.title}</span>
                          </div>
                        ))}
                      </div>

                      <button className={cn("w-full py-2.5 text-xs font-bold text-white shadow-2xs cursor-pointer min-h-[44px]", activeColorTheme.bg, getRadiusClass(customBorderRadius))}>
                        Tombol Utama Sentuh 44px
                      </button>
                    </div>

                    <div className="bg-white border-t border-[#e4e6e8] p-2 flex items-center justify-around text-[9px] font-bold text-[#7a838b]">
                      <div className={cn("flex flex-col items-center gap-0.5", activeColorTheme.text)}>
                        <Monitor className="h-3.5 w-3.5" />
                        <span>Home</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Search className="h-3.5 w-3.5" />
                        <span>Cari</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Bell className="h-3.5 w-3.5" />
                        <span>Notif</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMIZER */}
              {modalTab === "customizer" && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-[#e4e6e8] space-y-3">
                    <h4 className="text-xs font-bold text-[#384756] uppercase tracking-wide flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-[#696cff]" />
                      Atur Visual Tokens UI Kit
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#7a838b]">
                          Warna Utama
                        </label>
                        <select
                          value={customPrimaryColor}
                          onChange={(e) => setCustomPrimaryColor(e.target.value)}
                          className="w-full text-xs border border-[#e4e6e8] rounded-lg p-2 outline-none bg-white font-bold text-[#384756]"
                        >
                          <option value="sneat">Indigo Theme (#696cff)</option>
                          <option value="emerald">Emerald Green (#71dd37)</option>
                          <option value="rose">Rose Red (#ff3e1d)</option>
                          <option value="blue">Blue Retail (#2563eb)</option>
                          <option value="amber">Amber Warm (#ffab00)</option>
                          <option value="charcoal">Charcoal Dark (#22303e)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#7a838b]">
                          Border Radius
                        </label>
                        <div className="flex bg-[#e4e6e8]/60 p-0.5 rounded-lg">
                          {[
                            { id: "none", label: "Sharp" },
                            { id: "md", label: "Round" },
                            { id: "lg", label: "Soft" },
                          ].map((btn) => (
                            <button
                              key={btn.id}
                              onClick={() => setCustomBorderRadius(btn.id)}
                              className={cn(
                                "flex-1 text-xs py-1 rounded-md font-bold transition cursor-pointer",
                                customBorderRadius === btn.id
                                  ? "bg-white text-[#384756] shadow-2xs"
                                  : "text-[#7a838b]"
                              )}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#7a838b]">
                          Tipografi
                        </label>
                        <div className="flex bg-[#e4e6e8]/60 p-0.5 rounded-lg">
                          {[
                            { id: "sans", label: "Public Sans" },
                            { id: "serif", label: "Playfair" },
                            { id: "mono", label: "Mono" },
                          ].map((btn) => (
                            <button
                              key={btn.id}
                              onClick={() => setCustomFontTheme(btn.id)}
                              className={cn(
                                "flex-1 text-xs py-1 rounded-md font-bold transition cursor-pointer",
                                customFontTheme === btn.id
                                  ? "bg-white text-[#384756] shadow-2xs"
                                  : "text-[#7a838b]"
                              )}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={cn("p-4 bg-white border border-[#e4e6e8] space-y-3", getRadiusClass(customBorderRadius), getFontThemeClass(customFontTheme))}>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full uppercase", activeColorTheme.badgeBg, activeColorTheme.badgeText)}>
                        Pratinjau Token
                      </span>
                      <span className="text-xs font-mono text-[#7a838b]">{activeColorTheme.accentHex}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#384756]">
                      {activeTemplate.title}
                    </h3>
                    <div className="flex items-center gap-2 pt-1">
                      <button className={cn("px-3 py-1.5 text-xs font-bold text-white shadow-2xs cursor-pointer", activeColorTheme.bg, getRadiusClass(customBorderRadius))}>
                        Tombol Utama
                      </button>
                      <button className={cn("px-3 py-1.5 text-xs font-bold bg-white text-[#566a7f] border border-[#e4e6e8]", getRadiusClass(customBorderRadius))}>
                        Tombol Sekunder
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SPECS */}
              {modalTab === "specs" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-[#e4e6e8] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[#696cff] font-bold text-xs uppercase">
                        <Monitor className="h-4 w-4" />
                        <span>Desktop Specification</span>
                      </div>
                      <p className="text-xs text-[#566a7f]">
                        {activeTemplate.desktopSpec}
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-[#e4e6e8] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[#71dd37] font-bold text-xs uppercase">
                        <Smartphone className="h-4 w-4" />
                        <span>Mobile Specification</span>
                      </div>
                      <p className="text-xs text-[#566a7f]">
                        {activeTemplate.mobileSpec}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#e4e6e8] rounded-xl space-y-2">
                    <span className="block text-xs font-bold text-[#384756] uppercase">
                      Komponen UI Utama:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTemplate.uiComponents.map((comp, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-[#696cff] bg-[#e7e7ff] px-2 py-0.5 rounded-md">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#e4e6e8] rounded-xl space-y-1.5">
                    <span className="block text-xs font-bold text-[#384756] uppercase flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-[#71dd37]" />
                      Standar Aksesibilitas WCAG:
                    </span>
                    <ul className="space-y-1">
                      {activeTemplate.accessibility.map((acc, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-xs text-[#566a7f]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#71dd37] shrink-0" />
                          <span>{acc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-[#e4e6e8] bg-white flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-[#f5f5f9] hover:bg-[#e4e6e8] text-[#566a7f] text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Tutup
              </button>

              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleLaunchTemplate();
                }}
                className="px-5 py-2 bg-[#696cff] hover:bg-[#5a5ddb] text-white text-xs font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Gunakan & Generate Design</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
