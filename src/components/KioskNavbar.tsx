import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}


export default function KioskNavbar() {
  console.log('KioskNavbar render');

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

  // --- GOOGLE TRANSLATE LOADING LOGIC ---
  useEffect(() => {
    if (!showAccessibilityPopup) return;

    const elem = document.getElementById("google_translate_element");
    if (elem) elem.innerHTML = "";
    
    // Global callback for Google API
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
      );
    };

    // Load script only once
    const existingScript = document.querySelector("#google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    } else {
      // Re-init only after google translate API is fully ready
      const interval = setInterval(() => {
        if (window.google && window.google.translate) {
          window.googleTranslateElementInit?.();
          clearInterval(interval);
        }
      }, 50);
    }
  }, [showAccessibilityPopup]);

  // --- Adjust navbar for Google Translate banner ---
  useEffect(() => {
    const navbar = document.querySelector("nav");

    const observer = new MutationObserver(() => {
      // Google Translate banner iframe cannot be accessed directly
      const bannerIframe = document.querySelector(".goog-te-banner-frame");
      if (navbar) {
        if (bannerIframe) {
          // Assume fixed height of 40px
          (navbar as HTMLElement).style.top = `40px`;
        } else {
          (navbar as HTMLElement).style.top = `0px`;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const handleCancelOrder = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.style.filter = '';
    document.documentElement.style.fontSize = '16px';
    console.log("User canceled order out.");
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
      <div className="ShareTeaLogo">
        <img className="navLogo" src="/sharetealogo.png" alt="Share Tea Logo"/>
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
          <button className="logout" onClick={handleCancelOrder}>Cancel Order</button>
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

            {/* Google Translate */}
            <div style={{ margin: "1rem 0" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>Translate</h3>
              <div id="google_translate_element"></div>
            </div>

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
