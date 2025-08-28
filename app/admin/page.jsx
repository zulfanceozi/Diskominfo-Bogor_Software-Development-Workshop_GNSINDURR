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

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/admin/submissions");
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data);
        updateChartData(data);
      } else {
        message.error("Gagal memuat data pengajuan");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
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
    try {
      const response = await fetch(
        `/api/admin/submissions/${submissionId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        message.success("Status berhasil diupdate");
        fetchSubmissions(); // Refresh data
      } else {
        const error = await response.json();
        message.error(error.message || "Gagal mengupdate status");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
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
      render: (text) => <span className="font-mono">{text}</span>,
    },
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Jenis Layanan",
      dataIndex: "jenis_layanan",
      key: "jenis_layanan",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 150 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="PENGAJUAN_BARU">Pengajuan Baru</Option>
          <Option value="DIPROSES">Sedang Diproses</Option>
          <Option value="SELESAI">Selesai</Option>
          <Option value="DITOLAK">Ditolak</Option>
        </Select>
      ),
    },
    {
      title: "Tanggal",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("id-ID"),
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola pengajuan layanan masyarakat
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchSubmissions}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <Row gutter={16} className="mb-8">
          <Col span={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {submissions.length}
                </div>
                <div className="text-gray-600">Total Pengajuan</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    submissions.filter((s) => s.status === "PENGAJUAN_BARU")
                      .length
                  }
                </div>
                <div className="text-gray-600">Pengajuan Baru</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {submissions.filter((s) => s.status === "DIPROSES").length}
                </div>
                <div className="text-gray-600">Sedang Diproses</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {submissions.filter((s) => s.status === "SELESAI").length}
                </div>
                <div className="text-gray-600">Selesai</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Chart */}
        <Card title="Distribusi Status Pengajuan" className="mb-8">
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
        </Card>

        {/* Table */}
        <Card title="Daftar Pengajuan">
          <div className="mb-4">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 200 }}
              placeholder="Filter by status"
            >
              <Option value="ALL">Semua Status</Option>
              <Option value="PENGAJUAN_BARU">Pengajuan Baru</Option>
              <Option value="DIPROSES">Sedang Diproses</Option>
              <Option value="SELESAI">Selesai</Option>
              <Option value="DITOLAK">Ditolak</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredSubmissions}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} pengajuan`,
            }}
          />
        </Card>
      </div>
    </div>
  );
}
