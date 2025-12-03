import { useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ManagerNavbar() {
  const navigate = useNavigate();
  const [showAccessibilityPopup, setShowAccessibilityPopup] = useState(false);

  // Initialize from localStorage only once
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("fontSize")) || 16);
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("highContrast") === "true");

  const applyFontSize = (size: number) => {
    const currentSize = parseInt(getComputedStyle(document.documentElement).fontSize, 10);
    if (currentSize !== size) {
      document.documentElement.style.fontSize = `${size}px`;
      localStorage.setItem("fontSize", size.toString());
    }
  };

  const applyContrastMode = (enabled: boolean) => {
    const currentFilter = document.documentElement.style.filter;
    const desiredFilter = enabled ? "invert(1) hue-rotate(180deg)" : "";
    if (currentFilter !== desiredFilter) {
      document.documentElement.style.filter = desiredFilter;
      localStorage.setItem("highContrast", enabled.toString());
    }
  };

  // Apply saved settings
  useLayoutEffect(() => {
    applyFontSize(fontSize);
    applyContrastMode(highContrast);
  }, []);

  const handleLogout = () => {
    // Reset styles
    document.documentElement.style.fontSize = '16px';
    document.documentElement.style.filter = "";

    localStorage.clear();
    sessionStorage.clear();
    console.log("User logged out.");
    navigate("/");
  };

  // Font Size Handlers
  const handleIncreaseFont = () => {
    const newSize = fontSize + 2;
    setFontSize(newSize);
    applyFontSize(newSize);
  };
  const handleDecreaseFont = () => {
    const newSize = fontSize - 2 >= 10 ? fontSize - 2 : 10;
    setFontSize(newSize);
    applyFontSize(newSize);
  };
  const handleResetFont = () => {
    setFontSize(16);
    applyFontSize(16);
  };

  // Contrast Mode Handler
  const toggleContrastMode = () => {
    const newMode = !highContrast;
    setHighContrast(newMode);
    applyContrastMode(newMode);
  };

  return (
    <nav>
      <div className="leftSideNav">
        <div>
          <img className="navLogo" src="/sharetealogo.png" alt="Share Tea Logo"/>
        </div>
        <div className="pageItem">
          <a href="/Analytics">Analytics</a>
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

        <div 
          className="navItem" 
          onClick={() => setShowAccessibilityPopup(true)}
          style={{ cursor: "pointer" }}
        >
          <img className="navIcon" src="/Accessibility.svg" alt="Accessibility Icon" />
          <p>Accessibility</p>
        </div>

        <div className="navItem">
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {showAccessibilityPopup && (
        <div
          className="popup-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div
            className="popup-content"
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
              textAlign: "center"
            }}
          >
            <h2>Accessibility Settings</h2>

            <p style={{ marginBottom: "1rem" }}>Adjust Display Font Size</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <button className="btn" onClick={handleDecreaseFont}>A-</button>
              <button className="btn" onClick={handleIncreaseFont}>A+</button>
            </div>
            <p style={{ marginTop: "0.5rem" }}>Current Size: {fontSize}px</p>
            <button className="btn" onClick={handleResetFont} style={{ marginTop: "0.5rem" }}>
              Reset to Default
            </button>

            <hr style={{ margin: "1rem 0" }} />
            <p style={{ marginBottom: "0.5rem" }}>High Contrast Mode</p>
            <button className="btn" onClick={toggleContrastMode}>
              {highContrast ? "Disable" : "Enable"}
            </button>

            <div style={{ marginTop: "1.5rem" }}>
              <button className="btn" onClick={() => setShowAccessibilityPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
