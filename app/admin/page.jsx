"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, Select, message, Card, Row, Col } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const { Option } = Select;

export default function AdminDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [chartData, setChartData] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState({}); // Track which submission is being updated
  const [refreshing, setRefreshing] = useState(false); // Track refresh loading state

  const COLORS = ["#ffc107", "#1890ff", "#52c41a", "#ff4d4f"];

  useEffect(() => {
    // Check if admin is logged in
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("adminLoggedIn");
      console.log("Auth check - isLoggedIn:", isLoggedIn); // Debug log
      if (!isLoggedIn) {
        console.log("Not logged in, redirecting to login"); // Debug log
        router.push("/admin/login");
        return;
      }
      console.log("Logged in, fetching submissions"); // Debug log
      fetchSubmissions();
    };

    // Add a small delay to ensure localStorage is available
    setTimeout(checkAuth, 100);
  }, [router]);

  const fetchSubmissions = async (showLoading = false) => {
    if (showLoading) {
      setRefreshing(true);
    }

    try {
      // Force cache bypass dengan timestamp dan random parameter
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const response = await fetch(
        `/api/admin/submissions?t=${timestamp}&r=${random}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data);
        updateChartData(data);
        if (showLoading) {
          message.success("Data berhasil diperbarui");
        }
      } else {
        message.error("Gagal memuat data pengajuan");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
      if (showLoading) {
        setRefreshing(false);
      }
    }
  };

  // Simple refresh function
  const handleRefresh = () => {
    fetchSubmissions(true);
  };

  const updateChartData = (data) => {
    const statusCount = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(statusCount).map(([status, count]) => ({
      name: getStatusText(status),
      value: count,
      status,
    }));

    setChartData(chartData);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENGAJUAN_BARU":
        return "Pengajuan Baru";
      case "DIPROSES":
        return "Sedang Diproses";
      case "SELESAI":
        return "Selesai";
      case "DITOLAK":
        return "Ditolak";
      default:
        return status;
    }
  };

  const handleStatusChange = async (submissionId, newStatus) => {
    // Set loading state for this specific submission
    setUpdatingStatus((prev) => ({ ...prev, [submissionId]: true }));

    try {
      const response = await fetch(
        `/api/admin/submissions/${submissionId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        message.success("Status berhasil diupdate");
        // Simple refresh setelah status update
        setTimeout(() => {
          fetchSubmissions(true);
        }, 500); // Delay 500ms untuk memastikan database update
      } else {
        const error = await response.json();
        message.error(error.message || "Gagal mengupdate status");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
    } finally {
      // Clear loading state for this submission
      setUpdatingStatus((prev) => ({ ...prev, [submissionId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/admin/login");
  };

  const columns = [
    {
      title: "Kode Tracking",
      dataIndex: "tracking_code",
      key: "tracking_code",
      render: (text) => <span className="font-mono text-sm">{text}</span>,
      width: 150,
      fixed: "left",
    },
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      width: 120,
    },
    {
      title: "Jenis Layanan",
      dataIndex: "jenis_layanan",
      key: "jenis_layanan",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status, record) => (
        <div className="flex items-center space-x-2">
          <Select
            value={status}
            style={{ width: 150 }}
            onChange={(value) => handleStatusChange(record.id, value)}
            disabled={updatingStatus[record.id]}
            loading={updatingStatus[record.id]}
          >
            <Option value="PENGAJUAN_BARU">Pengajuan Baru</Option>
            <Option value="DIPROSES">Sedang Diproses</Option>
            <Option value="SELESAI">Selesai</Option>
            <Option value="DITOLAK">Ditolak</Option>
          </Select>
          {updatingStatus[record.id] && (
            <div className="flex items-center text-blue-600 text-sm">
              <svg
                className="animate-spin h-4 w-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating...
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) => {
        if (!date) return "-";
        try {
          return new Date(date).toLocaleString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (error) {
          return "-";
        }
      },
    },
    {
      title: "Diupdate",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 150,
      render: (date) => {
        if (!date) return "-";
        try {
          return new Date(date).toLocaleString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (error) {
          return "-";
        }
      },
    },
  ];

  const filteredSubmissions =
    statusFilter === "ALL"
      ? submissions
      : submissions.filter((sub) => sub.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {loading
                  ? "Memuat data pengajuan..."
                  : "Kelola pengajuan layanan masyarakat"}
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm sm:text-base"
              >
                {refreshing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Refreshing...
                  </>
                ) : loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Refresh"
                )}
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        <Row gutter={[8, 8]} className="mb-6 sm:mb-8">
          <Col xs={12} sm={6}>
            <Card>
              <div className="text-center">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {submissions.length}
                  </div>
                )}
                <div className="text-sm sm:text-base text-gray-600">
                  Total Pengajuan
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <div className="text-center">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-yellow-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {
                      submissions.filter((s) => s.status === "PENGAJUAN_BARU")
                        .length
                    }
                  </div>
                )}
                <div className="text-sm sm:text-base text-gray-600">
                  Pengajuan Baru
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <div className="text-center">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {submissions.filter((s) => s.status === "DIPROSES").length}
                  </div>
                )}
                <div className="text-sm sm:text-base text-gray-600">
                  Sedang Diproses
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <div className="text-center">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {submissions.filter((s) => s.status === "SELESAI").length}
                  </div>
                )}
                <div className="text-sm sm:text-base text-gray-600">
                  Selesai
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Chart */}
        <Card title="Distribusi Status Pengajuan" className="mb-6 sm:mb-8">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <svg
                  className="animate-spin h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600">Memuat data chart...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center text-gray-500">
                <svg
                  className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-base sm:text-lg font-medium">
                  Belum ada data
                </p>
                <p className="text-xs sm:text-sm">
                  Data chart akan muncul setelah ada pengajuan
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Table */}
        <Card title="Daftar Pengajuan">
          <div className="mb-4">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%", maxWidth: 200 }}
              placeholder="Filter by status"
              disabled={loading || Object.values(updatingStatus).some(Boolean)}
              loading={loading}
            >
              <Option value="ALL">Semua Status</Option>
              <Option value="PENGAJUAN_BARU">Pengajuan Baru</Option>
              <Option value="DIPROSES">Sedang Diproses</Option>
              <Option value="SELESAI">Selesai</Option>
              <Option value="DITOLAK">Ditolak</Option>
            </Select>
            {loading && (
              <span className="ml-2 text-xs sm:text-sm text-gray-500">
                Memuat data...
              </span>
            )}
          </div>

          <div className="relative">
            <Table
              columns={columns}
              dataSource={filteredSubmissions}
              rowKey="id"
              loading={loading}
              scroll={{ x: 800, y: 400 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} pengajuan`,
                size: "small",
              }}
              size="small"
              className="responsive-table"
            />

            {/* Loading overlay when any status is being updated */}
            {Object.values(updatingStatus).some(Boolean) && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-blue-600 font-medium text-sm sm:text-base">
                    Memperbarui status...
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Custom CSS for responsive table */}
      <style jsx global>{`
        .responsive-table .ant-table {
          overflow-x: auto;
        }

        .responsive-table .ant-table-thead > tr > th,
        .responsive-table .ant-table-tbody > tr > td {
          white-space: nowrap;
          padding: 8px 12px;
        }

        .responsive-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
          color: #262626;
        }

        .responsive-table .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5;
        }

        @media (max-width: 768px) {
          .responsive-table .ant-table {
            font-size: 11px;
          }

          .responsive-table .ant-table-thead > tr > th,
          .responsive-table .ant-table-tbody > tr > td {
            padding: 4px 6px;
          }

          .responsive-table .ant-table-pagination {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
