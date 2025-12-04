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

  const barData = {
    labels: ["8 am", "9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", "6 pm", "7 pm", "8 pm", "9 ap",],
    datasets: [
      {
        label: "Sales ($)",
        data: [120, 200, 150, 300, 250, 400, 350],
        backgroundColor: "rgba(37, 99, 235, 0.5)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Sales by Day",
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

        <section className="grid grid-cols-2 gap-6 w-full">
          <div className="bg-gray-50 border rounded-xl shadow-sm p-4 flex items-center justify-center h-80">
              <Bar data={barData} options={barOptions} />
          </div>

          <div className="bg-gray-50 border rounded-xl shadow-sm px-8 py-10 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-10 text-center">
              Order Statistics
            </h2>

            <div className="mb-10 text-center">
              <div className="text-xl font-medium mb-2">Total Sales</div>
              <div className="text-gray-500">(Value)</div>
            </div>

            <div className="mb-10 text-center">
              <div className="text-xl font-medium mb-2">Total Orders</div>
              <div className="text-gray-500">(Value)</div>
            </div>

            <div className="mb-10 text-center">
              <div className="text-xl font-medium mb-2">Total Tips</div>
              <div className="text-gray-500">(Value)</div>
            </div>


            <div className="w-full max-w-xs mt-4">
              <h3 className="text-xl font-medium text-center mb-4">
                Generate Reports
              </h3>

              <div className="space-y-3 mb-6">
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2 text-sm placeholder-gray-400"
                  placeholder="Date (YYYY-MM-DD)"
                />

                <button className="w-full border rounded-md px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200">
                  Generate X/Z Report
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
