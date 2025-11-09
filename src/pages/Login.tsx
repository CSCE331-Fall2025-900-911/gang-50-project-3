import '../App.css'
import Button from '../components/Button'
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

  return (
    <>
      <div className="background">
            <div className="backgroundBox">
                <div>
                    <img src="/sharetealogo.png" className="logo" alt="ShareTea logo" />
                    <h2>Login with Employee ID</h2>
                </div>
                <div>
                    <h3>Employee ID</h3>
                    <input type="text" placeholder="Employee ID" className="input" />
                    <h3>Last Name</h3>
                    <input type="text" placeholder="Last Name" className="input" />
                </div> 
                <Button label="Login" onClick={() => {}} />
            </div> 
      </div>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </>
  )
}
