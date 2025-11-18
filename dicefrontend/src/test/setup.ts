import '@testing-library/jest-dom/vitest';
import * as rtlDom from '@testing-library/dom';
import * as rtl from '@testing-library/react';
import userEvent from '@testing-library/user-event';

Object.assign(globalThis, rtlDom);
Object.assign(globalThis, rtl);
Object.assign(globalThis, { userEvent });