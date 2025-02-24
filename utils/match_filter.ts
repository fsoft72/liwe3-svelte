export enum filterModes {
	EQUAL = 'equal',
	NOT_EQUAL = 'not_equal',
	GREATER_THAN = 'greater_than',
	LESS_THAN = 'less_than',
	GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
	LESS_THAN_OR_EQUAL = 'less_than_or_equal',
	NUMERIC_GREATER_THAN = 'numeric_greater_than',
	NUMERIC_LESS_THAN = 'numeric_less_than',
	NUMERIC_GREATER_THAN_OR_EQUAL = 'numeric_greater_than_or_equal',
	NUMERIC_LESS_THAN_OR_EQUAL = 'numeric_less_than_or_equal',
	CONTAINS = 'contains',
	NOT_CONTAINS = 'not_contains',
	STARTS_WITH = 'starts_with',
	ENDS_WITH = 'ends_with',
	BETWEEN = 'between',
	NOT_BETWEEN = 'not_between',
	IN = 'in',
	NOT_IN = 'not_in',
	IS_NULL = 'is_null',
	IS_NOT_NULL = 'is_not_null',

}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const matchFilter = ( obj: Record<string, any>, name: string, value: string, mode: filterModes ) => {
	const fld = obj[ name ];

	if ( fld === undefined ) return false;

	switch ( mode ) {
		case filterModes.EQUAL: return fld == value;
		case filterModes.CONTAINS: return fld.toLowerCase().includes( value.toLowerCase() );
		case filterModes.LESS_THAN: return fld < value;
		case filterModes.LESS_THAN_OR_EQUAL: return fld <= value;
		case filterModes.GREATER_THAN: return fld > value;
		case filterModes.GREATER_THAN_OR_EQUAL: return fld >= value;
		case filterModes.NUMERIC_LESS_THAN: return parseFloat( fld ) < parseFloat( value );
		case filterModes.NUMERIC_LESS_THAN_OR_EQUAL: return parseFloat( fld ) <= parseFloat( value );
		case filterModes.NUMERIC_GREATER_THAN: return parseFloat( fld ) > parseFloat( value );
		case filterModes.NUMERIC_GREATER_THAN_OR_EQUAL: return parseFloat( fld ) >= parseFloat( value );
		case filterModes.NOT_EQUAL: return fld != value;
		case filterModes.STARTS_WITH: return fld.toLowerCase().startsWith( value.toLowerCase() );
		case filterModes.ENDS_WITH: return fld.toLowerCase().endsWith( value.toLowerCase() );
		case filterModes.BETWEEN: return fld >= value.split( '|' )[ 0 ] && fld <= value.split( '|' )[ 1 ];
		case filterModes.NOT_BETWEEN: return fld < value.split( '|' )[ 0 ] || fld > value.split( '|' )[ 1 ];
		case filterModes.IN: return value.split( '|' ).includes( fld );
		case filterModes.NOT_IN: return !value.split( '|' ).includes( fld );
		case filterModes.IS_NULL: return fld === null;
		case filterModes.IS_NOT_NULL: return fld !== null;

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
