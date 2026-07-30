import React, { useState, useEffect } from "react";
import { KeyRound, Sparkles, Loader2, Save } from "lucide-react";
import { db } from "../../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "../../contexts/LanguageContext";

interface ApiKeyInlineInputProps {
  modelName: string;
}

export function ApiKeyInlineInput({ modelName }: ApiKeyInlineInputProps) {
  const { t } = useTranslation();
  const [provider, setProvider] = useState("Gemini");
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let newProvider = "Gemini";
    if (modelName.includes("claude")) newProvider = "Claude";
    if (modelName.includes("gpt")) newProvider = "Chatgpt";
    if (modelName.includes("z-ai")) newProvider = "Z.ai";
    if (modelName.includes("xiaomi")) newProvider = "Xiaomi.ai";
    setProvider(newProvider);

    try {
      const savedKeys = localStorage.getItem("app_api_keys_detailed");
      if (savedKeys) {
        const parsed = JSON.parse(savedKeys);
        const key = parsed?.[newProvider]?.main || "";
        setApiKey(key);
        setIsSaved(!!key);
      } else {
        setApiKey("");
        setIsSaved(false);
      }
    } catch (e) {
      console.warn("Failed to read API keys", e);
    }
  }, [modelName]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savedKeys = localStorage.getItem("app_api_keys_detailed");
      let parsed = {
        Gemini: { main: "", context7: "", stitch: "" },
        Claude: { main: "", context7: "", stitch: "" },
        Chatgpt: { main: "", context7: "", stitch: "" },
        "Z.ai": { main: "", context7: "", stitch: "" },
        "Xiaomi.ai": { main: "", context7: "", stitch: "" },
      };
      if (savedKeys) {
        parsed = JSON.parse(savedKeys);
      }

      parsed[provider] = {
        ...(parsed[provider] || { context7: "", stitch: "" }),
        main: apiKey,
      };

      localStorage.setItem("app_api_keys_detailed", JSON.stringify(parsed));
      setIsSaved(true);

      // Save log
      await addDoc(collection(db, "logs"), {
        action: "Updated API Key Inline",
        details: `User updated ${provider} API Key inline from generation module.`,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex flex-col space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-indigo-500" />
        <span className="text-sm font-semibold text-indigo-900">
          {t("apiKeys.inlineTitle", { provider })}
        </span>
      </div>
      <p className="text-xs text-indigo-700/80 leading-relaxed max-w-2xl">
        {t("apiKeys.inlineDesc", { provider })}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setIsSaved(false);
          }}
          placeholder={t("apiKeys.inlinePlaceholder", { provider })}
          className="flex-1 rounded-lg border border-indigo-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isSaved || !apiKey.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSaved ? (
            <Sparkles className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaved ? t("apiKeys.saved") : t("apiKeys.saveKey")}
        </button>
      </div>
    </div>
  );
}
