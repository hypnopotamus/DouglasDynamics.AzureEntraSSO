import type { Configuration, EndSessionRequest, RedirectRequest } from "@azure/msal-browser";
import { LogLevel } from '@azure/msal-browser';

//https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-single-page-app-react-prepare-app?tabs=workforce-tenant

export const authConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
        authority: import.meta.env.VITE_AUTH_AUTHORITY,
        redirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI,
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        allowRedirectInIframe: true,
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const loginRequest: RedirectRequest = {
    scopes: [`api://${import.meta.env.VITE_AUTH_CLIENT_ID}/access`],
};

export const logoutRequest : EndSessionRequest = {
}