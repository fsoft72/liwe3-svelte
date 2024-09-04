/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This function dumps debug messages to the console.
 *
 * Every parameter is passed through the snapshot function to get a snapshot of the object.
 */
export const svelteDebug = ( ...args: any[] ) => {
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