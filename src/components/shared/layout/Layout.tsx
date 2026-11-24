/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

import { Menu, MenuProps } from "antd";
import { Layout } from "antd";
import Link from "next/link";
import AdminHeader from "../Navbar/DashboardHeader";
import { LogOut, Stethoscope } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

const { Content, Sider } = Layout;

export type MenuItem = Required<MenuProps>["items"][number];

export function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return { key, icon, children, label } as MenuItem;
}

interface AdminLayoutProps {
  children: ReactNode;
  menu: MenuItem[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, menu }) => {
  const [open, setOpen] = useState<boolean>(false);

  const pathname = usePathname();

  // Highlight the section the URL belongs to, e.g. /dashboard/doctors/<id> -> "Doctors".
  const selectedKey =
    menu
      .map((item) => String(item?.key))
      .filter((key) => pathname === key || (key !== "/dashboard" && pathname.startsWith(`${key}/`)))
      .sort((a, b) => b.length - a.length)[0] ?? pathname;

  const handleClick = () => setOpen(false); // close the mobile drawer after navigating

  const handleLogout = useLogout();

  return (
    <Layout style={{ height: "100vh" }}>
      {/* Backdrop overlay for mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Sider
        width={220}
        className={`!bg-white !overflow-y-auto !fixed lg:!static h-full z-50 ${open ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        theme="dark"
        collapsed={false}
      >
        <Link href="/dashboard" className="flex items-center justify-center gap-2 border-b border-[#E5E7EB] py-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white">
            <Stethoscope size={18} />
          </span>
          <span className="font-poppins text-lg font-semibold text-secondary-dark">Doctor Tracker</span>
        </Link>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleClick}
          items={menu}
          style={{
            backgroundColor: "#ffffff",
            fontWeight: "500",
          }}
          inlineIndent={16}
          rootClassName="custom-sidebar"
        />
        {/* Bottom Logout Button */}
        <button
          className="flex items-center w-full gap-2 px-6 py-2 text-black hover:bg-red-50 rounded-md font-medium transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="text-xl" />
          Logout
        </button>
      </Sider>

      <Layout>
        <AdminHeader open={open} setOpen={setOpen} />

        <Content
          className="!overflow-y-auto !overflow-x-hidden bg-[#F4F7FD] p-6"
          onClick={() => setOpen(false)}
          style={{ height: "100%" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
