import Environment from 'jest-environment-jsdom';
import { TextEncoder } from 'util';
import { TextDecoder } from 'util';
export default class CustomTestEnvironment extends Environment {
  async setup() {
    await super.setup();
    if (typeof this.global.TextEncoder === 'undefined') {
      this.global.TextEncoder = TextEncoder;
    }
    if (typeof this.global.TextDecoder === 'undefined') {
      this.global.TextDecoder = TextDecoder;
    }
  }
}
