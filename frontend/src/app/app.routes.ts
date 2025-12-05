import { Routes } from '@angular/router';
import { FrontchannelLogout } from './frontchannel-logout/frontchannel-logout';
import { AppContent } from './app-content/app-content';

export const routes: Routes = [
    { path: '', component: AppContent },
    { path: 'frontchannel-logout', component: FrontchannelLogout, title: 'frontchannel-logout' },
];
