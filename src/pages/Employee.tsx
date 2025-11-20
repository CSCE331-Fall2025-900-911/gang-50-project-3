import { useState, useRef, useLayoutEffect } from 'react'
import CashierNavbar from '../components/CashierNavbar'

export default function Employee() {
  const [employeeId, setEmployeeId] = useState('')
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  // --- Add this (same as UpdateMenu) ---
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
  // -------------------------------------

  const fetchEmployeeData = async () => {
    try {
      setError('')
      setEmployeeData(null)

      const res = await fetch(`/api/employees`)
      const data = await res.json()

      const found = data.find((emp: any) => emp.employee_id == employeeId)
      if (!found) {
        setError('Employee not found')
        return
      }

      setEmployeeData(found)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch employee data')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* Same structure as UpdateMenu */}
      <nav ref={headerRef as any} className="cashier-nav">
        <CashierNavbar />
      </nav>

      {/* Dynamically offset below navbar */}
      <div style={{ paddingTop: headerH }} className="flex-1">
        <div className="p-6 max-w-xl mx-auto">

          <h1 className="text-2xl font-bold mb-4">Employee Management</h1>

          <div className="bg-white p-4 rounded-xl shadow">
            <label className="block mb-2 font-semibold">Employee ID</label>

            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="Enter Employee ID"
            />

            <button
              onClick={fetchEmployeeData}
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              View Employee
            </button>

            {error && (
              <p className="text-red-500 mt-4 font-semibold">{error}</p>
            )}

            {employeeData && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
                <h2 className="text-lg font-semibold mb-2">Employee Data</h2>
                <p><strong>ID:</strong> {employeeData.employee_id}</p>
                <p><strong>Name:</strong> {employeeData.first_name} {employeeData.last_name}</p>
                <p><strong>Role:</strong> {employeeData.ismanager ? 'Manager' : 'Cashier'}</p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}
