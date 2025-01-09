/**
 * Action that adds clipboard copy functionality to an element
 * @param {HTMLElement} node - The DOM node to attach the action to
 * @param {string | (() => string)} text - The text to copy or a function that returns the text
 * @returns {import('svelte/action').ActionReturn}
 */
const copyToClipboard = ( node: HTMLElement, text: string | ( () => string ) ) => {
	/**
	 * Handles the copy operation
	 * @param {Event} _ - The event object (unused)
	 */
	const handleClick = async () => {
		const value = typeof text === 'function' ? text() : text;

		try {
			await navigator.clipboard.writeText( value );

			// Optional: Add a visual feedback class
			node.classList.add( 'copied' );
			setTimeout( () => node.classList.remove( 'copied' ), 1000 );

			console.log( 'Text copied to clipboard:', value );
		} catch ( err ) {
			console.error( 'Failed to copy text:', err );
		}
	};

	node.addEventListener( 'click', handleClick );

	return {
		update ( newText: string ) {
			text = newText;
		},
		destroy () {
			node.removeEventListener( 'click', handleClick );
		}
	};
};

export default copyToClipboard;