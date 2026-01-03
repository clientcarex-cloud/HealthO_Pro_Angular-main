
// build was successful pushed the code, ok let's see 
// import 'angular-server-side-configuration/process';

export const environment = {
  production: true,
  // basePath: process.env['API_URL'],
  // basePath: 'https://labspark.azurewebsites.net',
  // basePath: 'https://healthopro-django-master.azurewebsites.net',
  // basePath: `${process.env['WEBSITE_URL']}`, // Fallback to default if env variable is not set
  // basePath: 'https://healthopro.azurewebsites.net/api',
    basePath: 'https://healthoprodev.azurewebsites.net/api',
    webSocketUrl: 'ws://healthoprodev.azurewebsites.net/api',
    defaultauth: 'fackbackend',
    firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  },
  recaptcha: {
    siteKey: '6LfKNi0cAAAAACeYwFRY9_d_qjGhpiwYUo5gNW5-',
  }
};


  // basePath: 'https://labspark.azurewebsites.net',
  // basePath: NG_ENV['WEBSITE_URL'], 
  // basePath: 'https://healthopro-django-production.azurewebsites.net',