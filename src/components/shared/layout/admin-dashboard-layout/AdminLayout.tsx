// app/(adminDashboard)/layout.tsx

"use client";

import AdminLayout from "@/components/shared/layout/Layout";
import Link from "next/link";
import { ReactNode } from "react";

// Lucide Icons
import { LayoutDashboard, Stethoscope, Users } from "lucide-react";

import { getItem, MenuItem } from "../Layout";

// Doctor Tracker navigation.
const navItems: MenuItem[] = [
  getItem(<Link href="/dashboard">Dashboard</Link>, "/dashboard", <LayoutDashboard className="text-xl" />),
  getItem(<Link href="/dashboard/doctors">Doctors</Link>, "/dashboard/doctors", <Stethoscope className="text-xl" />),
  getItem(<Link href="/dashboard/patients">Patients</Link>, "/dashboard/patients", <Users className="text-xl" />),
];

const SuperAdminLayout = ({ children }: { children: ReactNode }) => {
  return <AdminLayout menu={navItems}>{children}</AdminLayout>;
};

export default SuperAdminLayout;