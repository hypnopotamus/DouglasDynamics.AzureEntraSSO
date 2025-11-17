import { App } from './App';
import { BackEndForFrontendApi } from './client/apis/BackEndForFrontendApi';
import * as mockExtended from 'vitest-mock-extended';
import { mocked } from 'vitest-mock-extended';
import type { Claim, UserInfo } from './client/models';

vitest.mock('./client/apis/BackEndForFrontendApi', async () => {
    const { mock } = await vitest.importActual<typeof mockExtended>('vitest-mock-extended');
    const actual = await vitest.importActual('./client/apis/BackEndForFrontendApi')

    const mockClient = mock<BackEndForFrontendApi>()

    return {
        ...actual,
        BackEndForFrontendApi: class {
            constructor() {
                return mockClient
            }
        }
    }
});

describe("<App />", () => {
    describe("the get user info button", () => {
        const info: UserInfo = {
            userName: 'user name',
            claims: [{
                type: "user info",
                value: "user info claim",
                source: "user info test"
            }]
        }
        beforeEach(() => {
            mocked(new BackEndForFrontendApi())
                .userInfoGet
                .mockResolvedValue(info)
        })

        it("fetches the user info on click", async () => {
            const { getAllByRole, getByText } = render(<App />);

            const button = getAllByRole("button").find(b => b.textContent.match(/info/));
            await userEvent.click(button!);

            expect(getByText(JSON.stringify(info), { exact: false })).toBeVisible()
        });
    });

    describe("the get user claims button", () => {
        const claims: Claim[] = [{
            type: "user claim",
            value: "user be1 claim",
            source: "user claim test"
        }]
        beforeEach(() => {
            mocked(new BackEndForFrontendApi())
                .userBackendoneClaimsGet
                .mockResolvedValue(claims)
        })

        it("fetches the user claims on click", async () => {
            const { getAllByRole, getByText } = render(<App />);

            const button = getAllByRole("button").find(b => b.textContent.match(/claims/));
            await userEvent.click(button!);

            expect(getByText(JSON.stringify(claims), { exact: false })).toBeVisible()
        });
    });
});