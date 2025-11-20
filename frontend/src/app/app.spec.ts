import { App } from './app';
import { Claim, UserInfo } from '../client/model/models';
import { type BackEndForFrontendServiceInterface, BackEndForFrontendService } from '../client/api/api';
import { of } from 'rxjs';
import { Configuration } from '../client/configuration';
import { HttpHeaders } from '@angular/common/http';
import { render as renderComponent } from '@testing-library/angular'
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/dom';
import { JsonPipe } from '@angular/common';

const info: UserInfo = {
  userName: 'user name',
  claims: [{
    type: "user info",
    value: "user info claim",
    source: "user info test"
  }]
}
const claims: Claim[] = [{
  type: "user claim",
  value: "user be1 claim",
  source: "user claim test"
}]

const fakeApi: BackEndForFrontendServiceInterface = {
  defaultHeaders: new HttpHeaders(),
  configuration: new Configuration(),
  userBackendoneClaimsGet: () => of(claims),
  userInfoGet: () => of(info),
}

const render = () => renderComponent(
  App,
  {
    providers: [{
      provide: BackEndForFrontendService,
      useValue: fakeApi
    }]
  }
);

describe('App', () => {
  describe("the get user info button", () => {
    it("fetches the user info on click", async () => {
      const { getAllByRole, getByText, debug } = await render();

      const button = getAllByRole("button").find(b => b.textContent.match(/info/));
      await userEvent.click(button!);
      
      expect(getByText("info: ", {exact: false})).toContainHTML(new JsonPipe().transform(info));
    });
  });

  describe("the get user claims button", () => {
    it("fetches the user claims on click", async () => {
      const { getAllByRole, getByText } = await render();

      const button = getAllByRole("button").find(b => b.textContent.match(/claims/));
      await userEvent.click(button!);

      expect(getByText("claims: ", {exact: false})).toContainHTML(new JsonPipe().transform(claims));
    });
  });
});