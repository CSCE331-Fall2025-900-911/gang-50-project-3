import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import ManagerNavbar from '../components/ManagerNavbar'

type Employee = {
  employee_id: number
  first_name: string
  last_name: string
  ismanager: boolean
  hours_worked?: number
  total_sales?: number
  items_sold?: number
}

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // add form
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newManager, setNewManager] = useState(false)

  // for editting names
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editManager, setEditManager] = useState(false)

  const headerRef = useRef<HTMLElement | null>(null)
  const [headerH, setHeaderH] = useState(64)

  /* keep navbar height + body scroll handling */
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
    const prev = document.body.style.overflowY
    document.body.style.overflowY = 'auto'
    return () => {
      document.body.style.overflowY = prev || 'hidden'
    }
  }, [])

  // ---------------- API helpers ----------------

  const loadEmployees = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/employees')
      if (!res.ok) throw new Error('Failed to load employees')
      const data = await res.json()
      setEmployees(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const addEmployee = async () => {
    if (!newFirst || !newLast ) {
      setError('Please fill out all fields for the new employee.')
      return
    }

    try {
      setError('')
      const body = {
        first_name: newFirst,
        last_name: newLast,
        ismanager: newManager,
      }

      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to add employee')
      setNewFirst('')
      setNewLast('')
      setNewManager(false)
      await loadEmployees()
      alert("Added new employee!");
    } catch (err) {
      console.error(err)
      setError('Failed to add employee')
    }
  }

  const deleteEmployee = async (id: number) => {
    if (!window.confirm('Delete this employee?')) return
    try {
      setError('')
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete employee')
      await loadEmployees()
    } catch (err) {
      console.error(err)
      setError('Failed to delete employee')
    }
  }

    const startEditEmployee = (emp: Employee) => {
    setEditingId(emp.employee_id);
    setEditFirst(emp.first_name);
    setEditLast(emp.last_name);
    setEditManager(emp.ismanager);
    setError('');
  };

  const cancelEditEmployee = () => {
    setEditingId(null);
    setEditFirst('');
    setEditLast('');
    setEditManager(false);
  };

  const saveEditEmployee = async () => {
    if (editingId === null) return;

    if (!editFirst.trim() || !editLast.trim()) {
      setError('First and last name cannot be empty.');
      return;
    }

    try {
      setError('');
      const res = await fetch(`/api/employees/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editFirst.trim(),
          last_name: editLast.trim(),
          ismanager: editManager,
        }),
      });

      if (!res.ok) throw new Error('Failed to update employee');

      await loadEmployees();
      cancelEditEmployee();
      alert('Updated employee info!');
    } catch (err) {
      console.error(err);
      setError('Failed to update employee');
    }
  };


  // ---------------- JSX ----------------

  return (
    <div className="employee-page">
      <nav ref={headerRef as any}>
        <ManagerNavbar />
      </nav>

      <main className="employee-main" style={{ paddingTop: headerH }}>

        {error && <div className="employee-error-banner">{error}</div>}

        <section className="employee-table-card">
          <div className="employee-table-header-row">
            <h2>Employee List</h2>
          </div>

          <div className="employee-table-wrapper">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Position</th>
                  <th className="employee-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="employee-empty">
                      No employees found.
                    </td>
                  </tr>
                )}

                {employees.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td>{emp.employee_id}</td>
                    <td>
                      {editingId === emp.employee_id ? (
                        <input
                          className="employee-input employee-input--inline"
                          value={editFirst}
                          onChange={(e) => setEditFirst(e.target.value)}
                        />
                      ) : (
                        emp.first_name
                      )}
                    </td>
                    <td>
                      {editingId === emp.employee_id ? (
                        <input
                          className="employee-input employee-input--inline"
                          value={editLast}
                          onChange={(e) => setEditLast(e.target.value)}
                        />
                      ) : (
                        emp.last_name
                      )}
                    </td>
                    <td>
                      {editingId === emp.employee_id ? (
                        <select
                          className="employee-input employee-input--inline"
                          value={editManager ? 'manager' : 'cashier'}
                          onChange={(e) => setEditManager(e.target.value === 'manager')}
                        >
                          <option value="cashier">Cashier</option>
                          <option value="manager">Manager</option>
                        </select>
                      ) : (
                        <span
                          className={
                            emp.ismanager
                              ? 'employee-role-pill employee-role-manager'
                              : 'employee-role-pill employee-role-cashier'
                          }
                        >
                          {emp.ismanager ? 'Manager' : 'Cashier'}
                        </span>
                      )}
                    </td>
                    <td className="employee-actions-cell">
                      {editingId === emp.employee_id ? (
                        <>
                          <button
                            className="btn-Employee"
                            onClick={saveEditEmployee}
                          >
                            Save
                          </button>
                          <button
                            className="btn-Employee btn-Employee--outline"
                            onClick={cancelEditEmployee}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-Employee btn-Employee--outline"
                            onClick={() => startEditEmployee(emp)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-Employee btn-Employee--danger-outline"
                            onClick={() => deleteEmployee(emp.employee_id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add employee inline form */}
          <div className="employee-add-row">
            <h2>Add Employee</h2>
            <div className="employee-add-fields">
              <div className="employee-field">
                <label className="label-Employee">First Name</label>
                <input
                  className="employee-input"
                  value={newFirst}
                  onChange={(e) => setNewFirst(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="employee-field">
                <label className="label-Employee">Last Name</label>
                <input
                  className="employee-input"
                  value={newLast}
                  onChange={(e) => setNewLast(e.target.value)}
                  placeholder="Last name"
                />
              </div>
              <label className="employee-checkbox-row employee-add-checkbox">
                <input
                  type="checkbox"
                  checked={newManager}
                  onChange={(e) => setNewManager(e.target.checked)}
                />
                <span>
                  Is Manager{' '}
                </span>
              </label>
              <div className="employee-add-button-wrap">
                <button className="btn-Employee" onClick={addEmployee}>
                  Add
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
