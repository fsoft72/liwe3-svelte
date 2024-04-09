export enum filterModes {
	'==',
	'!=',
	'>',
	'<',
	'>=',
	'<=',
	'n>',
	'n<',
	'n>=',
	'n<=',
	'contains',
	'not_contains',
	'starts_with',
	'ends_with'
}


/* eslint-disable @typescript-eslint/no-explicit-any */
export const matchFilter = ( obj: Record<string, any>, name: string, value: string, mode: filterModes ) => {
	const fld = obj[ name ];

	if ( fld === undefined ) return false;

	switch ( mode ) {
		case filterModes[ '==' ]: return fld == value;
		case filterModes.contains: return fld.includes( value );
		case filterModes[ '<' ]: return fld < value;
		case filterModes[ '<=' ]: return fld <= value;
		case filterModes[ '>' ]: return fld > value;
		case filterModes[ '>=' ]: return fld >= value;
		case filterModes[ 'n<' ]: return parseFloat( fld ) < parseFloat( value );
		case filterModes[ 'n<=' ]: return parseFloat( fld ) <= parseFloat( value );
		case filterModes[ 'n>' ]: return parseFloat( fld ) > parseFloat( value );
		case filterModes[ 'n>=' ]: return parseFloat( fld ) >= parseFloat( value );
		case filterModes[ '!=' ]: return fld != value;
		case filterModes.starts_with: return fld.startsWith( value );
		case filterModes.ends_with: return fld.endsWith( value );


		default:
			return false;
	}
};

interface ValueFilter {
	mode: filterModes;
	value: string;
};

export const filterObjects = ( objs: Record<string, any>[], filters: Record<string, ValueFilter> ) => {
	return objs.filter( obj => {
		for ( const name in filters ) {
			if ( !matchFilter( obj, name, filters[ name ].value, filters[ name ].mode ) ) return false;
		}

		return true;
	} );
};
