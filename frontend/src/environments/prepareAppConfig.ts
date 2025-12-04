import { load } from "@azure/app-configuration-provider";
import { DefaultAzureCredential } from "@azure/identity";
import type { Environment } from "./IEnvironment";
import type { DeepPartial } from "./DeepPartial";
import fs from 'fs';

//todo: env variable from command line
const appConfig = (await load('https://ac-spa-dd-frontend.azconfig.io', new DefaultAzureCredential())).constructConfigurationObject();

const environment: DeepPartial<Environment> = {
    auth: {
        authority: appConfig["VITE_AUTH_AUTHORITY"],
        clientId: appConfig["VITE_AUTH_CLIENT_ID"],
    },
};

fs.writeFileSync('./src/environments/appConfig.json', JSON.stringify(environment));