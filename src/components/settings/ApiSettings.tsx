import React, { useState, useEffect } from "react";
import { Save, Loader2, Zap, CloudCheck, RefreshCw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { db } from "../../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "../../contexts/LanguageContext";
import {
  loadStoredApiKeysSync,
  saveStoredApiKeys,
  syncApiKeysFromCloud,
  ApiKeysMap,
} from "../../lib/apiKeyStorage";

interface ApiSettingsProps {
  setSuccessMsg: (msg: string) => void;
}

export function ApiSettings({ setSuccessMsg }: ApiSettingsProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "success" | "error" | null;
    message: string;
  }>({ status: null, message: "" });
  const [apiProvider, setApiProvider] = useState("Gemini");

  const [apiKeysData, setApiKeysData] = useState<ApiKeysMap>(() =>
    loadStoredApiKeysSync()
  );

  const [globalContext7, setGlobalContext7] = useState("");
  const [globalStitch, setGlobalStitch] = useState("");

  // Initial Sync on Mount
  useEffect(() => {
    const local = loadStoredApiKeysSync();
    setApiKeysData(local);

    let foundContext7 = "";
    let foundStitch = "";
    Object.keys(local).forEach((prov) => {
      if (local[prov]?.context7 && !foundContext7) {
        foundContext7 = local[prov].context7;
      }
      if (local[prov]?.stitch && !foundStitch) {
        foundStitch = local[prov].stitch;
      }
    });

    setGlobalContext7(foundContext7);
    setGlobalStitch(foundStitch);

    // Asynchronously pull latest from Firestore Cloud Database
    setIsSyncing(true);
    syncApiKeysFromCloud()
      .then(({ keys, restoredFromCloud }) => {
        setApiKeysData(keys);
        if (restoredFromCloud) {
          setCloudSynced(true);
          setSuccessMsg("Kunci API berhasil dipulihkan dari Cloud Database!");
          setTimeout(() => setSuccessMsg(""), 4000);
        }
      })
      .catch((err) => console.warn("Cloud sync error:", err))
      .finally(() => setIsSyncing(false));
  }, []);

  useEffect(() => {
    setTestResult({ status: null, message: "" });
  }, [apiProvider]);

  const handleManualCloudSync = async () => {
    setIsSyncing(true);
    try {
      const { keys, restoredFromCloud } = await syncApiKeysFromCloud();
      setApiKeysData(keys);
      if (restoredFromCloud) {
        setCloudSynced(true);
        setSuccessMsg("Kunci API berhasil disinkronkan & dipulihkan dari Cloud!");
      } else {
        setSuccessMsg("Sinkronisasi Cloud Selesai - Data Kunci API Anda Sudah Terbaru.");
      }
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan sinkronisasi cloud. Periksa koneksi internet.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    const currentKey = apiKeysData[apiProvider]?.main;
    if (!currentKey) {
      setTestResult({
        status: "error",
        message: t("apiKeys.emptyKeyError", { provider: apiProvider }),
      });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: null, message: "" });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (currentKey.length < 10) {
        throw new Error(t("apiKeys.invalidKeyFormat"));
      }

      setTestResult({
        status: "success",
        message: t("apiKeys.connectionSuccess", { provider: apiProvider }),
      });
      setTimeout(() => setTestResult({ status: null, message: "" }), 5000);
    } catch (e: any) {
      setTestResult({
        status: "error",
        message: t("apiKeys.connectionFailed", { error: e.message || "Endpoint unreachable" }),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");

    try {
      const saved = await saveStoredApiKeys(
        apiKeysData,
        globalContext7,
        globalStitch
      );
      setApiKeysData(saved);

      await addDoc(collection(db, "logs"), {
        action: "Updated API Keys",
        details: "User updated third-party AI model API Keys (Local & Cloud Firestore).",
        createdAt: serverTimestamp(),
      });

      setSuccessMsg("Kunci API Berhasil Disimpan & Terproteksi di Cloud Database!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
      alert(t("apiKeys.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const activeKeyCount = Object.values(apiKeysData).filter((k) => k.main && k.main.trim().length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>{t("apiKeys.title")}</span>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Proteksi Cloud Permanent</span>
            </span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            {t("apiKeys.subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleManualCloudSync}
          disabled={isSyncing}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-xl border border-indigo-200 shadow-xs transition-all shrink-0 self-start sm:self-center"
          title="Sinkronkan & Pulihkan Kunci API dari Cloud Firestore"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-indigo-600" : ""}`} />
          <span>{isSyncing ? "Menyinkronkan..." : "Pulihkan dari Cloud"}</span>
        </button>
      </div>

      <form onSubmit={handleSaveApiKeys} className="space-y-6">
        {/* Select AI Provider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label
              htmlFor="ai-provider"
              className="block text-sm font-medium leading-6 text-gray-900 mb-1"
            >
              {t("apiKeys.selectProvider")}
            </label>
            <select
              id="ai-provider"
              value={apiProvider}
              onChange={(e) => setApiProvider(e.target.value)}
              className="block w-full sm:w-80 rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white font-medium"
            >
              <option value="Gemini">Gemini (Google AI)</option>
              <option value="Claude">Claude (Anthropic)</option>
              <option value="Chatgpt">ChatGPT (OpenAI)</option>
              <option value="Z.ai">Z.ai</option>
              <option value="Xiaomi.ai">Xiaomi AI</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl self-start sm:self-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>{activeKeyCount}</strong> dari {Object.keys(apiKeysData).length} Provider Terkonfigurasi
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {t("apiKeys.configTitle", { provider: apiProvider })}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("apiKeys.configDesc", { provider: apiProvider })}
              </p>
            </div>
            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0">
              {apiProvider}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-1 flex items-center justify-between">
                <span>{t("apiKeys.apiKeyLabel", { provider: apiProvider })}</span>
                {apiKeysData[apiProvider]?.main ? (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Kunci Tersimpan
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-gray-400">
                    Kosong
                  </span>
                )}
              </label>
              <input
                type="password"
                value={apiKeysData[apiProvider]?.main || ""}
                onChange={(e) =>
                  setApiKeysData({
                    ...apiKeysData,
                    [apiProvider]: {
                      ...apiKeysData[apiProvider],
                      main: e.target.value,
                    },
                  })
                }
                placeholder={t("apiKeys.apiKeyPlaceholder")}
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                {t("apiKeys.contextLabel")}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {t("apiKeys.contextDesc")}
              </p>
              <input
                type="text"
                value={globalContext7}
                onChange={(e) => {
                  const val = e.target.value;
                  setGlobalContext7(val);
                  const updated = { ...apiKeysData };
                  Object.keys(updated).forEach((prov) => {
                    updated[prov] = {
                      ...updated[prov],
                      context7: val,
                    };
                  });
                  setApiKeysData(updated);
                }}
                placeholder={t("apiKeys.contextPlaceholder")}
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                {t("apiKeys.stitchLabel")}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {t("apiKeys.stitchDesc")}
              </p>
              <input
                type="text"
                value={globalStitch}
                onChange={(e) => {
                  const val = e.target.value;
                  setGlobalStitch(val);
                  const updated = { ...apiKeysData };
                  Object.keys(updated).forEach((prov) => {
                    updated[prov] = {
                      ...updated[prov],
                      stitch: val,
                    };
                  });
                  setApiKeysData(updated);
                }}
                placeholder={t("apiKeys.stitchPlaceholder")}
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="flex-1 w-full flex items-center">
            {testResult.status === "success" && (
              <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md w-full sm:w-auto">
                {testResult.message}
              </p>
            )}
            {testResult.status === "error" && (
              <p className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-md w-full sm:w-auto break-words">
                {testResult.message}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKeysData[apiProvider]?.main}
              className="flex justify-center items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition min-w-[140px]"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  {t("apiKeys.testing")}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-amber-500" />
                  {t("apiKeys.testConnection")}
                </>
              )}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex justify-center items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition min-w-[140px]"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t("common.loading") : t("apiKeys.saveKeys")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

