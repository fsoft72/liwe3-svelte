import type SSEClient from '$liwe3/lib/sse';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LiWEApp {
  /** If the requests should show an error message */
  showRequestsError: boolean;
  /** The authentication token of the user */
  token: string;

  /** The Server Sent Events client */
  sse: SSEClient | null;

  /** Add a new property to the app data */
  [ key: string ]: any;
}

const appData: LiWEApp = $state( {
  showRequestsError: true,
  token: '',
  sse: null,
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

  del ( name: string ) {
    delete appData[ name ];
  },

  /** returns all values in the store as key/value pairs */
  dump () {
    const values: Record<string, any> = $state.snapshot( appData );
    return values;
  },

  set sse ( value: SSEClient | null ) {
    appData.sse = value;
  },

  get sse (): SSEClient | null {
    return appData.sse;
  },

};

export default store;