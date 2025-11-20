import { ApplicationConfig, InjectionToken, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideApi } from '../client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideApi('/api'),
  ]
};
