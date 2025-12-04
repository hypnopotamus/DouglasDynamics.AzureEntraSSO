import { EventType, PublicClientApplication, type AuthenticationResult, type EventPayload } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import type { PropsWithChildren } from "react";
import { authConfig } from "./authConfig";

const msalInstance = new PublicClientApplication(authConfig);
await msalInstance.initialize();

if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    //todo: ssoSilent
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

const isAuthenticationResult = (payload?: EventPayload): payload is AuthenticationResult =>
    payload != null && 'account' in (payload as AuthenticationResult);

msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && isAuthenticationResult(event.payload)) {
        const account = event.payload.account;
        msalInstance.setActiveAccount(account);
    }
});

export const AuthProvider = ({ children }: PropsWithChildren) => (
    <MsalProvider instance={msalInstance}>
        {children}
    </MsalProvider>
);