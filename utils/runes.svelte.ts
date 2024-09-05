/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This function dumps debug messages to the console.
 *
 * Every parameter is passed through the snapshot function to get a snapshot of the object.
 */
export const $debug = ( ...args: any[] ) => {
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

/**
 * This function creates a reactive state from an object.
 */
export const $restate = ( obj: any ) => {
	return $state( $state.snapshot( obj ) );
};