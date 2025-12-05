import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { filter, first, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { EchoUserInfoService, UserInfo } from '../../client/backendtwo';
import { type Claim, EchoUserClaimsService } from '../../client/backendone';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventPayload, EventType, InteractionStatus, type RedirectRequest, type SilentRequest, type SsoSilentRequest } from '@azure/msal-browser';
import { END_SESSION_REQUEST } from '../auth.module';

const isAuthenticationResult = (payload?: EventPayload): payload is AuthenticationResult =>
  payload != null && 'account' in payload;

const isAuthenticationSuccess = (event: { eventType: EventType, payload: EventPayload }): event is { eventType: EventType, payload: AuthenticationResult } =>
  (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.SSO_SILENT_SUCCESS)
  && isAuthenticationResult(event.payload);

@Component({
  selector: 'app-app-content',
  imports: [JsonPipe],
  templateUrl: './app-content.html',
})
export class AppContent implements OnInit, OnDestroy {
  protected readonly title = signal('frontend');
  protected readonly userInfo = signal<UserInfo | undefined>(undefined);
  protected readonly userClaims = signal<Claim[] | undefined>(undefined);
  protected readonly loggedIn = signal(false);

  private readonly _destroying$ = new Subject<void>();

  private readonly userInfoService = inject(EchoUserInfoService);
  private readonly useClaimsService = inject(EchoUserClaimsService);
  private readonly msalGuardConfig = inject<MsalGuardConfiguration>(MSAL_GUARD_CONFIG);
  private readonly logoutRequest = inject(END_SESSION_REQUEST);
  private readonly authService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);

  protected async fetchUserInfo() {
    this.userInfo.set(await firstValueFrom(this.userInfoService.apiEchoUserInfoGet()));
  }

  protected async fetchUserClaims() {
    this.userClaims.set(await firstValueFrom(this.useClaimsService.apiEchoUserClaimsGet()));
  }

  async ngOnInit(): Promise<void> {
    const getAccessToken = async () => {
      const account = this.authService.instance.getActiveAccount() ?? (() => {
        const [account, ...otherAccounts] = this.authService.instance.getAllAccounts();

        return otherAccounts.length === 0 ? account : null;
      })();

      if (account) {
        this.loggedIn.set(true);
        this.authService.instance.setActiveAccount(account);
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
      ).subscribe(getAccessToken);
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((event: EventMessage) => isAuthenticationSuccess(event)),
        takeUntil(this._destroying$)
      ).subscribe(async event => {
        this.authService.instance.setActiveAccount(event.payload.account);
        await getAccessToken();
      });
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((event: EventMessage) => event.eventType === EventType.ACTIVE_ACCOUNT_CHANGED),
        takeUntil(this._destroying$)
      ).subscribe(() => this.loggedIn.set(this.authService.instance.getActiveAccount() != null));

    await this.authService.instance.handleRedirectPromise();
  }

  async login() {
    try {
      await this.authService.instance.ssoSilent(this.msalGuardConfig.authRequest as SsoSilentRequest);
    }
    catch (error) {
      try {
        await this.authService.instance.loginRedirect(this.msalGuardConfig.authRequest as RedirectRequest);
      } catch (error) {
        console.log(error);
      }
    }
  }

  logout() {
    this.authService.logout(this.logoutRequest);
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}