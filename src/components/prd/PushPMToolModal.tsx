import React, { useState, useEffect } from "react";
import { 
  X, 
  Layers, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  User, 
  Calendar, 
  Tag, 
  Plus, 
  Trash, 
  Inbox, 
  Briefcase,
  Settings 
} from "lucide-react";

interface UserStory {
  id: string;
  summary: string;
  description: string;
}

interface PushPMToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  prdTitle: string;
  prdContent: string;
}

export default function PushPMToolModal({
  isOpen,
  onClose,
  prdTitle,
  prdContent,
}: PushPMToolModalProps) {
  const [activeTab, setActiveTab] = useState<"jira" | "asana">("jira");
  const [integrations, setIntegrations] = useState<any>(null);

  // Connection info
  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");

  const [asanaToken, setAsanaToken] = useState("");

  // Fetched data
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  
  // Selection states
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [issueType, setIssueType] = useState("Story");
  const [labels, setLabels] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Stories to push
  const [stories, setStories] = useState<UserStory[]>([]);
  const [selectedStories, setSelectedStories] = useState<Record<string, boolean>>({});

  // Loading/Status
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResults, setPushResults] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Load credentials from localStorage
    try {
      const saved = localStorage.getItem("app_integrations");
      if (saved) {
        const parsed = JSON.parse(saved);
        setIntegrations(parsed);
        if (parsed.jira) {
          setJiraUrl(parsed.jira.url || "");
          setJiraEmail(parsed.jira.email || "");
          setJiraToken(parsed.jira.token || "");
        }
        if (parsed.asana) {
          setAsanaToken(parsed.asana.token || "");
          if (parsed.asana.workspace) {
            setSelectedWorkspace(parsed.asana.workspace);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse integrations from localStorage", e);
    }
  }, []);

  // Parse stories from PRD content when open
  useEffect(() => {
    if (prdContent) {
      const foundStories: UserStory[] = [];
      // Split content into lines and find anything matching "Sebagai...", "As a...", "US-", or bullet stories
      const lines = prdContent.split("\n");
      let count = 1;

      lines.forEach((line) => {
        const trimmed = line.trim();
        const lower = trimmed.toLowerCase();
        
        // Match indonesian pattern "sebagai... saya ingin... sehingga..." or bullet stories
        if (
          lower.includes("sebagai") && 
          (lower.includes("saya ingin") || lower.includes("ingin")) && 
          (lower.includes("sehingga") || lower.includes("agar"))
        ) {
          // Clean bullet points
          const cleaned = trimmed.replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, "");
          foundStories.push({
            id: `story-${count++}`,
            summary: cleaned.length > 80 ? cleaned.substring(0, 80) + "..." : cleaned,
            description: cleaned,
          });
        }
      });

      // Default fallback story if none found
      if (foundStories.length === 0) {
        foundStories.push({
          id: "story-default",
          summary: `Implementasikan MVP dari ${prdTitle}`,
          description: `Harap kembangkan dan implementasikan fitur utama berdasarkan spesifikasi PRD "${prdTitle}".`,
        });
      }

      setStories(foundStories);
      
      // Select all by default
      const defaultSelected: Record<string, boolean> = {};
      foundStories.forEach(s => {
        defaultSelected[s.id] = true;
      });
      setSelectedStories(defaultSelected);
    }
  }, [prdContent, prdTitle, isOpen]);

  // Handle Tab Switch
  const handleTabSwitch = (tab: "jira" | "asana") => {
    setActiveTab(tab);
    setProjects([]);
    setUsers([]);
    setSelectedProject("");
    setSelectedAssignee("");
    setErrorMsg("");
    setStatusMsg("");
    setPushResults([]);
  };

  // Fetch Jira Projects
  const fetchJiraProjects = async () => {
    if (!jiraUrl || !jiraEmail || !jiraToken) {
      setErrorMsg("Harap lengkapi kredensial koneksi Jira terlebih dahulu.");
      return;
    }
    setErrorMsg("");
    setLoadingProjects(true);
    try {
      const res = await fetch("/api/v1/integrations/jira/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jiraUrl, email: jiraEmail, token: jiraToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
        if (data.isDemo) {
          setStatusMsg("Terhubung dalam mode DEMO Sandbox (Gunakan kredensial asli untuk menghubungkan server nyata).");
        }
      } else {
        setErrorMsg(data.error || "Gagal mengambil proyek dari Jira.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Gagal menghubungkan ke server.");
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch Jira Users when project changes
  useEffect(() => {
    if (activeTab === "jira" && selectedProject && jiraUrl) {
      const fetchJiraUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await fetch("/api/v1/integrations/jira/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: jiraUrl, email: jiraEmail, token: jiraToken, projectKey: selectedProject }),
          });
          const data = await res.json();
          if (res.ok) {
            setUsers(data.users || []);
          }
        } catch (e) {
          console.error("Gagal memuat pengguna Jira", e);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchJiraUsers();
    }
  }, [selectedProject, activeTab, jiraUrl]);

  // Fetch Asana Workspaces
  const fetchAsanaWorkspaces = async () => {
    if (!asanaToken) {
      setErrorMsg("Harap masukkan Personal Access Token Asana terlebih dahulu.");
      return;
    }
    setErrorMsg("");
    setLoadingWorkspaces(true);
    try {
      const res = await fetch("/api/v1/integrations/asana/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: asanaToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setWorkspaces(data.workspaces || []);
        if (data.isDemo) {
          setStatusMsg("Terhubung dalam mode DEMO Sandbox Asana.");
        }
        if (data.workspaces?.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(data.workspaces[0].gid);
        }
      } else {
        setErrorMsg(data.error || "Gagal memuat ruang kerja Asana.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Gagal terhubung ke server.");
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  // Fetch Asana Projects and Users when workspace changes
  useEffect(() => {
    if (activeTab === "asana" && selectedWorkspace && asanaToken) {
      const fetchAsanaData = async () => {
        setLoadingProjects(true);
        setLoadingUsers(true);
        try {
          // Projects
          const resProj = await fetch("/api/v1/integrations/asana/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: asanaToken, workspaceId: selectedWorkspace }),
          });
          const dataProj = await resProj.json();
          if (resProj.ok) {
            setProjects(dataProj.projects || []);
          }

          // Users
          const resUser = await fetch("/api/v1/integrations/asana/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: asanaToken, workspaceId: selectedWorkspace }),
          });
          const dataUser = await resUser.json();
          if (resUser.ok) {
            setUsers(dataUser.users || []);
          }
        } catch (e) {
          console.error("Gagal memuat proyek/user Asana", e);
        } finally {
          setLoadingProjects(false);
          setLoadingUsers(false);
        }
      };
      fetchAsanaData();
    }
  }, [selectedWorkspace, activeTab, asanaToken]);

  // Handle push to Jira
  const pushToJira = async () => {
    if (!selectedProject) {
      setErrorMsg("Harap pilih Proyek target terlebih dahulu.");
      return;
    }
    const storiesToPush = stories.filter(s => selectedStories[s.id]);
    if (storiesToPush.length === 0) {
      setErrorMsg("Harap pilih setidaknya satu user story untuk didorong.");
      return;
    }

    setErrorMsg("");
    setPushing(true);
    setPushResults([]);
    
    const results = [];
    const labelArray = labels ? labels.split(",").map(l => l.trim()) : ["PRD-Architect"];

    for (let i = 0; i < storiesToPush.length; i++) {
      const story = storiesToPush[i];
      try {
        const res = await fetch("/api/v1/integrations/jira/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: jiraUrl,
            email: jiraEmail,
            token: jiraToken,
            fields: {
              projectKey: selectedProject,
              summary: story.summary,
              description: story.description,
              assigneeId: selectedAssignee,
              labels: labelArray,
              dueDate: dueDate,
              issueType: issueType,
            },
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          results.push({
            id: story.id,
            summary: story.summary,
            success: true,
            key: data.key,
            url: data.url,
            isDemo: data.isDemo,
            details: data.details,
          });
        } else {
          results.push({
            id: story.id,
            summary: story.summary,
            success: false,
            error: data.error || "Gagal membuat tiket Jira.",
          });
        }
      } catch (e: any) {
        results.push({
          id: story.id,
          summary: story.summary,
          success: false,
          error: e.message || "Koneksi terputus.",
        });
      }
    }

    setPushResults(results);
    setPushing(false);
  };

  // Handle push to Asana
  const pushToAsana = async () => {
    if (!selectedWorkspace || !selectedProject) {
      setErrorMsg("Harap pilih Workspace dan Proyek target terlebih dahulu.");
      return;
    }
    const storiesToPush = stories.filter(s => selectedStories[s.id]);
    if (storiesToPush.length === 0) {
      setErrorMsg("Harap pilih setidaknya satu tugas untuk didorong.");
      return;
    }

    setErrorMsg("");
    setPushing(true);
    setPushResults([]);
    
    const results = [];
    const labelArray = labels ? labels.split(",").map(l => l.trim()) : ["PRD-Architect"];

    for (let i = 0; i < storiesToPush.length; i++) {
      const story = storiesToPush[i];
      try {
        const res = await fetch("/api/v1/integrations/asana/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: asanaToken,
            workspaceId: selectedWorkspace,
            projectId: selectedProject,
            name: story.summary,
            notes: story.description,
            assigneeId: selectedAssignee,
            dueDate: dueDate,
            labels: labelArray,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          results.push({
            id: story.id,
            summary: story.summary,
            success: true,
            key: data.gid,
            url: data.url,
            isDemo: data.isDemo,
            details: data.details,
          });
        } else {
          results.push({
            id: story.id,
            summary: story.summary,
            success: false,
            error: data.error || "Gagal membuat tugas Asana.",
          });
        }
      } catch (e: any) {
        results.push({
          id: story.id,
          summary: story.summary,
          success: false,
          error: e.message || "Koneksi terputus.",
        });
      }
    }

    setPushResults(results);
    setPushing(false);
  };

  // Add custom story on the fly
  const addCustomStory = () => {
    const newId = `story-custom-${Date.now()}`;
    const newStory: UserStory = {
      id: newId,
      summary: "User Story Baru",
      description: "Sebagai [persona], saya ingin [tujuan], sehingga [manfaat].",
    };
    setStories([...stories, newStory]);
    setSelectedStories({ ...selectedStories, [newId]: true });
  };

  const removeStory = (id: string) => {
    setStories(stories.filter(s => s.id !== id));
    const nextSelected = { ...selectedStories };
    delete nextSelected[id];
    setSelectedStories(nextSelected);
  };

  const updateStory = (id: string, field: "summary" | "description", val: string) => {
    setStories(stories.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Push to Project Management Boards</h3>
              <p className="text-xs text-gray-500">Dorong user story dan epics dari PRD langsung ke Jira atau Asana</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition rounded-lg hover:bg-gray-100 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-white shrink-0">
          <button
            onClick={() => handleTabSwitch("jira")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all duration-150 flex items-center gap-2 ${
              activeTab === "jira"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            Jira Software
          </button>
          <button
            onClick={() => handleTabSwitch("asana")}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all duration-150 flex items-center gap-2 ${
              activeTab === "asana"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Asana Project
          </button>
        </div>

        {/* Content Container (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Status Message */}
          {statusMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-900">Status Integrasi Aktif</p>
                <p className="text-xs text-emerald-700/95 mt-0.5">{statusMsg}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Credentials and Target Setup Panel */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-gray-400" />
              1. Konfigurasi Koneksi & Target Board
            </h4>

            {activeTab === "jira" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Jira Site URL</label>
                  <input
                    type="url"
                    value={jiraUrl}
                    onChange={(e) => setJiraUrl(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
                    placeholder="https://your-domain.atlassian.net"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Email Akun</label>
                  <input
                    type="email"
                    value={jiraEmail}
                    onChange={(e) => setJiraEmail(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
                    placeholder="name@domain.com"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Jira API Token</label>
                    <input
                      type="password"
                      value={jiraToken}
                      onChange={(e) => setJiraToken(e.target.value)}
                      className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
                      placeholder="Atlassian API Token"
                    />
                  </div>
                  <button
                    onClick={fetchJiraProjects}
                    disabled={loadingProjects}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all flex items-center h-[38px] cursor-pointer"
                  >
                    {loadingProjects ? "Memuat..." : "Hubungkan"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Asana Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    value={asanaToken}
                    onChange={(e) => setAsanaToken(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:border-rose-500 focus:ring-rose-500 px-3 py-2 border bg-white"
                    placeholder="Asana PAT (0/xxxx...)"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchAsanaWorkspaces}
                    disabled={loadingWorkspaces}
                    className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all h-[38px] cursor-pointer"
                  >
                    {loadingWorkspaces ? "Menghubungkan..." : "Hubungkan Asana"}
                  </button>
                </div>
              </div>
            )}

            {/* Target Selectors and Field Mapping */}
            {projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200/60 animate-in fade-in duration-200">
                {activeTab === "asana" && workspaces.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      Pilih Workspace
                    </label>
                    <select
                      value={selectedWorkspace}
                      onChange={(e) => setSelectedWorkspace(e.target.value)}
                      className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:ring-rose-500 focus:border-rose-500 p-2.5 border bg-white"
                    >
                      {workspaces.map((ws) => (
                        <option key={ws.gid} value={ws.gid}>{ws.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Inbox className="w-3.5 h-3.5 text-gray-400" />
                    Papan Proyek Target
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border bg-white"
                  >
                    <option value="">-- Pilih Proyek --</option>
                    {projects.map((p) => (
                      <option key={p.id || p.gid} value={p.key || p.gid}>
                        {p.name} ({p.key || "Asana"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field Mapping: Assignee */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Assignee (Pemilik Tugas)
                  </label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border bg-white"
                  >
                    <option value="">-- Tanpa Penerima --</option>
                    {users.map((u) => (
                      <option key={u.accountId || u.gid} value={u.accountId || u.gid}>
                        {u.displayName || u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jira-specific Issue Type Mapping */}
                {activeTab === "jira" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Tipe Isu (Issue Type)
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border bg-white"
                    >
                      <option value="Story">Story</option>
                      <option value="Epic">Epic</option>
                      <option value="Task">Task</option>
                      <option value="Bug">Bug</option>
                    </select>
                  </div>
                )}

                {/* Due Date Mapping */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Tenggat Waktu (Due Date)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white"
                  />
                </div>

                {/* Labels Mapping */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    Tag / Labels
                  </label>
                  <input
                    type="text"
                    value={labels}
                    onChange={(e) => setLabels(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border bg-white"
                    placeholder="spr-1, prd, web-app (pisahkan koma)"
                  />
                </div>
              </div>
            )}
          </div>

          {/* User Stories Manager & Field Mapping Pre-Push */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-sm">2. Seleksi dan Kustomisasi User Stories</h4>
              <button
                type="button"
                onClick={addCustomStory}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Isu/Story
              </button>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 max-h-[300px] overflow-y-auto bg-gray-50/20">
              {stories.map((story) => (
                <div key={story.id} className="p-4 flex items-start gap-3 bg-white hover:bg-gray-50/50 transition duration-150">
                  <input
                    type="checkbox"
                    checked={!!selectedStories[story.id]}
                    onChange={(e) => setSelectedStories({ ...selectedStories, [story.id]: e.target.checked })}
                    className="mt-1.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={story.summary}
                      onChange={(e) => updateStory(story.id, "summary", e.target.value)}
                      className="w-full text-sm font-semibold text-gray-800 border-none bg-transparent hover:bg-gray-100/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-md p-1 transition"
                      placeholder="Ringkasan tugas/isu"
                    />
                    <textarea
                      rows={2}
                      value={story.description}
                      onChange={(e) => updateStory(story.id, "description", e.target.value)}
                      className="w-full text-xs text-gray-500 border-none bg-transparent hover:bg-gray-100/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-md p-1 transition resize-none"
                      placeholder="Acceptance criteria / Kriteria penerimaan"
                    />
                  </div>
                  <button
                    onClick={() => removeStory(story.id)}
                    className="text-gray-400 hover:text-rose-600 transition p-1.5 hover:bg-rose-50 rounded-lg mt-0.5"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Push Action & Results Console */}
          {pushResults.length > 0 && (
            <div className="bg-white text-slate-800 rounded-2xl p-5 font-mono text-xs space-y-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Hasil Pushing Real-time</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Selesai
                </span>
              </div>
              <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {pushResults.map((r, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 py-1 border-b border-slate-100 last:border-0">
                    <div className="space-y-1">
                      <span className="text-slate-600 font-semibold">[{idx + 1}] {r.summary}</span>
                      {r.success ? (
                        <p className="text-emerald-400 flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Sukses terbuat: {r.key}
                          {r.isDemo && <span className="text-[10px] uppercase bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded text-emerald-300 ml-1.5">Demo</span>}
                        </p>
                      ) : (
                        <p className="text-rose-400">Gagal: {r.error}</p>
                      )}
                      {r.details && <p className="text-[10px] text-gray-500 italic ml-4 leading-relaxed">{r.details}</p>}
                    </div>
                    {r.success && r.url && r.url !== "#" && (
                      <a
                        href={r.url}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 shrink-0"
                      >
                        Buka Tiket
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center shrink-0">
          <p className="text-xs text-gray-500">
            Total terpilih: <span className="font-bold text-gray-800">{stories.filter(s => selectedStories[s.id]).length}</span> dari {stories.length} Isu
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Tutup
            </button>
            <button
              disabled={pushing || !selectedProject || stories.filter(s => selectedStories[s.id]).length === 0}
              onClick={activeTab === "jira" ? pushToJira : pushToAsana}
              className={`px-5 py-2 rounded-xl text-white font-medium text-sm transition flex items-center gap-2 cursor-pointer ${
                activeTab === "jira" 
                  ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300" 
                  : "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300"
              }`}
            >
              {pushing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Mendorong Isu...
                </>
              ) : (
                <>
                  Dorong ke {activeTab === "jira" ? "Jira" : "Asana"}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
