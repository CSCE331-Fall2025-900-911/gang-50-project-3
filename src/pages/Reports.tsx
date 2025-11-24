import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import CashierNavbar from '../components/CashierNavbar'

export default function Reports() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerH, setHeaderH] = useState(64);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => setHeaderH(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflowY;
    document.body.style.overflowY = "auto";
    return () => {
      document.body.style.overflowY = prev || "hidden";
    };
  }, []);

  return (
    <div
      id="rootPane"
      className="min-h-screen flex flex-col bg-white text-gray-900"
    >
      <nav ref={headerRef as any} className="cashier-nav">
        <CashierNavbar />
      </nav>

      {/* Main content area, offset by navbar height */}
      <div style={{ paddingTop: headerH }} className="flex-1">
        <div className="mx-auto max-w-6xl p-6">
          {/* Put your reports UI here */}
          <h1 className="text-2xl font-bold mb-4">Reports</h1>
          <p className="text-gray-700">
            Coming soon: sales reports, daily summaries, etc.
          </p>
        </div>
      </div>
    </div>
  );
}
