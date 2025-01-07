/* eslint-disable @typescript-eslint/no-explicit-any */
import { PUBLIC_LIWE_SERVER } from '$env/static/public';
import { storeUser } from '$modules/user/store.svelte';
import app from '$liwe3/stores/app.svelte';
import { addToast } from '$liwe3/stores/ToastStore.svelte';

export interface LiWEFetcherOptions {
	skipError?: boolean;
};

const url_and_headers = ( url: string ) => {
	if ( !url.startsWith( 'http' ) ) {
		url = PUBLIC_LIWE_SERVER + url;
	}

	const headers: Record<string, string> = {
		'Content-Type': 'application/json;charset=utf-8',
	};

	headers.Authorization = `Bearer ${ storeUser.token }`;

	return { url, headers };
};

const _get_params = ( data: FetcherData | null ) => {
	if ( !data ) return '';

	const p: Record<string, string> = {};

	for ( const key in data ) {
		const val = data[ key ];
		if ( val == null ) continue;

		if ( typeof val === 'object' ) {
			p[ key ] = JSON.stringify( val );
		} else {
			p[ key ] = val.toString();
		}
	}

	return new URLSearchParams( p ).toString();
};

const _showError = ( url: string, error: any ) => {
	addToast( {
		message: error.message || error,
		type: 'error',
	} );
};

const _post = async ( method: string, url: string, data: FetcherData, skipError: boolean ) => {
	const d = url_and_headers( url );

	try {
		const res = await fetch( d.url, {
			method,
			body: JSON.stringify( data ),
			headers: d.headers,
		} );

		const r = await res.json();

		if ( r.error && app.showRequestsError && !skipError ) _showError( url, r.error );

		return r;

	} catch ( e ) {
		if ( !skipError ) _showError( url, e );
		return { error: e };
	}
};


interface FetcherData {
	[ key: string ]: string | number | boolean | Record<string, unknown> | Array<unknown> | File | undefined | Date | null;
}

const get = async ( url: string, data: FetcherData | null, skipError: boolean ) => {
	const d = url_and_headers( url );
	const params = _get_params( data );

	try {
		const res = await fetch( d.url + "?" + params, {
			method: 'GET',
			headers: d.headers,
		} );

		const r = await res.json();

		if ( r.error && app.showRequestsError && !skipError ) _showError( url, r.error );

		return r;
	} catch ( e ) {
		if ( !skipError ) _showError( url, e );
		return { error: e };
	}
};

const post = async ( url: string, data: FetcherData, skipError = false ) => {
	return _post( 'POST', url, data, skipError );
};

const patch = async ( url: string, data: FetcherData, skipError = false ) => {
	return _post( 'PATCH', url, data, skipError );
};

const delete_ = async ( url: string, data: FetcherData, skipError = false ) => {
	return _post( 'DELETE', url, data, skipError );
};

export {
	post,
	get,
	patch,
	delete_,
	url_and_headers,
};