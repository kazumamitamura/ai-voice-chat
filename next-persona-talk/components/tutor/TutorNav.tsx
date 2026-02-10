"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/supabase/auth-actions";
import { useState, useTransition } from "react";

export default function TutorNav() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/tutor", label: "チャット（学習）", icon: "💬" },
    { href: "/tutor/admin", label: "管理画面（先生用）", icon: "📊" },
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-indigo-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/tutor"
          className="flex items-center gap-2.5 transition hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-lg shadow-sm">
            📚
          </div>
          <span className="text-lg font-bold text-gray-800">
            AI<span className="text-indigo-600">チューター</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/tutor"
                ? pathname === "/tutor"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="ml-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {isPending ? "処理中..." : "ログアウト"}
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 md:hidden"
          aria-label="メニュー"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/tutor"
                  ? pathname === "/tutor"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="mt-1 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            >
              {isPending ? "処理中..." : "🚪 ログアウト"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
