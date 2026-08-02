import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
} from "firebase/firestore";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface PresenceData {
  userId: string;
  email: string;
  lastActive: any;
  currentSection: string;
  isEditing?: boolean;
  color?: string;
}

const USER_COLORS = [
  "#696cff",
  "#71dd37",
  "#ffab00",
  "#ff3e1d",
  "#03c3ec",
  "#8592a3",
  "#e83e8c",
  "#20c997",
];

export function PRDPresence({
  prdId,
  currentSection,
  isEditing = false,
}: {
  prdId: string;
  currentSection: string;
  isEditing?: boolean;
}) {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<PresenceData[]>([]);

  useEffect(() => {
    if (!user || !prdId) return;

    const presenceRef = doc(db, `prds/${prdId}/presence/${user.uid}`);
    const userColor =
      USER_COLORS[Math.abs(user.uid.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % USER_COLORS.length];

    // Update presence
    const updatePresence = async () => {
      try {
        await setDoc(
          presenceRef,
          {
            userId: user.uid,
            email: user.email,
            lastActive: serverTimestamp(),
            currentSection: currentSection || "Viewing Document",
            isEditing: !!isEditing,
            color: userColor,
          },
          { merge: true }
        );
      } catch (e) {
        console.error("Failed to update presence", e);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 15000); // 15s heartbeat

    const handleBeforeUnload = () => {
      deleteDoc(presenceRef);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      deleteDoc(presenceRef).catch(() => {});
    };
  }, [prdId, user, currentSection, isEditing]);

  useEffect(() => {
    if (!prdId) return;
    const q = query(collection(db, `prds/${prdId}/presence`));
    const unsub = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const users: PresenceData[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as PresenceData;
        const lastActiveTime = data.lastActive?.toMillis?.() || Date.now();
        // Consider active if updated within last 60s
        if (now - lastActiveTime < 60000 && data.userId !== user?.uid) {
          users.push(data);
        }
      });
      setActiveUsers(users);
    });
    return unsub;
  }, [prdId, user]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-xl border border-[#e4e6e8] shadow-2xs">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs text-[#566a7f] font-bold">
          {activeUsers.length} Active Collaborator{activeUsers.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex -space-x-2">
        {activeUsers.map((u) => {
          const initials = (u.email || "User").substring(0, 2).toUpperCase();
          const avatarBg = u.color || "#696cff";

          return (
            <div
              key={u.userId}
              className="relative group"
            >
              <Avatar className="w-8 h-8 ring-2 ring-white border border-[#e4e6e8] shadow-2xs cursor-pointer hover:z-20 transition-transform hover:scale-110">
                <AvatarFallback
                  style={{ backgroundColor: `${avatarBg}20`, color: avatarBg }}
                  className="text-xs font-bold"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>

              {u.isEditing && (
                <span className="absolute -bottom-1 -right-1 text-[10px] bg-amber-500 text-white font-bold px-1 rounded-full border border-white shadow-xs">
                  ✎
                </span>
              )}

              {/* Hover Cursor Card Tooltip */}
              <div className="absolute hidden group-hover:block top-full mt-2 left-1/2 -translate-x-1/2 p-2 bg-[#384756] text-white text-xs rounded-xl shadow-lg whitespace-nowrap z-50 space-y-0.5">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: avatarBg }} />
                  <span>{u.email}</span>
                </div>
                <div className="text-[11px] text-[#a1acb8] font-medium">
                  {u.isEditing ? "Editing: " : "Viewing: "}
                  <strong className="text-white">{u.currentSection}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
