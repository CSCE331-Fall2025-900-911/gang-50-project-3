import './App.css';
import Login from './pages/Login';
import Orders from './pages/Orders';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/orders"
          element={
            <Orders activeTab={activeTab} setActiveTab={setActiveTab} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;



