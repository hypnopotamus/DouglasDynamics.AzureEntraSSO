import { useState, type SVGProps } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Configuration, DiceApi, type DiceApiInterface } from './client'

const client: DiceApiInterface = new DiceApi(new Configuration({ basePath: "/api" }));

const DieIcon = ({ children, ...props }: SVGProps<SVGSVGElement>) => (
  <svg className="die" height={100} width={100} viewBox="0 0 100 100" stroke={"silver"} fill={"transparent"} strokeWidth={5} {...props}>
    {children}
  </svg>
);

export const App = () => {
  const [coinResult, setCoinResult] = useState<'heads' | 'tails'>();
  const [d6Result, setCD6Result] = useState<number>();

  const flipCoin = async () => {
    setCoinResult((await client.diceCoinPost()) == 1 ? 'heads' : 'tails')
  }

  const roll = async () => {
    setCD6Result(await client.diceD6Post())
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="cardRow">
        <div className="card">
          <DieIcon onClick={flipCoin} role='button' aria-label='coin'>
            <circle cx={50} cy={50} r={25} />
            <text x={43} y={58} fill={"silver"} strokeWidth={1} fontSize={25}>$</text>
          </DieIcon>
          <div>{coinResult ?? "flip"}</div>
        </div>
        <div className="card">
          <DieIcon onClick={roll} role='button' aria-label='d6'>
            <rect x={25} y={25} width={50} height={50} rx={2} />
            <circle cx={35} cy={35} r={2} fill={"silver"} />
            <circle cx={35} cy={50} r={2} fill={"silver"} />
            <circle cx={35} cy={65} r={2} fill={"silver"} />
            <circle cx={65} cy={35} r={2} fill={"silver"} />
            <circle cx={65} cy={50} r={2} fill={"silver"} />
            <circle cx={65} cy={65} r={2} fill={"silver"} />
          </DieIcon>
          <div>{d6Result ?? "roll"}</div>
        </div>
      </div>
    </>
  )
}

export default App
