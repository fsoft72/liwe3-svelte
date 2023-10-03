import { browser } from '$app/environment';
import { writable, get, derived } from 'svelte/store';

export type Language = 'it_IT' | 'en_US';

type Translations = {
	[ key: string ]: {
		[ key in Language ]?: string;
	};
};

type TranslationsInfo = {
	translations: Translations;
	language: Language;
};

const defaultTranslations: Translations = {
	'language': {
		it_IT: 'Italiano',
		en_US: 'English',
	},
	'inv_language': {
		it_IT: 'English',
		en_US: 'Italiano',
	},
	'hello_world': {
		it_IT: 'Ciao mondo',
		en_US: 'Hello World',
	},
	'goodbye_world': {
		it_IT: 'Addio mondo',
		en_US: 'Goodbye World',
	},
	'hello_pizza_world': {
		it_IT: 'Ciao mondo della pizza',
	},
};

// this function normalize the key with:
// - lowercase
// - replace spaces with underscores
const _createKey = ( key: string ) => {
	return key.toLowerCase().replace( / /g, '_' );
};

export const translationsStore = writable<TranslationsInfo>( {
	translations: defaultTranslations,
	language: 'it_IT',
} );

// set data to the translations store
export const setTranslations = ( data: Translations ) => {
	translationsStore.set( { translations: data, language: get( translationsStore ).language } );
};

export const setLanguage = ( language: Language ) => {
	translationsStore.update( ( value ) => ( { ...value, language } ) );

	if ( browser ) {
		// save the language to the localStorage
		localStorage.setItem( 'language', language );
	}
};

// get a translation from the translations store
export const _ = derived( translationsStore, ( $translationsStore ) => {
	return ( key: string ): string => {
		const skey = _createKey( key );
		const language = $translationsStore.language;

		const translations: Record<Language, string> = $translationsStore.translations[ skey ];
		let translation = key;

		if ( translations ) {
			translation = translations[ language ] || key;
		}

		return translation;
	};
} );