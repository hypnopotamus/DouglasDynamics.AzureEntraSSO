import type { DeepPartial } from "./DeepPartial";
import type { Environment } from "./IEnvironment";
import { merge } from "ts-deepmerge";

export const mergeConfiguration = (...environments: DeepPartial<Environment>[]): Environment => merge(...environments) as Environment;