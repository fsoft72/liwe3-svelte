import { browser } from '$app/environment';

export type Language = 'it_IT' | 'en_US' | 'es_ES' | 'fr_FR' | 'de_DE' | 'pt_PT';

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
    'hello_world': {
        it_IT: 'Ciao mondo',
        en_US: 'Hello World',
    },
    'login': {
        it_IT: 'Accedi',
    },
    'logout': {
        it_IT: 'Esci',
    },
};

// this function normalize the key with:
// - lowercase
// - replaces multiple spaces with a single underscore
// - removes all characters that are not a-z0-9
const _createKey = ( key: string ) => {
    return key.toLowerCase().replace( /  */g, '_' ).replace( /[^a-z0-9_]/g, '' );
};

const _getLanguage = () => {
    if ( browser ) {
        const lang = navigator.language;
        return lang as Language;
    }
    return 'en_US';
};

const store: TranslationsInfo = $state( {
    language: _getLanguage(),
    translations: defaultTranslations,
} );

const ops = {
    get language () {
        return store.language;
    },
    set language ( language: Language ) {
        store.language = language;
    },
    get translations () {
        return store.translations;
    },
    _ ( key: string ) {
        // if current language is en_US, return the key as is
        if ( store.language === 'en_US' ) return key;

        const k = _createKey( key );
        console.log( "=== K: ", k );
        return store.translations[ k ]?.[ store.language ] ?? key;
    },
    _t ( key: string, language: Language ) {
        const k = _createKey( key );
        return store.translations[ k ]?.[ language ] ?? key;
    },
    addMulti ( key: string, translations: { [ key in Language ]: string } ) {
        const k = _createKey( key );
        store.translations[ k ] = translations;
    },

    add ( key: string, translation: string, language?: Language ) {
        if ( !language ) language = store.language;

        const k = _createKey( key );
        if ( !store.translations[ k ] ) store.translations[ k ] = {};
        store.translations[ k ][ language ] = translation;
    }
};

export default ops;