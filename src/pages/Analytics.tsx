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
      console.log("Date submitting:", selectedDate);
      if (!selectedDate) {
        console.warn("No date selected");
        return;
      }

      const res = await fetch(`/api/sales/by-date/${selectedDate}`);
      console.log("Response status:", res.status);

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
      console.log("Date submitting:", selectedDate);
      if (!selectedDate) {
        console.warn("No date selected");
        return;
      }

      const res = await fetch(`/api/totalOrders/by-date/${selectedDate}`);
      console.log("Response status:", res.status);

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
      console.log("Fetching hourly sales for:", selectedDate);

      const res = await fetch(`/api/hourlySales/by-date/${selectedDate}`);
      console.log("Hourly sales response status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("Hourly sales backend error body:", text);
        throw new Error(`Hourly sales request failed with status ${res.status}`);
      }

      const hourlyData = await res.json();
      console.log("Hourly sales data:", hourlyData);

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
      if (!startDate || !endDate) {
        console.warn("Start and end dates are required for inventory usage");
        return;
      }
  
      console.log("Fetching inventory usage for range:", startDate, "to", endDate);
  
      const res = await fetch(
        `/api/inventoryusage/by-date-range?startDate=${startDate}&endDate=${endDate}`
      );
      console.log("Inventory usage response status:", res.status);
  
      if (!res.ok) {
        const text = await res.text();
        console.error("Inventory usage backend error body:", text);
        throw new Error(
          `Inventory usage request failed with status ${res.status}`
        );
      }
  
      const data = await res.json();
      console.log("Inventory usage data:", data);
  
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
      if (!startDate || !endDate) {
        console.warn("Start and end dates are required");
        return;
      }

      console.log("Fetching sales report for range:", startDate, "to", endDate);

      const res = await fetch(
        `/api/salesreport/by-date-range?startDate=${startDate}&endDate=${endDate}`
      );
      console.log("Sales report response status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("Sales report backend error body:", text);
        throw new Error(`Sales report request failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("Sales report data:", data);

      const labels = data.map((row: any) =>
        new Date(row.sale_date).toLocaleDateString()
      );
      const values = data.map((row: any) => Number(row.total_sales) || 0);

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
    if (!selectedDate) {
      console.warn("No date selected");
      return;
    }

    try {
      await Promise.all([
        fetchTotalSales(),
        fetchTotalOrders(),
        fetchHourlySales(),
      ]);
      console.log("Report data updated.");
    } catch (err) {
      console.error("Error running report wrapper", err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav
        ref={headerRef}
        className="cashier-nav fixed top-0 left-0 right-0 z-50"
      >
        <ManagerNavbar />
      </nav>

      <main
        style={{ paddingTop: headerH }}
        className="p-6 max-w-7xl mx-auto overflow-y-auto"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Sales Analytics
        </h1>

        {/* X/Z hourly report */}
        <section className="rounded-2xl border p-4 shadow-sm flex flex-col max-w-5xl mx-auto">
          <h2 className="mb-3 text-lg font-bold text-center text-black">
            X/Z Report
          </h2>

          <div className="relative h-[70vh] w-full">
            <Bar data={barData} options={barOptions} />
          </div>
        </section>

        {/* Order stats + daily report controls */}
        <div className="Analytics-grid max-w-5xl mx-auto mt-10">
          <section className="rounded-2xl border p-6 shadow-sm text-center">
            <h2 className="text-lg font-bold mb-4">Order Statistics</h2>

            <div className="text-xl font-medium mb-2">Total Sales</div>
            <div className="text-gray-500 mb-4">
              {totalSales !== null ? `$${totalSales.toFixed(2)}` : "(Value)"}
            </div>

            <div className="text-xl font-medium mb-2">Total Orders</div>
            <div className="text-gray-500">
              {totalOrders !== null ? totalOrders : "(Value)"}
            </div>
          </section>

          <section className="rounded-2xl border p-6 shadow-sm text-center">
            <h2 className="text-lg font-bold mb-4">Generate Report</h2>

            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />

              <button
                id="reportButton"
                onClick={fetchReportData}
                className="reportButton w-3/4 mt-4"
              >
                Generate X/Z Report
              </button>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border p-4 shadow-sm max-w-5xl mx-auto mt-8">
          <h2 className="mb-3 text-lg font-bold text-center text-black">
            Product Usage &amp; Sales Report
          </h2>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 relative h-[50vh] w-full">
              <Bar data={productBarData} options={productBarOptions} />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Start -
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  End -
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <button
                className="reportButton w-full"
                onClick={fetchProductUsageReport}
              >
                Generate Product Usage Report
              </button>

              <button
                className="reportButton w-full"
                onClick={fetchSalesReport}
              >
                Generate Sales Report
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
