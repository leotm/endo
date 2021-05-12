// @ts-check

import { StaticModuleRecord } from '@endo/static-module-record';
import { encodeSyrup } from '@endo/syrup/encode';

const textDecoder = new TextDecoder();

/** @type {ParseFn} */
export const parseArchiveMjs = async (
  bytes,
  _specifier,
  _location,
  _packageLocation,
) => {
  const source = textDecoder.decode(bytes);
  const record = new StaticModuleRecord(source);
  const pre = encodeSyrup(record);
  return {
    parser: 'premjs',
    bytes: pre,
    record,
  };
};