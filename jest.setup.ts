// jest.setup.ts
import 'whatwg-fetch';

// Polyfill TextEncoder/TextDecoder for MSW
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
