import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidChart } from "../components/MermaidChart";
import { VoiceInput } from "../components/VoiceInput";
import { useSearchParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  CheckCircle2,
  Circle,
  FileText,
  Blocks,
  Code,
  Wand2,
  Download,
  Copy,
  FileDown,
  Check,
  Share,
  Sparkles,
  Compass,
  Target,
  Smile,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  X,
  
  
  
  ChevronRight,
  ChevronDown,
  
  Eye,
  FileCode,
  Send,
  Server,
  Database,
  Cpu,
  Activity,
  Shield,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { ShareTemplateModal } from "../components/prd/ShareTemplateModal";
import { PRDDocumentAnalyzer } from "../components/prd/PRDDocumentAnalyzer";
import { useTranslation } from "../contexts/LanguageContext";
import { loadStoredApiKeysSync, syncApiKeysFromCloud } from "../lib/apiKeyStorage";

const steps = [
  { id: 1, name: "Project Info", description: "Basic details" },
  { id: 2, name: "Tech Stack", description: "Frameworks & databases" },
  { id: 3, name: "Problem Statement", description: "Pain points & goals" },
  {
    id: 4,
    name: "Constraints & Outcomes",
    description: "Performance & budget",
  },
  { id: 5, name: "Generate", description: "Review & create" },
];

const PROJECT_TYPES = [
  "SaaS Application",
  "E-commerce Platform",
  "Social Network",
  "IoT Backend",
  "Microservices Architecture",
  "Internal Admin Tool",
  "Healthcare Dashboard",
  "Business Intelligence Tool",
  "Predictive Maintenance Hub",
  "Blockchain Asset Ledger",
  "Telemedicine Consultation Portal",
  "AI-Powered Content Generator",
  "Smart Home Automation Hub",
  "Cybersecurity Threat Detector",
  "Cloud Cost Optimization Tool",
  "Fleet Management System",
  "Automated Invoice Processor",
  "Digital Asset Management",
  "Sales CRM",
  "E-Learning",
  "Supply Chain",
  "Super App",
  "AI Tool",
];

const FRAMEWORKS = [
  { value: "node-express", label: "Node.js / Express (TypeScript)" },
  { value: "go-gin", label: "Go / Gin" },
  { value: "python-fastapi", label: "Python / FastAPI" },
  { value: "Laravel", label: "Laravel" },
  { value: "Codeigniter", label: "Codeigniter" },
  { value: "spring-boot", label: "Spring Boot (Java)" },
  { value: "dotnet", label: ".NET Core (C#)" },
];

const DATABASES = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "sqlite", label: "SQLite" },
];

const API_STYLES = [
  { value: "rest", label: "RESTful API" },
  { value: "graphql", label: "GraphQL" },
  { value: "grpc", label: "gRPC" },
];

