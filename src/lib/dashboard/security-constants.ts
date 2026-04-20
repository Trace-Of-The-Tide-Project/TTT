import type { ComponentType } from "react";
import {
  ShieldIcon,
  UsersIcon,
  ActivityIcon,
  AlertTriangleIcon,
} from "@/components/ui/icons";

export type SecurityStatItem = {
  id: "status" | "admins" | "sessions" | "alerts";
  icon: ComponentType;
};

export const securityStats: SecurityStatItem[] = [
  { id: "status", icon: ShieldIcon },
  { id: "admins", icon: UsersIcon },
  { id: "sessions", icon: ActivityIcon },
  { id: "alerts", icon: AlertTriangleIcon },
];

export type SecurityAdminRoleRow = {
  id: "super" | "finance" | "content" | "support";
};

export const securityAdminRoles: SecurityAdminRoleRow[] = [
  { id: "super" },
  { id: "finance" },
  { id: "content" },
  { id: "support" },
];

export type ActiveSessionRow = {
  id: string;
  user: string;
  device: string;
  location: string;
  lastActive: string;
};

/** Legacy compact list (optional reuse). */
export const sampleActiveSessions: ActiveSessionRow[] = [
  {
    id: "s1",
    user: "You (current)",
    device: "Chrome · Windows",
    location: "Amman, JO",
    lastActive: "Now",
  },
  {
    id: "s2",
    user: "m.chen@example.com",
    device: "Safari · macOS",
    location: "London, UK",
    lastActive: "12 min ago",
  },
  {
    id: "s3",
    user: "admin@traceofthetide.com",
    device: "Firefox · Linux",
    location: "Berlin, DE",
    lastActive: "1 hour ago",
  },
  {
    id: "s4",
    user: "support@traceofthetide.com",
    device: "Edge · Windows",
    location: "New York, US",
    lastActive: "3 hours ago",
  },
];

export type AdminSessionTableRow = {
  id: "t1" | "t2" | "t3" | "t4";
  ip: string;
  status: "current" | "active" | "idle";
};

export const adminSessionTableRows: AdminSessionTableRow[] = [
  {
    id: "t1",
    ip: "192.168.1.1",
    status: "current",
  },
  {
    id: "t2",
    ip: "192.168.1.42",
    status: "active",
  },
  {
    id: "t3",
    ip: "10.0.0.12",
    status: "idle",
  },
  {
    id: "t4",
    ip: "172.16.0.5",
    status: "idle",
  },
];

export type SecurityLogEntry = {
  id: "l1" | "l2" | "l3" | "l4" | "l5";
  variant: "success" | "warning";
};

export const securityLogEntries: SecurityLogEntry[] = [
  { id: "l1", variant: "success" },
  { id: "l2", variant: "success" },
  { id: "l3", variant: "warning" },
  { id: "l4", variant: "success" },
  { id: "l5", variant: "success" },
];
