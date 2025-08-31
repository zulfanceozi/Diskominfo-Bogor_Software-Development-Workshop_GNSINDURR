"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import NewSubmission from "./components/NewSubmission";
import StatusCheck from "./components/StatusCheck";

export default function PublicPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("submission");

  useEffect(() => {
    // Handle tab parameter from URL
    const tabParam = searchParams.get("tab");
    if (tabParam === "status" || tabParam === "submission") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Layanan Masyarakat
              </h1>
              <p className="text-gray-600 mt-1">
                Pengajuan dan Pengecekan Status Layanan
              </p>
            </div>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("submission")}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "submission"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pengajuan Baru
              </button>
              <button
                onClick={() => setActiveTab("status")}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "status"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Cek Status
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeTab === "submission" ? <NewSubmission /> : <StatusCheck />}
        </div>
      </div>
    </div>
  );
}
