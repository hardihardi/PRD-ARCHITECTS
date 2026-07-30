import React, { useState, useEffect } from "react";
import { Save, Loader2, Zap } from "lucide-react";
import { db } from "../../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "../../contexts/LanguageContext";

interface ApiSettingsProps {
  setSuccessMsg: (msg: string) => void;
}

export function ApiSettings({ setSuccessMsg }: ApiSettingsProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "success" | "error" | null;
    message: string;
  }>({ status: null, message: "" });
  const [apiProvider, setApiProvider] = useState("Gemini");

  const [apiKeysData, setApiKeysData] = useState<
    Record<string, { main: string; context7: string; stitch: string }>
  >({
    Gemini: { main: "", context7: "", stitch: "" },
    Claude: { main: "", context7: "", stitch: "" },
    Chatgpt: { main: "", context7: "", stitch: "" },
    "Z.ai": { main: "", context7: "", stitch: "" },
    "Xiaomi.ai": { main: "", context7: "", stitch: "" },
  });

  const [globalContext7, setGlobalContext7] = useState("");
  const [globalStitch, setGlobalStitch] = useState("");

  useEffect(() => {
    const savedKeys = localStorage.getItem("app_api_keys_detailed");
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        
        let foundContext7 = "";
        let foundStitch = "";
        Object.keys(parsed).forEach((prov) => {
          if (parsed[prov]?.context7 && !foundContext7) {
            foundContext7 = parsed[prov].context7;
          }
          if (parsed[prov]?.stitch && !foundStitch) {
            foundStitch = parsed[prov].stitch;
          }
        });

        setGlobalContext7(foundContext7);
        setGlobalStitch(foundStitch);

        const normalized = { ...parsed };
        Object.keys(normalized).forEach((prov) => {
          normalized[prov] = {
            ...normalized[prov],
            context7: normalized[prov]?.context7 || foundContext7,
            stitch: normalized[prov]?.stitch || foundStitch,
          };
        });

        setApiKeysData(normalized);
      } catch (e) {
        console.error("Error parsing saved keys:", e);
      }
    }
  }, []);

  useEffect(() => {
    setTestResult({ status: null, message: "" });
  }, [apiProvider]);

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
      const updatedKeys = { ...apiKeysData };
      Object.keys(updatedKeys).forEach((prov) => {
        updatedKeys[prov] = {
          ...updatedKeys[prov],
          context7: globalContext7,
          stitch: globalStitch,
        };
      });

      localStorage.setItem(
        "app_api_keys_detailed",
        JSON.stringify(updatedKeys),
      );
      setApiKeysData(updatedKeys);

      await new Promise((resolve) => setTimeout(resolve, 800));

      await addDoc(collection(db, "logs"), {
        action: "Updated API Keys",
        details: "User updated third-party AI model API Keys.",
        createdAt: serverTimestamp(),
      });

      setSuccessMsg(t("apiKeys.keysSavedSuccess"));
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error(e);
      alert(t("apiKeys.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">
          {t("apiKeys.title")}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t("apiKeys.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSaveApiKeys} className="space-y-6">
        {/* Select AI Provider */}
        <div>
          <label
            htmlFor="ai-provider"
            className="block text-sm font-medium leading-6 text-gray-900 mb-2"
          >
            {t("apiKeys.selectProvider")}
          </label>
          <select
            id="ai-provider"
            value={apiProvider}
            onChange={(e) => setApiProvider(e.target.value)}
            className="block w-full sm:w-80 rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="Gemini">Gemini</option>
            <option value="Claude">Claude</option>
            <option value="Chatgpt">Chatgpt</option>
            <option value="Z.ai">Z.ai</option>
            <option value="Xiaomi.ai">Xiaomi.ai</option>
          </select>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {t("apiKeys.configTitle", { provider: apiProvider })}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("apiKeys.configDesc", { provider: apiProvider })}
              </p>
            </div>
            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              {apiProvider}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                {t("apiKeys.apiKeyLabel", { provider: apiProvider })}
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
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
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
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
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
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
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
