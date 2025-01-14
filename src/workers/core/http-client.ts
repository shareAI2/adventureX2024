import axios from 'axios';

export const httpClient = axios.create();

httpClient.interceptors.request.use((config) => {
  if (config.url?.startsWith('api:'))
    config.url = config.url.replace(
      'api:',
      'https://advx24-api.jht.workers.dev/api/',
    );
  return config;
});
