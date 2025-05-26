<script lang="ts" module>
	export interface DropDownMenu {
		label: string;
		items: DropDownMenuItem[];
		direction?: 'left' | 'right' | 'up' | 'down';
	}

	export interface DropDownMenuItem {
		id: string;
		label: string;
		action?: () => void;
	}
</script>

<script lang="ts">
	interface Props {
		label: string;
		items: DropDownMenuItem[];
		direction?: 'left' | 'right' | 'up' | 'down';
	}

	let { label, items, direction = 'down' }: Props = $props();
	let isOpen = $state(false);
	let menuItems: HTMLElement | null = $state(null);
	let menuLabel: HTMLElement | null = $state(null);
	let menuContainer: HTMLElement | null = $state(null);

	function positionMenu() {
		if (!menuItems || !menuLabel) return;

		// Reset position to calculate proper dimensions
		menuItems.style.left = '0';
		menuItems.style.top = '0';
		menuItems.style.right = 'auto';
		menuItems.style.bottom = 'auto';
		menuItems.style.maxHeight = '';
		menuItems.style.overflowY = '';

		const menuRect = menuItems.getBoundingClientRect();
		const labelRect = menuLabel.getBoundingClientRect();
		const viewportWidth = window.innerWidth - 20; // 20px buffer
		const viewportHeight = window.innerHeight - 20; // 20px buffer

		let finalLeft = 0;
		let finalTop = 0;
		let finalRight = 'auto';
		let finalBottom = 'auto';

		// Set initial position based on direction
		switch (direction) {
			case 'down':
				finalTop = labelRect.height;
				finalLeft = 0;
				break;
			case 'up':
				finalTop = -menuRect.height; // Position menu above the button
				finalLeft = 0;
				break;
			case 'left':
				finalTop = 0;
				finalLeft = -menuRect.width; // Position menu to the left of the button
				break;
			case 'right':
				finalTop = 0;
				finalLeft = labelRect.width;
				break;
		}

		// Apply initial positioning
		menuItems.style.left = typeof finalLeft === 'number' ? `${finalLeft}px` : finalLeft;
		menuItems.style.top = typeof finalTop === 'number' ? `${finalTop}px` : finalTop;
		menuItems.style.right = finalRight;
		menuItems.style.bottom = finalBottom;

		// Get updated menu rectangle after positioning
		const updatedMenuRect = menuItems.getBoundingClientRect();

		// Handle viewport overflow adjustments
		if (direction === 'down' || direction === 'up') {
			// Handle horizontal overflow for vertical directions
			if (updatedMenuRect.right > viewportWidth) {
				const overflow = updatedMenuRect.right - viewportWidth;
				if (labelRect.left >= overflow) {
					// Shift left by overflow amount
					finalLeft -= overflow;
				} else {
					// Align to right edge of label if not enough space to shift
					menuItems.style.left = 'auto';
					menuItems.style.right = '0';
				}
			}

			// Handle vertical overflow
			if (direction === 'down' && updatedMenuRect.bottom > viewportHeight) {
				const overflow = updatedMenuRect.bottom - viewportHeight;
				if (labelRect.top >= overflow) {
					// Switch to 'up' if there's enough space above
					menuItems.style.top = 'auto';
					menuItems.style.bottom = '100%';
				} else {
					// Constrain height if not enough space above or below
					const maxHeight = viewportHeight - labelRect.bottom - 10;
					menuItems.style.maxHeight = `${maxHeight}px`;
					menuItems.style.overflowY = 'auto';
				}
			} else if (direction === 'up' && updatedMenuRect.top < 0) {
				const overflow = Math.abs(updatedMenuRect.top);
				if (viewportHeight - labelRect.bottom >= menuRect.height) {
					// Switch to 'down' if there's enough space below
					finalTop = labelRect.height;
				} else {
					// Constrain position to stay in viewport
					finalTop = -labelRect.top + 10;
				}
			}
		} else {
			// Handle vertical overflow for horizontal directions
			if (updatedMenuRect.bottom > viewportHeight) {
				const overflow = updatedMenuRect.bottom - viewportHeight;
				if (labelRect.top >= overflow) {
					// Shift up by overflow amount
					finalTop -= overflow;
				} else {
					// Align to top of viewport if not enough space to shift
					finalTop = -labelRect.top + 10;
				}
			} else if (updatedMenuRect.top < 0) {
				// Shift down to stay in viewport
				finalTop = -labelRect.top + 10;
			}

			// Handle horizontal overflow
			if (direction === 'right' && updatedMenuRect.right > viewportWidth) {
				const overflow = updatedMenuRect.right - viewportWidth;
				if (labelRect.left >= overflow + labelRect.width) {
					// Switch to 'left' if there's enough space
					menuItems.style.left = 'auto';
					menuItems.style.right = '100%';
				} else {
					// Constrain position to stay in viewport
					finalLeft = viewportWidth - labelRect.left - updatedMenuRect.width - 10;
				}
			} else if (direction === 'left' && updatedMenuRect.left < 0) {
				const overflow = Math.abs(updatedMenuRect.left);
				if (viewportWidth - labelRect.right >= menuRect.width) {
					// Switch to 'right' if there's enough space
					finalLeft = labelRect.width;
				} else {
					// Constrain position to stay in viewport
					finalLeft = -labelRect.left + 10;
				}
			}

			// Apply final vertical position for horizontal directions
			if (typeof finalTop === 'number') {
				menuItems.style.top = `${finalTop}px`;
			}
		}

		// Apply final horizontal position adjustments for vertical directions
		if ((direction === 'down' || direction === 'up') && typeof finalLeft === 'number') {
			menuItems.style.left = `${finalLeft}px`;
		}

		// Apply final horizontal position adjustments for horizontal directions
		if ((direction === 'left' || direction === 'right') && typeof finalLeft === 'number') {
			menuItems.style.left = `${finalLeft}px`;
		}

		menuItems.style.visibility = 'visible';
	}

	function toggleMenu() {
		isOpen = !isOpen;
		if (isOpen) {
			// Use setTimeout to ensure DOM is updated before positioning
			setTimeout(positionMenu, 0);
			// Add event listener for clicks outside the menu
			setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
		} else {
			// Remove event listener when menu is closed
			document.removeEventListener('click', handleClickOutside);
		}
	}

	// Handle clicks outside the menu to close it
	function handleClickOutside(event: MouseEvent) {
		if (menuContainer && !menuContainer.contains(event.target as Node)) {
			isOpen = false;
			document.removeEventListener('click', handleClickOutside);
		}
	}

	// Clean up event listener when component is destroyed
	$effect(() => {
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="menu-container" bind:this={menuContainer}>
	<button class="menu-label" bind:this={menuLabel} onclick={toggleMenu}>
		{label}
	</button>
	{#if isOpen}
		<div class="menu-items" bind:this={menuItems}>
			{#each items as item}
				<button
					class="menu-item"
					onclick={() => {
						if (item.action) item.action();
						isOpen = false;
					}}
				>
					{item.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.menu-container {
		position: relative;
		display: inline-block;
	}

	.menu-label {
		cursor: pointer;
		padding: 8px 12px;
		background-color: #f0f0f0;
		border-radius: 4px;
	}

	.menu-items {
		position: absolute;
		background-color: #fff;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 1;
		min-width: 100%;
		max-height: 80vh; /* Set a maximum height */
		overflow-y: auto; /* Add vertical scrolling if needed */

		visibility: hidden;
	}

	.menu-item {
		padding: 8px 12px;
		cursor: pointer;
		transition: background-color 0.2s;
		color: #333;
		font-size: 14px;
		font-weight: 500;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 200px;
		text-decoration: none;
		border-radius: 4px;
		margin: 0;
		list-style: none;
		display: block;
		width: 100%;
		box-sizing: border-box;
		background-color: #fff;
		border: 1px solid #ccc;
	}
	.menu-item:hover {
		background-color: #f0f0f0;
	}
	.menu-item:active {
		background-color: #e0e0e0;
	}
	.menu-item:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(0, 0, 255, 0.5);
	}
</style>
