// File: src/api/apiService.ts
// File ini sekarang berfungsi sebagai facade (pintu gerbang) untuk modul-modul API yang telah di-refactor.
// Tujuannya adalah menjaga kompatibilitas dengan kode yang sudah ada.

// Export Core & Utils
export { default } from './core/apiClient';
export { BACKEND_URL } from './core/apiClient';
export { logoutAndRedirect } from './utils/authUtils';

// Export Modules
export * from './modules/auth';
export * from './modules/registration';
export * from './modules/participant';
export * from './modules/document';
export * from './modules/attendance';
export * from './modules/report';
export * from './modules/dashboard';
export * from './modules/announcement';
export * from './modules/certificate';
export * from './modules/quota';
export * from './modules/payment';