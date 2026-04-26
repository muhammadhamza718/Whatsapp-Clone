"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { authClient } from "@/lib/auth-client";

export type PresenceStatus = "online" | "away" | "offline";

interface PresenceContextType {
  status: PresenceStatus;
  idleMinutes: number;
  maxIdleMinutes: number;
  setManualStatus: (status: PresenceStatus) => void;
  isConnected: boolean;
  connection: signalR.HubConnection | null;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<PresenceStatus>("online");
  const [idleMinutes, setIdleMinutes] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const maxIdleMinutes = 5;
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // 1. Initialize SignalR Connection
  useEffect(() => {
    if (!session?.user?.id) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5100";
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/presence?userId=${session.user.id}`)
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        setIsConnected(true);
        connectionRef.current = connection;
      })
      .catch((err) => console.error("SignalR Connection Error: ", err));

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));

    return () => {
      connection.stop();
    };
  }, [session?.user?.id]);

  // 2. Idle Detection Logic
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (idleMinutes > 0) {
        setIdleMinutes(0);
        updateStatus("online");
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMinutes = Math.floor((now - lastActivityRef.current) / 60000);
      
      if (diffMinutes !== idleMinutes) {
        setIdleMinutes(Math.min(diffMinutes, maxIdleMinutes));
        
        if (diffMinutes >= maxIdleMinutes && status === "online") {
          updateStatus("away");
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearInterval(interval);
    };
  }, [idleMinutes, status]);

  const updateStatus = async (newStatus: PresenceStatus) => {
    setStatus(newStatus);
    const conn = connectionRef.current;
    if (conn && session?.user?.id && conn.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke("UpdateStatus", session.user.id, newStatus);
      } catch (err) {
        console.error("Failed to update status via SignalR", err);
      }
    }
  };

  const setManualStatus = (newStatus: PresenceStatus) => {
    updateStatus(newStatus);
  };

  return (
    <PresenceContext.Provider value={{ 
      status, 
      idleMinutes, 
      maxIdleMinutes, 
      setManualStatus,
      isConnected,
      connection: connectionRef.current
    }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
}
