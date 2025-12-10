import { useState, useRef, useLayoutEffect, useEffect } from "react";
import ManagerNavbar from "../components/ManagerNavbar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type RecentOrder = {
  order_id: number;
  order_date: string;
  total_cost: number;
  item_count: number;
};

export default function Analytics() {
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(64);
  const [selectedDate, setSelectedDate] = useState("");
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);

  const HOUR_LABELS = [
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
    "9 PM",
  ];

  const [barData, setBarData] = useState<any>({
    labels: HOUR_LABELS,
    datasets: [
      {
        label: "Sales ($)",
        data: new Array(HOUR_LABELS.length).fill(0),
        backgroundColor: "rgba(197, 48, 48, 0.6)",
        borderColor: "rgba(197, 48, 48, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [productBarData, setProductBarData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "Product Usage / Sales",
        data: [],
        backgroundColor: "rgba(197, 48, 48, 0.6)",
        borderColor: "rgba(197, 48, 48, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [recentError, setRecentError] = useState("");

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => setHeaderH(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflowY;
    document.body.style.overflowY = "auto";
    return () => {
      document.body.style.overflowY = prev;
    };
  }, []);

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const productBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const fetchTotalSales = async () => {
    try {
      if (!selectedDate) return;

      const res = await fetch(`/api/sales/by-date/${selectedDate}`);
      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error body:", text);
        throw new Error(`Request failed with status ${res.status}`);
      }

      const sales_data = await res.json();
      const sales_total = Number(sales_data[0]?.total_cost) || 0;
      setTotalSales(sales_total);
    } catch (err) {
      console.error("Error fetching total sales", err);
    }
  };

  const fetchTotalOrders = async () => {
    try {
      if (!selectedDate) return;

      const res = await fetch(`/api/totalOrders/by-date/${selectedDate}`);
      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error body:", text);
        throw new Error(`Request failed with status ${res.status}`);
      }

      const order_data = await res.json();
      const order_total = Number(order_data[0]?.total_orders) || 0;
      setTotalOrders(order_total);
    } catch (err) {
      console.error("Error fetching total orders", err);
    }
  };

  const fetchHourlySales = async () => {
    try {
      if (!selectedDate) return;

      const res = await fetch(`/api/hourlySales/by-date/${selectedDate}`);
      if (!res.ok) {
        const text = await res.text();
        console.error("Hourly sales backend error body:", text);
        throw new Error(`Hourly sales request failed with status ${res.status}`);
      }

      const hourlyData = await res.json();
      const values = new Array(HOUR_LABELS.length).fill(0);

      hourlyData.forEach((row: any) => {
        const hour24 = Number(row.hour);
        const idx = hour24 - 8;

        if (idx >= 0 && idx < values.length) {
          values[idx] = Number(row.total_sales) || 0;
        }
      });

      setBarData({
        labels: HOUR_LABELS,
        datasets: [
          {
            label: "Sales ($)",
            data: values,
            backgroundColor: "rgba(197, 48, 48, 0.6)",
            borderColor: "rgba(197, 48, 48, 1)",
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching hourly sales", err);
    }
  };

  const fetchProductUsageReport = async () => {
    try {
      if (!startDate || !endDate) return;

      const res = await fetch(
        `/api/inventoryusage/by-date-range?startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Inventory usage backend error body:", text);
        throw new Error(
          `Inventory usage request failed with status ${res.status}`
        );
      }

      const data = await res.json();

      const labels = data.map((row: any) => row.ingredient_name);
      const values = data.map(
        (row: any) => Number(row.total_items_using_ingredient) || 0
      );

      setProductBarData((prev: any) => ({
        ...prev,
        labels,
        datasets: [
          {
            ...prev.datasets[0],
            label: "Inventory Used (Qty)",
            data: values,
          },
        ],
      }));
    } catch (err) {
      console.error("Error fetching inventory usage report", err);
    }
  };

  const fetchSalesReport = async () => {
  try {
    if (!startDate || !endDate) return;

    const res = await fetch(
      `/api/salesreport/by-date-range?startDate=${startDate}&endDate=${endDate}`
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("Sales report backend error body:", text);
      throw new Error(`Sales report request failed with status ${res.status}`);
    }

    type SalesReportRow = {
      sale_date: string;          // e.g. "2024-10-09" or "2024-10-09T00:00:00.000Z"
      total_sales: number | string;
    };

    const data: SalesReportRow[] = await res.json();

    const labels = data.map((row) => {
      // Take only the date part before any "T"
      const dateOnly = row.sale_date.split("T")[0];
      const [year, month, day] = dateOnly.split("-");
      return `${month}/${day}/${year}`;
    });

    const values = data.map((row) => Number(row.total_sales) || 0);

    setProductBarData((prev: any) => ({
      ...prev,
      labels,
      datasets: [
        {
          ...prev.datasets[0],
          label: "Total Sales ($)",
          data: values,
        },
      ],
    }));
  } catch (err) {
    console.error("Error fetching sales report", err);
  }
};

  const fetchReportData = async () => {
    if (!selectedDate) return;

    try {
      await Promise.all([fetchTotalSales(), fetchTotalOrders(), fetchHourlySales()]);
    } catch (err) {
      console.error("Error running report wrapper", err);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      setLoadingRecent(true);
      setRecentError("");


      const res = await fetch("/api/orders/recent?limit=10");
      if (!res.ok) {
        const text = await res.text();
        console.error("Recent orders backend error:", text);
        throw new Error(`Recent orders request failed: ${res.status}`);
      }

      const data = await res.json();
      setRecentOrders(
        data.map((row: any) => ({
          order_id: row.order_id,
          order_date: row.order_date,
          total_cost: Number(row.total_cost),
          item_count: row.item_count,
        }))
      );
    } catch (err: any) {
      console.error("Error fetching recent orders", err);
      setRecentError("Failed to load recent orders.");
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  return (
    <div className="update-page">
      <nav ref={headerRef as any}>
        <ManagerNavbar />
      </nav>

      <main className="update-main" style={{ paddingTop: headerH }}>
        {/* main analytics card, same style as employee/inventory */}
        <section className="update-card-big">
          <div className="update-table-header-row">
            <h2>Sales Analytics</h2>
          </div>

          <section>
              <div>
                <h2>Recent Orders</h2>
              </div>

              <div className="update-table-wrapper">
                <table className="update-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentError && (
                      <tr>
                        <td colSpan={4} className="update-empty">
                          {recentError}
                        </td>
                      </tr>
                    )}

                    {!recentError && !loadingRecent && recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="update-empty">
                          No recent orders found.
                        </td>
                      </tr>
                    )}

                    {loadingRecent && (
                      <tr>
                        <td colSpan={4} className="update-empty">
                          Loading…
                        </td>
                      </tr>
                    )}

                    {!loadingRecent &&
                      !recentError &&
                      recentOrders.map((o) => (
                        <tr key={o.order_id}>
                          <td>{o.order_id}</td>
                          <td>
                            {new Date(o.order_date).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>{o.item_count}</td>
                          <td>${o.total_cost.toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

          <div className="analytics-card-body">
            {/* X/Z hourly report */}
            <section className="analytics-section">
              <h2 className="analytics-section-title">X/Z Report</h2>
              <div className="analytics-chart-wrapper">
                <Bar data={barData} options={barOptions} />
              </div>
            </section>
            {/* order stats + date picker */}
            <div className="Analytics-grid">
              <section className="analytics-small-card">
                <h3 className="analytics-section-title">Order Statistics</h3>

                <div className="analytics-stat-label">Total Sales:</div>
                <div className="analytics-stat-value">
                  {totalSales !== null ? `$${totalSales.toFixed(2)}` : "(Value)"}
                </div>

                <div className="analytics-stat-label" style={{ marginTop: "1rem" }}>
                  Total Orders:
                </div>
                <div className="analytics-stat-value">
                  {totalOrders !== null ? totalOrders : "(Value)"}
                </div>
              </section>

              <section className="analytics-small-card">
                <h3 className="analytics-section-title">Generate Daily Report</h3>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="analytics-date-input"
                />

                <button
                  id="reportButton"
                  onClick={fetchReportData}
                  className="reportButton analytics-report-btn"
                >
                  Generate X/Z Report
                </button>
              </section>
            </div>

            {/* product usage & sales report */}
            <section className="analytics-product-card">
              <h2 className="analytics-section-title">
                Product Usage &amp; Sales Report
              </h2>

              <div className="analytics-product-grid">
                <div className="analytics-product-chart">
                  <Bar data={productBarData} options={productBarOptions} />
                </div>

                <div className="analytics-product-controls">
                  <div className="analytics-input-group">
                    <label className="analytics-input-label">Start: </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="analytics-date-input"
                    />
                  </div>

                  <div className="analytics-input-group">
                    <label className="analytics-input-label">End: </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="analytics-date-input"
                    />
                  </div>

                  <button
                    className="reportButton analytics-report-btn"
                    onClick={fetchProductUsageReport}
                  >
                    Product Usage Report
                  </button>

                  <button
                    className="reportButton analytics-report-btn"
                    onClick={fetchSalesReport}
                  >
                    Sales Report
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
