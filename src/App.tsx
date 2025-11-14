import './App.css'
import Login from './pages/Login'
import Orders from './pages/Orders'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        `<Route path="/Orders" element={<Orders/>} />
         </Routes>
    </Router>
  )
}

export default App
