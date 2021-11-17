import { encodeURLSafe, decodeURLSafe } from '@stablelib/base64';

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

export const utf8 = {
  decode: function Utf8Decode(input: Uint8Array): string {
    return utf8Decoder.decode(input);
  },
  encode: function Utf8Encode(input: string): Uint8Array {
    const buf = utf8Encoder.encode(input);
    return new Uint8Array(buf, 0, buf.length);
  },
};

export const b64 = {
  urlSafe: (str: string): string => str.replace(/\+/g, '-').replace(/\//g, '_'),
  encode: function b64Encode(input: Uint8Array): string {
    return encodeURLSafe(input);
  },
  decode: function b64Decode(input: string): Uint8Array {
    return decodeURLSafe(b64.urlSafe(input));
  },
};
