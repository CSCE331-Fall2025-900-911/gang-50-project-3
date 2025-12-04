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
  const [selectedDate, setSelectedDate] = useState("");   // date input
  const [salesError, setSalesError] = useState("");       // error message
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

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "X/Z Report",
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

  const fetchDailySales = async () => {
    
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
            <h2 className="mb-3 text-lg font-bold text-center text-black">X/Z Report</h2>
        
            {/* Chart container */}
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
              <div className="text-gray-500">(Value)</div>
            </div>
        
            <div className="mb-8 text-center">
              <div className="text-xl font-medium mb-2">Total Orders</div>
              <div className="text-gray-500">(Value)</div>
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
                
                <button
                  onClick={fetchDailySales}
                  className="w-full border rounded-md px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200"
                >
                  Generate X/Z Report
                </button>
                
                {salesError && (
                  <p className="mt-2 text-sm text-red-500 font-semibold">{salesError}</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
