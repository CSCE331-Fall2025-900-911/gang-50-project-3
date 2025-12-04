import { useState, useRef, useLayoutEffect, useEffect, useMemo } from "react";
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

const HOUR_OPTIONS = [
  "Full Day (Z-Report)",
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

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function convertTo24Hour(option: string): number {
  switch (option) {
    case "8 AM":  return 8;
    case "9 AM":  return 9;
    case "10 AM": return 10;
    case "11 AM": return 11;
    case "12 PM": return 12;
    case "1 PM":  return 13;
    case "2 PM":  return 14;
    case "3 PM":  return 15;
    case "4 PM":  return 16;
    case "5 PM":  return 17;
    case "6 PM":  return 18;
    case "7 PM":  return 19;
    case "8 PM":  return 20;
    case "9 PM":  return 21;
    default:
      throw new Error(`Invalid hour option: ${option}`);
  }
}

export default function Analytics() {
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(64);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHourOption, setSelectedHourOption] = useState(
    "Full Day (Z-Report)"
  );

  const [salesError, setSalesError] = useState("");

  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [totalTips, setTotalTips] = useState<number | null>(null);

  const [reportTitle, setReportTitle] = useState("X/Z Report");

  const [barData, setBarData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: "Sales ($)",
        data: [] as number[],
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

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom" as const,
        },
        title: {
          display: true,
          text: reportTitle,
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
    }),
    [reportTitle]
  );

  const fetchDailySales = async () => {
    if (!selectedDate) {
      setSalesError("Please select a date to generate the report.");
      return;
    }

    try {
      setSalesError("");

      const isZReport = selectedHourOption === "Full Day (Z-Report)";
      const params = new URLSearchParams({
        date: selectedDate,
        mode: isZReport ? "z" : "x",
      });

      if (!isZReport) {
        const hour24 = convertTo24Hour(selectedHourOption);
        params.set("hour", String(hour24));
      }

      const res = await fetch(`/api/analytics/xz-report?${params.toString()}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to fetch X/Z report");
      }

      const data: {
        totals: { totalSales: number; totalOrders: number; totalTips: number };
        hourlySales: { hour: number; totalSales: number }[];
      } = await res.json();

      // Totals
      setTotalSales(data.totals.totalSales);
      setTotalOrders(data.totals.totalOrders);
      setTotalTips(data.totals.totalTips);

      // Chart title
      setReportTitle(isZReport ? "Z-Report (Full Day)" : "X-Report (Partial Day)");

      // Build hourly chart
      const HOURS_OPEN_START = 8;
      const HOURS_OPEN_END = isZReport
        ? 21 // full day: 8–21
        : convertTo24Hour(selectedHourOption); // X-report: 8–selected hour

      const hourlyMap = new Map<number, number>();
      for (const h of data.hourlySales) {
        hourlyMap.set(h.hour, h.totalSales);
      }

      const labels: string[] = [];
      const values: number[] = [];

      for (let hour = HOURS_OPEN_START; hour <= HOURS_OPEN_END; hour++) {
        labels.push(formatHour(hour));
        values.push(hourlyMap.get(hour) ?? 0);
      }

      setBarData((prev) => ({
        ...prev,
        labels,
        datasets: [
          {
            ...prev.datasets[0],
            data: values,
          },
        ],
      }));
    } catch (err: any) {
      console.error(err);
      setSalesError(err.message || "Error loading X/Z report.");

      // Clear old data on error (optional)
      setBarData((prev) => ({
        ...prev,
        labels: [],
        datasets: [{ ...prev.datasets[0], data: [] }],
      }));
      setTotalSales(null);
      setTotalOrders(null);
      setTotalTips(null);
      setReportTitle("X/Z Report");
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

        <div className="Analytics-grid">
          {/* Column 1: Chart */}
          <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
            <h2 className="mb-3 text-lg font-bold text-center text-black">
              X/Z Report
            </h2>

            <div className="relative h-96">
              <Bar data={barData} options={barOptions} />
            </div>
          </section>

          {/* Column 2: Order statistics + Report controls */}
          <section className="rounded-2xl border p-4 shadow-sm flex flex-col items-center">
            <h2 className="mb-6 text-lg font-bold text-center text-black">
              Order Statistics
            </h2>

            <div className="mb-8 text-center">
              <div className="text-xl font-medium mb-2">Total Sales</div>
              <div className="text-gray-500">
                {totalSales !== null ? `$${totalSales.toFixed(2)}` : "--"}
              </div>
            </div>

            <div className="mb-8 text-center">
              <div className="text-xl font-medium mb-2">Total Orders</div>
              <div className="text-gray-500">
                {totalOrders !== null ? totalOrders : "--"}
              </div>
            </div>

            <div className="mb-8 text-center">
              <div className="text-xl font-medium mb-2">Total Tips</div>
              <div className="text-gray-500">
                {totalTips !== null ? `$${totalTips.toFixed(2)}` : "--"}
              </div>
            </div>

            <div className="w-full max-w-xs mt-auto">
              <h3 className="text-xl font-medium text-center mb-4">
                Generate Reports
              </h3>

              <div className="space-y-3 mb-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm placeholder-gray-400"
                />

                <select
                  value={selectedHourOption}
                  onChange={(e) => setSelectedHourOption(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  {HOUR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchDailySales}
                  className="w-full border rounded-md px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200"
                >
                  Generate X/Z Report
                </button>

                {salesError && (
                  <p className="mt-2 text-sm text-red-500 font-semibold">
                    {salesError}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
