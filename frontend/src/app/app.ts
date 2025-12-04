import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { filter, first, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { EchoUserInfoService, UserInfo } from '../client/backendtwo';
import { type Claim, EchoUserClaimsService } from '../client/backendone';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest, SilentRequest } from '@azure/msal-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('frontend');
  protected readonly userInfo = signal<UserInfo | undefined>(undefined);
  protected readonly userClaims = signal<Claim[] | undefined>(undefined);
  protected readonly loggedIn = signal(false);

  private readonly _destroying$ = new Subject<void>();

  private readonly userInfoService = inject(EchoUserInfoService);
  private readonly useClaimsService = inject(EchoUserClaimsService);
  private readonly msalGuardConfig = inject<MsalGuardConfiguration>(MSAL_GUARD_CONFIG);
  private readonly authService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);

  protected async fetchUserInfo() {
    const a = await firstValueFrom(this.userInfoService.apiEchoUserInfoGet())
    debugger;
    this.userInfo.set(await firstValueFrom(this.userInfoService.apiEchoUserInfoGet()));
  }

  protected async fetchUserClaims() {
    const a = await firstValueFrom(this.useClaimsService.apiEchoUserClaimsGet());
    debugger;
    this.userClaims.set(await firstValueFrom(this.useClaimsService.apiEchoUserClaimsGet()));
  }

  async ngOnInit(): Promise<void> {
    const getAccessToken = async () => {
      const account = this.authService.instance.getActiveAccount()
        ?? this.authService.instance.getAllAccounts().length === 1
         ? this.authService.instance.getAllAccounts()[0]
         : undefined;
      this.loggedIn.set(account != null);

      if (account) {
        this.authService.instance.setActiveAccount(account);
        //todo: ssoSilent
        this.authService.acquireTokenSilent(this.msalGuardConfig.authRequest as SilentRequest)
          .pipe(first())
          .subscribe(r => {
            this.userInfoService.configuration.credentials["Bearer"] = r.accessToken;
            this.useClaimsService.configuration.credentials["Bearer"] = r.accessToken;
          });
      }
    }

    getAccessToken();
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(getAccessToken);

    await this.authService.instance.handleRedirectPromise();
  }

  login() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect(this.msalGuardConfig.authRequest as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
