import fetchMock from 'jest-fetch-mock';
import { Crypto } from '@peculiar/webcrypto';

fetchMock.enableMocks();

window.crypto = new Crypto();
