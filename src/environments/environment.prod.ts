import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  baseUrl: 'http://localhost:8080/unity-admin/api/v1',
  appName: 'Unity App',
  enableDebugMode: true,
  logLevel: 'debug',
};
