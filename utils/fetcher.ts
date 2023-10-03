/* eslint-disable @typescript-eslint/no-explicit-any */
import { PUBLIC_LIWE_SERVER } from '$env/static/public';
import { currentUser } from '$modules/user/store';
import { app } from '$liwe3/stores/LiWEApp';
import { addToast } from '$liwe3/stores/ToastStore';

const url_and_headers = ( url: string, authenticated = false ) => {
	if ( !url.startsWith( 'http' ) ) {
		url = PUBLIC_LIWE_SERVER + url;
	}

	const headers: Record<string, string> = {
		'Content-Type': 'application/json;charset=utf-8',
	};

	if ( authenticated ) {
		headers.Authorization = `Bearer ${ currentUser?.token }`;
	}

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


interface FetcherData {
	[ key: string ]: string | number | boolean | Record<string, unknown> | Array<unknown> | undefined | Date | null;
}

const get = async ( url: string, data: FetcherData | null, authenticated = false ) => {
	const d = url_and_headers( url, authenticated );
	const params = _get_params( data );

	try {
		const res = await fetch( d.url + "?" + params, {
			method: 'GET',
			headers: d.headers,
		} );

		const r = await res.json();

		if ( r.error && app.showRequestsError ) _showError( url, r.error );

		return r;
	} catch ( e ) {
		_showError( url, e );
		return { error: e };
	}
};

const post = async ( url: string, data: FetcherData, authenticated = false ) => {
	const d = url_and_headers( url, authenticated );

	try {
		const res = await fetch( d.url, {
			method: 'POST',
			body: JSON.stringify( data ),
			headers: d.headers,
		} );

		const r = await res.json();

		if ( r.error && app.showRequestsError ) _showError( url, r.error );

		return r;

	} catch ( e ) {
		_showError( url, e );
		return { error: e };
	}
};

const patch = async ( url: string, data: FetcherData, authenticated = false ) => {
	const d = url_and_headers( url, authenticated );

	try {
		const res = await fetch( d.url, {
			method: 'PATCH',
			body: JSON.stringify( data ),
			headers: d.headers,
		} );
		const r = await res.json();

		if ( r.error && app.showRequestsError ) _showError( url, r.error );

		return r;
	} catch ( e ) {
		_showError( url, e );
		return { error: e };
	}
};

const delete_ = async ( url: string, data: FetcherData, authenticated = false ) => {
	const d = url_and_headers( url, authenticated );

	try {
		const res = await fetch( d.url, {
			method: 'DELETE',
			body: JSON.stringify( data ),
			headers: d.headers,
		} );
		const r = await res.json();

		if ( r.error && app.showRequestsError ) _showError( url, r.error );

		return r;
	} catch ( e ) {
		_showError( url, e );
		return { error: e };
	}
};


export {
	post,
	get,
	patch,
	delete_,
	url_and_headers,
};