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
		case filterModes.contains: return fld.toLowerCase().includes( value.toLowerCase() );
		case filterModes[ '<' ]: return fld < value;
		case filterModes[ '<=' ]: return fld <= value;
		case filterModes[ '>' ]: return fld > value;
		case filterModes[ '>=' ]: return fld >= value;
		case filterModes[ 'n<' ]: return parseFloat( fld ) < parseFloat( value );
		case filterModes[ 'n<=' ]: return parseFloat( fld ) <= parseFloat( value );
		case filterModes[ 'n>' ]: return parseFloat( fld ) > parseFloat( value );
		case filterModes[ 'n>=' ]: return parseFloat( fld ) >= parseFloat( value );
		case filterModes[ '!=' ]: return fld != value;
		case filterModes.starts_with: return fld.toLowerCase().startsWith( value.toLowerCase() );
		case filterModes.ends_with: return fld.toLowerCase().endsWith( value.toLowerCase() );


		default:
			return false;
	}
};

interface ValueFilter {
	mode: filterModes;
	value: string;
};

export function filterObjects<T> ( objs: Record<string, any>[], filters: Record<string, ValueFilter> ): T[] {
	return objs.filter( obj => {
		for ( const name in filters ) {
			if ( !matchFilter( obj, name, filters[ name ].value, filters[ name ].mode ) ) return false;
		}

		return true;
	} ) as T[];
};
