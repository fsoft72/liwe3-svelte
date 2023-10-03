import { writable } from "svelte/store";

interface LiWEApp {
  showRequestsError?: boolean;
}

const liweApp = writable<LiWEApp>( { showRequestsError: true } );

export const setApp = ( app: LiWEApp ) => {
  liweApp.set( { ...app } );
};

export let app: LiWEApp;

// subscribe to the user store
liweApp.subscribe( ( value ) => {
  app = value;
} );
