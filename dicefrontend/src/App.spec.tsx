import { App } from './App';
import * as mockExtended from 'vitest-mock-extended';
import { mocked } from 'vitest-mock-extended';
import { DiceApi, type DiceApiInterface } from './client'

vitest.mock('./client/apis/DiceApi', async () => {
    const { mock } = await vitest.importActual<typeof mockExtended>('vitest-mock-extended');
    const actual = await vitest.importActual('./client/apis/DiceApi')

    const mockClient = mock<DiceApiInterface>()

    return {
        ...actual,
        DiceApi: class {
            constructor() {
                return mockClient
            }
        }
    }
});

describe("App />", () => {
    describe("the coin flip", () => {
        it.each([{ result: 1, expected: 'heads' }, { result: 2, expected: 'tails' }])("shows $expected for the backend result $result on clicking", async (flipResult) => {
            mocked(new DiceApi())
                .diceCoinPost
                .mockResolvedValue(flipResult.result);
            const { getByRole, getByText } = render(<App />);

            await userEvent.click(getByRole("button", { name: 'coin' }));

            expect(getByText(flipResult.expected)).toBeVisible()
        });
    });

    describe("the die roll", () => {
        it.each([1, 2, 3, 4, 5, 6])("shows the backend result %i on clicking", async (rollResult) => {
            mocked(new DiceApi())
                .diceD6Post
                .mockResolvedValue(rollResult);
            const { getByRole, getByText } = render(<App />);

            await userEvent.click(getByRole("button", { name: 'd6' }));

            expect(getByText(rollResult)).toBeVisible()
        });
    });
});