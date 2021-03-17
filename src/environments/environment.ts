// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  webClientId: '51993057457-0bh4l5ehrqssnucbg6f8avm99masdvk4.apps.googleusercontent.com',
  server_timezone: 'America/New_York',
  //LIVE SERVER
  // data_url : "https://getstylin.com/api",
  // default_url : "https://getstylin.com",
  // base_url: "https://",
  // data_url_api : "https://",
  
  //LOCAL SERVER
  data_url : "http://getstyln.local/api",
  default_url : "http://getstyln.local",
  base_url: "http://",
  data_url_api : "http://",

   // DEV SERVER
  // data_url : "https://devs.getstylin.com/api",
  // default_url : "https://devs.getstylin.com/",
  // base_url: "https://",
  // data_url_api : "https://",

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
