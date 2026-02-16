/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _utils_auth from "../_utils/auth.js";
import type * as emissions from "../emissions.js";
import type * as forms__utils from "../forms/_utils.js";
import type * as forms_debug from "../forms/debug.js";
import type * as forms_get from "../forms/get.js";
import type * as forms_getAll from "../forms/getAll.js";
import type * as forms_reopen from "../forms/reopen.js";
import type * as forms_rollback from "../forms/rollback.js";
import type * as forms_save from "../forms/save.js";
import type * as forms_submit from "../forms/submit.js";
import type * as mongodb_client from "../mongodb/client.js";
import type * as mongodb_queries from "../mongodb/queries.js";
import type * as organizations from "../organizations.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "_utils/auth": typeof _utils_auth;
  emissions: typeof emissions;
  "forms/_utils": typeof forms__utils;
  "forms/debug": typeof forms_debug;
  "forms/get": typeof forms_get;
  "forms/getAll": typeof forms_getAll;
  "forms/reopen": typeof forms_reopen;
  "forms/rollback": typeof forms_rollback;
  "forms/save": typeof forms_save;
  "forms/submit": typeof forms_submit;
  "mongodb/client": typeof mongodb_client;
  "mongodb/queries": typeof mongodb_queries;
  organizations: typeof organizations;
  todos: typeof todos;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
