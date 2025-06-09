<script module lang="ts">
	type GeocoderType = { lat: number; lng: number } | {};

	export type GoogleAddressType = {
		address: string | '';
		city: string | '';
		postal_code: string | '';
		province: string | '';
		country: string | '';
		formatted: string | '';
		telephone?: string | '';
		position?: GeocoderType;
	};
</script>

<script lang="ts">
	import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';

	import Input from '$liwe3/components/Input.svelte';
	import Button from '$liwe3/components/Button.svelte';

	import { slide } from 'svelte/transition';
	import { sineInOut } from 'svelte/easing';
	import { onDestroy, onMount } from 'svelte';

	import { Trash, Plus } from 'svelte-hero-icons';

	import type { FormField } from '$liwe3/components/FormCreator.svelte';
	import AutoComplete from '../AutoComplete.svelte';

	interface Props {
		field: FormField;
		name: string;
		telephone?: boolean; // show telephone field
		multiple?: boolean; // multiple addresses
		addressOnly?: boolean; // show only address, no regions or establishments
		hideFields?: boolean; // hide address fields, only show autocomplete
		// dependency injection
		_v: (field: FormField) => any;
		// events
		onchange: (name: string, value: any, field: FormField) => void;
		// extra
		[key: string]: any;
	}

	type ValuesType = Record<string, GoogleAddressType> | { [key: string]: GoogleAddressType };

	// Keys must be the same as AutoCompleteType, also used to check if all keys/values are present
	const emptyValues: GoogleAddressType = {
		address: '',
		city: '',
		postal_code: '',
		province: '',
		country: '',
		formatted: '',
		telephone: '',
		position: {}
	};

	const prefix = 'address';
	let { onchange, name, _v, field, telephone = false, multiple = true, addressOnly = true, hideFields = false, optionalRequestFields, ...rest }: Props = $props();

	let maps: any;
	let placesService: any;
	let autocompleteService: any;
	let autocompleteSuggestion: any;
	let sessionToken: any; // Autocomplete session token
	let libLoaded: boolean = $state(false); // Google Maps library loaded
	let current: number = $state(0); // current address index
	let values: ValuesType = $state({}); // all addresses values
	let counter: number = $derived(Object.keys(values).length);
	let searchType: string[] = $derived( addressOnly ? ['address'] : ['geocode', 'establishment'] );

	/**
	 * @description Clear undefined values from object and add missing keys to be compliant with AutoCompleteType
	 * @param dct: Record<string, string | undefined>
	 * @returns AutoCompleteType
	 */
	const clear_undefined = (dct: Record<string, string | {} | undefined>): GoogleAddressType => {
		const res: any = {};
		Object.keys(emptyValues).forEach((k) => {
			if (!dct[k] || dct[k] === undefined) {
				res[k] = '';
				return;
			}
			res[k] = dct[k];
		});
		return res;
	};

	/**
	 * @description Load Google Maps API with new Places API
	 * @returns Promise
	 */
	const loadGoogleMapsCore = async () => {
		// @ts-ignore
		((g) => {
			// @ts-ignore
			var h,
				a,
				k,
				p = 'The Google Maps JavaScript API',
				c = 'google',
				l = 'importLibrary',
				q = '__ib__',
				m = document,
				b = window as any;
			b = b[c] || (b[c] = {});
			var d = b.maps || (b.maps = {}),
				r = new Set(),
				e = new URLSearchParams(),
				u = () =>
					// @ts-ignore
					h ||
					(h = new Promise(async (f, n) => {
						await (a = m.createElement('script'));
						e.set('libraries', [...r] + '');
						for (k in g)
							e.set(
								k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()),
								// @ts-ignore
								g[k]
							);
						e.set('callback', c + '.maps.' + q);
						a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
						d[q] = f;
						a.onerror = () => (h = n(Error(p + ' could not load.')));
						// @ts-ignore
						a.nonce = m.querySelector('script[nonce]')?.nonce || '';
						m.head.append(a);
					}));
			d[l]
				? console.warn(p + ' only loads once. Ignoring:', g)
				: (d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n)));
		})({
			key: PUBLIC_GOOGLE_MAPS_API_KEY,
			v: 'weekly',
			libraries: ['places', 'geocoding']
		});
	};

	/**
	 * @description Load new Places API library (latest version)
	 */
	const loadPlacesLibrary = async () => {
		// @ts-ignore
		if (!window.google || !window.google.maps) {
			try {
				await loadGoogleMapsCore();
			} catch (error) {
				console.error('Error loading Google Maps library:', error);
				throw error;
			}
		}
		// @ts-ignore
		maps = window.google.maps;

		// Import the new Places API (latest version)
		// @ts-ignore
		const { AutocompleteSessionToken, AutocompleteSuggestion } = await window.google.maps.importLibrary('places');
		autocompleteSuggestion = AutocompleteSuggestion;
		sessionToken = AutocompleteSessionToken;
		// Optionally log to verify
		 console.log('Google Maps Places library loaded successfully');
	};

	/**
	 * @description Get place details using the new Place class (latest Places API)
	 * @param placeObj: any
	 * @returns Promise<any>
	 */
	const getPlaceDetails = async (placeObj: any): Promise<any> => {
		try {
			const place = placeObj.placePrediction.toPlace();
       		await place.fetchFields({
				fields: [
					'addressComponents',
					'formattedAddress',
					'location',
				]
			});
			return place;
		} catch (error) {
			console.error('Place fetch failed:', error);
			throw error;
		}
	};

	/**
	 * @description Get autocomplete predictions using the new Places API
	 * @param input: string
	 * @returns Promise<any[]>
	 */
	const getAutocompletePredictions = async (input: string): Promise<any[]> => {
			if (!input || input.length < 2) {
				return [];
			}

			const token = new sessionToken();

			let  request = {
				sessionToken: token,
				input: input,
				includedPrimaryTypes: searchType,
			};

			// If optionalRequestFields is provided, merge it with the request
			if( optionalRequestFields ) {
				request = { ...request, ...optionalRequestFields };
			}
			console.log('Autocomplete request:', request);

			const { suggestions } = await autocompleteSuggestion.fetchAutocompleteSuggestions(request);
			return suggestions;
	};

	/**
	 * @description Geocode address to get lat/lng coordinates
	 * @param address: string
	 * @returns Promise<GeocoderType>
	 */
	const addressGeocoder = (address: string): Promise<GeocoderType> => {
		return new Promise((resolve, reject) => {
			const geocoder = new maps.Geocoder();
			geocoder.geocode({ address }, (results: any, status: any) => {
				if (status === 'OK' && results && results.length > 0) {
					const location = results[0].geometry.location;
					const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
					const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
					resolve({ lat, lng });
				} else {
					console.warn('Geocode was not successful for the following reason: ' + status);
					resolve({});
				}
			});
		});
	};

	/**
	 * @description Process place selection and update form fields
	 * @param placeObj: any
	 * @returns Promise<void>
	 */
	const processPlaceSelection = async (placeObj: any) => {
		try {
			const place = await getPlaceDetails(placeObj);

			const tmp: Record<string, string | { lat: number; lng: number } | {} | undefined> = {};
			// clear form fields to avoid messy data when changing address
			clearFields();

			const typeMapping: Record<string, string> = {
				route: 'address',
				street_number: 'address',
				locality: 'city',
				postal_code: 'postal_code',
				administrative_area_level_1: 'province',
				administrative_area_level_2: 'province',
				country: 'country'
			};

			// Process address components (adapt to new API property names)
			const addressComponents = place.addressComponents || place.address_components;
			if (addressComponents) {
				addressComponents.forEach((component: any) => {
					const types = component.types || component.type;
					(types || []).forEach((type: string) => {
						const objKey = typeMapping[type];
						if (objKey) {
							if (type === 'street_number') {
								tmp[objKey] = component.longText || component.long_name || '';
							} else if (type === 'route') {
								const number = tmp[objKey] === undefined ? '' : tmp[objKey];
								tmp[objKey] = `${number} ${component.longText || component.long_name}`.trim();
							} else {
								// Use shortText/short_name for postal codes and countries, longText/long_name for others
								tmp[objKey] = type === 'postal_code' || type === 'country'
									? (component.shortText || component.short_name || component.longText || component.long_name)
									: (component.longText || component.long_name || component.shortText || component.short_name);
							}
						}
					});
				});
			}

			// Add formatted address
			tmp.formatted = place.formattedAddress || place.formatted_address || '';

			// Keep telephone value when changing address
			tmp.telephone = values[prefix + current]?.telephone || '';

			// Get coordinates
			const location = place.location || (place.geometry && place.geometry.location);
			if (location) {
				const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
				const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
				tmp.position = { lat, lng };
			} else {
				// Fallback to geocoding if geometry is not available
				tmp.position = await addressGeocoder(tmp.formatted as string);
			}

			// Update values to trigger reactivity
			values[prefix + current] = { ...(clear_undefined(tmp) as GoogleAddressType) };

			// Call onchange event to return all values to FormCreator
			onchange(name, Object.values(values), field);

		} catch (error) {
			console.error('Error processing place selection:', error);
		}
	};

	/**
	 * @description Handle address input changes and show suggestions
	 * @param e: Event
	 * @returns Promise<void>
	 */
	const handleAddressInput = async (e: Event) => {
		const input = e.target as HTMLInputElement;
		const value = input.value;

		// Remove any existing autocomplete dropdown
		removeAutocompleteDropdown();

		if (!value || value.length < 2) return;

		try {
			const predictions = await getAutocompletePredictions(value);

			if (predictions.length > 0) {
				showAutocompleteDropdown(input, predictions);
			}
		} catch (error) {
			console.error('Error getting autocomplete predictions:', error);
		}
	};

	/**
	 * @description Show autocomplete dropdown with predictions
	 * @param input: HTMLInputElement
	 * @param predictions: any[]
	 */
	const showAutocompleteDropdown = (input: HTMLInputElement, predictions: any[]) => {
		const dropdown = document.createElement('div');
		dropdown.className = 'google-autocomplete-dropdown';
		dropdown.style.cssText = `
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background: var(--FCP-google-address-dropdown-bg, #fff);
			border: 1px solid var(--FCP-google-address-dropdown-border, #ccc);
			border-top: none;
			max-height: 200px;
			overflow-y: auto;
			z-index: 10000;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		`;

		predictions.forEach((suggestion) => {
		//for( let suggestion of predictions) {
			const prediction = suggestion.placePrediction;
			const item = document.createElement('div');
			item.className = 'autocomplete-item';
			item.style.cssText = `
				padding: 10px;
				cursor: pointer;
				border-bottom: 1px solid var(--FCP-google-address-item-border,#eee);
				transition: background-color 0.2s;
			`;
			item.textContent = prediction.text.text;

			item.addEventListener('mouseenter', () => {
				item.style.backgroundColor = 'var(--FCP-google-address-item-hover,#f5f5f5)';
			});

			item.addEventListener('mouseleave', () => {
				item.style.backgroundColor = 'var(--FCP-google-address-item-bg,#fff)';
			});

			item.addEventListener('click', () => {
				input.value = prediction.text.text;
				processPlaceSelection(suggestion);
				removeAutocompleteDropdown();
			});

			dropdown.appendChild(item);
		});

		// Position dropdown relative to input
		const inputContainer = input.parentElement;
		if (inputContainer) {
			inputContainer.style.position = 'relative';
			inputContainer.appendChild(dropdown);
		}
	};

	/**
	 * @description Remove autocomplete dropdown
	 */
	const removeAutocompleteDropdown = () => {
		const existing = document.querySelector('.google-autocomplete-dropdown');
		if (existing) {
			existing.remove();
		}
	};

	/**
	 * @description Update FormCreator with telephone field value
	 * @returns void
	 */
	const telephoneField = () => {
		values[prefix + current] = { ...clear_undefined(values[prefix + current]) };
		onchange(name, Object.values(values), field);
	};

	/**
	 * @description Handle input focus and setup event listeners
	 * @param e: Event
	 * @returns void
	 */
	const handleInputFocus = (e: Event, id: number) => {
		current = id;
		const input = e.target as HTMLInputElement;

		// Remove existing listeners
		input.removeEventListener('input', handleAddressInput);

		// Add new listener
		input.addEventListener('input', handleAddressInput);

		// Remove dropdown when clicking outside
		const handleClickOutside = (event: Event) => {
			if (!input.contains(event.target as Node)) {
				removeAutocompleteDropdown();
				document.removeEventListener('click', handleClickOutside);
			}
		};

		setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 100);
	};

	/**
	 * @description Feed fields with values from FormCreator
	 * @returns void
	 */
	const feedFields = () => {
		const v = _v(field);
		if (!v || v.length == 0) {
			addIt();
			return;
		}
		try {
			v.forEach((f: GoogleAddressType, idx: number) => {
				addIt(idx, f);
			});
		} catch (error) {
			console.error('Error feeding fields:', error);
		}
	};

	/**
	 * @description Clear fields when changing address
	 * @returns void
	 */
	const clearFields = () => {
		let v: GoogleAddressType = { ...emptyValues };
		if (values[prefix + current]?.telephone !== '') {
			v.telephone = values[prefix + current]?.telephone || '';
		}
		values[prefix + current] = { ...v };
	};

	/**
	 * @description Remove address item values from the values array and from the form
	 * @param e: Event
	 * @param id: number
	 * @returns void
	 */
	const trashIt = (e: Event, id: number) => {
		removeAutocompleteDropdown();

		if (!values[prefix + id]) {
			console.warn('Address item not found');
			return;
		}
		delete values[prefix + id];
		values = { ...values };

		// Update form creator
		onchange(name, Object.values(values), field);
	};

	/**
	 * @description Add a new address item to the values array and render it in the form
	 * @param id: number
	 * @param val: GoogleAddressType
	 * @returns void
	 */
	const addIt = (id?: number, val?: GoogleAddressType) => {
		id = id || counter;
		const spread = val || emptyValues;
		values[prefix + id] = { ...clear_undefined(spread) };
		current = id;
	};

	/**
	 * @description Clean up environment
	 */
	const clearEnv = () => {
		removeAutocompleteDropdown();
		placesService = null;
		autocompleteService = null;
		maps = null;
		libLoaded = false;
		values = {};
		current = 0;
	};

	/**
	 * @description Initialize Google Maps and Places API
	 */
	onMount(async () => {
		try {
			await loadPlacesLibrary();
			libLoaded = true;
			feedFields();
		} catch (error) {
			console.error('Failed to load Google Maps Places library:', error);
		}
	});

	/**
	 * @description Clean up on component destroy
	 */
	onDestroy(() => {
		clearEnv();
	});
