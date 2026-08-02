import { Activity, Users, FileText, Blocks, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { useSettings } from "../contexts/SettingsContext";
import { useTranslation } from "../contexts/LanguageContext";
import {
  collection,
  onSnapshot,
  query,
  limit,
  orderBy,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const generateLast30DaysData = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push({
      dateStr: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      timestamp: date.getTime(),
      count: 0,
    });
  }
  return dates;
};

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  type: "prd" | "log";
}

export function Dashboard() {
  const [totalPRDs, setTotalPRDs] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { settings } = useSettings();
  const { t } = useTranslation();

  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const q = query(collection(db, "prds"));

    const unsubscribePRDs = onSnapshot(
      q,
      (snapshot) => {
        setTotalPRDs(snapshot.docs.length);

        const baseDates = generateLast30DaysData();
        const prdActivities: ActivityItem[] = [];

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            const ms = data.createdAt.seconds * 1000;
            const dateStr = new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const dayData = baseDates.find((d) => d.dateStr === dateStr);
            if (dayData) {
              dayData.count += 1;
            }
            prdActivities.push({
              id: doc.id,
              title: data.projectName || "New PRD Generated",
              description: `Generated a ${data.projectType || "project"} PRD`,
              timestamp: ms,
              type: "prd"
            });
          }
        });

        setChartData(baseDates);
        setActivities(prev => {
          const filtered = prev.filter(a => a.type !== "prd");
          return [...filtered, ...prdActivities].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
        });
      },
      (error) => {
        console.warn(
          "Firestore permissions error. Ensure your rules are deployed. Using fallback value of 0.",
          error,
        );
        setTotalPRDs(0);
        setChartData(generateLast30DaysData());
      },
    );

    const logsQ = query(collection(db, "logs"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribeLogs = onSnapshot(
      logsQ,
      (snapshot) => {
        const logActivities: ActivityItem[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            logActivities.push({
              id: doc.id,
              title: data.action || "System Action",
              description: data.details || "A system action occurred",
              timestamp: data.createdAt.seconds * 1000,
              type: "log"
            });
          }
        });

        setActivities(prev => {
          const filtered = prev.filter(a => a.type !== "log");
          return [...filtered, ...logActivities].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
        });
      },
      (error) => {
        console.warn("Error fetching logs for activity feed:", error);
      }
    );

    return () => {
      unsubscribePRDs();
      unsubscribeLogs();
    };
  }, []);

  return (
    <div className="w-full space-y-6 text-[#566a7f]">
      {/* Signature Welcome Hero Banner Card */}
      <div className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-3 z-10 max-w-xl text-left flex-1">
          <div className="inline-flex items-center gap-1.5 bg-[#e7e7ff] text-[#696cff] px-3 py-1 rounded-full text-xs font-bold">
            <span>{t("dashboard.welcomeTitle")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#384756] tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-xs sm:text-sm text-[#7a838b] leading-relaxed">
            {t("dashboard.subtitlePre")}{" "}
            <span className="font-bold text-[#696cff]">
              {t("dashboard.totalPRDsCount", { count: totalPRDs })}
            </span>{" "}
            {t("dashboard.subtitlePost")}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-start gap-3">
            <Link
              to="/generate"
              className="px-4 py-2.5 bg-[#696cff] hover:bg-[#5a5ddb] text-white text-xs font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all active:scale-98"
            >
              {t("dashboard.generateNewPRD")}
            </Link>
            <Link
              to="/templates"
              className="px-4 py-2.5 bg-[#e7e7ff] hover:bg-[#d0d0ff] text-[#696cff] text-xs font-bold rounded-lg transition-all"
            >
              {t("dashboard.browseTemplates")}
            </Link>
            <Link
              to="/web-extractor"
              className="px-4 py-2.5 bg-[#f5f5f9] hover:bg-[#e4e6e8] text-[#384756] text-xs font-bold rounded-lg border border-[#e4e6e8] transition-all"
            >
              🌐 Web Extractor Suite
            </Link>
          </div>
        </div>

        {/* Decorative graphic for the right side */}
        <div className="hidden md:flex items-center justify-center relative w-48 h-32 md:w-64 md:h-40 shrink-0">
          <div className="absolute inset-0 bg-[#e7e7ff] rounded-2xl transform rotate-3 opacity-50 transition-transform hover:rotate-6 duration-300"></div>
          <div className="absolute inset-0 bg-indigo-50 rounded-2xl transform -rotate-3 opacity-50 transition-transform hover:-rotate-6 duration-300"></div>
          <div className="relative bg-white p-5 rounded-xl shadow-sm border border-[#e7e7ff] w-full h-full flex flex-col justify-center items-center gap-3">
            <div className="w-12 h-12 bg-[#e7e7ff] rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#696cff]" />
            </div>
            <div className="w-full space-y-2 px-2">
              <div className="h-2 w-3/4 bg-gray-100 rounded-full mx-auto"></div>
              <div className="h-2 w-1/2 bg-gray-100 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Sneat Styled */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            name: t("dashboard.statTotalPRDs"),
            value: totalPRDs.toString(),
            icon: FileText,
            change: t("dashboard.statPrdChange"),
            iconBg: "bg-[#e7e7ff]",
            iconColor: "text-[#696cff]",
            badgeBg: "bg-[#e8f5e9]",
            badgeColor: "text-[#71dd37]",
          },
          {
            name: t("dashboard.statActiveUsers"),
            value: "1 User",
            icon: Users,
            change: t("dashboard.statUserRole"),
            iconBg: "bg-[#e8f5e9]",
            iconColor: "text-[#71dd37]",
            badgeBg: "bg-[#e7e7ff]",
            badgeColor: "text-[#696cff]",
          },
          {
            name: t("dashboard.statAiToken"),
            value: `${totalPRDs * 1200} tokens`,
            icon: Activity,
            change: t("dashboard.statAiModel"),
            iconBg: "bg-[#ffe0d6]",
            iconColor: "text-[#ff3e1d]",
            badgeBg: "bg-[#ffebe8]",
            badgeColor: "text-[#ff3e1d]",
          },
          {
            name: t("dashboard.statReadyTemplates"),
            value: "8 Templates",
            icon: Blocks,
            change: t("dashboard.statStandardIndustry"),
            iconBg: "bg-[#fff3e0]",
            iconColor: "text-[#ffab00]",
            badgeBg: "bg-[#fff3e0]",
            badgeColor: "text-[#ffab00]",
          },
        ].map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl bg-white p-5 border border-[#e4e6e8] shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex flex-col justify-between hover:shadow-[0_4px_12px_0_rgba(67,89,113,0.16)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${stat.badgeBg} ${stat.badgeColor}`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-[#7a838b] uppercase tracking-wider">
                {stat.name}
              </p>
              <h3 className="text-2xl font-extrabold text-[#384756] mt-1">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area - Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-[#e4e6e8] bg-white p-6 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#384756]">
                {t("dashboard.chartTitle")}
              </h3>
              <p className="text-xs text-[#7a838b]">{t("dashboard.chartSubtitle")}</p>
            </div>
            <span className="text-xs font-bold text-[#696cff] bg-[#e7e7ff] px-3 py-1 rounded-full">
              {t("dashboard.chartRealtime")}
            </span>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#696cff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#696cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e6e8"
                />
                <XAxis
                  dataKey="dateStr"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#7a838b", fontWeight: 600 }}
                  minTickGap={20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#7a838b", fontWeight: 600 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e4e6e8",
                    boxShadow: "0 4px 12px rgba(67,89,113,0.15)",
                    backgroundColor: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#384756"
                  }}
                  cursor={{
                    stroke: "#696cff",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#696cff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  activeDot={{
                    r: 6,
                    fill: "#696cff",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Widget */}
        <div className="col-span-1 rounded-xl border border-[#e4e6e8] bg-white shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex flex-col overflow-hidden max-h-[420px]">
          <div className="p-5 border-b border-[#e4e6e8] flex items-center justify-between bg-[#f5f5f9]/60">
            <h3 className="text-sm font-bold text-[#384756] tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#696cff]" />
              {t("dashboard.recentActivityTitle")}
            </h3>
            <span className="text-[10px] font-extrabold text-[#71dd37] bg-[#e8f5e9] px-2 py-0.5 rounded-full">
              {t("dashboard.liveFeed")}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
            {activities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#a1acb8] py-8">
                <Activity className="h-8 w-8 text-[#a1acb8] mb-2" />
                <p className="text-xs font-semibold">{t("dashboard.noActivityYet")}</p>
              </div>
            ) : (
              <div className="space-y-5">
                {activities.map((activity, index) => (
                  <div key={`${activity.id}-${index}`} className="relative pl-4">
                    {/* Timeline line */}
                    {index !== activities.length - 1 && (
                      <span
                        className="absolute left-[7px] top-5 -ml-px h-full w-0.5 bg-[#e4e6e8]"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <span className={`h-4 w-4 rounded-full flex items-center justify-center ring-4 ring-white ${activity.type === 'prd' ? 'bg-[#696cff]' : 'bg-[#71dd37]'}`}>
                           {activity.type === 'prd' ? (
                             <FileText className="h-2 w-2 text-white" />
                           ) : (
                             <Activity className="h-2 w-2 text-white" />
                           )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 -mt-1">
                        <div>
                          <div className="text-xs">
                            <span className="font-bold text-[#384756]">
                              {activity.title}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#7a838b] truncate">
                            {activity.description}
                          </p>
                        </div>
                        <div className="mt-1 text-[10px] text-[#a1acb8] font-medium">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Start New Project Quick Action Container */}
      <div className="rounded-xl border border-[#e4e6e8] bg-white p-6 sm:p-8 shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e7e7ff] text-[#696cff] flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#384756]">
              {t("dashboard.startWizardTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-[#7a838b] max-w-xl leading-relaxed">
              {t("dashboard.startWizardDesc")}
            </p>
          </div>
        </div>
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 rounded-lg bg-[#696cff] hover:bg-[#5a5ddb] px-5 py-2.5 text-xs font-bold text-white shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all active:scale-98 shrink-0 w-full sm:w-auto justify-center"
        >
          <span>{t("dashboard.openWizardBtn")}</span>
        </Link>
      </div>
    </div>
  );
}
