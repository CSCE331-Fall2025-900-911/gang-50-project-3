import { useNavigate } from "react-router-dom";

export default function ManagerNavbar() {
  
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.clear();
    sessionStorage.clear();

    console.log("User logged out.");

    navigate("/");
  };
  
  return (
    <nav>
      <div className="leftSideNav">
        <div>
          <img className="navLogo" src="/sharetealogo.png" alt="Share Tea Logo"/>
        </div>
        <div className="pageItem">
          <p>Analytics</p>
          <a href="/UpdateMenu">Items</a>
          <a href="/Employee">Employees</a>
          <a href="/inventorymenu">Inventory</a>
        </div>
      </div>


      <div className="pages">

        <div className="navItem">
          <img className="navIcon" src="/Sun.svg" alt="Weather" />
          <p>72° F</p>
        </div>

        <div className="navItem">
          <img className="navIcon" src="/Accessibility.svg" alt="Accessibility Icon" />
          <p>Accessibility</p>
        </div>

        <div className="navItem">
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
