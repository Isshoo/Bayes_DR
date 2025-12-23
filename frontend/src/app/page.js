import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-45 pb-27 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-1/2 -right-[10%] w-[600px] h-[600px] rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute -bottom-[30%] -left-[5%] w-[400px] h-[400px] rounded-full bg-white/[0.03] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2.5 text-sm text-white font-medium mb-7">
                <span className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></span>
                Powered by Bayesian CNN
              </div>

              <h1 className="text-5xl lg:text-[52px] font-extrabold mb-6 leading-tight text-white tracking-tight">
                Deteksi{" "}
                <span className="bg-gradient-to-r from-cyan-200 to-teal-200 bg-clip-text text-transparent">
                  Diabetic Retinopathy
                </span>{" "}
                dengan AI
              </h1>

              <p className="text-lg text-white/85 mb-9 leading-relaxed max-w-lg">
                Upload gambar fundus mata dan dapatkan hasil klasifikasi tingkat
                keparahan dengan confidence score dan uncertainty estimation
                yang akurat.
              </p>

              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/classify"
                  className="inline-flex items-center justify-center gap-2.5 bg-white text-teal-700 font-bold px-8 py-4 rounded-xl no-underline shadow-xl shadow-black/15 hover:shadow-2xl hover:bg-teal-50 transition-all text-base"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Mulai Klasifikasi
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl no-underline border-2 border-white/25 hover:bg-white/20 transition-all text-base"
                >
                  Pelajari Lebih Lanjut
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right - Eye Illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-80 lg:w-[340px] lg:h-[340px] rounded-full bg-white/[0.08] flex items-center justify-center border border-white/15">
                  <div className="w-64 lg:w-[260px] h-64 lg:h-[260px] rounded-full bg-gradient-to-br from-amber-100 via-amber-500 to-amber-900 flex items-center justify-center shadow-2xl">
                    <div className="w-24 lg:w-[100px] h-24 lg:h-[100px] rounded-full bg-stone-900 flex items-center justify-center shadow-inner">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/90 to-white/30 -translate-x-3 -translate-y-3"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-7 w-4 h-4 bg-teal-300 rounded-full shadow-lg shadow-teal-300/50"></div>
                <div className="absolute bottom-7 left-5 w-3 h-3 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-teal-600">5</span>
              <span className="text-sm text-slate-500 ml-2">
                Tingkat Klasifikasi
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
            <div className="text-center">
              <span className="text-3xl font-extrabold text-teal-600">
                BCNN
              </span>
              <span className="text-sm text-slate-500 ml-2">Model</span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
            <div className="text-center">
              <span className="text-3xl font-extrabold text-teal-600">
                224px
              </span>
              <span className="text-sm text-slate-500 ml-2">Input Size</span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
            <div className="text-center">
              <span className="text-3xl font-extrabold text-teal-600">±σ</span>
              <span className="text-sm text-slate-500 ml-2">Uncertainty</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-5">
              Informasi Penting
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-5 leading-tight">
              Apa itu Diabetic Retinopathy?
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Diabetic Retinopathy adalah komplikasi diabetes yang mempengaruhi
              mata. Kondisi ini disebabkan oleh kerusakan pada pembuluh darah di
              retina dan dapat menyebabkan kebutaan jika tidak terdeteksi dan
              ditangani dengan tepat.
            </p>
          </div>

          {/* Classification Levels */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ClassificationCard
              level="No DR"
              color="bg-emerald-500"
              bgColor="bg-emerald-50"
              borderColor="border-emerald-500"
              description="Tidak ada tanda DR"
              severity="0"
            />
            <ClassificationCard
              level="Mild"
              color="bg-yellow-500"
              bgColor="bg-yellow-50"
              borderColor="border-yellow-500"
              description="Tahap awal"
              severity="1"
            />
            <ClassificationCard
              level="Moderate"
              color="bg-orange-500"
              bgColor="bg-orange-50"
              borderColor="border-orange-500"
              description="Perlu pemantauan"
              severity="2"
            />
            <ClassificationCard
              level="Severe"
              color="bg-red-500"
              bgColor="bg-red-50"
              borderColor="border-red-500"
              description="Perlu penanganan"
              severity="3"
            />
            <ClassificationCard
              level="Proliferate"
              color="bg-red-800"
              bgColor="bg-red-50"
              borderColor="border-red-800"
              description="Tahap parah"
              severity="4"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-5">
              Keunggulan
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-5 leading-tight">
              Fitur Unggulan BayesDR
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Menggunakan teknologi Bayesian CNN untuk memberikan hasil
              klasifikasi yang akurat dan terukur.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="Confidence Score"
              description="Setiap prediksi dilengkapi dengan skor kepercayaan untuk membantu interpretasi hasil diagnosis."
              bgColor="bg-teal-50"
            />
            <FeatureCard
              icon="📈"
              title="Uncertainty Estimation"
              description="Model Bayesian memberikan estimasi ketidakpastian untuk setiap prediksi yang dihasilkan."
              bgColor="bg-blue-50"
            />
            <FeatureCard
              icon="⚡"
              title="Proses Cepat"
              description="Hasil klasifikasi diperoleh dalam hitungan detik dengan antarmuka yang mudah digunakan."
              bgColor="bg-violet-50"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="text-4xl font-extrabold mb-4 text-white leading-tight">
            Siap Mencoba BayesDR?
          </h2>
          <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl mx-auto">
            Upload gambar fundus mata Anda dan dapatkan hasil klasifikasi
            Diabetic Retinopathy sekarang juga.
          </p>
          <Link
            href="/classify"
            className="inline-flex items-center justify-center gap-2.5 bg-white text-teal-700 font-bold text-lg px-10 py-4 rounded-xl no-underline shadow-xl hover:shadow-2xl hover:bg-teal-50 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Mulai Klasifikasi Sekarang
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ClassificationCard({
  level,
  color,
  bgColor,
  borderColor,
  description,
  severity,
}) {
  return (
    <div
      className={`${bgColor} rounded-2xl p-5 border-2 ${borderColor} text-center transition-all hover:shadow-lg`}
    >
      <div
        className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-4`}
      >
        <span className="text-white font-extrabold text-xl">{severity}</span>
      </div>
      <h3 className="font-bold text-slate-900 mb-1 text-sm">{level}</h3>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, bgColor }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1">
      <div
        className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center mb-6 text-3xl`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
