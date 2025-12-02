import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import ManagerNavbar from '../components/ManagerNavbar'

export default function Analytics() {

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

        <h1 className="text-2xl font-bold mb-6">Sales Analytics</h1>

      </main>

    </div>
  )
}
