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

  return (
    <>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </>
  )
}
