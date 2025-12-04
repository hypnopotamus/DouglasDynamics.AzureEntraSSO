import { useEffect, useMemo, useState, type SVGProps } from 'react'
import './App.css'
import { Configuration, DiceApi, type DiceApiInterface } from './client'
import { useMsalAuthentication } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { loginRequest } from './authConfig';

const DieIcon = ({ children, ...props }: SVGProps<SVGSVGElement>) => (
  <svg className="die" height={100} width={100} viewBox="0 0 100 100" stroke={"silver"} fill={"transparent"} strokeWidth={5} {...props}>
    {children}
  </svg>
);

export const CoinFlip = () => {
  const [coinResult, setCoinResult] = useState<'heads' | 'tails'>();
  const [d6Result, setCD6Result] = useState<number>();
  const { result, acquireToken } = useMsalAuthentication(InteractionType.Silent, loginRequest);
  const [accessToken, setAccessToken] = useState<string | undefined>(result?.accessToken);

  useEffect(() => {
    const fetchAccessToken = async () => {
      const { accessToken } = (await acquireToken()) ?? {};
      setAccessToken(accessToken);
    };

    if (!accessToken) {
      fetchAccessToken();
    }
  }, [accessToken]);

  const client = useMemo<DiceApiInterface>(
    () => new DiceApi(new Configuration({ basePath: "/api", accessToken: accessToken })),
    [accessToken]
  );

  const flipCoin = async () => {
    setCoinResult((await client.diceCoinPost()) == 1 ? 'heads' : 'tails')
  }

  const roll = async () => {
    setCD6Result(await client.diceD6Post())
  }

  return (
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
  )
}