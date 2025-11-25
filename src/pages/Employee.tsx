import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import ManagerNavbar from '../components/ManagerNavbar'

export default function Employee() {
  const [employeeId, setEmployeeId] = useState('')
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [error, setError] = useState('')
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newId, setNewId] = useState('')
  const [newManager, setNewManager] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [updateId, setUpdateId] = useState('')
  const [updateManager, setUpdateManager] = useState(false)
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

  const addEmployee = async () => {
    console.log("Add employee:", {
      first_name: newFirst,
      last_name: newLast,
      employee_id: newId,
      ismanager: newManager
    })

    setError("");
    try {
      const body = {
        employee_id: Number(newId),
        first_name: newFirst,
        last_name: newLast,
        ismanager: newManager
      };

      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to add employee");

      alert("Employee added successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to add employee");
    }
  }

  const deleteEmployee = async () => {
    console.log("Delete employee:", deleteId)

    setError("");
    try {
      const res = await fetch(`/api/employees/${Number(deleteId)}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete employee");

      alert("Employee deleted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete employee");
    }
  }

  const updateEmployee = async () => {
    console.log("Update employee:", {employee_id: updateId, ismanager: updateManager})

    setError("");
    try {
      const res = await fetch(`/api/employees/${Number(updateId)}/manager`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ismanager: updateManager }),
      });

      if (!res.ok) throw new Error("Failed to update employee");

      alert("Employee updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update employee");
    }
  }

  const inputBase = "block w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="min-h-screen bg-white text-gray-900">

      <nav ref={headerRef as any} className="cashier-nav fixed top-0 left-0 right-0 z-50">
        <ManagerNavbar />
      </nav>

      <main style={{ paddingTop: headerH }} className="p-6 max-w-7xl mx-auto overflow-y-auto">

        <h1 className="text-2xl font-bold mb-6">Employee Management</h1>

        <div className="Employee-grid">

          {/* Column 1: Lookup Employee */}
          <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
            <h2 className="mb-3 text-lg font-bold text-center text-black">Lookup Employee</h2>

            <label className="label-Employee">Employee ID:</label>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className={inputBase}
              placeholder="Enter Employee ID"
            />

            <div className="mt-auto pt-2">
              <button
                onClick={fetchEmployeeData}
                className="btn-Employee"
              >
                View Employee
              </button>
            </div>

            {error && <p className="text-red-500 mt-4 font-semibold">{error}</p>}

            {employeeData && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Employee Data</h3>
                <p><strong>ID:</strong> {employeeData.employee_id}</p>
                <p><strong>Name:</strong> {employeeData.first_name} {employeeData.last_name}</p>
                <p><strong>Role:</strong> {employeeData.ismanager ? 'Manager' : 'Cashier'}</p>
              </div>
            )}
          </section>

          {/* Column 2: Add Employee */}
          <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
            <h2 className="mb-3 text-lg font-bold text-center text-black">Add Employee</h2>

            <label className="label-Employee">First Name:</label>
            <input
              value={newFirst}
              onChange={(e) => setNewFirst(e.target.value)}
              className={inputBase}
              placeholder="Enter first name"
            />

            <label className="label-Employee">Last Name:</label>
            <input
              value={newLast}
              onChange={(e) => setNewLast(e.target.value)}
              className={inputBase}
              placeholder="Enter last name"
            />

            <label className="label-Employee">Employee ID:</label>
            <input
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              className={inputBase}
              placeholder="Enter unique ID"
            />

            <label className="label-Employee">Job Title:</label>
            <input
              type="checkbox"
              checked={newManager}
              onChange={(e) => setNewManager(e.target.checked)}
            />
            <span className="font-semibold">Is Manager (T/F)</span>

            

            <div className="mt-auto pt-2">
              <button
                onClick={addEmployee}
                className="btn-Employee"
              >
                Add Employee
              </button>
            </div>
          </section>

          {/* Column 3: Delete Employee and Modify Job Title*/}
          <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
            <h2 className="mb-3 text-lg font-bold text-center text-black">Delete Employee</h2>

            <label className="label-Employee">Employee ID:</label>
            <input
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
              className={inputBase}
              placeholder="Enter Employee ID"
            />

            <div className="mt-auto pt-2">
              <button
                onClick={deleteEmployee}
                className="btn-Employee"
              >
                Delete Employee
              </button>
            </div>

            {/* Modify Job Title */}
            <h2 className="mb-3 text-lg font-bold text-center text-black">Update Employee</h2>

            <label className="label-Employee">Employee ID:</label>
            <input
              value={updateId}
              onChange={(e) => setUpdateId(e.target.value)}
              className={inputBase}
              placeholder="Enter Employee ID"
            />

            <label className="label-Employee">Job Title:</label>
            <input
              type="checkbox"
              checked={updateManager}
              onChange={(e) => setUpdateManager(e.target.checked)}
            />
            <span className="font-semibold">Is Manager (T/F)</span>

            <div className="mt-auto pt-2">
              <button
                onClick={updateEmployee}
                className="btn-Employee"
              >
                Update Employee
              </button>
            </div>
          </section>

        </div>
      </main>

    </div>
  )
}
