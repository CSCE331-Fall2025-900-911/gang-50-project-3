import { useState } from 'react'
import '../App.css'
import Button from '../components/button'

export default function Login() {
  const [count, setCount] = useState(0)

  return (
    <>
        <div className="background">
            <div className="backgroundBox">
                <div>
                    <img src="../../public/sharetealogo.png" className="logo" alt="ShareTea logo" />
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
    </>
  )
}
