import type SSEClient from '$liwe3/lib/sse';
import { browser } from '$app/environment';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LiWEApp {
  /** If the requests should show an error message */
  showRequestsError: boolean;
  /** The authentication token of the user */
  token: string;

  /** The Server Sent Events client */
  sse: SSEClient | null;

  /** If the SSE client is connected */
  sseConnected: boolean;

  /** Flag T/F if the app is running on a mobile device */
  isMobile: boolean;

  /** Add a new property to the app data */
  [ key: string ]: any;
}

const appData: LiWEApp = $state( {
  showRequestsError: true,
  token: '',
  sse: null,
  sseConnected: false,
  isMobile: false,
} );

const store = {
  init () {
    console.log( "=== LIWE APP STORE INIT" );
    if ( browser ) {
      const mediaQuery = window.matchMedia( '(max-width: 768px)' );
      appData.isMobile = mediaQuery.matches;

      const listener = ( event: any ) => {
        appData.isMobile = event.matches;
      };

      mediaQuery.addEventListener( 'change', listener );
    }
  },

  get isMobile () {
    return appData.isMobile;
  },

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

  set sseConnected ( value: boolean ) {
    appData.sseConnected = value;
  },

  get sseConnected (): boolean {
    return appData.sseConnected;
  },

};

export default store;