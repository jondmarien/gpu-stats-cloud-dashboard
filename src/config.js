import dotenv from 'dotenv';
dotenv.config();

// Configure per-device API keys here
// Example: export const API_KEYS = { device1: 'key1', device2: 'key2' };
export const API_KEYS = {
  //mypc: process.env.API_KEY_MYPC,
  thebeast: process.env.API_KEY_THEBEAST
  // Add more devices as needed
};
