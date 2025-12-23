import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="text-xl font-bold text-white">
                Bayes<span className="text-teal-400">DR</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Deteksi Diabetic Retinopathy menggunakan teknologi Bayesian CNN
              untuk hasil yang akurat dan terukur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider min-h-[40px] flex items-center">
                Navigasi
              </h4>
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="text-slate-400 hover:text-white text-sm no-underline transition-colors"
                >
                  Beranda
                </Link>
                <Link
                  href="/classify"
                  className="text-slate-400 hover:text-white text-sm no-underline transition-colors"
                >
                  Klasifikasi
                </Link>
                <a
                  href="#about"
                  className="text-slate-400 hover:text-white text-sm no-underline transition-colors"
                >
                  Tentang DR
                </a>
              </div>
            </div>

            {/* Technology */}
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider min-h-[40px] flex items-center">
                Teknologi
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-slate-700 rounded-md text-xs text-slate-300 font-medium">
                  Bayesian CNN
                </span>
                <span className="px-3 py-1.5 bg-slate-700 rounded-md text-xs text-slate-300 font-medium">
                  TensorFlow
                </span>
                <span className="px-3 py-1.5 bg-slate-700 rounded-md text-xs text-slate-300 font-medium">
                  Next.js
                </span>
                <span className="px-3 py-1.5 bg-slate-700 rounded-md text-xs text-slate-300 font-medium">
                  Flask
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-700 mb-6"></div>

        {/* Bottom Row */}
        <div className="flex flex-col gap-4 items-center text-center">
          <p className="text-sm text-slate-500">
            © 2025 BayesDR. Dibuat untuk keperluan edukasi dan penelitian.
          </p>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 max-w-2xl">
            <p className="text-xs text-red-400 leading-relaxed">
              <strong>⚠️ Disclaimer:</strong> Aplikasi ini bukan pengganti
              diagnosis medis profesional. Selalu konsultasikan dengan dokter
              mata untuk pemeriksaan dan diagnosa yang akurat.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
