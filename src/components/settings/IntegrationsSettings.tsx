import React, { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useTranslation } from "../../contexts/LanguageContext";
import {
  CheckCircle2,
  Link2,
  ExternalLink,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

export function IntegrationsSettings({
  setSuccessMsg,
}: {
  setSuccessMsg: (msg: string) => void;
}) {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<Record<string, any>>({
    github: { connected: false, token: "", repo: "" },
    slack: { connected: false, webhook: "" },
    jira: { connected: false, url: "", email: "", token: "" },
    trello: { connected: false, apiKey: "", token: "", boardId: "" },
    asana: { connected: false, token: "", workspace: "" },
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app_integrations");
    if (saved) {
      try {
        setIntegrations(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSave = async (key: string, data: any) => {
    setIsSaving(true);
    try {
      const updated = {
        ...integrations,
        [key]: { ...data, connected: true },
      };
      setIntegrations(updated);
      localStorage.setItem("app_integrations", JSON.stringify(updated));

      await addDoc(collection(db, "logs"), {
        action: `Connected Integration: ${key}`,
        details: `User successfully connected to ${key.toUpperCase()}.`,
        createdAt: serverTimestamp(),
      });

      setSuccessMsg(t("integrations.connectedSuccess", { name: key.toUpperCase() }));
      setTimeout(() => setSuccessMsg(""), 3000);
      setActiveModal(null);
    } catch (e) {
      console.error(e);
      alert(t("settings.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async (key: string) => {
    if (
      !confirm(
        t("integrations.disconnectConfirm", { name: key.toUpperCase() })
      )
    )
      return;

    setIsSaving(true);
    try {
      const updated = {
        ...integrations,
        [key]: { connected: false },
      };
      if (key === "github")
        updated[key] = { connected: false, token: "", repo: "" };
      if (key === "slack") updated[key] = { connected: false, webhook: "" };
      if (key === "jira")
        updated[key] = { connected: false, url: "", email: "", token: "" };
      if (key === "trello")
        updated[key] = { connected: false, apiKey: "", token: "", boardId: "" };
      if (key === "asana")
        updated[key] = { connected: false, token: "", workspace: "" };

      setIntegrations(updated);
      localStorage.setItem("app_integrations", JSON.stringify(updated));

      await addDoc(collection(db, "logs"), {
        action: `Disconnected Integration: ${key}`,
        details: `User disconnected ${key.toUpperCase()}.`,
        createdAt: serverTimestamp(),
      });

      setSuccessMsg(t("integrations.disconnectedSuccess", { name: key.toUpperCase() }));
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const IntegrationCard = ({
    id,
    name,
    description,
    iconColor,
    shortName,
    data,
  }: any) => {
    return (
      <div
        className={`border rounded-xl p-5 transition bg-white flex flex-col ${data.connected ? "border-green-200 shadow-sm" : "border-gray-200 hover:border-indigo-300"}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div
            className={`h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm`}
            style={{ backgroundColor: iconColor }}
          >
            {shortName}
          </div>
          {data.connected ? (
            <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {t("integrations.connected")}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-500/10">
              {t("integrations.notConnected")}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500 mt-1 mb-5 flex-1 line-clamp-2">
          {description}
        </p>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          {data.connected ? (
            <>
              <button
                onClick={() => setActiveModal(id)}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> {t("integrations.editConfig")}
              </button>
              <button
                onClick={() => handleDisconnect(id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                title={t("integrations.disconnect")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveModal(id)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition flex items-center w-full justify-center bg-indigo-50 py-2 rounded-lg hover:bg-indigo-100"
            >
              <Link2 className="w-4 h-4 mr-2" /> {t("integrations.connect")}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t("integrations.title")}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t("integrations.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
        <IntegrationCard
          id="github"
          name="GitHub"
          shortName="GH"
          iconColor="#181717"
          description={t("integrations.githubDesc")}
          data={integrations.github}
        />
        <IntegrationCard
          id="slack"
          name="Slack"
          shortName="SL"
          iconColor="#E01E5A"
          description={t("integrations.slackDesc")}
          data={integrations.slack}
        />
        <IntegrationCard
          id="jira"
          name="Jira Software"
          shortName="JR"
          iconColor="#0052CC"
          description={t("integrations.jiraDesc")}
          data={integrations.jira}
        />
        <IntegrationCard
          id="trello"
          name="Trello"
          shortName="TR"
          iconColor="#0079BF"
          description={t("integrations.trelloDesc")}
          data={integrations.trello}
        />
        <IntegrationCard
          id="asana"
          name="Asana"
          shortName="AS"
          iconColor="#F06A6A"
          description={t("integrations.asanaDesc")}
          data={integrations.asana}
        />
      </div>

      {activeModal === "github" && (
        <ModalWrapper
          title={t("integrations.configGithub")}
          onClose={() => setActiveModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave("github", {
                token: formData.get("token"),
                repo: formData.get("repo"),
              });
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Access Token
                </label>
                <input
                  required
                  type="password"
                  name="token"
                  defaultValue={integrations.github.token}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="ghp_xxx..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("integrations.githubTokenHint")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Repository Path
                </label>
                <input
                  required
                  type="text"
                  name="repo"
                  defaultValue={integrations.github.repo}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="username/repository-name"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t("integrations.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#181717] rounded-md hover:bg-black disabled:opacity-50 flex items-center"
              >
                {isSaving ? t("integrations.saving") : t("integrations.saveConnect")}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {activeModal === "slack" && (
        <ModalWrapper
          title={t("integrations.configSlack")}
          onClose={() => setActiveModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave("slack", { webhook: formData.get("webhook") });
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incoming Webhook URL
                </label>
                <input
                  required
                  type="text"
                  name="webhook"
                  defaultValue={integrations.slack.webhook}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="https://hooks.slack.com/services/T000.../B000.../..."
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  {t("integrations.slackWebhookHint")}{" "}
                  <ExternalLink className="w-3 h-3" />
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t("integrations.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#E01E5A] rounded-md hover:bg-[#C0104A] disabled:opacity-50 flex items-center"
              >
                {isSaving ? t("integrations.saving") : t("integrations.saveConnect")}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {activeModal === "jira" && (
        <ModalWrapper
          title={t("integrations.configJira")}
          onClose={() => setActiveModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave("jira", {
                url: formData.get("url"),
                email: formData.get("email"),
                token: formData.get("token"),
              });
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jira Site URL
                </label>
                <input
                  required
                  type="url"
                  name="url"
                  defaultValue={integrations.jira.url}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="https://your-domain.atlassian.net"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atlassian Account Email
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  defaultValue={integrations.jira.email}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="email@perusahaan.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Token
                </label>
                <input
                  required
                  type="password"
                  name="token"
                  defaultValue={integrations.jira.token}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Atlassian API Token"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t("integrations.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0052CC] rounded-md hover:bg-[#0047b3] disabled:opacity-50 flex items-center"
              >
                {isSaving ? t("integrations.saving") : t("integrations.saveConnect")}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {activeModal === "trello" && (
        <ModalWrapper
          title={t("integrations.configTrello")}
          onClose={() => setActiveModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave("trello", {
                apiKey: formData.get("apiKey"),
                token: formData.get("token"),
                boardId: formData.get("boardId"),
              });
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  required
                  type="text"
                  name="apiKey"
                  defaultValue={integrations.trello.apiKey}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Trello API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Token
                </label>
                <input
                  required
                  type="password"
                  name="token"
                  defaultValue={integrations.trello.token}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Trello API Token"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Board ID
                </label>
                <input
                  required
                  type="text"
                  name="boardId"
                  defaultValue={integrations.trello.boardId}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Board ID"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t("integrations.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0079BF] rounded-md hover:bg-[#006aa8] disabled:opacity-50 flex items-center"
              >
                {isSaving ? t("integrations.saving") : t("integrations.saveConnect")}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {activeModal === "asana" && (
        <ModalWrapper
          title={t("integrations.configAsana")}
          onClose={() => setActiveModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave("asana", {
                token: formData.get("token"),
                workspace: formData.get("workspace"),
              });
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Access Token (PAT)
                </label>
                <input
                  required
                  type="password"
                  name="token"
                  defaultValue={integrations.asana?.token || ""}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="0/xxxxxxxxx..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("integrations.asanaTokenHint")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("integrations.optionalWorkspace")}
                </label>
                <input
                  type="text"
                  name="workspace"
                  defaultValue={integrations.asana?.workspace || ""}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Workspace ID"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t("integrations.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#F06A6A] rounded-md hover:bg-[#E05A5A] disabled:opacity-50 flex items-center"
              >
                {isSaving ? t("integrations.saving") : t("integrations.saveConnect")}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}
    </div>
  );
}

function ModalWrapper({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition rounded-md hover:bg-gray-100 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
