"use client";

import React, { useState } from "react";
import { MenuOutlined } from "@ant-design/icons";
import { useLogout } from "@/hooks/useLogout";
import { useGetMeQuery } from "@/redux/service/auth/authApi";
import { IS_DEMO } from "@/lib/demo/config";

interface AdminHeaderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const initials = (name?: string | null) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A";

const AdminHeader: React.FC<AdminHeaderProps> = ({ open, setOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const handleLogout = useLogout();
  const { data, isLoading } = useGetMeQuery();
  const user = data?.data;

  return (
    <header className="flex h-16 items-center justify-between px-6">
      <div className="lg:hidden">
        <MenuOutlined onClick={() => setOpen(!open)} className="cursor-pointer text-2xl text-gray-700" />
      </div>

      <div className="hidden flex-1 items-center py-3 lg:flex">
        <h2 className="text-2xl font-semibold text-gray-800">Welcome back{user?.name ? `, ${user.name}` : ""}!</h2>
        {IS_DEMO && <span className="ml-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">Demo data</span>}
      </div>

      <div className="relative">
        {IS_DEMO && <span className="mr-3 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 lg:hidden">Demo</span>}
        <button
          className="flex cursor-pointer items-center space-x-2 focus:outline-none"
          onClick={() => setShowDropdown((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={showDropdown}
        >
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-gray-800">{isLoading ? "Loading…" : user?.name || user?.email || "Admin"}</div>
            <div className="text-xs text-gray-500">{user?.role ?? "ADMIN"}</div>
          </div>
          {isLoading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {initials(user?.name)}
            </div>
          )}
        </button>

        {showDropdown && (
          <>
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 text-sm text-gray-700 shadow-lg"
            >
              {user?.email && <div className="truncate border-b border-gray-100 px-4 py-2 text-xs text-gray-500">{user.email}</div>}
              <button
                role="menuitem"
                className="block w-full px-4 py-2 text-left font-medium text-red-600 hover:bg-red-50"
                onClick={() => {
                  setShowDropdown(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          </>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
