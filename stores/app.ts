/* eslint-disable @typescript-eslint/no-explicit-any */
interface LiWEApp {
  /** If the requests should show an error message */
  showRequestsError: boolean;
  /** The authentication token of the user */
  token: string;

  /** Add a new property to the app data */
  [ key: string ]: any;
}

const appData: LiWEApp = $state( {
  showRequestsError: true,
  token: ''
} );

const store = {
  get showRequestsError () {
    return appData.showRequestsError ?? false;
  },

  set showRequestsError ( value: boolean ) {
    appData.showRequestsError = value;
  },

  get token () {
    return appData.token;
  },

  set token ( value: string ) {
    appData.token = value;
  },

  add ( name: string, value: any ) {
    appData[ name ] = value;
  },

  get ( name: string ) {
    return appData[ name ];
  },

};

export default store;