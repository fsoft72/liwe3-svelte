/* eslint-disable @typescript-eslint/no-explicit-any */
import { dev } from '$app/environment';

/**
 * This function dumps debug messages to the console.
 *
 * Every parameter is passed through the snapshot function to get a snapshot of the object.
 */
export const runeDebug = ( ...args: any[] ) => {
	if ( !dev ) return;

	// only run in development mode
	const snapshotArgs = args.map( arg => {
		try {
			return $state.snapshot( arg );
		} catch ( error ) {
			// If snapshot fails, return the original argument
			return arg;
		}
	} );
	console.log( ...snapshotArgs );
};
