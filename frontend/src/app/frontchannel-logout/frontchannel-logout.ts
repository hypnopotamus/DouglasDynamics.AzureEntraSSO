import { Component, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-frontchannel-logout',
  templateUrl: './frontchannel-logout.html',
})
export class FrontchannelLogout {
  private readonly authService = inject(MsalService);

  async ngOnInit(): Promise<void> {
    await this.authService.instance.logoutRedirect({
      account: this.authService.instance.getActiveAccount(),
      onRedirectNavigate: () => false
    })
  }
}
