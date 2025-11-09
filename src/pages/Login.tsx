import '../App.css'
import Button from '../components/Button'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'


export default function Login() {

  const navigate = useNavigate()
  return (
    <>
      <GoogleLogin onSuccess={(credentialResponse) => {
        console.log(credentialResponse)
        navigate("/orders");
      }}
      onError={() => console.log("Login Error")}></GoogleLogin>
    </>
  )
}
