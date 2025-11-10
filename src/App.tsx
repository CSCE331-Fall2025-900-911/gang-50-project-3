import './App.css'
import Login from './pages/Login'
import Orders from './pages/Orders'
import  {Customization} from './pages/Customization'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        `<Route path="/Orders" element={<Orders/>} />
        <Route path="/Customization" element={<Customization />} />
      </Routes>
    </Router>
  )
}

export default App
