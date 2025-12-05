import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";

export const FrontChannelLogout = () => {
    const { instance } = useMsal();

    useEffect(() => {
        instance.logoutRedirect({
            account: instance.getActiveAccount(),
            onRedirectNavigate: () => false,
        });
    }, [instance]);

    return (
        <p>logging out</p>
    );
}