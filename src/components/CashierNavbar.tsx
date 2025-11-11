export default function CashierNavbar() {
  return (
    <nav>
      <div className="ShareTeaLogo">
        <img className="navLogo" src="/sharetealogo.png" alt="Share Tea Logo"/>
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
