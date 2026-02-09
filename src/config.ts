// src/config.ts
/// <reference types="vite/client" />

const isProd = import.meta.env.PROD;
export const API_URL = import.meta.env.VITE_API_URL || (isProd ? '' : 'http://localhost:3001');
export const APP_URL = import.meta.env.VITE_APP_URL || (isProd ? 'https://kodamicro.vercel.app' : 'http://localhost:5173');

