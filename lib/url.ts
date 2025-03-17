let params: Record<string, string> = {};

export const parse = ( url: string ): Record<string, string> => {
	params = {};

	const query = url.charAt( 0 ) == '?' ? url : new URL( url ).search.substring( 1 );

	const searchParams = new URLSearchParams( query );
	for ( const p of searchParams ) params[ p[ 0 ] ] = p[ 1 ];

	return params;
};

export const addParam = ( key: string, value: string ) => {
	params[ key ] = value;
};

export const getParams = () => {
	const searchParams = new URLSearchParams();
	for ( const k in params ) searchParams.append( k, params[ k ] as string );

	return searchParams.toString();
};