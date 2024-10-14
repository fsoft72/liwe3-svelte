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
	amount = Math.round( amount * 100 ) / 100;
	const [ int, dec ] = amount.toFixed( 2 ).split( '.' );
	return `${ Number( int ).toLocaleString().replace( /,/g, '.' ) },${ dec }`;
};

export const toFixed = ( amount?: number | string, decimals = 2 ) => {
	if ( !amount ) return 0.00;
	return parseFloat( parseFloat( amount.toString() ).toFixed( decimals ) );
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
	if ( !user.perms.length ) return false;

	if ( user.perms.indexOf( 'system.admin' ) >= 0 ) return true;

	// split on the first dot
	const mod = perm.split( '.' )[ 0 ];
	if ( user.perms.indexOf( `${ mod }.admin` ) >= 0 ) return true;

	if ( user.perms.indexOf( perm ) >= 0 ) return true;

	return false;
};

export const has_one_perm = ( user: UserAuth | null, perms: string[] ) => {
	// if perms is empty, everyone has access
	if ( !perms ) return true;
	if ( !perms.length ) return true;

	if ( !user ) return false;
	if ( !user.perms ) return false;

	if ( !user.perms.length ) return false;
	if ( user.perms.indexOf( 'system.admin' ) >= 0 ) return true;

	for ( let i = 0; i < perms.length; i++ ) {
		const perm = perms[ i ];

		if ( has_perm( user, perm ) ) return true;
	}

	return false;
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

export const mkid_simple = ( prefix: string, rnd: boolean = true, sep: string = '.' ) => {
	const d = new Date().getTime().toString( 36 );
	const rand = rand_int( 0, 999999 ).toString( 36 );

	if ( rnd ) return `${ prefix }${ sep }${ d }${ sep }${ rand }`;

	return `${ prefix }${ sep }${ d }`;
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

/**
 * Converts a hexadecimal RGB color code to an array of integers representing the RGB values.
 *
 * @param rgb - The hexadecimal RGB color code (e.g., "#FF0000" for red).
 * @returns An array of integers representing the RGB values [r, g, b].
 */
export const rgbHexToInt = ( rgb: string ) => {
	if ( !rgb ) return [ 0, 0, 0 ];

	// add the '#' if it's missing
	if ( rgb.length === 6 ) rgb = `#${ rgb }`;

	const r = parseInt( rgb.slice( 1, 3 ), 16 );
	const g = parseInt( rgb.slice( 3, 5 ), 16 );
	const b = parseInt( rgb.slice( 5, 7 ), 16 );

	return [ r, g, b ];
};

/**
 * Converts an RGB color array to a hexadecimal color string.
 * @param rgb - The RGB color array [r, g, b].
 * @returns The hexadecimal color string.
 */
export const intToRGBHex = ( rgb: number[] ) => {
	const r = rgb[ 0 ].toString( 16 ).padStart( 2, '0' );
	const g = rgb[ 1 ].toString( 16 ).padStart( 2, '0' );
	const b = rgb[ 2 ].toString( 16 ).padStart( 2, '0' );

	return `#${ r }${ g }${ b }`;
};


export function debounce<T extends ( ...args: any[] ) => any> (
	func: T,
	delay: number
): ( ...args: Parameters<T> ) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return ( ...args: Parameters<T> ): void => {
		if ( timeoutId ) {
			clearTimeout( timeoutId );
		}
		timeoutId = setTimeout( () => {
			func( ...args );
		}, delay );
	};
}

export const downloadFile = ( content: string, file_name: string, type = 'application/json' ) => {
	const element = document.createElement( 'a' );
	file_name = file_name.toLowerCase();

	const file = new Blob( [ content ], {
		type
	} );
	element.href = URL.createObjectURL( file );
	element.download = file_name;
	document.body.appendChild( element );
	element.click();
};

export function values<T> ( obj: any ): T[] {
	if ( !obj ) return [];
	return Object.values( obj );
};

export function keys<T> ( obj: any ): string[] {
	if ( !obj ) return [];
	return Object.keys( obj );
}

export function clearObject ( obj: any ) {
	for ( const prop in obj ) {
		delete obj[ prop ];
	}
}


export const isTrue = ( value: any ): boolean => {
	if ( typeof value === 'boolean' ) return value;

	if ( typeof value === 'string' ) {
		if ( value === 'true' ) return true;
		if ( value === 'false' ) return false;
		if ( value === '1' ) return true;
		if ( value === '0' ) return false;
		if ( value === 'on' ) return true;

	}

	return false;
};

export const toInt = ( value: any ): number => {
	return parseInt( value.toString(), 10 );
};

export const challenge_create = ( params: string[], secret: string, debug = false ) => {
	const s: string[] = params.map( ( p ) => ( p || '' )?.toString().toLowerCase() );
	s.sort();
	s.push( secret );

	let ckey = s.join( '-' );

	// remove multiple '-' characters
	ckey = ckey.replace( /-{2,}/g, '-' );

	// remove all starting '-' characters
	while ( ckey[ 0 ] == '-' ) ckey = ckey.substring( 1 );

	/*
	if ( cfg.debug.enabled || debug )
		console.log( "=== Server Challenge: ", ckey );
	*/

	return md5( ckey );
};


/**
 * This function returns a deep copy of the object passed as argument.
 *
 * @param obj - The object to clone.
 *
 * @returns A deep copy of the object.
 *
 */
export const clone = ( obj: any ) => {
	return structuredClone( obj );
};


/**
 * this function returns a dict with only the keys that are not undefined
 */
export const clean = ( obj: Record<string, any> ) => {
	const res: Record<string, any> = {};

	for ( const key in obj ) {
		if ( obj[ key ] !== undefined ) res[ key ] = obj[ key ];
	}

	return res;
};