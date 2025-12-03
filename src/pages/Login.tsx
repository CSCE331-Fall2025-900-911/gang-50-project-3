import '../App.css'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  
  const navigate = useNavigate()

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    console.log(credentialResponse)
    navigate("/orders")
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
    navigate("/employee")
  }
}

  return (
    <div className="background">
      <div className="backgroundBox">
        <div>
          <img src="/sharetealogo.png" className="logo" alt="ShareTea logo" />

          <h2>Select Login Type</h2>

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
          </div>

          <h2 className="orDivider">
            ─────────────────── OR ───────────────────
          </h2>

          <div className="googleButton">
            <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
          </div>
        </div>
      </div>
    </div>
  )
}
