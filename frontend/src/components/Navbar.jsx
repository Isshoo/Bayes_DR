"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <span className="text-[22px] font-extrabold text-slate-800 tracking-tight">
                Bayes<span className="text-teal-600">DR</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium tracking-wider uppercase m-0">
                Diabetic Retinopathy
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-5 py-2.5 rounded-lg font-semibold text-[15px] no-underline transition-all ${
                isActive("/")
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/classify"
              className={`px-5 py-2.5 rounded-lg font-semibold text-[15px] no-underline transition-all ${
                isActive("/classify")
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Klasifikasi
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
