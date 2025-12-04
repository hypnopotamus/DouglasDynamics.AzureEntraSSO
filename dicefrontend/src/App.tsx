import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { Button, Container } from "react-bootstrap";
import { CoinFlip } from "./CoinFlip";
import { loginRequest } from './authConfig';
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

export const App = () => {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  const handleLogin = async () => {
    try {
      await instance.loginRedirect(loginRequest)
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="App">
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <AuthenticatedTemplate>
        {activeAccount ? (
          <Container>
            <CoinFlip />
          </Container>
        ) : null}
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Button className="signInButton" onClick={handleLogin} variant="primary">
          Sign in
        </Button>
      </UnauthenticatedTemplate>
    </div>
  );
};

export default App
