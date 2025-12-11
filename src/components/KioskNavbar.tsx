import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export default function KioskNavbar() {
  const navigate = useNavigate();
  const [showAccessibilityPopup, setShowAccessibilityPopup] = useState(false);
  const [showWeatherPopup, setShowWeatherPopup] = useState(false);

  interface WeatherData {
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
    };
    weather: {
      description: string;
    }[];
    wind: {
      speed: number;
    };
  }

  const [weather, setWeather] = useState<WeatherData | null>(null);

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

  /* ---------- GOOGLE TRANSLATE ---------- */

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

  /* ---------- NAVBAR OFFSET FOR GT BANNER ---------- */

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

  /* ---------- WEATHER ---------- */

  useEffect(() => {
    if (!showWeatherPopup) return;

    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/weather?lat=30.6280&lon=-96.3344`);
        const data = await res.json();
        setWeather(data);
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };

    fetchWeather();
  }, [showWeatherPopup]);

  /* ---------- CANCEL ORDER ---------- */

  const handleCancelOrder = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.style.fontSize = "16px";
    document.body.classList.remove("high-contrast");
    console.log("User canceled order.");
    navigate("/");
  };

  /* ---------- FONT SIZE HANDLERS ---------- */

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
          onClick={() => setShowWeatherPopup(true)}
          style={{ cursor: "pointer" }}
        >
          <img className="navIcon" src="/Sun.svg" alt="Weather" />
          <p>Weather</p>
        </div>

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

      {/* WEATHER POPUP (unchanged) */}
      {showWeatherPopup && (
        <div className="checkout-backdrop weather-backdrop">
          <div className="weather-modal">
            <div className="weather-modal-header">
              <h2 className="weather-title">
                Current Weather in College Station
              </h2>
              <button
                type="button"
                className="weather-close-icon"
                onClick={() => setShowWeatherPopup(false)}
              >
                ✕
              </button>
            </div>

            {weather ? (
              <>
                <div className="weather-main-temp">
                  {weather.main?.temp ?? "N/A"}°F
                </div>
                <p className="weather-description">
                  Feels like {weather.main?.feels_like ?? "N/A"}°F ·{" "}
                  {weather.weather?.[0]?.description
                    ? weather.weather[0].description
                        .charAt(0)
                        .toUpperCase() +
                      weather.weather[0].description.slice(1)
                    : "No description"}
                </p>

                <div className="weather-grid">
                  <div>
                    <div className="weather-stat-label">Humidity</div>
                    <div className="weather-stat-value">
                      {weather.main?.humidity ?? "N/A"}%
                    </div>
                  </div>
                  <div>
                    <div className="weather-stat-label">Wind</div>
                    <div className="weather-stat-value">
                      {weather.wind?.speed ?? "N/A"} mph
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="muted">Loading or no data available…</p>
            )}

            <div className="weather-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowWeatherPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
