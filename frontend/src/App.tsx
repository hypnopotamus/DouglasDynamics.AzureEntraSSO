import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import type { Claim, UserInfo } from './client/models'
import { Configuration, BackEndForFrontendApi, type BackEndForFrontendApiInterface } from './client'

const client: BackEndForFrontendApiInterface = new BackEndForFrontendApi(new Configuration({ basePath: "/api" }));

export function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>()
  const [userClaims, setUserClaims] = useState<Claim[] | undefined>()

  const fetchUserInfo = async () => {
    setUserInfo(await client.userInfoGet())
  }

  const fetchUserClaims = async () => {
    setUserClaims(await client.userBackendoneClaimsGet())
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={fetchUserInfo}>
          get user info (be1+2)
        </button>
        <div>
          info: {userInfo && JSON.stringify(userInfo)}
        </div>
      </div>
      <div className="card">
        <button onClick={fetchUserClaims}>
          get user claims (be1)
        </button>
        <div>
          claims: {userClaims && JSON.stringify(userClaims)}
        </div>
      </div>
    </>
  )
}
