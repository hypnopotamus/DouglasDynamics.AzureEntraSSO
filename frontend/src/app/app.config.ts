import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthModule } from './auth.module';
import { provideApi as provideBackendOne } from '../client/backendone';
import { provideApi as provideBackendTwo } from '../client/backendtwo';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(AuthModule),
    provideBackendOne('/api'),
    provideBackendTwo('/api'),
  ]
};
