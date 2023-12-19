/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import md5 from './md5';
import type { UserAuth } from '../types/user_auth';
import type { TreeItem } from './tree';
import { url_and_headers } from './fetcher';

// Format a date string like '2023-08-01T17:15:09.388Z' into a readable date string
export const format_date = ( date?: string | Date, format = 'YYYY-MM-DD HH:mm:ss' ) => {
	if ( !date ) return '';

	let d: Date;

	if ( typeof date === 'string' ) {
		d = new Date( date );
	} else {
		d = date;
	}

	const dct: Record<string, string> = {
		YYYY: d.getFullYear().toString(),
		MM: ( '0' + ( d.getMonth() + 1 ) ).slice( -2 ),
		DD: ( '0' + d.getDate() ).slice( -2 ),
		HH: ( '0' + d.getHours() ).slice( -2 ),
		mm: ( '0' + d.getMinutes() ).slice( -2 ),
		ss: ( '0' + d.getSeconds() ).slice( -2 ),
	};

	// convert YYYY, MM, DD HH, mm, ss in the format string into ${YYYY}, ${MM}, ${DD}, ${HH}, ${mm}, ${ss}
	const res = format.replace( /YYYY|MM|DD|HH|mm|ss/g, ( match ) => dct[ match ] );

	return res;
};

// converts a number like 1000.23  into 1.000,23
export const format_amount = ( amount?: number ) => {
	if ( !amount ) return '0,00';
	const [ int, dec ] = amount.toFixed( 2 ).split( '.' );
	return `${ Number( int ).toLocaleString().replace( /,/g, '.' ) },${ dec }`;
};

export const format_size = ( size: number ) => {
	const units = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ];
	let i = 0;
	while ( size >= 1024 ) {
		size /= 1024;
		++i;
	}
	return `${ size.toFixed( 2 ) } ${ units[ i ] }`;
};

export const has_perm = ( user: UserAuth | null, perm: string ) => {
	// console.log( "=== PERM: ", perm, user, user?.perms );
	if ( !user ) return false;
	if ( !user.perms ) return false;

	if ( user.perms[ 'system' ]?.includes( 'admin' ) ) return true;

	const [ module, action ] = perm.split( '.' );

	if ( !user.perms[ module ] ) return false;
	if ( user.perms[ module ].includes( 'admin' ) ) return true;

	if ( user.perms[ module ].includes( action ) ) return true;

	return false;
};

export const has_one_perm = ( user: UserAuth | null, perms: string[] ) => {
	if ( !user ) return false;
	if ( !user.perms ) return false;

	if ( user.perms[ 'system' ]?.includes( 'admin' ) ) return true;

	for ( let i = 0; i < perms.length; i++ ) {
		const perm = perms[ i ];

		if ( has_perm( user, perm ) ) return true;
	}

	return false;
};


export const tree_set_meta = ( items: TreeItem[], id_parent: string, level: number ) => {
	for ( let i = 0; i < items.length; i++ ) {
		const item = items[ i ];
		item.id_parent = id_parent;
		item.pos = i;
		item.level = level;
		if ( item.children ) {
			tree_set_meta( item.children, item.id, level + 1 );
		}
	}
};

/**
 *  Generates a random integer number from `min` to `max`
 *
 * @param min Random int starting number
 * @param max Random int max ending number
 * @returns an integer between the specified min / max range
 */
export const rand_int = ( min: number = 0, max: number = 100 ): number => {
	min = Math.ceil( min );
	max = Math.floor( max );

	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};

/**
 * Generates an unique string code (up to 37 chars long)
 *
 * @param simple	If the code should be simpler (smaller)
 * @param prefix	The prefix to add to the string
 * @param second_slice	If a second slice of random string should be added
 * @returns the unique string generated
 */
export const unique_code = ( simple: boolean = true, prefix: string = '', second_slice: boolean = true ): string => {
	const now = new Date();
	const n = now.getTime(); //  + now.getMilliseconds();

	if ( prefix )
		prefix = `${ prefix }.`;
	else
		prefix = '';

	let c = `${ prefix }${ md5( n.toString( 36 ) ) }`;

	if ( simple && !second_slice ) return c;

	c = `${ c }.${ rand_int( 0, n ).toString( 36 ).slice( 0, 4 ) }`;

	if ( simple ) return c;

	return `${ prefix }${ md5( c ) }.${ rand_int( 0, n ).toString( 36 ).slice( 0, 4 ) }`;
};

/**
 * Generates a unique code number string based on the current timestamp.
 *
 * @param {number} length - The length of the code number string to generate.
 * @param {number} [second_slice=0] - The length of the second slice to append to the code number string.
 * @returns {string} - The unique code number string.
 */
export const unique_code_numbers = ( length: number, second_slice: number = 0 ): string => {
	const now = new Date();
	const n = now.getTime(); //  + now.getMilliseconds();

	// get the latest length digits of the string
	const c = n.toString().slice( -length );

	if ( !second_slice ) return c;

	const m = now.getTime() + now.getMilliseconds();

	// get the latest length digits of the string
	return `${ c }.${ m.toString().slice( -second_slice ) }`;
};

/**
 * @description This function returns an unique id, the id starts with the prefix and can optionally contain an extension
 * @param prefix - The prefix to add to the string
 * @param ext - The extension to add to the string
 */
export const mkid = ( prefix: string, ext?: string ) => {
	if ( !ext ) ext = '';
	if ( ext && ext.length && !ext.startsWith( '.' ) ) ext = `.${ ext }`;

	return `${ unique_code( false, prefix ) }${ ext }`;
};

export const media_url = ( id: string, filename: string = '', thumbnail = false ) => {
	if ( !id ) return '';

	if ( !filename ) filename = id;

	const { url } = url_and_headers( `/static/public/uploads` );
	const base = id.split( "." ).slice( -1 );
	let new_url;

	if ( !thumbnail )
		new_url = `${ url }/${ base }/${ filename }`;
	else
		new_url = `${ url }/${ base }/thumbs/${ id }.jpg`;

	return new_url;
};

/**
 * Convert seconds into a time string of hh:mm:ss
 *
 * @param secs - The seconds to convert
 * @returns the time string
 */
export const secs2time = ( secs?: number ) => {
	if ( !secs ) return '00:00';
	const hours = Math.floor( secs / 3600 );
	const minutes = Math.floor( ( secs - ( hours * 3600 ) ) / 60 );
	const seconds = secs - ( hours * 3600 ) - ( minutes * 60 );

	let time = '';

	if ( hours > 0 ) {
		time = `${ hours }:`;
	}

	time += `${ ( '0' + minutes ).slice( -2 ) }:${ ( '0' + seconds ).slice( -2 ) }`;

	return time;

};

export const toBool = ( val: any ) => {
	if ( val === 'true' || val === true || val === 1 || val === '1' ) return true;
	return false;
};


/**
 * This function returns the username or (deleted) if the username starts with 'user.'
 *
 * @param username
 * @returns
 */
export const uname = ( username?: string ) => {
	if ( !username ) return '';
	if ( username.startsWith( 'user.' ) ) return '(deleted)';
	return username;
};
