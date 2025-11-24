export default function ManagerNavbar() {
  return (
    <nav>
      <div className="leftSideNav">
        <div>
          <img className="navLogo" src="/sharetealogo.png" alt="Share Tea Logo"/>
        </div>
        <div className="pageItem">
          <p>Analytics</p>
          <p>Items</p>
          <p>Manage Employees</p>
          <p>Inventory</p>
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
          <button className="logout">Logout</button>
        </div>
      </div>
    </nav>
  );
}
