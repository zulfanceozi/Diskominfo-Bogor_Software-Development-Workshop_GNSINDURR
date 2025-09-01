"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Layanan Publik PWA
          </h1>
          <p className="text-gray-600">
            Sistem Layanan Publik Berbasis Progressive Web App
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin/login"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Login Admin
          </Link>

          <Link
            href="/public"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Layanan Masyarakat
          </Link>

          {/* PWA Install Button */}
          <button
            id="pwa-install-btn"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center hidden"
            onClick={() => {
              if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                window.deferredPrompt.userChoice.then((choiceResult) => {
                  if (choiceResult.outcome === "accepted") {
                    console.log("User accepted the install prompt");
                  } else {
                    console.log("User dismissed the install prompt");
                  }
                  window.deferredPrompt = null;
                  document
                    .getElementById("pwa-install-btn")
                    .classList.add("hidden");
                });
              }
            }}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Install Aplikasi
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Layanan Publik PWA</p>
          <p className="mt-1">Workshop-Friendly System</p>
        </div>

        {/* PWA Install Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Show PWA install button when available
              window.showInstallPrompt = function() {
                const installBtn = document.getElementById('pwa-install-btn');
                if (installBtn) {
                  installBtn.classList.remove('hidden');
                }
              };
              
              // Check if PWA is already installed
              if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
                console.log('PWA is already installed');
              }
            `,
          }}
        />
      </div>
    </div>
  );
}