</script>

{#snippet trashBtn(id: number)}
	<Button
		mode="danger"
		icon={Trash}
		title="Remove this address"
		onclick={(e: Event) => trashIt(e, id)}
	></Button>
{/snippet}

{#snippet singleAddress(values: ValuesType, id: number)}
	<div class="liwe3-col12" transition:slide={{ axis: 'y', duration: 200, easing: sineInOut }}>
		{#if telephone}
			<div class="liwe3-row liwe3-flex-bottom">
				<div class="liwe3-col-xs10">
					<Input
						label="Telephone"
						bind:value={values[prefix + id].telephone}
						placeholder="Enter your telephone"
						onchange={telephoneField}
						onfocus={() => (current = id)}
					/>
				</div>
				<div class="liwe3-offset-xs1 liwe3-col-xs1">
					{#if multiple}
						{@render trashBtn(id)}
					{/if}
				</div>
			</div>
			<div class="liwe3-row">
				<div class="liwe3-col-xs12">
					<Input
						label={field.label}
						id={`addressField${id}`}
						bind:value={values[prefix + id].address}
						placeholder="Enter your address"
						onchange={(e: Event) => clearFields()}
						onfocus={(e: Event) => handleInputFocus(e, id)}
					/>
				</div>
			</div>
		{:else}
			<div class="liwe3-row liwe3-flex-bottom">
				<div class={multiple ? "liwe3-col-xs10" : "liwe3-col-xs12"}>
					<Input
						label={field.label}
						id={`addressField${id}`}
						bind:value={values[prefix + id].address}
						placeholder="Enter your address"
						onchange={(e: Event) => clearFields()}
						onfocus={(e: Event) => handleInputFocus(e, id)}
					/>
				</div>
				{#if multiple}
					<div class="liwe3-offset-xs1 liwe3-col-xs1">
						{@render trashBtn(id)}
					</div>
				{/if}
			</div>
		{/if}
		<div class="liwe3-row" style="z-index: 9999;">
			<div class="liwe3-col-xs12 liwe3-col-md5">
				<Input type={ hideFields ? 'hidden' : 'text'} bind:value={values[prefix + id].city} placeholder="City" disabled={true} />
			</div>
			<div class="liwe3-col-xs12 liwe3-col-md3">
				<Input type={ hideFields ? 'hidden' : 'text'} bind:value={values[prefix + id].postal_code} placeholder="CAP" disabled={true} />
			</div>
			<div class="liwe3-col-xs12 liwe3-col-md2">
				<Input type={ hideFields ? 'hidden' : 'text'} bind:value={values[prefix + id].province} placeholder="Province" disabled={true} />
			</div>
			<div class="liwe3-col-xs12 liwe3-col-md2">
				<Input type={ hideFields ? 'hidden' : 'text'} bind:value={values[prefix + id].country} placeholder="Country" disabled={true} />
			</div>
		</div>
	</div>
{/snippet}

{#if libLoaded}
	<div class="liwe3-row liwe3-p2 y">
	{#each Object.values(values) as value, idx}
		{@render singleAddress(values, idx)}
	{/each}
	{#if multiple}
		<div class="liwe3-row liwe3-p2 y">
			<span>
				<Button
					mode="success"
					size="sm"
					title="Add a new address"
					icon={Plus}
					onclick={() => addIt()}
				></Button>
			</span>
		</div>
	{/if}
	</div>
{:else}
	<div class="liwe3-row liwe3-p2 y">
		<span><small>Loading Google Maps Library...</small></span>
	</div>
{/if}