import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import ManagerNavbar from '../components/ManagerNavbar'

export default function Analytics() {
  
  const headerRef = useRef<HTMLElement | null>(null)
  const [headerH, setHeaderH] = useState(64)

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
    <div className="min-h-screen bg-white text-gray-900">

      <nav ref={headerRef as any} className="cashier-nav fixed top-0 left-0 right-0 z-50">
        <ManagerNavbar />
      </nav>

      <main style={{ paddingTop: headerH }} className="p-6 max-w-7xl mx-auto overflow-y-auto">

        <h1 className="text-2xl font-bold mb-6">Sales Analytics</h1>

      </main>

    </div>
  )
}
