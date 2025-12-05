import { EventType, PublicClientApplication, type AccountInfo, type AuthenticationResult, type EventPayload } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { type PropsWithChildren } from "react";
import { authConfig } from "./authConfig";

const msalInstance = new PublicClientApplication(authConfig);
await msalInstance.initialize();
msalInstance.enableAccountStorageEvents();

const isAccountInfo = (info?: any): info is AccountInfo =>
    info != null && 'username' in info

const isAuthenticationResult = (payload?: EventPayload): payload is AuthenticationResult =>
    payload != null && 'account' in payload && isAccountInfo(payload.account);

const isAuthenticationSuccess = (event: { eventType: EventType, payload: EventPayload }): event is { eventType: EventType, payload: AuthenticationResult } =>
    (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.SSO_SILENT_SUCCESS)
    && isAuthenticationResult(event.payload);

const isExternalAuthenticationSuccess = (event: { eventType: EventType, payload: EventPayload }): event is { eventType: EventType, payload: AccountInfo } =>
    (event.eventType === EventType.ACCOUNT_ADDED)
    && isAccountInfo(event.payload);

msalInstance.addEventCallback((event) => {
    if (isAuthenticationSuccess(event)) {
        msalInstance.setActiveAccount(event.payload.account);
    }

    if (isExternalAuthenticationSuccess(event)) {
        msalInstance.setActiveAccount(event.payload);
    }
});


export const AuthProvider = ({ children }: PropsWithChildren) => (
    <MsalProvider instance={msalInstance}>
        {children}
    </MsalProvider>
);