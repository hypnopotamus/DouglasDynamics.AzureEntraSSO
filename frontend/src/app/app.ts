import { Component, signal, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Claim, UserInfo } from '../client/model/models';
import { BackEndForFrontendService, BackEndForFrontendServiceInterface } from '../client/api/api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly userInfo = signal<UserInfo | undefined>(undefined);
  protected readonly userClaims = signal<Claim[] | undefined>(undefined);

  private readonly client: BackEndForFrontendServiceInterface = inject(BackEndForFrontendService);

  protected async fetchUserInfo() {
    this.userInfo.set(await firstValueFrom(this.client.userInfoGet()));
  }

  protected async fetchUserClaims() {
    this.userClaims.set(await firstValueFrom(this.client.userBackendoneClaimsGet()));
  }
}
