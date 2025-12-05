import { appConfigEnvironment } from './appConfig';
import { mergeConfiguration } from './mergeConfiguration';

export const environment = mergeConfiguration(
    appConfigEnvironment,
    { auth: { redirectUri: 'https://localhost:64634' } }
);
