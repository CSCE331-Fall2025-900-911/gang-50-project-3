import '../App.css'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  
  const navigate = useNavigate()

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    console.log(credentialResponse)
    navigate("/kiosk")
  }

  const handleLoginError = () => {
    console.error("Login Error")
  }

  const handleRoleSelect = (role: string) => {
  console.log("Selected role:", role)

  if (role === "kiosk") {
    navigate("/kiosk")
  } else if (role === "cashier") {
    navigate("/orders")
  } else if (role === "manager") {
    navigate("/analytics")
  } else if (role === "menuboard") {
    navigate("/menuboard")
  }
}

  return (
    <main>
    <div className="background">
      <div className="backgroundBox">
        <div>
          <header>
            <img src="/FifteaLogo.png" className="logo" alt="FifTea logo" />
          </header>
          <div className="roleButtonsContainer">
            <button className="roleButton" onClick={() => handleRoleSelect("kiosk")}>
              Kiosk
            </button>

            <button className="roleButton" onClick={() => handleRoleSelect("cashier")}>
              Cashier
            </button>

            <button className="roleButton" onClick={() => handleRoleSelect("manager")}>
              Manager
            </button>

            <button className="roleButton" onClick={() => handleRoleSelect("menuboard")}>
              Menu Board
            </button>
          </div>

          <footer>
            <h2>
              ────── OR ──────
            </h2>

            <div className="googleButton">
              <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
            </div>
          </footer> 
        </div>
      </div>
    </div>
    </main>
  )
}
