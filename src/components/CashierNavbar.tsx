import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export default function CashierNavbar() {
  const navigate = useNavigate();
  const [showAccessibilityPopup, setShowAccessibilityPopup] = useState(false);

  // Initialize from localStorage only once
  const [fontSize, setFontSize] = useState(
    () => Number(localStorage.getItem("fontSize")) || 16
  );
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem("highContrast") === "true"
  );

  /* ---------- FONT SIZE ---------- */

  const applyFontSize = (size: number) => {
    const currentSize = parseInt(
      getComputedStyle(document.documentElement).fontSize,
      10
    );
    if (currentSize !== size) {
      document.documentElement.style.fontSize = `${size}px`;
      localStorage.setItem("fontSize", size.toString());
    }
  };

  /* ---------- HIGH CONTRAST (class on <body>) ---------- */

  const applyContrastMode = (enabled: boolean) => {
    const body = document.body;
    if (!body) return;

    if (enabled) {
      body.classList.add("high-contrast");
    } else {
      body.classList.remove("high-contrast");
    }

    localStorage.setItem("highContrast", enabled.toString());
  };

  // Apply saved settings on first mount
  useLayoutEffect(() => {
    applyFontSize(fontSize);
    applyContrastMode(highContrast);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (!showAccessibilityPopup) return;

    const elem = document.getElementById("google_translate_element");
    if (elem) elem.innerHTML = "";

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
      );
    };

    const existingScript = document.querySelector("#google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.translate) {
          window.googleTranslateElementInit?.();
          clearInterval(interval);
        }
      }, 50);
    }
  }, [showAccessibilityPopup]);

  useEffect(() => {
    const navbar = document.querySelector("nav");

    const observer = new MutationObserver(() => {
      const bannerIframe = document.querySelector(".goog-te-banner-frame");
      if (navbar) {
        (navbar as HTMLElement).style.top = bannerIframe ? "40px" : "0px";
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);


  const handleCancelOrder = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.style.fontSize = "16px";
    document.body.classList.remove("high-contrast");
    console.log("User canceled order.");
    navigate("/");
  };

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

  /* ---------- CONTRAST TOGGLE ---------- */

  const toggleContrastMode = () => {
    setHighContrast(prev => {
      const next = !prev;
      applyContrastMode(next);
      return next;
    });
  };

  return (
    <nav>
      <div className="FifTeaLogo">
        <img className="navLogo" src="/FifteaLogo.png" alt="FifTea Logo" />
      </div>

      <div className="pages">
        <div
          className="navItem"
          onClick={() => setShowAccessibilityPopup(true)}
          style={{ cursor: "pointer" }}
        >
          <img
            className="navIcon"
            src="/Accessibility.svg"
            alt="Accessibility Icon"
          />
          <p>Accessibility</p>
        </div>

        <div className="navItem">
          <button className="logout" onClick={handleCancelOrder}>
            Cancel Order
          </button>
        </div>
      </div>

      {/* ACCESSIBILITY POPUP */}
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
          <div className="weather-modal">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2>Accessibility Settings</h2>
              <button
                className="logout"
                onClick={() => setShowAccessibilityPopup(false)}
                style={{ width: 40, height: 40, padding: 10, marginTop: 15 }}
              >
                X
              </button>
            </div>
            <h3 style={{ marginBottom: "1rem" }}>Adjust Display Font Size</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <button className="btn" onClick={handleDecreaseFont}>
                A-
              </button>
              <button className="btn" onClick={handleIncreaseFont}>
                A+
              </button>
            </div>
            <p style={{ marginTop: "0.5rem" }}>Current Size: {fontSize}px</p>
            <button
              className="logout"
              onClick={handleResetFont}
              style={{ marginTop: "0.5rem" }}
            >
              Reset to Default
            </button>

            <hr style={{ margin: "1rem 0" }} />

            <div style={{ margin: "1rem 0" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>Translate</h3>
              <div id="google_translate_element" />
            </div>

            <hr style={{ margin: "1rem 0" }} />

            <h3 style={{ marginBottom: "0.5rem" }}>High Contrast Mode</h3>
            <button className="logout" onClick={toggleContrastMode}>
              {highContrast ? "Disable" : "Enable"}
            </button>

            
          </div>
        </div>
      )}

    </nav>
  );
}
