// This module is safe for SSR and delegates to the useQueryParamLib library in the browser.

import { QueryParamConfig } from 'serialize-query-params';
import { QueryParamOptions } from 'use-query-params/src/options.ts';
import { UrlUpdateType } from '../../types/use-query-params.ts';
import { isServerSideRendering } from './is-server-side-rendering.ts';

let useQueryParamLib: any | null = null;

if (!isServerSideRendering()) {
  // Loaded only on the client
  useQueryParamLib = await import('use-query-params');
}

export const useQueryParam = (
  name: string,
  paramConfig?: QueryParamConfig<any, any>,
  options?: QueryParamOptions,
): [string, (newValue: any, urlUpdateType?: UrlUpdateType) => void] => {
  console.log('useQueryParam called for:', {
    name,
    paramConfig,
    options,
    useQueryParamLib,
  });
  if (!useQueryParamLib) {
    console.warn('useQueryParam called on server side');
    return ['' as any, () => {}];
  }
  console.log('useQueryParam called on client side');
  return useQueryParamLib.useQueryParam(name, paramConfig, options);
};

export const useQueryParams = (options: any) => {
  return useQueryParamLib
    ? useQueryParamLib.useQueryParams(options)
    : [{} as any, () => {}];
};

export const StringParam = useQueryParamLib
  ? useQueryParamLib.StringParam
  : undefined;
export const NumberParam = useQueryParamLib
  ? useQueryParamLib.NumberParam
  : undefined;
export const ArrayParam = useQueryParamLib
  ? useQueryParamLib.ArrayParam
  : undefined;
export const BooleanParam = useQueryParamLib
  ? useQueryParamLib.BooleanParam
  : undefined;
export const DateParam = useQueryParamLib
  ? useQueryParamLib.DateParam
  : undefined;
export const JsonParam = useQueryParamLib
  ? useQueryParamLib.JsonParam
  : undefined;
export const DelimitedArrayParam = useQueryParamLib
  ? useQueryParamLib.DelimitedArrayParam
  : undefined;
export const withDefault = useQueryParamLib
  ? useQueryParamLib.withDefault
  : (param: any) => param;

export const QueryParamProvider = useQueryParamLib
  ? useQueryParamLib.QueryParamProvider
  : ({ children }: any) => children;
export function encodeString(value: string): string {
  return useQueryParamLib ? useQueryParamLib.encodeString(value) : value;
}
export function decodeString(value: string): string {
  return useQueryParamLib ? useQueryParamLib.decodeString(value) : value;
}
export class QueryParamAdapterComponent {}
