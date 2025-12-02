import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import ManagerNavbar from '../components/ManagerNavbar'


export default function Analytics() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerH, setHeaderH] = useState(64);

   useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => setHeaderH(el.getBoundingClientRect().height)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflowY;
    document.body.style.overflowY = "auto";     
    return () => { document.body.style.overflowY = prev || "hidden"; };
}, []);

  return (
    <div id="rootPane" className="min-h-screen flex flex-col bg-white text-gray-900">
      <nav ref={headerRef as any} className="cashier-nav">
        <ManagerNavbar />
      </nav>
      <div style={{ paddingTop: headerH }} className="flex-1">
        {Analytics}
      </div>
    </div>
  );
}
