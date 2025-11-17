import type { render as r, act as a, renderHook as rh } from '@testing-library/react';
import type { waitFor as wf, within as w } from '@testing-library/dom';
import type * as ue from '@testing-library/user-event';

declare global {
    const render: typeof r;
    const act: typeof a;
    const renderHook: typeof rh;
    const waitFor: typeof wf;
    const userEvent: typeof ue.userEvent;
    const within: typeof w;
}