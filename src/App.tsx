import './App.css'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Kiosk from './pages/Kiosk'
import UpdateMenu from './pages/UpdateMenu'
import InventoryMenu from './pages/InventoryMenu'
import Employee from './pages/Employee'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/updatemenu" element={<UpdateMenu />} />
        <Route path="/inventorymenu" element={<InventoryMenu />} />
        <Route path="/employee" element={<Employee />} />
      </Routes>
    </Router>
  )
}

export default App