export function GenerateWizard() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");

  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [selectedTemplateVal, setSelectedTemplateVal] = useState("");
  const [isImportingTemplate, setIsImportingTemplate] = useState(false);

  useEffect(() => {
    const fetchDbTemplates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "templates"));
        const fetched: any[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() });
        });
        setDbTemplates(fetched);
      } catch (err) {
        console.warn("Error fetching templates from firestore:", err);
      }
    };
    fetchDbTemplates();
  }, []);

  const applyTemplate = async (id: string) => {
    if (!id) return;
    setIsImportingTemplate(true);
    setSelectedTemplateVal(id);
    
    // Check if it's custom community template
    const selectedDbTemplate = dbTemplates.find((t) => t.id === id);
    if (selectedDbTemplate) {
      setFormData({
        projectName: selectedDbTemplate.name || selectedDbTemplate.projectName || "",
        projectDescription: selectedDbTemplate.description || selectedDbTemplate.projectDescription || "",
        projectType: selectedDbTemplate.type || selectedDbTemplate.projectType || "SaaS Application",
        industry: selectedDbTemplate.industry || "Technology",
        targetUser: selectedDbTemplate.targetUser || "General Users",
        framework: selectedDbTemplate.framework || "node-express",
        database: selectedDbTemplate.database || "postgresql",
        apiStyle: selectedDbTemplate.apiStyle || "rest",
        authMethod: selectedDbTemplate.authMethod || "JWT",
        deploymentEnv: selectedDbTemplate.deploymentEnv || "Vercel",
        existingProblem: selectedDbTemplate.existingProblem || "",
        painPoints: selectedDbTemplate.painPoints || "",
        expectedOutcome: selectedDbTemplate.expectedOutcome || "",
        budget: selectedDbTemplate.budget || "$10,000",
        teamSize: selectedDbTemplate.teamSize || "2-3 orang",
        performanceReqs: selectedDbTemplate.performanceReqs || "",
        scalability: selectedDbTemplate.scalability || "",
        latency: selectedDbTemplate.latency || "",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions(
        selectedDbTemplate.type || selectedDbTemplate.projectType || "SaaS Application",
        selectedDbTemplate.industry || "Technology",
        id
      );
      setIsImportingTemplate(false);
      return;
    }

    // Otherwise it is built-in template
    if (id === "ecommerce") {
      setFormData({
        projectName: "Platform E-Commerce Modern",
        projectDescription: "Marketplace digital terintegrasi yang menghubungkan penjual dan pembeli dengan alur checkout yang mulus, mendukung berbagai metode pembayaran, dan menyediakan dashboard analitik khusus bagi penjual.",
        projectType: "E-Commerce & Marketplace",
        industry: "Retail / E-Commerce",
        targetUser: "Pembeli Online (B2C), Penjual Independen, Admin Platform",
        framework: "React / Next.js",
        database: "PostgreSQL",
        apiStyle: "REST",
        authMethod: "OAuth2",
        deploymentEnv: "Vercel + Supabase",
        existingProblem: "Sistem saat ini belum memiliki kapabilitas sinkronisasi inventaris real-time dan checkout multi-vendor dalam satu keranjang yang sering membingungkan pengguna.",
        painPoints: "1. Tingkat pengabaian keranjang (cart abandonment) tinggi akibat proses checkout rumit.\n2. Alat penjual (seller tools) sangat terbatas dan harus dilakukan manual.\n3. Kecepatan loading halaman pencarian lambat.",
        expectedOutcome: "Meningkatkan konversi penjualan minimal 20%, mempercepat proses checkout dalam 3 langkah mudah, dan memberikan laporan performa produk secara dinamis kepada penjual.",
        budget: "$15,000 - $30,000",
        teamSize: "3-5 Orang (Frontend, Backend, UI/UX, QA)",
        performanceReqs: "Halaman produk dimuat di bawah 1.5 detik (First Contentful Paint).",
        scalability: "Dapat menangani 10,000+ pengguna aktif bulanan (MAU) dan traffic spike saat periode promo.",
        latency: "< 200ms per interaksi pencarian",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("E-Commerce & Marketplace", "Retail / E-Commerce", "ecommerce");
    } else if (id === "saas") {
      setFormData({
        projectName: "Dashboard Analitik SaaS (B2B)",
        projectDescription: "Aplikasi Software-as-a-Service multi-tenant yang menganalisis penggunaan produk oleh pelanggan, mengelola penagihan berlangganan (subscription billing), serta mengatur akses anggota tim melalui RBAC.",
        projectType: "B2B SaaS Analytics",
        industry: "B2B Software",
        targetUser: "Product Manager, Tim Pemasaran B2B, Eksekutif Perusahaan",
        framework: "Next.js",
        database: "PostgreSQL + Redis",
        apiStyle: "REST / GraphQL",
        authMethod: "Keycloak (SSO)",
        deploymentEnv: "AWS (EKS / ECS)",
        existingProblem: "Manajemen pelanggan yang siloed (terpisah-pisah) menyulitkan tim customer success melihat kesehatan akun pelanggan, serta penagihan enterprise seringkali luput dari pantauan dan harus direkonsiliasi manual.",
        painPoints: "1. Rekonsiliasi faktur manual memakan waktu berminggu-minggu.\n2. Tidak ada pandangan metrik penggunaan yang real-time bagi tenant.\n3. Kesulitan mengatur tingkat perizinan (permissions) staf secara dinamis.",
        expectedOutcome: "Sistem billing otomatis dengan integrasi gateway B2B, visibilitas 360-derajat terhadap penggunaan pelanggan, serta struktur role dan permission yang fleksibel per tenant.",
        budget: "$40,000 - $60,000",
        teamSize: "5-7 Orang (Fullstack, DevOps, QA, Product Manager)",
        performanceReqs: "Query data analitik berat selesai di bawah 3 detik. Dashboard utama dimuat secara instan.",
        scalability: "Horizontal scaling arsitektur microservices. Isolasi basis data per-tenant.",
        latency: "< 300ms untuk endpoint GraphQL",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("B2B SaaS Analytics", "B2B Software", "saas");
    } else if (id === "internal-tool") {
      setFormData({
        projectName: "Sistem Manajemen Admin HR",
        projectDescription: "Dashboard back-office untuk mengelola catatan kinerja karyawan, alur persetujuan cuti bertingkat, serta penyimpanan dokumen sensitif perusahaan secara aman dan terenkripsi.",
        projectType: "Internal Admin System",
        industry: "Human Resources / Back-office",
        targetUser: "Manajer HR, Operasional Karyawan, Auditor Supervisor",
        framework: "React / Vite, Tailwind CSS",
        database: "MySQL",
        apiStyle: "REST",
        authMethod: "SAML (Google Workspace SSO)",
        deploymentEnv: "Google Cloud Platform",
        existingProblem: "Permintaan cuti dan reimbursement karyawan masih menggunakan email dan formulir cetak, menyebabkan kehilangan data dan ketidakakuratan sisa kuota yang merugikan baik perusahaan maupun karyawan.",
        painPoints: "1. SLA persetujuan cuti sangat lama.\n2. Kehilangan jejak komunikasi HR dan staf.\n3. Kebocoran akses dokumen kepada pihak tak berwenang dikarenakan sistem folder terpusat biasa.",
        expectedOutcome: "Mengurangi waktu pemrosesan klaim dan cuti hingga 80%, memastikan 100% kepatuhan log audit, dan sentralisasi data historis kinerja dalam satu panel tanpa server pihak ketiga yang terbuka.",
        budget: "$10,000 - $20,000",
        teamSize: "2-3 Orang (Fullstack Developer)",
        performanceReqs: "Aplikasi reaktif cepat, pemrosesan laporan bulk di background (Asynchronous).",
        scalability: "Skalabilitas menengah, cukup untuk ribuan internal karyawan perusahaan.",
        latency: "< 100ms internal latency",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("Internal Admin System", "Human Resources / Back-office", "internal-tool");
    } else if (id === "fintech") {
      setFormData({
        projectName: "Aplikasi Remitansi & E-Wallet Global",
        projectDescription: "Aplikasi seluler dan web finansial dengan tingkat keamanan bank-grade yang mendukung transfer uang lintas batas (cross-border), verifikasi e-KYC mandiri, serta pelacakan dana secara real-time.",
        projectType: "Fintech Mobile & Web",
        industry: "Financial Services",
        targetUser: "Pekerja Migran, Freelancer Global, Mahasiswa Internasional",
        framework: "React Native / Next.js",
        database: "PostgreSQL (ACID Compliant)",
        apiStyle: "gRPC",
        authMethod: "MFA + Biometrik Autentikasi",
        deploymentEnv: "AWS dengan standar PCI-DSS & SOC2",
        existingProblem: "Biaya transaksi pengiriman uang ke luar negeri mencapai lebih dari 5%, kecepatan transmisi melalui perantara memakan waktu hingga 3-5 hari kerja, dan pendaftaran ke lembaga finansial seringkali offline.",
        painPoints: "1. Kurangnya transparansi nilai tukar konversi.\n2. Setelmen dana yang tidak real-time.\n3. Pengalaman onboarding KYC membosankan dan tingkat kegagalan foto ID tinggi.",
        expectedOutcome: "Transmisi instan dibawah 5 menit, struktur biaya langganan yang transparan sebelum pengiriman, serta e-KYC 90% otomasi untuk pengguna dapat segera bertransaksi dalam 10 menit pendaftaran.",
        budget: "$100,000+",
        teamSize: "10+ Orang (Mobile & Web Devs, Security Engineer, QA, Compliance Officer)",
        performanceReqs: "Zero-downtime deployment, transaksional state yang absolut konsisten.",
        scalability: "Event-driven architecture untuk memproses puluhan ribu transaksi per detik.",
        latency: "< 50ms untuk sistem internal core banking",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("Fintech Mobile & Web", "Financial Services", "fintech");
    } else if (id === "healthtech") {
      setFormData({
        projectName: "Portal Booking Telemedisin Klinis",
        projectDescription: "Platform kepatuhan medis yang memungkinkan penjadwalan konsultasi virtual (video/chat), penerbitan resep obat elektronik, dan penyatuan riwayat rekam medis pasien di satu profil portofolio.",
        projectType: "Healthcare Provider Portal",
        industry: "Healthcare",
        targetUser: "Pasien Rawat Jalan, Dokter Spesialis, Resepsionis Klinik",
        framework: "React / NestJS",
        database: "PostgreSQL",
        apiStyle: "GraphQL",
        authMethod: "JWT + Strict Session Expiry",
        deploymentEnv: "Azure Healthcare API / HIPAA Compliant",
        existingProblem: "Pasien harus datang pagi-pagi, antri panjang hanya untuk mendapat konsultasi ringan; Dokter mengeluh rekam medis pasien tercecer antar rumah sakit yang berbeda-beda.",
        painPoints: "1. Kasus janji temu tak terjadwal terlambat (No-shows) meningkat drastis.\n2. Waktu tunggu pasien sebelum bertemu spesialis melumpuhkan kenyamanan lobi fasilitas medis.\n3. Rujukan dan resep cetak kerap salah baca dan sulit ditelusuri riwayat dosisnya.",
        expectedOutcome: "Reservasi sepenuhnya swalayan dengan auto-reminder WhatsApp, mengurangi kepadatan ruang tunggu sebesar 40%, serta memberdayakan dokter dengan dashboard holistik riwayat medis sebelum kunjungan dimulai.",
        budget: "$50,000 - $80,000",
        teamSize: "6-8 Orang (Mobile/Web, Backend, Data Engineer)",
        performanceReqs: "Streaming video konsultasi low-latency dengan resolusi adaptif.",
        scalability: "Auto-scaling untuk jam sibuk (pagi & malam) trafik pemesanan dokter.",
        latency: "Video stream latency < 50ms (WebRTC)",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("Healthcare Provider Portal", "Healthcare", "healthtech");
    } else if (id === "crm") {
      setFormData({
        projectName: "Platform CRM Omnichannel Sales",
        projectDescription: "Sistem Customer Relationship Management yang melacak prospek (leads), menjadwalkan interaksi tindak lanjut otomatis (follow-up), menganalisis konversi corong penjualan.",
        projectType: "Sales CRM",
        industry: "Sales & Marketing",
        targetUser: "Tim SDR (Sales Development), Account Executives, Manajer Pemasaran",
        framework: "React / Node.js",
        database: "PostgreSQL",
        apiStyle: "REST",
        authMethod: "SSO (SAML) & Password",
        deploymentEnv: "AWS",
        existingProblem: "Tim penjualan kesulitan memonitor tindak-lanjut klien di ratusan email yang terpisah, manajer kesulitan memberikan perkiraan pendapatan (forecasting) bulanan karena data prospek disembunyikan staf di buku tulis pribadi.",
        painPoints: "1. Kehilangan momen menindaklanjuti klien potensial (leads lost in cracks).\n2. Pekerjaan pelaporan pipeline membosankan dan lambat bagi staf penjualan.\n3. Kebingungan mengukur ROI kampanye marketing spesifik.",
        expectedOutcome: "Sinkronisasi kotak masuk dua arah (two-way email sync) white label, dasbor Kanban interaktif Drag-and-drop untuk manajemen kesepakatan, serta laporan forecasting probabilitas otomatis menggunakan analisis ringkas.",
        budget: "$30,000 - $50,000",
        teamSize: "4-6 Orang (Frontend, Backend, Integrations Spec.)",
        performanceReqs: "Sinkronisasi email berjalan di background tanpa memblokir UI.",
        scalability: "Sistem antrean (Queue) andal untuk mengirim email prospek massal.",
        latency: "< 200ms untuk query pencarian prospek global",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("Sales CRM", "Sales & Marketing", "crm");
    } else if (id === "elearning") {
      setFormData({
        projectName: "LMS & E-Learning Platform Interaktif",
        projectDescription: "Sistem Manajemen Pembelajaran (LMS) modern untuk institusi pendidikan dan kreator kursus independen dengan dukungan kelas sinkron asinkron, sistem ujian, dan proctoring.",
        projectType: "E-Learning",
        industry: "EdTech",
        targetUser: "Siswa, Mahasiswa, Instruktur, Admin Institusi Pendidikan",
        framework: "React / Express",
        database: "MongoDB",
        apiStyle: "REST / WebRTC",
        authMethod: "JWT & OAuth Google",
        deploymentEnv: "Google Cloud Platform",
        existingProblem: "Institusi kesulitan mengatur materi ajar dalam satu tempat, video terpisah-pisah, dan ujian sering bocor karena tidak ada pengawasan. Sistem sertifikasi dan pelaporan masih manual.",
        painPoints: "1. Ujian jarak jauh sulit diawasi dari kecurangan.\n2. Siswa merasa tidak termotivasi (kurang gamifikasi).\n3. Server sering down ketika waktu ujian serentak tiba.",
        expectedOutcome: "Materi terkurasi dalam silabus terstruktur, sistem proctoring dengan anti-tab-switch, penghargaan penyelesaian interaktif (gamifikasi), serta infrastruktur mandiri yang stabil walim kelas besar secara sinkron.",
        budget: "$40,000 - $70,000",
        teamSize: "5-7 Orang (Fullstack, WebRTC Engineer, UI/UX)",
        performanceReqs: "Layanan video kompresi otomatis untuk pengguna dengan internet lambat.",
        scalability: "Mampu menampung 5000+ ujian serentak dalam 1 instansi.",
        latency: "< 100ms pemuatan soal ujian dan sinkronisasi status waktu ujian.",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("E-Learning", "EdTech", "elearning");
    } else if (id === "logistics") {
      setFormData({
        projectName: "Sistem Logistik & Supply Chain Tracker Pro",
        projectDescription: "Platfom manajemen rantai pasok dengan pelacakan GPS armada secara sinkron penuh, manajemen gudang otomatis multi-node, dan optimasi rute kurir pintar.",
        projectType: "Supply Chain",
        industry: "Logistics",
        targetUser: "Staf Gudang, Kurir Pengiriman, Manajer Logistik, Klien B2B",
        framework: "React Native / Node.js",
        database: "PostgreSQL & Redis",
        apiStyle: "gRPC",
        authMethod: "MFA",
        deploymentEnv: "AWS",
        existingProblem: "Rute pengiriman kurir sangat tidak efisien (mahal bensin), bukti dokumen pengiriman fisik sering hilang, posisi truk sulit dilacak sehingga klien sering menelepon berulang kali mempertanyakan status paket.",
        painPoints: "1. Estimasi kedatangan (ETA) sangat tidak akurat (blind spot di jalan).\n2. Gudang mengalami bottleneck di jam sortir pagi (mis-routing paket).\n3. Supir malas memperbarui status pengiriman secara manual.",
        expectedOutcome: "Pelacakan GPS interaktif untuk pemantauan real-time, Scanner aplikasi mobile ber-kamera mumpuni untuk bukti foto serah terima (e-POD), dan rute pengiriman yang direkalkulerasi otomatis menggunakan Google Maps API based pada kemacetan.",
        budget: "$60,000 - $100,000",
        teamSize: "7-10 Orang (Mobile, Backend, DevOps, Data Analyst)",
        performanceReqs: "Update koordinat GPS kurir dikirimkan setiap 5 detik.",
        scalability: "Sistem harus menangani ribuan update koordinat per detik dengan WebSocket/MQTT.",
        latency: "< 50ms untuk ping update lokasi, pencarian rute < 2s.",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("Supply Chain", "Logistics", "logistics");
    } else if (id === "on-demand") {
      setFormData({
        projectName: "Super App On-Demand Services",
        projectDescription: "Klon Super-App (Gojek/Grab) canggih yang mempertimbangkan geolocation matchmaking real-time, wallet interaktif, in-app chat, dan surge pricing otonom.",
        projectType: "Super App",
        industry: "Mobility & On-Demand",
        targetUser: "Pengguna B2C, Driver (Mitra Kurir), Merchant Restoran",
        framework: "Flutter / Go",
        database: "PostgreSQL & Cassandra",
        apiStyle: "gRPC & WebSocket",
        authMethod: "OTP SMS / Whatsapp",
        deploymentEnv: "Google Cloud Platform",
        existingProblem: "Mitra pengemudi kesulitan mendapatkan order dengan jarak masuk akal, pengguna kesulitan membatalkan pesanan yang sangat tidak responsif.",
        painPoints: "1. Aplikasi lambat memperbarui posisi di peta (Jumping Location).\n2. Kalkulasi harga statis membuat rugi pengemudi saat hujan / macet.\n3. Pertukaran nomor HP merusak privasi pengemudi dan penumpang.",
        expectedOutcome: "Algoritma distribusi order yang sangat adil jarak jauh-dekat, sistem In-App Chatting mask-phonenumber, dan model perhitungan tarif harga dinamis akurat otomatis (Surge pricing).",
        budget: "$120,000 - $250,000+",
        teamSize: "15+ Orang (Squad Tim terpisah: Geo, Ride, Pay, dll)",
        performanceReqs: "Sistem koneksi putus-nyambung harus ditangani elegan dengan sinkronisasi batch latar belakang.",
        scalability: "Arsitektur Event-Driven (Kafka) murni untuk menyebarkan notifikasi ke jutaan aplikasi klien.",
        latency: "< 10ms read/write di sistem Wallet Core, < 50ms matchmaking.",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("Super App", "Mobility & On-Demand", "on-demand");
    } else if (id === "ai-copilot") {
      setFormData({
        projectName: "Asisten Cerdas AI & Generative Workspace",
        projectDescription: "Ruang kerja kolaboratif bergaya blok notion berorientasi LLM. Mampu merangkum otomatis, penulisan prediktif, penelusuran dokumen perusahaan secara semantik (RAG).",
        projectType: "AI Tool",
        industry: "Productivity",
        targetUser: "Penulis, Pembuat Konten, Tim Eksekutif, Akuntan, Peneliti",
        framework: "React / Python (FastAPI)",
        database: "PostgreSQL & Pinecone (VectorDB)",
        apiStyle: "REST / Server-Sent Events (SSE)",
        authMethod: "OAuth Google",
        deploymentEnv: "Vercel & AWS",
        existingProblem: "Proses riset sangat memakan waktu. Karyawan harus bolak-balik antara dokumen internal dan alat publik LLM (yang bisa membahayakan kerahasiaan data). Tidak ada ringkasan otomatis untuk rapat besar.",
        painPoints: "1. Kebocoran data ketika menggunakan AI pihak ketiga (tanpa isolasi tenant).\n2. LLM berhalusinasi tidak berdasarkan dokumen internal nyata.\n3. Terlalu banyak berpindah pindah jendela aplikasi web.",
        expectedOutcome: "Sistem Retrieval-Augmented Generation (RAG) tangguh dimana AI hanya menjawab berdasarkan kumpulan knowledge base internal, Streaming respons text untuk user experience yang mirip ChatGPT, dan text-editor blok modern yang intuitif.",
        budget: "$40,000 - $80,000",
        teamSize: "4-6 Orang (AI/ML Engineer, Fullstack, Frontend Spec.)",
        performanceReqs: "Proses embed vector dalam antrean untuk file otomatis bergaya modular, UX UI tidak boleh blocking/terjeda.",
        scalability: "Indeks vektor yang scalable hingga jutaan potongan semantik.",
        latency: "Pemuatan aliran token pertama < 1.0 detik (Time To First Token).",
        aiModel: "gemini-3.5-flash",
        templateType: "Agile",
      });
      await fetchTemplateSuggestions("AI Tool", "Productivity", "ai-copilot");
    }
    setIsImportingTemplate(false);
  };

  // Load draft from localStorage if present
  const getDraftData = () => {
    try {
      const saved = localStorage.getItem("prd_generator_draft");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse draft from localStorage:", e);
    }
    return null;
  };

  const draft = getDraftData();

  const [draftRestored, setDraftRestored] = useState(() => !!draft);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => draft?.timestamp || null);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [hideBanner, setHideBanner] = useState(false);
  const [manualDraftSaved, setManualDraftSaved] = useState(false);

  const [currentStep, setCurrentStep] = useState(() => draft?.currentStep || 1);
  const [isSuggestingStack, setIsSuggestingStack] = useState(false);
  const [isDraftingProblem, setIsDraftingProblem] = useState(false);

  // AI Suggestions State
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [customSections, setCustomSections] = useState<any[]>(() => draft?.customSections || []);

  // Suggested items directly editable by the user
  const [visionInput, setVisionInput] = useState(() => draft?.visionInput || "");
  const [goalsInput, setGoalsInput] = useState(() => draft?.goalsInput || "");
  const [featuresInput, setFeaturesInput] = useState(() => draft?.featuresInput || "");
  const [storiesInput, setStoriesInput] = useState(() => draft?.storiesInput || "");

  const [suggestionVision, setSuggestionVision] = useState(() => draft?.suggestionVision || "");
  const [suggestionGoals, setSuggestionGoals] = useState<string[]>(() => draft?.suggestionGoals || []);
  const [suggestionFeatures, setSuggestionFeatures] = useState<string[]>(() => draft?.suggestionFeatures || []);
  const [suggestionUserStories, setSuggestionUserStories] = useState<string[]>(() => draft?.suggestionUserStories || []);

  // Original suggestions stored to allow reset/restore
  const [originalVision, setOriginalVision] = useState(() => draft?.originalVision || "");
  const [originalGoals, setOriginalGoals] = useState<string[]>(() => draft?.originalGoals || []);
  const [originalFeatures, setOriginalFeatures] = useState<string[]>(() => draft?.originalFeatures || []);
  const [originalUserStories, setOriginalUserStories] = useState<string[]>(() => draft?.originalUserStories || []);

  // Status flags
  const [visionStatus, setVisionStatus] = useState<"pending" | "accepted" | "rejected">(
    () => draft?.visionStatus || "pending"
  );
  const [goalsStatus, setGoalsStatus] = useState<"pending" | "accepted" | "rejected">(
    () => draft?.goalsStatus || "pending"
  );
  const [featuresStatus, setFeaturesStatus] = useState<"pending" | "accepted" | "rejected">(
    () => draft?.featuresStatus || "pending"
  );
  const [userStoriesStatus, setUserStoriesStatus] = useState<"pending" | "accepted" | "rejected">(
    () => draft?.userStoriesStatus || "pending"
  );

  // Helper to fetch template-based AI suggestions
  const fetchTemplateSuggestions = async (type: string, ind: string, name: string) => {
    if (!type && !ind) return;
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    try {
      const res = await fetch("/api/v1/suggest-template-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: type,
          industry: ind,
          templateName: name,
          projectDescription: formData.projectDescription
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Set editable suggestion inputs
        setVisionInput(data.vision || "");
        setGoalsInput(Array.isArray(data.goals) ? data.goals.join("\n") : (data.goals || ""));
        setFeaturesInput(Array.isArray(data.features) ? data.features.join("\n") : (data.features || ""));
        setStoriesInput(Array.isArray(data.userStories) ? data.userStories.join("\n") : (data.userStories || ""));

        // Set state values
        setSuggestionVision(data.vision || "");
        setSuggestionGoals(data.goals || []);
        setSuggestionFeatures(data.features || []);
        setSuggestionUserStories(data.userStories || []);

        // Set originals for reset capability
        setOriginalVision(data.vision || "");
        setOriginalGoals(data.goals || []);
        setOriginalFeatures(data.features || []);
        setOriginalUserStories(data.userStories || []);

        // Reset statuses to pending
        setVisionStatus("pending");
        setGoalsStatus("pending");
        setFeaturesStatus("pending");
        setUserStoriesStatus("pending");
      } else {
        throw new Error("Gagal mengambil saran AI");
      }
    } catch (err: any) {
      console.error(err);
      setSuggestionsError(err.message || "Terjadi kesalahan saat membuat saran.");
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const [showDocAnalyzer, setShowDocAnalyzer] = useState(false);

  const [formData, setFormData] = useState(() => draft?.formData || {
    projectName: "",
    projectDescription: "",
    projectType: "",
    industry: "",
    targetUser: "",
    framework: "",
    database: "",
    apiStyle: "",
    authMethod: "",
    deploymentEnv: "",
    existingProblem: "",
    painPoints: "",
    expectedOutcome: "",
    budget: "",
    teamSize: "",
    performanceReqs: "",
    scalability: "",
    latency: "",
    aiModel: "gemini-3.5-flash",
    templateType: "Agile",
  });

  const handleApplyDocAnalysisToWizard = (data: any) => {
    if (!data) return;
    const ep = data.enrichmentPayload || {};
    const ke = data.keyEntities || {};
    const reqs = data.requirements || {};
    const st = data.suggestedTechStack || {};

    const extractedProjectName = ep.projectName || ke.projectName || formData.projectName || "Sistem Aplikasi Baru";
    const extractedDescription = ep.projectDescription || data.summary || ke.problemStatement || formData.projectDescription;
    const extractedType = ep.projectType || ke.projectType || formData.projectType || "SaaS Application";
    const extractedIndustry = ep.industry || ke.industry || formData.industry || "Technology";
    const extractedTargetUser = ep.targetUser || (Array.isArray(ke.targetAudience) ? ke.targetAudience.join(", ") : ke.targetAudience) || formData.targetUser;
    const extractedProblem = ep.existingProblem || ke.problemStatement || formData.existingProblem;
    
    const extractedPainPoints = ep.painPoints || (Array.isArray(reqs.functional) && reqs.functional.length > 0
      ? reqs.functional
          .map((f: any, idx: number) => `${idx + 1}. [${f.priority || "High"}] ${f.title}: ${f.description}`)
          .join("\n")
      : formData.painPoints);

    const extractedOutcome = ep.expectedOutcome || (Array.isArray(ke.primaryGoals) && ke.primaryGoals.length > 0
      ? ke.primaryGoals.map((g: string, idx: number) => `${idx + 1}. ${g}`).join("\n")
      : formData.expectedOutcome);

    const extractedFramework = ep.framework || st.framework || formData.framework || "React / Node.js";
    const extractedDatabase = ep.database || st.database || formData.database || "PostgreSQL";
    const extractedApiStyle = ep.apiStyle || st.apiStyle || formData.apiStyle || "REST";
    const extractedAuthMethod = ep.authMethod || st.authMethod || formData.authMethod || "JWT & OAuth Google";
    const extractedDeploymentEnv = ep.deploymentEnv || st.deploymentEnv || formData.deploymentEnv || "AWS / Cloud Run";

    const extractedBudget = ep.budget || formData.budget || "$30,000 - $60,000";
    const extractedTeamSize = ep.teamSize || formData.teamSize || "4-6 Orang (Fullstack & UI/UX)";
    const extractedPerfReqs = ep.performanceReqs || formData.performanceReqs || "Waktu tanggap UI < 200ms, beban pemrosesan terdistribusi";
    const extractedScalability = ep.scalability || formData.scalability || "Mampu menangani hingga 25,000 pengguna aktif bulanan";
    const extractedLatency = ep.latency || formData.latency || "< 150ms untuk kueri data standar";

    // 1. Update All Form Fields
    setFormData((prev) => ({
      ...prev,
      projectName: extractedProjectName,
      projectDescription: extractedDescription,
      projectType: extractedType,
      industry: extractedIndustry,
      targetUser: extractedTargetUser,
      existingProblem: extractedProblem,
      painPoints: extractedPainPoints,
      expectedOutcome: extractedOutcome,
      framework: extractedFramework,
      database: extractedDatabase,
      apiStyle: extractedApiStyle,
      authMethod: extractedAuthMethod,
      deploymentEnv: extractedDeploymentEnv,
      budget: extractedBudget,
      teamSize: extractedTeamSize,
      performanceReqs: extractedPerfReqs,
      scalability: extractedScalability,
      latency: extractedLatency,
    }));

    // 2. Populate AI Suggestions Step (Vision, Goals, Features, User Stories)
    const visionVal = ep.vision || (data.summary ? `Membangun ${extractedProjectName} sebagai platform ${extractedType} terdepan di industri ${extractedIndustry}.` : "");
    const goalsVal: string[] = Array.isArray(ep.goals) && ep.goals.length > 0
      ? ep.goals
      : (Array.isArray(ke.primaryGoals) && ke.primaryGoals.length > 0 ? ke.primaryGoals : ["Meningkatkan efisiensi alur kerja produk", "Mengurangi waktu pemrosesan manual"]);
    
    const featuresVal: string[] = Array.isArray(ep.features) && ep.features.length > 0
      ? ep.features
      : (Array.isArray(reqs.functional) && reqs.functional.length > 0 ? reqs.functional.map((f: any) => `${f.title}: ${f.description}`) : ["Manajemen Akses & Autentikasi Pengguna", "Dasbor Analisis & Pelaporan Real-time"]);

    const storiesVal: string[] = Array.isArray(ep.userStories) && ep.userStories.length > 0
      ? ep.userStories
      : (Array.isArray(reqs.userPersonas) && reqs.userPersonas.length > 0
          ? reqs.userPersonas.map((p: any) => `Sebagai ${p.name || p.role || "Pengguna"}, saya ingin ${Array.isArray(p.needs) ? p.needs.join(" & ") : "akses fitur utama"} agar pekerjaan saya lebih efisien.`)
          : ["Sebagai Pengguna, saya ingin masuk ke aplikasi dengan aman agar data saya terlindungi."]);

    setVisionInput(visionVal);
    setSuggestionVision(visionVal);
    setOriginalVision(visionVal);
    setVisionStatus("accepted");

    setGoalsInput(goalsVal.join("\n"));
    setSuggestionGoals(goalsVal);
    setOriginalGoals(goalsVal);
    setGoalsStatus("accepted");

    setFeaturesInput(featuresVal.join("\n"));
    setSuggestionFeatures(featuresVal);
    setOriginalFeatures(featuresVal);
    setFeaturesStatus("accepted");

    setStoriesInput(storiesVal.join("\n"));
    setSuggestionUserStories(storiesVal);
    setOriginalUserStories(storiesVal);
    setUserStoriesStatus("accepted");

    // 3. Populate Custom Sections if provided in suggestedSections
    if (Array.isArray(ep.suggestedSections) && ep.suggestedSections.length > 0) {
      const newCustomSecs = ep.suggestedSections.map((sec: any, idx: number) => ({
        id: `sec-doc-${Date.now()}-${idx}`,
        heading: sec.heading || sec.title || `Seksi Kustom ${idx + 1}`,
        content: sec.content || sec.description || "",
      }));
      setCustomSections((prev) => {
        // combine unique by heading
        const existingHeadings = new Set(prev.map((s) => s.heading.toLowerCase()));
        const filteredNew = newCustomSecs.filter((ns) => !existingHeadings.has(ns.heading.toLowerCase()));
        return [...prev, ...filteredNew];
      });
    }

    setImportedSuccessMsg("Form PRD Generator & Seluruh Saran AI telah berhasil diisi secara lengkap dari Analisis Dokumen!");
    setTimeout(() => setImportedSuccessMsg(null), 6000);
  };

  useEffect(() => {
    if (draftRestored) return;
    if (templateId) {
      applyTemplate(templateId);
    }
  }, [templateId, draftRestored, dbTemplates]);

  // Trigger AI suggestions automatically when templateId or projectType or industry changes
  useEffect(() => {
    if (templateId && formData.projectType && formData.industry) {
      fetchTemplateSuggestions(formData.projectType, formData.industry, templateId);
    }
  }, [templateId, formData.projectType, formData.industry]);

  // Auto-save debounced effect
  useEffect(() => {
    const hasContent =
      formData.projectName ||
      formData.projectDescription ||
      customSections.length > 0;

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
          formData,
          currentStep,
          customSections,
          visionInput,
          goalsInput,
          featuresInput,
          storiesInput,
          suggestionVision,
          suggestionGoals,
          suggestionFeatures,
          suggestionUserStories,
          originalVision,
          originalGoals,
          originalFeatures,
          originalUserStories,
          visionStatus,
          goalsStatus,
          featuresStatus,
          userStoriesStatus,
          timestamp,
        };

        localStorage.setItem("prd_generator_draft", JSON.stringify(draftData));
        setLastSavedTime(timestamp);
        setAutoSaveState("saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
        setAutoSaveState("idle");
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [
    formData,
    currentStep,
    customSections,
    visionInput,
    goalsInput,
    featuresInput,
    storiesInput,
    suggestionVision,
    suggestionGoals,
    suggestionFeatures,
    suggestionUserStories,
    originalVision,
    originalGoals,
    originalFeatures,
    originalUserStories,
    visionStatus,
    goalsStatus,
    featuresStatus,
    userStoriesStatus,
  ]);

  const handleStartFresh = () => {
    try {
      localStorage.removeItem("prd_generator_draft");
    } catch (e) {}

    setFormData({
      projectName: "",
      projectDescription: "",
      projectType: "",
      industry: "",
      targetUser: "",
      framework: "",
      database: "",
      apiStyle: "",
      authMethod: "",
      deploymentEnv: "",
      existingProblem: "",
      painPoints: "",
      expectedOutcome: "",
      budget: "",
      teamSize: "",
      performanceReqs: "",
      scalability: "",
      latency: "",
      aiModel: "gemini-3.5-flash",
      templateType: "Agile",
    });

    setCurrentStep(1);
    setCustomSections([]);
    setVisionInput("");
    setGoalsInput("");
    setFeaturesInput("");
    setStoriesInput("");
    setSuggestionVision("");
    setSuggestionGoals([]);
    setSuggestionFeatures([]);
    setSuggestionUserStories([]);
    setOriginalVision("");
    setOriginalGoals([]);
    setOriginalFeatures([]);
    setOriginalUserStories([]);
    setVisionStatus("pending");
    setGoalsStatus("pending");
    setFeaturesStatus("pending");
    setUserStoriesStatus("pending");

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
        formData,
        currentStep,
        customSections,
        visionInput,
        goalsInput,
        featuresInput,
        storiesInput,
        suggestionVision,
        suggestionGoals,
        suggestionFeatures,
        suggestionUserStories,
        originalVision,
        originalGoals,
        originalFeatures,
        originalUserStories,
        visionStatus,
        goalsStatus,
        featuresStatus,
        userStoriesStatus,
        timestamp,
      };

      localStorage.setItem("prd_generator_draft", JSON.stringify(draftData));
      setLastSavedTime(timestamp);
      setAutoSaveState("saved");
      setManualDraftSaved(true);
      setTimeout(() => {
        setManualDraftSaved(false);
      }, 4000);
    } catch (err) {
      console.error("Save manual draft failed:", err);
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPRD, setGeneratedPRD] = useState<string | null>(null);
  const [savingError, setSavingError] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Template selector states
  const [communityTemplates, setCommunityTemplates] = useState<any[]>([]);
  const [importedSuccessMsg, setImportedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunityTemplates = async () => {
      try {
        const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setCommunityTemplates(list);
      } catch (e) {
        console.warn("Failed to fetch community templates for wizard:", e);
      }
    };
    fetchCommunityTemplates();
  }, []);

  const handleApplyPRDTemplate = (templateId: string, templateName: string) => {
    setImportedSuccessMsg(null);
    if (templateId === "ecommerce") {
      setFormData((prev) => ({
        ...prev,
        projectName: "Platform E-Commerce Modern",
        projectDescription:
          "Marketplace digital terintegrasi yang menghubungkan penjual dan pembeli dengan alur checkout yang mulus, mendukung berbagai metode pembayaran, dan menyediakan dashboard analitik khusus bagi penjual.",
        projectType: "E-Commerce & Marketplace",
        industry: "Retail / E-Commerce",
        targetUser: "Pembeli Online (B2C), Penjual Independen, Admin Platform",
        framework: "React / Next.js",
        database: "PostgreSQL",
        apiStyle: "REST",
        authMethod: "OAuth2",
        deploymentEnv: "Vercel + Supabase",
        existingProblem:
          "Sistem saat ini belum memiliki kapabilitas sinkronisasi inventaris real-time dan checkout multi-vendor dalam satu keranjang yang sering membingungkan pengguna.",
        painPoints:
          "1. Tingkat pengabaian keranjang (cart abandonment) tinggi akibat proses checkout rumit.\n2. Alat penjual (seller tools) sangat terbatas dan harus dilakukan manual.\n3. Kecepatan loading halaman pencarian lambat.",
        expectedOutcome:
          "Meningkatkan konversi penjualan minimal 20%, mempercepat proses checkout dalam 3 langkah mudah, dan memberikan laporan performa produk secara dinamis kepada penjual.",
        budget: "$15,000 - $30,000",
        teamSize: "3-5 Orang (Frontend, Backend, UI/UX, QA)",
        performanceReqs: "Halaman produk dimuat di bawah 1.5 detik (First Contentful Paint).",
        scalability: "Dapat menangani 10,000+ pengguna aktif bulanan (MAU) dan traffic spike saat periode promo.",
        latency: "< 200ms per interaksi pencarian",
      }));
    } else if (templateId === "saas") {
      setFormData((prev) => ({
        ...prev,
        projectName: "Dashboard Analitik SaaS (B2B)",
        projectDescription:
          "Aplikasi Software-as-a-Service multi-tenant yang menganalisis penggunaan produk oleh pelanggan, mengelola penagihan berlangganan (subscription billing), serta mengatur akses anggota tim melalui RBAC.",
        projectType: "B2B SaaS Analytics",
        industry: "B2B Software",
        targetUser: "Product Manager, Tim Pemasaran B2B, Eksekutif Perusahaan",
        framework: "Next.js",
        database: "PostgreSQL + Redis",
        apiStyle: "REST / GraphQL",
        authMethod: "Keycloak (SSO)",
        deploymentEnv: "AWS (EKS / ECS)",
        existingProblem:
          "Manajemen pelanggan yang siloed (terpisah-pisah) menyulitkan tim customer success melihat kesehatan akun pelanggan, serta penagihan enterprise seringkali luput dari pantauan dan harus direkonsiliasi manual.",
        painPoints:
          "1. Rekonsiliasi faktur manual memakan waktu berminggu-minggu.\n2. Tidak ada pandangan metrik penggunaan yang real-time bagi tenant.\n3. Kesulitan mengatur tingkat perizinan (permissions) staf secara dinamis.",
        expectedOutcome:
          "Sistem billing otomatis dengan integrasi gateway B2B, visibilitas 360-derajat terhadap penggunaan pelanggan, serta struktur role dan permission yang fleksibel per tenant.",
        budget: "$40,000 - $60,000",
        teamSize: "5-7 Orang (Fullstack, DevOps, QA, Product Manager)",
        performanceReqs: "Query data analitik berat selesai di bawah 3 detik. Dashboard utama dimuat secara instan.",
        scalability: "Horizontal scaling arsitektur microservices. Isolasi basis data per-tenant.",
        latency: "< 300ms untuk endpoint GraphQL",
      }));
    } else if (templateId === "internal-tool") {
      setFormData((prev) => ({
        ...prev,
        projectName: "Sistem Manajemen Admin HR",
        projectDescription:
          "Dashboard back-office untuk mengelola catatan kinerja karyawan, alur persetujuan cuti bertingkat, serta penyimpanan dokumen sensitif perusahaan secara aman dan terenkripsi.",
        projectType: "Internal Admin System",
        industry: "Human Resources / Back-office",
        targetUser: "Manajer HR, Operasional Karyawan, Auditor Supervisor",
        framework: "React / Vite, Tailwind CSS",
        database: "MySQL",
        apiStyle: "REST",
        authMethod: "SAML (Google Workspace SSO)",
        deploymentEnv: "Google Cloud Platform",
        existingProblem:
          "Permintaan cuti dan reimbursement karyawan masih menggunakan email dan formulir cetak, menyebabkan kehilangan data dan ketidakakuratan sisa kuota yang merugikan baik perusahaan maupun karyawan.",
        painPoints:
          "1. SLA persetujuan cuti sangat lama.\n2. Kehilangan jejak komunikasi HR dan staf.\n3. Kebocoran akses dokumen kepada pihak tak berwenang dikarenakan sistem folder terpusat biasa.",
        expectedOutcome:
          "Mengurangi waktu pemrosesan klaim dan cuti hingga 80%, memastikan 100% kepatuhan log audit, dan sentralisasi data historis kinerja dalam satu panel tanpa server pihak ketiga yang terbuka.",
        budget: "$10,000 - $20,000",
        teamSize: "2-3 Orang (Fullstack Developer)",
        performanceReqs: "Aplikasi reaktif cepat, pemrosesan laporan bulk di background (Asynchronous).",
        scalability: "Skalabilitas menengah, cukup untuk ribuan internal karyawan perusahaan.",
        latency: "< 100ms internal latency",
      }));
    } else if (templateId === "fintech") {
      setFormData((prev) => ({
        ...prev,
        projectName: "Aplikasi Remitansi & E-Wallet Global",
        projectDescription:
          "Aplikasi seluler dan web finansial dengan tingkat keamanan bank-grade yang mendukung transfer uang lintas batas (cross-border), verifikasi e-KYC mandiri, serta pelacakan dana secara real-time.",
        projectType: "Fintech Mobile & Web",
        industry: "Financial Services",
        targetUser: "Pekerja Migran, Freelancer Global, Mahasiswa Internasional",
        framework: "React Native / Next.js",
        database: "PostgreSQL (ACID Compliant)",
        apiStyle: "gRPC",
        authMethod: "MFA + Biometrik Autentikasi",
        deploymentEnv: "AWS dengan standar PCI-DSS & SOC2",
        existingProblem:
          "Biaya transaksi pengiriman uang ke luar negeri mencapai lebih dari 5%, kecepatan transmisi melalui perantara memakan waktu hingga 3-5 hari kerja, dan pendaftaran ke lembaga finansial seringkali offline.",
        painPoints:
          "1. Kurangnya transparansi nilai tukar konversi.\n2. Setelmen dana yang tidak real-time.\n3. Pengalaman onboarding KYC membosankan dan tingkat kegagalan foto ID tinggi.",
        expectedOutcome:
          "Transmisi instan dibawah 5 menit, struktur biaya langganan yang transparan sebelum pengiriman, serta e-KYC 90% otomasi untuk pengguna dapat segera bertransaksi dalam 10 menit pendaftaran.",
        budget: "$100,000+",
        teamSize: "10+ Orang (Mobile & Web Devs, Security Engineer, QA, Compliance Officer)",
        performanceReqs: "Zero-downtime deployment, transaksional state yang absolut konsisten.",
        scalability: "Event-driven architecture untuk memproses puluhan ribu transaksi per detik.",
        latency: "< 50ms untuk sistem internal core banking",
      }));
    } else if (templateId === "healthtech") {
      setFormData((prev) => ({
        ...prev,
        projectName: "Portal Booking Telemedisin Klinis",
        projectDescription:
          "Platform kepatuhan medis yang memungkinkan penjadwalan konsultasi virtual (video/chat), penerbitan resep obat elektronik, dan penyatuan riwayat rekam medis pasien di satu profil portofolio.",
        projectType: "Healthcare Provider Portal",
        industry: "Healthcare",
        targetUser: "Pasien Rawat Jalan, Dokter Spesialis, Resepsionis Klinik",
        framework: "React / NestJS",
        database: "PostgreSQL",
        apiStyle: "GraphQL",
        authMethod: "JWT + Strict Session Expiry",
        deploymentEnv: "Azure Healthcare API / HIPAA Compliant",
        existingProblem:
          "Pasien harus datang pagi-pagi, antri panjang hanya untuk mendapat konsultasi ringan; Dokter mengeluh rekam medis pasien tercecer antar rumah sakit yang berbeda-beda.",
        painPoints:
          "1. Kasus janji temu tak terjadwal terlambat (No-shows) meningkat drastis.\n2. Waktu tunggu pasien sebelum bertemu spesialis melumpuhkan kenyamanan lobi fasilitas medis.\n3. Rujukan dan resep cetak kerap salah baca dan sulit ditelusuri riwayat dosisnya.",
        expectedOutcome:
          "Reservasi sepenuhnya swalayan dengan auto-reminder WhatsApp, mengurangi kepadatan ruang tunggu sebesar 40%, serta memberdayakan dokter dengan dashboard holistik riwayat medis sebelum kunjungan dimulai.",
        budget: "$50,000 - $80,000",
        teamSize: "6-8 Orang (Mobile/Web, Backend, Data Engineer)",
        performanceReqs: "Streaming video konsultasi low-latency dengan resolusi adaptif.",
        scalability: "Auto-scaling untuk jam sibuk (pagi & malam) trafik pemesanan dokter.",
        latency: "Video stream latency < 50ms (WebRTC)",
      }));
    } else if (templateId === "crm") {
      setFormData((prev) => ({
        ...prev,
        projectName: "Platform CRM Omnichannel Sales",
        projectDescription:
          "Sistem Customer Relationship Management yang melacak prospek (leads), menjadwalkan interaksi tindak lanjut otomatis (follow-up), menganalisis konversi corong penjualan.",
        projectType: "Sales CRM",
        industry: "Sales & Marketing",
        targetUser: "Tim SDR (Sales Development), Account Executives, Manajer Pemasaran",
        framework: "React / Node.js",
        database: "PostgreSQL",
        apiStyle: "REST",
        authMethod: "SSO (SAML) & Password",
        deploymentEnv: "AWS",
        existingProblem:
          "Tim penjualan kesulitan memonitor tindak-lanjut klien di ratusan email yang terpisah, manajer kesulitan memberikan perkiraan pendapatan (forecasting) bulanan karena data prospek disembunyikan staf di buku tulis pribadi.",
        painPoints:
          "1. Kehilangan momen menindaklanjuti klien potensial (leads lost in cracks).\n2. Pekerjaan pelaporan pipeline membosankan dan lambat bagi staf penjualan.\n3. Kebingungan mengukur ROI kampanye marketing spesifik.",
        expectedOutcome:
          "Sinkronisasi kotak masuk dua arah (two-way email sync) tanpa ribet, dasbor Kanban interaktif Drag-and-drop untuk manajemen kesepakatan, serta laporan forecasting probabilitas otomatis menggunakan analisis ringkas.",
        budget: "$30,000 - $50,000",
        teamSize: "4-6 Orang (Frontend, Backend, Integrations Spec.)",
        performanceReqs: "Sinkronisasi email berjalan di background tanpa memblokir UI.",
        scalability: "Sistem antrean (Queue) andal untuk mengirim email jutaan prospek massal.",
        latency: "< 200ms untuk query pencarian prospek global",
      }));
    } else if (templateId === "elearning") {
      setFormData((prev) => ({
        ...prev,
        projectName: "LMS & E-Learning Platform Interaktif",
        projectDescription:
          "Sistem Manajemen Pembelajaran (LMS) modern untuk institusi pendidikan dan kreator kursus independen dengan dukungan kelas sinkron asinkron, sistem ujian, dan proctoring.",
        projectType: "E-Learning",
        industry: "EdTech",
        targetUser: "Siswa, Mahasiswa, Instruktur, Admin Institusi Pendidikan",
        framework: "React / Express",
        database: "MongoDB",
        apiStyle: "REST / WebRTC",
        authMethod: "JWT & OAuth Google",
        deploymentEnv: "Google Cloud Platform",
        existingProblem:
          "Institusi kesulitan mengatur materi ajar dalam satu tempat, video terpisah-pisah, dan ujian sering bocor karena tidak ada pengawasan. Sistem sertifikasi dan pelaporan masih manual.",
        painPoints:
          "1. Ujian jarak jauh sulit diawasi dari kecurangan.\n2. Siswa merasa tidak termotivasi (kurang gamifikasi).\n3. Server sering down ketika waktu ujian serentak tiba.",
        expectedOutcome:
          "Materi terkurasi dalam silabus terstruktur, sistem proctoring dengan anti-tab-switch, penghargaan penyelesaian interaktif (gamifikasi), serta infrastruktur mandiri yang stabil walim kelas besar secara sinkron.",
        budget: "$40,000 - $70,000",
        teamSize: "5-7 Orang (Fullstack, WebRTC Engineer, UI/UX)",
        performanceReqs: "Layanan video kompresi otomatis untuk pengguna dengan internet lambat.",
        scalability: "Mampu menampung 5000+ ujian serentak dalam 1 instansi.",
        latency: "< 100ms pemuatan soal ujian dan sinkronisasi status waktu ujian.",
      }));
    } else if (templateId === "logistics") {
      setFormData((prev) => ({
        ...prev,
        projectName: "Sistem Logistik & Supply Chain Tracker Pro",
        projectDescription:
          "Platform manajemen rantai pasok dengan pelacakan GPS armada secara sinkron penuh, manajemen gudang otomatis multi-node, dan optimasi rute kurir pintar.",
        projectType: "Supply Chain",
        industry: "Logistics",
        targetUser: "Staf Gudang, Kurir Pengiriman, Manajer Logistik, Klien B2B",
        framework: "React Native / Node.js",
        database: "PostgreSQL & Redis",
        apiStyle: "gRPC",
        authMethod: "MFA",
        deploymentEnv: "AWS",
        existingProblem:
          "Rute pengiriman kurir sangat tidak efisien (mahal bensin), bukti dokumen pengiriman fisik sering hilang, posisi truk sulit dilacak sehingga klien sering menelepon berulang kali mempertanyakan status paket.",
        painPoints:
          "1. Estimasi kedatangan (ETA) sangat tidak akurat (blind spot di jalan).\n2. Gudang mengalami bottleneck di jam sortir pagi (mis-routing paket).\n3. Supir malas memperbarui status pengiriman secara manual.",
        expectedOutcome:
          "Pelacakan GPS interaktif untuk pemantauan real-time, Scanner aplikasi mobile ber-kamera mumpuni untuk bukti foto serah terima (e-POD), dan rute pengiriman yang direkalkulerasi otomatis menggunakan Google Maps API based pada kemacetan.",
        budget: "$60,000 - $100,000",
        teamSize: "7-10 Orang (Mobile, Backend, DevOps, Data Analyst)",
        performanceReqs: "Update koordinat GPS kurir dikirimkan setiap 5 detik.",
        scalability: "Sistem harus menangani ribuan update koordinat per detik dengan WebSocket/MQTT.",
        latency: "< 50ms untuk ping update lokasi, pencarian rute < 2s.",
      }));
    } else if (templateId === "on-demand") {
      setFormData((prev) => ({
        ...prev,
        projectName: "Super App On-Demand Services",
        projectDescription:
          "Klon Super-App (Gojek/Grab) canggih yang mempertimbangkan geolocation matchmaking real-time, wallet interaktif, in-app chat, dan surge pricing otonom.",
        projectType: "Super App",
        industry: "Mobility & On-Demand",
        targetUser: "Pengguna B2C, Driver (Mitra Kurir), Merchant Restoran",
        framework: "Flutter / Go",
        database: "PostgreSQL & Cassandra",
        apiStyle: "gRPC & WebSocket",
        authMethod: "OTP SMS / Whatsapp",
        deploymentEnv: "Google Cloud Platform",
        existingProblem:
          "Mitra pengemudi kesulitan mendapatkan order dengan jarak masuk akal, pengguna kesulitan membatalkan pesanan yang sangat tidak responsif.",
        painPoints:
          "1. Aplikasi lambat memperbarui posisi di peta (Jumping Location).\n2. Kalkulasi harga statis membuat rugi pengemudi saat hujan / macet.\n3. Pertukaran nomor HP merusak privasi pengemudi dan penumpang.",
        expectedOutcome:
          "Algoritma distribusi order yang sangat adil jarak jauh-dekat, sistem In-App Chatting mask-phonenumber, dan model perhitungan tarif harga dinamis akurat otomatis (Surge pricing).",
        budget: "$120,000 - $250,000+",
        teamSize: "15+ Orang (Squad Tim terpisah: Geo, Ride, Pay, dll)",
        performanceReqs: "Sistem koneksi putus-nyambung harus ditangani elegan dengan sinkronisasi batch latar belakang.",
        scalability: "Arsitektur Event-Driven (Kafka) murni untuk menyebarkan notifikasi ke jutaan aplikasi klien.",
        latency: "< 10ms read/write di sistem Wallet Core, < 50ms matchmaking.",
      }));
    } else if (templateId === "ai-copilot") {
      setFormData((prev) => ({
        ...prev,
        projectName: "Asisten Cerdas AI & Generative Workspace",
        projectDescription:
          "Ruang kerja kolaboratif bergaya blok notion berorientasi LLM. Mampu merangkum otomatis, penulisan prediktif, penelusuran dokumen perusahaan secara semantik (RAG).",
        projectType: "AI Tool",
        industry: "Productivity",
        targetUser: "Penulis, Pembuat Konten, Tim Eksekutif, Akuntan, Peneliti",
        framework: "React / Python (FastAPI)",
        database: "PostgreSQL & Pinecone (VectorDB)",
        apiStyle: "REST / Server-Sent Events (SSE)",
        authMethod: "OAuth Google",
        deploymentEnv: "Vercel & AWS",
        existingProblem:
          "Proses riset sangat memakan waktu. Karyawan harus bolak-balik antara dokumen internal dan alat publik LLM (yang bisa membahayakan kerahasiaan data). Tidak ada ringkasan otomatis untuk rapat besar.",
        painPoints:
          "1. Kebocoran data ketika menggunakan AI pihak ketiga (tanpa isolasi tenant).\n2. LLM berhalusinasi tidak berdasarkan dokumen internal nyata.\n3. Terlahu banyak berpindah pindah jendela aplikasi web.",
        expectedOutcome:
          "Sistem Retrieval-Augmented Generation (RAG) tangguh dimana AI hanya menjawab berdasarkan kumpulan knowledge base internal, Streaming respons text untuk user experience yang mirip ChatGPT, dan text-editor blok modern yang intuitif.",
        budget: "$40,000 - $80,000",
        teamSize: "4-6 Orang (AI/ML Engineer, Fullstack, Frontend Spec.)",
        performanceReqs: "Proses embed vector dalam antrean untuk file ratusan halaman, UX UI tidak boleh blocking/terjeda.",
        scalability: "Indeks vektor yang scalable hingga jutaan potongan semantik.",
        latency: "Pemuatan aliran token pertama < 1.0 detik (Time To First Token).",
      }));
    } else {
      // Find inside communityTemplates
      const matched = communityTemplates.find(c => c.id === templateId);
      if (matched) {
        setFormData((prev) => ({
          ...prev,
          projectName: matched.name || "",
          projectDescription: matched.description || "",
          projectType: matched.category || "",
          industry: matched.industry || "",
          expectedOutcome: matched.features ? (Array.isArray(matched.features) ? matched.features.join("\n") : matched.features) : "",
          targetUser: matched.audience || "",
          framework: matched.techStack || "",
          database: matched.database || "",
          apiStyle: matched.apiStyle || "",
          authMethod: matched.authMethod || "",
          deploymentEnv: matched.deploymentEnv || "",
          existingProblem: matched.existingProblem || "",
          painPoints: matched.painPoints ? (Array.isArray(matched.painPoints) ? matched.painPoints.join("\n") : matched.painPoints) : "",
          budget: matched.budget || "",
          teamSize: matched.teamSize || "",
          performanceReqs: matched.performanceReqs || "",
          scalability: matched.scalability || "",
          latency: matched.latency || "",
        }));
        if (matched.customSections) {
          setCustomSections(matched.customSections);
        }
      }
    }
    setImportedSuccessMsg(`Berhasil meng-import template: "${templateName}"!`);
    setTimeout(() => setImportedSuccessMsg(null), 4000);
  };

  // --- EXTRA CODE GENERATION & ADVANCED DIAGRAMMING STATES ---
  const [activePrdTab, setActivePrdTab] = useState<
    "prd" | "security"
  >("prd");
  const [showRawPrd, setShowRawPrd] = useState(false);
  
  // Diagrams tab states

  // Code Generator tab states
  const [selectedFramework, setSelectedFramework] = useState("express");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generatedCodeData, setGeneratedCodeData] = useState<any>(null);
  const [activeCodeFileIndex, setActiveCodeFileIndex] = useState(0);
  const [codeRefinePrompt, setCodeRefinePrompt] = useState("");
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isInstructionsCopied, setIsInstructionsCopied] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  // Automatically extract Boilerplate Code & Unit Tests from Section 15 of the PRD
  useEffect(() => {
    if (!generatedPRD) {
      setGeneratedCodeData(null);
      return;
    }

    const files: { name: string; code: string }[] = [];
    const fileRegex = /###\s+File:\s*(?:`|')?([^`'\n]+)(?:`|')?\s*\n+```(?:\w+)?\n([\s\S]*?)\n```/g;
    let match;
    const prdText = generatedPRD;
    
    while ((match = fileRegex.exec(prdText)) !== null) {
      const name = match[1].trim().replace(/`/g, "").trim();
      const code = match[2].trim();
      if (name && !files.some(f => f.name === name)) {
        files.push({ name, code });
      }
    }

    // Try to extract installation instructions / guide (usually under 15.3 Panduan Instalasi)
    let instructions = "";
    const instructionsRegex = /##\s+15\.3\s+Panduan\s+Instalasi[^\n]*\n([\s\S]*?)(?=\n#|$)/i;
    const instMatch = prdText.match(instructionsRegex);
    if (instMatch) {
      instructions = instMatch[1].trim();
    } else {
      const generalInstRegex = /(?:Panduan Instalasi|Installation Guide)[^\n]*\n([\s\S]*?)(?=\n#|$)/i;
      const genMatch = prdText.match(generalInstRegex);
      if (genMatch) {
        instructions = genMatch[1].trim();
      }
    }

    if (files.length > 0) {
      setGeneratedCodeData({
        files,
        instructions: instructions || "Petunjuk instalasi dan cara menjalankan aplikasi dapat dilihat di Bagian 15.3 pada tab Dokumen PRD Utama."
      });
      setActiveCodeFileIndex(0);
    }
  }, [generatedPRD]);

  // Diagrams Extractor with Resilient Fallbacks

  // Extract specific PRD sections with extremely flexible fallback search keys
  const parsePrdSection = (primaryKeys: string[], stopKeys: string[]): string => {
    if (!generatedPRD) return "";
    
    let startIndex = -1;
    let foundKey = "";
    
    // Search for the start key
    for (const key of primaryKeys) {
      startIndex = generatedPRD.indexOf(key);
      if (startIndex !== -1) {
        foundKey = key;
        break;
      }
    }
    
    if (startIndex === -1) {
      // Try lowercase matching or loose matching if direct matches fail
      const lowerPrd = generatedPRD.toLowerCase();
      for (const key of primaryKeys) {
        const idx = lowerPrd.indexOf(key.toLowerCase());
        if (idx !== -1) {
          startIndex = idx;
          foundKey = generatedPRD.substring(idx, idx + key.length);
          break;
        }
      }
    }
    
    if (startIndex === -1) return "";
    
    const contentStart = startIndex + foundKey.length;
    let endIndex = -1;
    
    // Search for the end key from contentStart
    for (const key of stopKeys) {
      endIndex = generatedPRD.indexOf(key, contentStart);
      if (endIndex !== -1) {
        break;
      }
    }
    
    if (endIndex === -1) {
      const lowerPrd = generatedPRD.toLowerCase();
      for (const key of stopKeys) {
        const idx = lowerPrd.indexOf(key.toLowerCase(), contentStart);
        if (idx !== -1) {
          endIndex = idx;
          break;
        }
      }
    }
    
    if (endIndex === -1) {
      return generatedPRD.substring(contentStart).trim();
    }
    
    return generatedPRD.substring(contentStart, endIndex).trim();
  };

  const getParsedSection = (type: "rbac" | "auth" | "architecture" | "api" | "erd" | "dictionary" | "user_journey" | "rules" | "sequence" | "environment_spec" | "nfr") => {
    switch (type) {
      case "rbac":
        return parsePrdSection(["## 5.1 Matriks RBAC", "## 5.1 Matriks Role-Based Access Control"], ["## 5.2 Protokol Autentikasi", "# 6. Arsitektur"]);
      case "auth":
        return parsePrdSection(["## 5.2 Protokol Autentikasi"], ["# 6. Arsitektur", "## 6.1 Arsitektur Sistem"]);
      case "architecture":
        return parsePrdSection(["## 6.1 Arsitektur Sistem"], ["## 6.2 Arsitektur Integrasi", "## 6.2 Arsitektur Kontrak", "# 7. Model Data"]);
      case "api":
        return parsePrdSection(["## 6.2 Arsitektur Integrasi", "## 6.2 Arsitektur Kontrak"], ["# 7. Model Data", "## 7.1 Entity Relationship Diagram"]);
      case "erd":
        return parsePrdSection(["## 7.1 Entity Relationship Diagram"], ["## 7.2 Kamus Data", "# 8. Alur Kerja"]);
      case "dictionary":
        return parsePrdSection(["## 7.2 Kamus Data"], ["# 8. Alur Kerja", "## 8.1 User Journey"]);
      case "user_journey":
        return parsePrdSection(["## 8.1 User Journey"], ["## 8.2 Aturan Main Bisnis", "## 8.3 UML Sequence"]);
      case "rules":
        return parsePrdSection(["## 8.2 Aturan Main Bisnis"], ["## 8.3 UML Sequence", "# 9. Kebutuhan Fungsional"]);
      case "sequence":
        return parsePrdSection(["## 8.3 UML Sequence", "## 8.3 UML State Diagram"], ["# 9. Kebutuhan Fungsional", "# 10. Lingkungan"]);
      case "environment_spec":
        return parsePrdSection(["## 10.1 Spesifikasi Lingkungan"], ["## 10.2 Kebutuhan Non-Fungsional", "# 11. Integrasi"]);
      case "nfr":
        return parsePrdSection(["## 10.2 Kebutuhan Non-Fungsional"], ["# 11. Integrasi", "# 12. Fitur Usulan"]);
      default:
        return "";
    }
  };

  // Code Generation Trigger
  const generateBoilerplate = async (framework: string, refine: string = "") => {
    setIsGeneratingCode(true);
    setCodeError(null);
    try {
      const response = await fetch("/api/v1/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prdText: generatedPRD,
          framework,
          refinePrompt: refine,
          provider: formData.provider || "Gemini",
          aiModel: formData.aiModel,
          apiKey: formData.apiKey,
        }),
      });
      
      const data = await response.json();
      if (response.ok && data.status === "success") {
        setGeneratedCodeData(data.data);
        setActiveCodeFileIndex(0);
      } else {
        throw new Error(data.error || "Gagal membuat kode boilerplate");
      }
    } catch (err: any) {
      console.error(err);
      setCodeError(err.message || "Terjadi kesalahan koneksi atau otorisasi.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Diagram Exports Handler
  const exportDiagram = (format: "svg" | "png" | "pdf", activeDiagramType: string) => {
    const svgElement =
      (document.querySelector("#diagram-container svg") as SVGElement) ||
      (document.querySelector("svg") as SVGElement);
    if (!svgElement) return;

    if (format === "svg") {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `diagram-${activeDiagramType}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else if (format === "png") {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = new Image();
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const blobURL = URL.createObjectURL(svgBlob);
      image.onload = () => {
        canvas.width = image.width || 800;
        canvas.height = image.height || 600;
        ctx?.drawImage(image, 0, 0);
        const png = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = png;
        downloadLink.download = `diagram-${activeDiagramType}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      image.src = blobURL;
    } else if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Export Diagram ${activeDiagramType.toUpperCase()}</title>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  background-color: white;
                  font-family: sans-serif;
                }
                svg {
                  max-width: 95%;
                  max-height: 95%;
                }
              </style>
            </head>
            <body>
              ${svgElement.outerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const copyToClipboard = async () => {
    if (generatedPRD) {
      await navigator.clipboard.writeText(generatedPRD);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const exportToPdf = () => {
    const element = document.getElementById("prd-export-content");
    if (element) {
      element.classList.add("print-target");
      document.body.classList.add("printing-element-active");
      const originalTitle = document.title;
      document.title = `${formData.projectName ? formData.projectName.replace(/\s+/g, "-") : "PRD"}-Document`;
      
      window.print();
      
      document.title = originalTitle;
      document.body.classList.remove("printing-element-active");
      element.classList.remove("print-target");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVoiceInput = (name: keyof typeof formData, text: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name] ? prev[name] + " " + text : text,
    }));
  };

  const handleSuggestStack = async () => {
    if (!formData.projectDescription) return;
    setIsSuggestingStack(true);
    try {
      const res = await fetch("/api/v1/suggest-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: formData.industry,
          projectDescription: formData.projectDescription,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          projectType: data.projectType || prev.projectType,
          framework: data.framework || prev.framework,
          database: data.database || prev.database,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggestingStack(false);
    }
  };

  const handleDraftProblem = async () => {
    if (!formData.projectDescription) return;
    setIsDraftingProblem(true);
    try {
      const res = await fetch("/api/v1/draft-problem-statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: formData.industry,
          projectDescription: formData.projectDescription,
          projectType: formData.projectType,
          framework: formData.framework,
          database: formData.database,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          existingProblem: data.existingProblem || prev.existingProblem,
          painPoints: data.painPoints || prev.painPoints,
          expectedOutcome: data.expectedOutcome || prev.expectedOutcome,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDraftingProblem(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSavingError(false);
    setGenerateError(null);

    let apiKeys = loadStoredApiKeysSync();

    // Map aiModel to Provider
    let providerName = "Gemini";
    if (formData.aiModel.includes("claude")) providerName = "Claude";
    if (formData.aiModel.includes("gpt")) providerName = "Chatgpt";
    if (formData.aiModel.includes("z-ai")) providerName = "Z.ai";
    if (formData.aiModel.includes("xiaomi")) providerName = "Xiaomi.ai";

    let preferredKey = apiKeys?.[providerName]?.main || "";

    // If local key is empty, try quick sync from cloud database
    if (!preferredKey) {
      try {
        const { keys } = await syncApiKeysFromCloud();
        apiKeys = keys;
        preferredKey = apiKeys?.[providerName]?.main || "";
      } catch (err) {
        console.warn("Cloud key sync fallback error:", err);
      }
    }

    // Simulate API Call to backend
    try {
      const response = await fetch("/api/v1/generate-prd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: providerName,
          aiModel: formData.aiModel,
          apiKey: preferredKey,
          customSections: customSections,
          projectInfo: {
            name: formData.projectName,
            description: formData.projectDescription,
            type: formData.projectType,
            industry: formData.industry,
            targetUser: formData.targetUser,
          },
          techStack: {
            framework: formData.framework,
            database: formData.database,
            apiStyle: formData.apiStyle,
            auth: formData.authMethod,
            deployment: formData.deploymentEnv,
          },
          problemStatement: {
            problem: formData.existingProblem,
            painPoints: formData.painPoints,
            outcome: formData.expectedOutcome,
          },
          constraints: {
            budget: formData.budget,
            teamSize: formData.teamSize,
            performanceReqs: formData.performanceReqs,
            scalability: formData.scalability,
            latency: formData.latency,
          },
          templateSuggestions: (visionStatus === "accepted" || goalsStatus === "accepted" || featuresStatus === "accepted" || userStoriesStatus === "accepted") ? {
            vision: visionStatus === "accepted" ? suggestionVision : undefined,
            goals: goalsStatus === "accepted" ? suggestionGoals : undefined,
            features: featuresStatus === "accepted" ? suggestionFeatures : undefined,
            userStories: userStoriesStatus === "accepted" ? suggestionUserStories : undefined,
          } : undefined,
        }),
      });

      let data;
      let rawText = "";
      try {
        rawText = await response.text();
        data = JSON.parse(rawText);
      } catch (jsonErr) {
        if (!response.ok) {
           throw new Error(`Server returned an error (${response.status} ${response.statusText}). It might be experiencing timeouts or high load. Please try again.`);
        }
        throw new Error(`Invalid response received from server. Please try again. Response was not JSON.`);
      }

      if (!response.ok || data?.error) {
        throw new Error(data?.error || `Failed to generate PRD (${response.status})`);
      }

      const content =
        data.markdown ||
        "PRD Document generated successfully. In production, this would contain the full Markdown.";

      try {
        await addDoc(collection(db, "prds"), {
          projectName: formData.projectName,
          projectType: formData.projectType,
          framework: formData.framework,
          database: formData.database,
          description: formData.projectDescription,
          content: content,
          createdAt: serverTimestamp(),
        });
        localStorage.removeItem("prd_generator_draft");
      } catch (err) {
        console.error("Failed to save to Firestore:", err);
        setSavingError(true);
      }

      setTimeout(() => {
        setGeneratedPRD(content);
        setIsGenerating(false);
      }, 2000);
    } catch (e: any) {
      console.warn("Generation error:", e.message);
      setGenerateError(
        e.message || "An unexpected error occurred during generation.",
      );
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Draft Recovery Alert Banner */}
      <AnimatePresence>
        {draftRestored && !hideBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-amber-950">Draf Pengerjaan Terdeteksi & Dipulihkan Otomatis</h4>
                <p className="text-xs text-amber-800 mt-1">
                  Progres pembuatan PRD terakhir Anda ({lastSavedTime || "baru saja"}) telah dipulihkan agar Anda tidak kehilangan data. Sistem auto-save aktif melacak setiap langkah Anda secara real-time.
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

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            PRD Generator Wizard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Follow the steps to configure and generate your automated Product
            Requirements Document.
          </p>
        </div>

        {/* Auto-save Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full self-start sm:self-center shadow-xs">
          {autoSaveState === "saving" && (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>Menyimpan draf...</span>
            </>
          )}
          {autoSaveState === "saved" && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <span>Draf disimpan ({lastSavedTime || "baru saja"})</span>
            </>
          )}
          {autoSaveState === "idle" && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <span>Auto-save Aktif</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-col gap-8">
        {/* Stepper Horizontal for Desktop, Vertical for Mobile */}
        <div className="w-full">
          <nav aria-label="Progress">
            <ol
              role="list"
              className="overflow-hidden lg:flex lg:items-center lg:justify-between lg:rounded-xl lg:border lg:border-gray-200 lg:bg-white lg:shadow-sm"
            >
              {steps.map((step, stepIdx) => (
                <li
                  key={step.id}
                  className={cn(
                    "relative lg:flex-1",
                    stepIdx !== steps.length - 1 ? "pb-10 lg:pb-0" : "",
                  )}
                >
                  {/* Vertical Line for Mobile */}
                  {stepIdx !== steps.length - 1 ? (
                    <div
                      className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-200 lg:hidden"
                      aria-hidden="true"
                    />
                  ) : null}

                  {/* Horizontal Arrow for Desktop */}
                  {stepIdx !== steps.length - 1 ? (
                    <div
                      className="hidden lg:block absolute right-0 top-0 h-full w-5"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-full w-full text-gray-300"
                        viewBox="0 0 22 80"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0 -2L20 40L0 82"
                          vectorEffect="non-scaling-stroke"
                          stroke="currentcolor"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "group relative flex items-start lg:items-center lg:py-4 lg:pl-4 lg:pr-6",
                      stepIdx !== 0 ? "lg:pl-9" : "lg:pl-8",
                    )}
                  >
                    <span className="flex h-9 items-center lg:h-auto">
                      <span
                        className={cn(
                          "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                          currentStep > step.id
                            ? "bg-indigo-600 border-indigo-600"
                            : currentStep === step.id
                              ? "border-indigo-600 bg-white"
                              : "border-gray-300 bg-white",
                        )}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <span
                            className={cn(
                              "text-sm font-medium",
                              currentStep === step.id
                                ? "text-indigo-600"
                                : "text-gray-500",
                            )}
                          >
                            {step.id}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col lg:ml-4 lg:flex-row lg:items-center lg:gap-2 lg:text-sm">
                      <span
                        className={cn(
                          "text-sm font-medium tracking-wide",
                          currentStep === step.id
                            ? "text-indigo-600"
                            : "text-gray-500",
                        )}
                      >
                        {step.name}
                      </span>
                      <span className="text-sm text-gray-500 hidden sm:block lg:hidden xl:block">
                        {step.description}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Wizard Form & Copilot Split Layout */}
        <div className="w-full">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Step 1: Project Info */}
            {currentStep === 1 && (
              <div className="p-4 sm:p-8">
                <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  Project Information
                </h2>

                {/* Elegant Template Selector */}
                <div className="mb-8 p-5 bg-gradient-to-r from-slate-50 to-indigo-50/20 rounded-2xl border border-indigo-100/60 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full -mr-5 -mt-5 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-indigo-900 tracking-wider uppercase flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        Pilih & Import Template PRD Profesional
                      </h3>
                      <p className="text-xs text-slate-500 max-w-xl">
                        Mulai dengan cepat menggunakan cetak biru PRD pra-konfigurasi untuk mempercepat perumusan arsitektur, tech stack, dan pain points aplikasi Anda.
                      </p>
                    </div>

                    {/* Dropdown Action - Responsive Layout */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      {/* Responsive Styled Dropdown Menu */}
                      <div className="relative w-full sm:w-64">
                        <select
                          id="prd-template-dropdown"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            let name = "";
                            if (val === "ecommerce") name = "E-Commerce & Marketplace Modern";
                            else if (val === "saas") name = "SaaS Subscription Analytics Platform";
                            else if (val === "internal-tool") name = "Sistem Manajemen Admin HR";
                            else if (val === "fintech") name = "Aplikasi Remitansi & Global E-Wallet";
                            else if (val === "healthtech") name = "Portal Booking Telemedisin Klinis";
                            else if (val === "crm") name = "Platform CRM Omnichannel Sales";
                            else if (val === "elearning") name = "LMS & E-Learning Platform Interaktif";
                            else if (val === "logistics") name = "Sistem Logistik & Supply Chain Tracker Pro";
                            else if (val === "on-demand") name = "Super App On-Demand Services";
                            else if (val === "ai-copilot") name = "Asisten Cerdas AI & Workspace";
                            else {
                              const matched = communityTemplates.find(c => c.id === val);
                              name = matched ? (matched.name || matched.projectName || "Template Komunitas") : "Template Komunitas";
                            }
                            handleApplyPRDTemplate(val, name);
                            // reset value so user can select again if needed
                            e.target.value = "";
                          }}
                          className="w-full appearance-none px-4 py-2.5 bg-white border border-indigo-200 text-indigo-950 rounded-xl text-xs font-semibold shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer pr-10 hover:border-indigo-300 transition-all"
                        >
                          <option value="">Pilih Template PRD...</option>
                          <optgroup label="Template Bawaan (Industri)">
                            <option value="ecommerce">E-Commerce & Marketplace</option>
                            <option value="saas">SaaS Subscription Analytics</option>
                            <option value="internal-tool">Sistem Manajemen Admin HR</option>
                            <option value="fintech">Remitansi & Global E-Wallet</option>
                            <option value="healthtech">Portal Booking Telemedisin</option>
                            <option value="crm">Platform CRM Omnichannel</option>
                            <option value="elearning">LMS & E-Learning Platform</option>
                            <option value="logistics">Logistik & Supply Chain Tracker</option>
                            <option value="on-demand">Super App On-Demand Services</option>
                            <option value="ai-copilot">Asisten Cerdas AI & Workspace</option>
                          </optgroup>
                          {communityTemplates.length > 0 && (
                            <optgroup label="Template Komunitas">
                              {communityTemplates.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.name || t.projectName || "Template Tanpa Nama"}
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

                {/* AI Document Analysis Integration Banner */}
                <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-purple-200/80 shadow-xs relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#696cff] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 flex flex-wrap items-center gap-2">
                          <span>AI Document Analyzer & Key Requirements Extractor</span>
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-purple-200">
                            GEMINI 2.5 FLASH
                          </span>
                        </h3>
                        <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                          Unggah berkas spesifikasi awal (.txt, .docx, .md) atau tempelkan teks penjelasan produk. AI akan merangkum poin penting, mengekstrak kebutuhan fitur, dan mengisi form PRD ini secara otomatis.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDocAnalyzer(!showDocAnalyzer)}
                      className="bg-[#696cff] hover:bg-[#5a5ddb] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs shrink-0 flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
                    >
                      <Wand2 className="w-4 h-4" />
                      {showDocAnalyzer ? "Sembunyikan Analyzer" : "Buka AI Doc Analyzer"}
                    </button>
                  </div>

                  {/* Expandable Document Analyzer */}
                  {showDocAnalyzer && (
                    <div className="mt-5 pt-5 border-t border-purple-100">
                      <PRDDocumentAnalyzer
                        onApplyToWizard={(result) => {
                          handleApplyDocAnalysisToWizard(result);
                          setShowDocAnalyzer(false);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Toast Feedback */}
                {importedSuccessMsg && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 animate-scale-up">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-medium">{importedSuccessMsg}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Project Name
                      </label>
                      <input
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. HealthTracker Pro"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Project Description
                        </label>
                        <VoiceInput
                          onTranscript={(t) =>
                            handleVoiceInput("projectDescription", t)
                          }
                        />
                      </div>
                      <textarea
                        name="projectDescription"
                        value={formData.projectDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Briefly describe what this project does..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Project Type
                      </label>
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select type...</option>
                        {PROJECT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Industry
                      </label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Healthcare, Finance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Target User Persona
                      </label>
                      <input
                        type="text"
                        name="targetUser"
                        value={formData.targetUser}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Clinic Administrators, Doctors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                        <span>AI Model Tuning</span>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Engine</span>
                      </label>
                      <select
                        name="aiModel"
                        value={formData.aiModel}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="gemini-3.1-pro-preview">
                          Gemini 3.1 Pro (Preview)
                        </option>
                        <option value="gemini-3.5-flash">
                          Gemini 3.5 Flash
                        </option>
                        <option value="claude-3-5-sonnet">
                          Claude 3.5 Sonnet
                        </option>
                        <option value="gpt-4o">OpenAI GPT-4o</option>
                        <option value="deepseek-coder">DeepSeek Coder</option>
                        <option value="xiaomi-ai">Xiaomi AI</option>
                        <option value="z-ai">Z.ai</option>
                      </select>
                    </div>
                  </div>

                  {templateId && (
                    <div className="mt-8 border-t border-gray-100 pt-8 animate-in fade-in duration-500">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                            AI Template Assistant: Modul Fondasi Otonom
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Saran otomatis Vision, Goals, Features, dan User Stories berbasis kecerdasan AI untuk akselerasi PRD Anda.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fetchTemplateSuggestions(formData.projectType, formData.industry, templateId)}
                          disabled={suggestionsLoading || !formData.projectType || !formData.industry}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw className={cn("h-3.5 w-3.5", suggestionsLoading && "animate-spin")} />
                          Ambil Saran AI Baru
                        </button>
                      </div>

                      {suggestionsLoading ? (
                        <div className="space-y-4 py-8">
                          <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium text-sm">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Menghasilkan Saran Fondasi PRD...</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[1, 2, 3, 4].map((n) => (
                              <div key={n} className="h-44 rounded-xl border border-gray-200 bg-gray-50/50 animate-pulse p-4 flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                                  <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                                  <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="h-8 w-1/4 bg-gray-200 rounded self-end" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : suggestionsError ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-red-800">Gagal Memuat Saran Fondasi</h4>
                            <p className="text-xs text-red-600 mt-1">{suggestionsError}</p>
                            <button
                              type="button"
                              onClick={() => fetchTemplateSuggestions(formData.projectType, formData.industry, templateId)}
                              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                            >
                              Coba Lagi
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Vision Section */}
                          <div
                            className={cn(
                              "rounded-xl border p-4 bg-white transition-all flex flex-col justify-between min-h-[12.5rem] relative",
                              visionStatus === "accepted" && "border-green-300 bg-green-50/5 shadow-sm",
                              visionStatus === "rejected" && "border-gray-200 opacity-60 bg-gray-50/30",
                              visionStatus === "pending" && "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Compass className="h-4 w-4 text-indigo-500" />
                                  Visi Produk
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                    visionStatus === "accepted" && "bg-green-100 text-green-800",
                                    visionStatus === "rejected" && "bg-gray-100 text-gray-600",
                                    visionStatus === "pending" && "bg-indigo-50 text-indigo-700"
                                  )}
                                >
                                  {visionStatus === "accepted" ? "Diterima" : visionStatus === "rejected" ? "Diabaikan" : "Saran AI"}
                                </span>
                              </div>
                              <textarea
                                value={visionInput}
                                onChange={(e) => {
                                  setVisionInput(e.target.value);
                                  if (visionStatus === "accepted") setSuggestionVision(e.target.value);
                                }}
                                disabled={visionStatus === "rejected"}
                                rows={4}
                                className="w-full text-xs text-gray-700 border border-gray-100 rounded-lg p-2.5 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50/30 resize-none leading-relaxed font-sans"
                                placeholder="Tulis visi produk di sini..."
                              />
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/60">
                              <button
                                type="button"
                                onClick={() => {
                                  setVisionInput(originalVision);
                                  setSuggestionVision(originalVision);
                                  setVisionStatus("pending");
                                }}
                                className="text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-[10px] font-medium cursor-pointer"
                                title="Kembalikan ke saran asli"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Reset
                              </button>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVisionStatus("rejected");
                                    setSuggestionVision("");
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition cursor-pointer",
                                    visionStatus === "rejected" ? "bg-red-50 text-red-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                  )}
                                >
                                  <X className="h-3 w-3" />
                                  Abaikan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVisionStatus("accepted");
                                    setSuggestionVision(visionInput);
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-md transition cursor-pointer",
                                    visionStatus === "accepted" ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                  {visionStatus === "accepted" ? "Diterima" : "Terima"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Goals Section */}
                          <div
                            className={cn(
                              "rounded-xl border p-4 bg-white transition-all flex flex-col justify-between min-h-[12.5rem] relative",
                              goalsStatus === "accepted" && "border-green-300 bg-green-50/5 shadow-sm",
                              goalsStatus === "rejected" && "border-gray-200 opacity-60 bg-gray-50/30",
                              goalsStatus === "pending" && "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Target className="h-4 w-4 text-indigo-500" />
                                  Metrik & Sasaran (Goals)
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                    goalsStatus === "accepted" && "bg-green-100 text-green-800",
                                    goalsStatus === "rejected" && "bg-gray-100 text-gray-600",
                                    goalsStatus === "pending" && "bg-indigo-50 text-indigo-700"
                                  )}
                                >
                                  {goalsStatus === "accepted" ? "Diterima" : goalsStatus === "rejected" ? "Diabaikan" : "Saran AI"}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400">Gunakan baris baru untuk memisahkan setiap sasaran.</p>
                              <textarea
                                value={goalsInput}
                                onChange={(e) => {
                                  setGoalsInput(e.target.value);
                                  if (goalsStatus === "accepted") setSuggestionGoals(e.target.value.split("\n").map(l => l.trim()).filter(Boolean));
                                }}
                                disabled={goalsStatus === "rejected"}
                                rows={4}
                                className="w-full text-xs text-gray-700 border border-gray-100 rounded-lg p-2.5 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50/30 resize-none leading-relaxed font-sans"
                                placeholder="Contoh:&#10;Meningkatkan retensi 20%&#10;Meluncurkan portal dalam 4 minggu"
                              />
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/60">
                              <button
                                type="button"
                                onClick={() => {
                                  setGoalsInput(originalGoals.join("\n"));
                                  setSuggestionGoals(originalGoals);
                                  setGoalsStatus("pending");
                                }}
                                className="text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-[10px] font-medium cursor-pointer"
                                title="Kembalikan ke saran asli"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Reset
                              </button>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGoalsStatus("rejected");
                                    setSuggestionGoals([]);
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition cursor-pointer",
                                    goalsStatus === "rejected" ? "bg-red-50 text-red-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                  )}
                                >
                                  <X className="h-3 w-3" />
                                  Abaikan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGoalsStatus("accepted");
                                    setSuggestionGoals(goalsInput.split("\n").map(l => l.trim()).filter(Boolean));
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-md transition cursor-pointer",
                                    goalsStatus === "accepted" ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                  {goalsStatus === "accepted" ? "Diterima" : "Terima"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Features Section */}
                          <div
                            className={cn(
                              "rounded-xl border p-4 bg-white transition-all flex flex-col justify-between min-h-[12.5rem] relative",
                              featuresStatus === "accepted" && "border-green-300 bg-green-50/5 shadow-sm",
                              featuresStatus === "rejected" && "border-gray-200 opacity-60 bg-gray-50/30",
                              featuresStatus === "pending" && "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Blocks className="h-4 w-4 text-indigo-500" />
                                  Fitur Utama (Features)
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                    featuresStatus === "accepted" && "bg-green-100 text-green-800",
                                    featuresStatus === "rejected" && "bg-gray-100 text-gray-600",
                                    featuresStatus === "pending" && "bg-indigo-50 text-indigo-700"
                                  )}
                                >
                                  {featuresStatus === "accepted" ? "Diterima" : featuresStatus === "rejected" ? "Diabaikan" : "Saran AI"}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400">Gunakan baris baru untuk memisahkan setiap fitur.</p>
                              <textarea
                                value={featuresInput}
                                onChange={(e) => {
                                  setFeaturesInput(e.target.value);
                                  if (featuresStatus === "accepted") setSuggestionFeatures(e.target.value.split("\n").map(l => l.trim()).filter(Boolean));
                                }}
                                disabled={featuresStatus === "rejected"}
                                rows={4}
                                className="w-full text-xs text-gray-700 border border-gray-100 rounded-lg p-2.5 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50/30 resize-none leading-relaxed font-sans"
                                placeholder="Contoh:&#10;Sinkronisasi Inventaris Real-Time&#10;Checkout Multi-Vendor"
                              />
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/60">
                              <button
                                type="button"
                                onClick={() => {
                                  setFeaturesInput(originalFeatures.join("\n"));
                                  setSuggestionFeatures(originalFeatures);
                                  setFeaturesStatus("pending");
                                }}
                                className="text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-[10px] font-medium cursor-pointer"
                                title="Kembalikan ke saran asli"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Reset
                              </button>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFeaturesStatus("rejected");
                                    setSuggestionFeatures([]);
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition cursor-pointer",
                                    featuresStatus === "rejected" ? "bg-red-50 text-red-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                  )}
                                >
                                  <X className="h-3 w-3" />
                                  Abaikan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFeaturesStatus("accepted");
                                    setSuggestionFeatures(featuresInput.split("\n").map(l => l.trim()).filter(Boolean));
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-md transition cursor-pointer",
                                    featuresStatus === "accepted" ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                  {featuresStatus === "accepted" ? "Diterima" : "Terima"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* User Stories Section */}
                          <div
                            className={cn(
                              "rounded-xl border p-4 bg-white transition-all flex flex-col justify-between min-h-[12.5rem] relative",
                              userStoriesStatus === "accepted" && "border-green-300 bg-green-50/5 shadow-sm",
                              userStoriesStatus === "rejected" && "border-gray-200 opacity-60 bg-gray-50/30",
                              userStoriesStatus === "pending" && "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Smile className="h-4 w-4 text-indigo-500" />
                                  Skenario Pengguna (User Stories)
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                    userStoriesStatus === "accepted" && "bg-green-100 text-green-800",
                                    userStoriesStatus === "rejected" && "bg-gray-100 text-gray-600",
                                    userStoriesStatus === "pending" && "bg-indigo-50 text-indigo-700"
                                  )}
                                >
                                  {userStoriesStatus === "accepted" ? "Diterima" : userStoriesStatus === "rejected" ? "Diabaikan" : "Saran AI"}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400">Gunakan baris baru untuk memisahkan setiap skenario.</p>
                              <textarea
                                value={storiesInput}
                                onChange={(e) => {
                                  setStoriesInput(e.target.value);
                                  if (userStoriesStatus === "accepted") setSuggestionUserStories(e.target.value.split("\n").map(l => l.trim()).filter(Boolean));
                                }}
                                disabled={userStoriesStatus === "rejected"}
                                rows={4}
                                className="w-full text-xs text-gray-700 border border-gray-100 rounded-lg p-2.5 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50/30 resize-none leading-relaxed font-sans"
                                placeholder="Contoh:&#10;Sebagai pembeli, saya ingin...&#10;Sebagai admin, saya ingin..."
                              />
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/60">
                              <button
                                type="button"
                                onClick={() => {
                                  setStoriesInput(originalUserStories.join("\n"));
                                  setSuggestionUserStories(originalUserStories);
                                  setUserStoriesStatus("pending");
                                }}
                                className="text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-[10px] font-medium cursor-pointer"
                                title="Kembalikan ke saran asli"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Reset
                              </button>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserStoriesStatus("rejected");
                                    setSuggestionUserStories([]);
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition cursor-pointer",
                                    userStoriesStatus === "rejected" ? "bg-red-50 text-red-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                  )}
                                >
                                  <X className="h-3 w-3" />
                                  Abaikan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserStoriesStatus("accepted");
                                    setSuggestionUserStories(storiesInput.split("\n").map(l => l.trim()).filter(Boolean));
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-md transition cursor-pointer",
                                    userStoriesStatus === "accepted" ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                  {userStoriesStatus === "accepted" ? "Diterima" : "Terima"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Tech Stack */}
            {currentStep === 2 && (
              <div className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-500" />
                    Technology Stack
                  </h2>
                  <button
                    onClick={handleSuggestStack}
                    disabled={isSuggestingStack || !formData.projectDescription}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border",
                      isSuggestingStack || !formData.projectDescription
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    )}
                  >
                    <Wand2 className={cn("w-4 h-4", isSuggestingStack && "animate-pulse")} />
                    {isSuggestingStack ? "Suggesting..." : "AI Suggest Stack"}
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Backend Framework
                      </label>
                      <select
                        name="framework"
                        value={formData.framework}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select framework...</option>
                        {FRAMEWORKS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Primary Database
                      </label>
                      <select
                        name="database"
                        value={formData.database}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select database...</option>
                        {DATABASES.map((db) => (
                          <option key={db.value} value={db.value}>
                            {db.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        API Style
                      </label>
                      <select
                        name="apiStyle"
                        value={formData.apiStyle}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select style...</option>
                        {API_STYLES.map((api) => (
                          <option key={api.value} value={api.value}>
                            {api.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Authentication Method
                      </label>
                      <select
                        name="authMethod"
                        value={formData.authMethod}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select auth...</option>
                        <option value="JWT">JWT Standard</option>
                        <option value="OAuth2">OAuth 2.0</option>
                        <option value="Firebase">Firebase Auth</option>
                        <option value="Keycloak">Keycloak</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Deployment Environment
                      </label>
                      <input
                        type="text"
                        name="deploymentEnv"
                        value={formData.deploymentEnv}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. AWS (EKS), Vercel + Supabase, GCP Cloud Run"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Problem Statement */}
            {currentStep === 3 && (
              <div className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Blocks className="h-5 w-5 text-indigo-500" />
                    Problem Statement & Goals
                  </h2>
                  <button
                    onClick={handleDraftProblem}
                    disabled={isDraftingProblem || !formData.projectDescription}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border",
                      isDraftingProblem || !formData.projectDescription
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    )}
                  >
                    <Wand2 className={cn("w-4 h-4", isDraftingProblem && "animate-pulse")} />
                    {isDraftingProblem ? "Drafting..." : "AI Draft Problem"}
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Existing Problem
                      </label>
                      <VoiceInput
                        onTranscript={(t) =>
                          handleVoiceInput("existingProblem", t)
                        }
                      />
                    </div>
                    <textarea
                      name="existingProblem"
                      value={formData.existingProblem}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="What is the current business problem?"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Pain Points
                      </label>
                      <VoiceInput
                        onTranscript={(t) => handleVoiceInput("painPoints", t)}
                      />
                    </div>
                    <textarea
                      name="painPoints"
                      value={formData.painPoints}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="List the specific user pain points..."
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Expected Outcome / Goals
                      </label>
                      <VoiceInput
                        onTranscript={(t) =>
                          handleVoiceInput("expectedOutcome", t)
                        }
                      />
                    </div>
                    <textarea
                      name="expectedOutcome"
                      value={formData.expectedOutcome}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="What are the success criteria and expectations?"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Template PRD
                      </label>
                      <select
                        name="templateType"
                        value={formData.templateType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="Agile">Agile (Standard)</option>
                        <option value="Waterfall">
                          Waterfall (Traditional)
                        </option>
                        <option value="Lean">Lean Startup</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Constraints & Outcomes */}
            {currentStep === 4 && (
              <div className="p-4 sm:p-8">
                <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-indigo-500" />
                  Constraints & Outcomes
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Budget Constraints
                      </label>
                      <input
                        type="text"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Low Budget, $500/month limit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Team Size & Expertise
                      </label>
                      <input
                        type="text"
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Small team (3 devs), Fullstack"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Performance Requirements
                    </label>
                    <textarea
                      name="performanceReqs"
                      value={formData.performanceReqs}
                      onChange={handleInputChange}
                      rows={2}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Must support 10k concurrent users, 99.9% API uptime"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Scalability Goal
                      </label>
                      <input
                        type="text"
                        name="scalability"
                        value={formData.scalability}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. High scalability (Auto-scaling groups)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Latency Target
                      </label>
                      <input
                        type="text"
                        name="latency"
                        value={formData.latency}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Ultra low latency (<50ms)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Generate */}
            {currentStep === 5 && (
              <div className="p-4 sm:p-8 text-center">
                {generatedPRD ? (
                  <div className="text-left space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        PRD Generated Successfully
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setShowShareModal(true)}
                          className="bg-white border border-gray-300 px-3 sm:px-4 py-2 text-sm rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          title="Bagikan sebagai Template"
                        >
                          <Share className="h-4 w-4 text-gray-500" />
                          <span className="hidden sm:inline">Bagikan</span>
                        </button>
                        <button
                          onClick={() => setShowRawPrd(!showRawPrd)}
                          className={`bg-white border px-3 sm:px-4 py-2 text-sm rounded-md shadow-sm flex items-center gap-2 transition-colors ${showRawPrd ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                          title="Lihat Raw Markdown"
                        >
                          <FileCode className={`h-4 w-4 ${showRawPrd ? 'text-indigo-600' : 'text-gray-500'}`} />
                          <span className="hidden sm:inline">{showRawPrd ? "Sembunyikan Raw" : "Raw Markdown"}</span>
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className="bg-white border border-gray-300 px-3 sm:px-4 py-2 text-sm rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          title="Salin PRD"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="hidden sm:inline">{isCopied ? "Disalin!" : "Salin"}</span>
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([generatedPRD], {
                              type: "text/markdown",
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${formData.projectName ? formData.projectName.replace(/\s+/g, "-") : "PRD"}-Document.md`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="bg-white border border-gray-300 px-3 sm:px-4 py-2 text-sm rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <Download className="h-4 w-4 text-gray-500" />
                          <span className="hidden sm:inline">Markdown</span>
                        </button>
                        <button
                          onClick={exportToPdf}
                          className="bg-indigo-600 text-white px-3 sm:px-4 py-2 text-sm rounded-md shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                        >
                          <FileDown className="h-4 w-4" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>
                      </div>
                    </div>
                    {savingError && (
                      <div className="rounded-md bg-yellow-50 p-4 mb-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Note: Saving to Library failed
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                The PRD was generated but it could not be saved
                                to the database. Permissions may be missing.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Tab Navigation */}
                    <div className="flex flex-row border-b border-gray-200 mb-6 bg-gray-50/50 p-1.5 rounded-xl gap-2 shadow-inner overflow-x-auto scrollbar-none snap-x">
                      <button
                        type="button"
                        onClick={() => setActivePrdTab("prd")}
                        className={cn(
                          "flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 shrink-0 snap-start",
                          activePrdTab === "prd"
                            ? "bg-white text-indigo-600 shadow-sm border border-gray-200/60"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        Dokumen Utama
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePrdTab("security")}
                        className={cn(
                          "flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 shrink-0 snap-start",
                          activePrdTab === "security"
                            ? "bg-white text-indigo-600 shadow-sm border border-gray-200/60"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                        )}
                      >
                        <Shield className="h-4 w-4" />
                        Keamanan & Akses
                      </button>
                    </div>

                    {/* PRD DOCUMENT TAB */}
                    {activePrdTab === "prd" && (
                      <div
                        id="prd-export-content"
                        className="bg-white border border-gray-200 rounded-lg p-5 lg:p-10 text-gray-800 text-left w-full mx-auto max-w-full overflow-hidden"
                      >
                        {showRawPrd ? (
                          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner">
                            <div className="flex items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                              <span className="text-xs font-semibold text-slate-300">Raw Markdown Output</span>
                            </div>
                            <pre className="p-5 text-sm font-mono whitespace-pre-wrap text-slate-300 break-words overflow-x-auto h-full max-h-[70vh]">
                              {generatedPRD}
                            </pre>
                          </div>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                          components={{
                            pre: ({ node, ...props }: any) => {
                              const hasMermaid = node?.children?.some(
                                (child: any) =>
                                  child.tagName === "code" &&
                                  child.properties?.className?.includes(
                                    "language-mermaid",
                                  ),
                              );
                              if (hasMermaid) {
                                return <div className="w-full flex justify-center" {...props} />;
                              }
                              return (
                                <div className="my-6 rounded-xl overflow-hidden shadow-sm border border-gray-800 bg-[#1E1E1E]">
                                  <pre className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600" {...props} />
                                </div>
                              );
                            },
                            code(props: any) {
                              const { children, className, node, ...rest } = props;
                              const match = /language-(\w+)/.exec(className || "");

                              if (match && match[1] === "mermaid") {
                                return (
                                  <MermaidChart
                                    chart={String(children).replace(/\n$/, "")}
                                  />
                                );
                              }

                              // If it's a code block with language
                              if (match) {
                                return (
                                  <SyntaxHighlighter
                                    {...rest}
                                    PreTag="div"
                                    children={String(children).replace(/\n$/, "")}
                                    language={match[1]}
                                    style={vscDarkPlus}
                                    customStyle={{
                                      margin: 0,
                                      background: "transparent",
                                      padding: "1rem",
                                      fontSize: "0.875rem",
                                      lineHeight: "1.5",
                                    }}
                                    wrapLines={true}
                                    wrapLongLines={true}
                                  />
                                );
                              }

                              // If it's inside a pre tag without language
                              if (node?.position?.start?.line !== node?.position?.end?.line) {
                                return (
                                  <code className="block p-4 text-sm text-gray-100 font-mono w-full" {...rest}>
                                    {children}
                                  </code>
                                );
                              }

                              // Otherwise it's inline code
                              return (
                                <code
                                  className="bg-indigo-50/80 text-indigo-700 px-1.5 py-0.5 rounded text-[0.875em] font-mono border border-indigo-100/50 break-words"
                                  {...rest}
                                >
                                  {children}
                                </code>
                              );
                            },
                            h1: ({ node, ...props }: any) => (
                              <h1
                                className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-10 mb-6 text-gray-900 tracking-tight leading-tight"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }: any) => (
                              <h2
                                className="text-xl sm:text-2xl font-semibold mt-10 mb-4 text-gray-900 border-b border-gray-100 pb-2 leading-snug"
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }: any) => (
                              <h3
                                className="text-lg sm:text-xl font-semibold mt-8 mb-3 text-gray-800 leading-snug"
                                {...props}
                              />
                            ),
                            h4: ({ node, ...props }: any) => (
                              <h4
                                className="text-base sm:text-lg font-semibold mt-6 mb-2 text-gray-800"
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }: any) => (
                              <p
                                className="mb-5 text-gray-600 leading-relaxed max-w-none text-sm sm:text-base"
                                {...props}
                              />
                            ),
                            ul: ({ node, ...props }: any) => (
                              <ul
                                className="list-disc pl-5 sm:pl-6 mb-5 text-gray-600 space-y-2 marker:text-gray-400 text-sm sm:text-base"
                                {...props}
                              />
                            ),
                            ol: ({ node, ...props }: any) => (
                              <ol
                                className="list-decimal pl-5 sm:pl-6 mb-5 text-gray-600 space-y-2 marker:text-gray-500 text-sm sm:text-base font-medium"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }: any) => (
                              <li className="pl-1 sm:pl-2" {...props} />
                            ),
                            a: ({ node, ...props }: any) => (
                              <a
                                className="text-indigo-600 hover:text-indigo-500 font-medium underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-500 transition-colors break-words"
                                {...props}
                              />
                            ),
                            strong: ({ node, ...props }: any) => (
                              <strong
                                className="font-semibold text-gray-900"
                                {...props}
                              />
                            ),
                            blockquote: ({ node, ...props }: any) => (
                              <blockquote
                                className="border-l-4 border-indigo-500/30 pl-4 sm:pl-5 py-3 pr-4 italic text-gray-700 my-6 bg-indigo-50/30 rounded-r-xl"
                                {...props}
                              />
                            ),
                            table: ({ node, ...props }: any) => (
                              <div className="overflow-x-auto my-6 w-full rounded-xl border border-gray-200">
                                <table
                                  className="min-w-full divide-y divide-gray-200 text-sm sm:text-base"
                                  {...props}
                                />
                              </div>
                            ),
                            thead: ({ node, ...props }: any) => (
                              <thead className="bg-gray-50/80" {...props} />
                            ),
                            tbody: ({ node, ...props }: any) => (
                              <tbody
                                className="divide-y divide-gray-200 bg-white"
                                {...props}
                              />
                            ),
                            tr: ({ node, ...props }: any) => <tr className="hover:bg-gray-50/50 transition-colors" {...props} />,
                            th: ({ node, ...props }: any) => (
                              <th
                                className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap"
                                {...props}
                              />
                            ),
                            td: ({ node, ...props }: any) => (
                              <td
                                className="px-4 py-4 text-sm text-gray-600 whitespace-normal break-words"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {generatedPRD}
                        </ReactMarkdown>
                        )}
                      </div>
                    )}

                    {activePrdTab === "security" && (
                      <div className="space-y-6 text-left">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column: Matriks RBAC */}
                          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                              <Shield className="h-5 w-5 text-indigo-600" />
                              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                Matriks RBAC (Role-Based Access Control)
                              </h3>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Pemetaan hak akses pengguna berdasarkan peran operasional sistem.
                            </p>
                            
                            {getParsedSection("rbac") ? (
                              <div className="prose max-w-none text-xs sm:text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {getParsedSection("rbac")}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              /* Rich Fallback Visual RBAC Table */
                              <div className="overflow-x-auto rounded-lg border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-3 text-left font-semibold text-gray-900">Modul / Fitur</th>
                                      <th className="px-3 py-3 text-center font-semibold text-gray-900">Admin</th>
                                      <th className="px-3 py-3 text-center font-semibold text-gray-900">Operator</th>
                                      <th className="px-3 py-3 text-center font-semibold text-gray-900">User / Guest</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 bg-white">
                                    {[
                                      { name: "Manajemen Pengguna", admin: "Full (CRUD)", op: "Read Only", guest: "No Access" },
                                      { name: "Konfigurasi Sistem", admin: "Full (CRUD)", op: "No Access", guest: "No Access" },
                                      { name: "Dashboard Utama", admin: "Full (CRUD)", op: "Full (CRUD)", guest: "Read Only" },
                                      { name: "Laporan & Ekspor", admin: "Full (CRUD)", op: "Read & Update", guest: "No Access" },
                                      { name: "Integrasi API", admin: "Full (CRUD)", op: "No Access", guest: "No Access" },
                                    ].map((row, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="px-3 py-3 font-medium text-gray-900">{row.name}</td>
                                        <td className="px-3 py-3 text-center text-emerald-600 font-semibold">{row.admin}</td>
                                        <td className="px-3 py-3 text-center text-indigo-600 font-medium">{row.op}</td>
                                        <td className="px-3 py-3 text-center text-gray-400">{row.guest}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* Right Column: Protokol Autentikasi */}
                          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                              <Shield className="h-5 w-5 text-indigo-600" />
                              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                Protokol Autentikasi & Sesi
                              </h3>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Mekanisme login aman, otorisasi token, enkripsi sesi, dan proteksi kredensial.
                            </p>
                            
                            {getParsedSection("auth") ? (
                              <div className="prose max-w-none text-xs sm:text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {getParsedSection("auth")}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              /* Rich Fallback Visual Auth Cards */
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3.5 bg-indigo-50/40 rounded-lg border border-indigo-100/50">
                                  <h4 className="text-xs font-bold text-indigo-900 mb-1">Metode Utama</h4>
                                  <p className="text-[11px] text-indigo-700 leading-relaxed">
                                    JWT (JSON Web Token) dengan signature SHA-256 tersimpan di HttpOnly, Secure Cookie.
                                  </p>
                                </div>
                                <div className="p-3.5 bg-emerald-50/40 rounded-lg border border-emerald-100/50">
                                  <h4 className="text-xs font-bold text-emerald-900 mb-1">MFA & Keamanan</h4>
                                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                                    Multi-Factor Authentication menggunakan aplikasi TOTP (Google Authenticator) atau OAuth2.
                                  </p>
                                </div>
                                <div className="p-3.5 bg-amber-50/40 rounded-lg border border-amber-100/50">
                                  <h4 className="text-xs font-bold text-amber-900 mb-1">Masa Sesi</h4>
                                  <p className="text-[11px] text-amber-700 leading-relaxed">
                                    Token Akses berlaku selama 15 menit. Refresh Token berlaku selama 7 hari dengan rotasi otomatis.
                                  </p>
                                </div>
                                <div className="p-3.5 bg-rose-50/40 rounded-lg border border-rose-100/50">
                                  <h4 className="text-xs font-bold text-rose-900 mb-1">Kredensial</h4>
                                  <p className="text-[11px] text-rose-700 leading-relaxed">
                                    Password di-hash menggunakan algoritma Bcrypt dengan cost factor minimal 12 sebelum disimpan.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                                      </div>
                ) : (
                  <div className="py-12">
                    <Wand2
                      className={cn(
                        "mx-auto h-16 w-16 text-indigo-500 mb-6",
                        isGenerating && "animate-pulse",
                      )}
                    />
                    <h2 className="text-xl font-medium text-gray-900 mb-2">
                      Ready to generate Architect PRD
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Our AI will now analyze your inputs and synthesize a
                      complete Product Requirements Document, Software
                      Architecture, and ERD schemas.
                    </p>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isGenerating
                        ? "Synthesizing Document..."
                        : "Generate AI Blueprint"}
                    </button>
                    {generateError && (
                      <div className="mt-6 mx-auto max-w-md rounded-md bg-red-50 p-4 text-left">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              Generation Failed
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{generateError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {showShareModal && (
              <ShareTemplateModal
                onClose={() => setShowShareModal(false)}
                prd={{
                  projectName: formData.projectName,
                  projectDescription: formData.projectDescription,
                  content: generatedPRD || "",
                }}
              />
            )}

            {/* Footer Navigation */}
            {(!generatedPRD || currentStep !== 5) && (
              <div className="bg-gray-50 px-4 sm:px-8 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between rounded-b-xl gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentStep === 1 || isGenerating}
                  className="w-full sm:w-auto rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Kembali
                </button>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                  <button
                    type="button"
                    onClick={handleSaveManualDraft}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
                  >
                    <Save className="h-4 w-4 text-gray-500" />
                    Simpan Draft
                  </button>
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentStep((prev) => Math.min(5, prev + 1))
                      }
                      className="w-full sm:w-auto flex justify-center items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                    >
                      Selanjutnya
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
              <p className="font-bold text-xs sm:text-sm text-emerald-50">Draf Berhasil Disimpan!</p>
              <p className="text-[10px] text-emerald-100/80 mt-0.5">Seluruh progres pembuatan PRD Anda telah disimpan dengan aman di penyimpanan lokal.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
