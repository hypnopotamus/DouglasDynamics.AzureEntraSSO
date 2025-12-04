import * as prepared from './appConfig.json';
import type { DeepPartial } from "./DeepPartial";
import { Environment } from './IEnvironment';

export const appConfigEnvironment: DeepPartial<Environment> = prepared;
