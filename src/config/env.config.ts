import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

console.log(process.cwd());

const isTest = process.env.NODE_ENV === 'test';
export const env = {
  ROOT_PATH: process.cwd() + (isTest ? '/src' : ''),
  APP_PORT: process.env.APP_PORT,
};
