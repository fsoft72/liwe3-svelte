<!-- VerticalDND.svelte - Vertical Drag and Drop Component -->
<script lang="ts">
	import { onMount } from 'svelte';

	type PropsType = {
		disabled?: boolean;
		placeholderText?: string;
		threshold?: number;
		children?: import('svelte').Snippet;
		onreorder?: (newOrder: string[]) => void; // Changed from number[] to string[]
	};

	let {
		onreorder,
		disabled = false,
		placeholderText = '',
		threshold = 20,
		children
	}: PropsType = $props();

	let container: HTMLDivElement;
	let childElements = $state<HTMLElement[]>([]);
	let draggedItemHeight = $state(0);
	let placeholder: HTMLDivElement | null = null;

	let dndIdCounter = 0;
	const getUniqueDndId = () => `dnd-item-${dndIdCounter++}`;

	// Drag and drop state
	let _dragState = $state({
		isDragging: false,
		draggedItemId: null as string | null,
		draggedElement: null as HTMLElement | null,
		draggedClone: null as HTMLElement | null,
		placeholderBeforeItemId: null as string | null, // ID of item placeholder is before, null for end
		originalNextSiblingId: null as string | null, // ID of the item originally after the dragged one
		startY: 0,
		currentY: 0,
		lastPlaceholderY: 0,
		mouseOffsetY: 0, // Mouse offset from element top edge
		fixedLeft: 0 // Fixed left position for clone
	});

	/**
	 * Create and insert placeholder element
	 */
	const _createPlaceholder = (): HTMLDivElement => {
		if (placeholder) {
			placeholder.remove();
		}

		placeholder = document.createElement('div');
		placeholder.className = 'dnd-placeholder';
		placeholder.style.height = `${draggedItemHeight}px`;

		if (placeholderText) {
			const span = document.createElement('span');
			span.className = 'placeholder-text';
			span.textContent = placeholderText;
			placeholder.appendChild(span);
		} else {
			// Add the default indicator line
			const line = document.createElement('div');
			line.className = 'placeholder-line';
			placeholder.appendChild(line);
		}

		return placeholder;
	};

	/**
	 * Update placeholder position
	 */
	const _updatePlaceholder = (): void => {
		if (!_dragState.isDragging || !container) return;

		// Remove existing placeholder
		if (placeholder) {
			placeholder.remove();
		}

		// Don't show placeholder if it's at the dragged item's original effective position
		if (_dragState.placeholderBeforeItemId === _dragState.originalNextSiblingId) {
			return;
		}

		// Create new placeholder
		_createPlaceholder(); // placeholder is a global var, created here

		// Insert placeholder at the correct position
		if (_dragState.placeholderBeforeItemId === null) {
			if (placeholder) container.appendChild(placeholder);
		} else {
			const targetElement = childElements.find(
				(el) => el.dataset.dndId === _dragState.placeholderBeforeItemId
			);
			if (targetElement && placeholder) {
				container.insertBefore(placeholder, targetElement);
			} else if (placeholder) {
				// Fallback if target not found (should ideally not happen)
				container.appendChild(placeholder);
			}
		}
	};
	/**
	 * Update children list when container content changes
	 */
	const _updateChildren = (): void => {
		if (!container) return;
		const newChildElements: HTMLElement[] = [];
		Array.from(container.children).forEach((child) => {
			if (child instanceof HTMLElement && !child.classList.contains('dnd-placeholder')) {
				if (!child.dataset.dndId) {
					child.dataset.dndId = getUniqueDndId();
				}
				newChildElements.push(child);
			}
		});
		childElements = newChildElements;
	};

	/**
	 * Create a visual clone of the dragged element that follows mouse vertically only
	 */
	const _createDragClone = (
		originalElement: HTMLElement,
		mouseX: number,
		mouseY: number
	): HTMLElement => {
		const clone = originalElement.cloneNode(true) as HTMLElement;
		const rect = originalElement.getBoundingClientRect();

		// Store the height for the placeholder
		draggedItemHeight = rect.height;

		// Calculate mouse offset relative to element (only Y)
		_dragState.mouseOffsetY = mouseY - rect.top;
		_dragState.fixedLeft = rect.left; // Store original left position

		// Clear any existing styles that might interfere
		clone.style.cssText = '';
		clone.className = originalElement.className + ' dnd-clone';

		// Apply positioning styles
		clone.style.position = 'fixed';
		clone.style.top = `${mouseY - _dragState.mouseOffsetY}px`;
		clone.style.left = `${_dragState.fixedLeft}px`; // Use fixed left position
		clone.style.width = `${rect.width}px`;
		clone.style.height = `${rect.height}px`;
		clone.style.zIndex = '9999';
		clone.style.transform = 'scale(1.05)';
		clone.style.opacity = '0.9';
		clone.style.pointerEvents = 'none';
		clone.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
		clone.style.borderRadius = 'var(--liwe3-border-radius)';
		clone.style.backgroundColor = 'var(--liwe3-background)';
		clone.style.border = '1px solid var(--liwe3-border-color)';

		// Ensure visibility
		clone.style.display = 'block';
		clone.style.visibility = 'visible';

		document.body.appendChild(clone);
		return clone;
	};

	/**
	 * Remove the drag clone from DOM
	 */
	const _removeDragClone = (): void => {
		if (!_dragState.draggedClone) return;

		try {
			document.body.removeChild(_dragState.draggedClone);
		} catch (error) {
			console.warn('Error removing drag clone:', error);
		}
		_dragState.draggedClone = null;
	};

	/**
	 * Handle drag start
	 */
	const _handleDragStart = (e: MouseEvent | TouchEvent, itemId: string): void => {
		if (disabled) return;

		_updateChildren(); // Ensure childElements and IDs are fresh
		const target = childElements.find((el) => el.dataset.dndId === itemId);
		if (!target) return;

		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

		_dragState.isDragging = true;
		_dragState.draggedItemId = itemId;
		_dragState.draggedElement = target;

		const currentIndex = childElements.findIndex((el) => el.dataset.dndId === itemId);
		if (currentIndex !== -1 && currentIndex + 1 < childElements.length) {
			_dragState.originalNextSiblingId = childElements[currentIndex + 1].dataset.dndId!;
		} else {
			_dragState.originalNextSiblingId = null; // Dragged item was last
		}
		// Initially, the placeholder conceptually occupies the original spot.
		_dragState.placeholderBeforeItemId = _dragState.originalNextSiblingId;

		_dragState.startY = clientY;
		_dragState.currentY = clientY;
		_dragState.lastPlaceholderY = clientY;

		// Create visual clone that follows mouse vertically only
		_dragState.draggedClone = _createDragClone(target, clientX, clientY);

		// Make the original element faint instead of removing it, for touch compatibility
		target.style.opacity = '0.1';
		// target.remove(); // Do not remove here
		// _updateChildren(); // Not needed here as DOM structure hasn't changed yet

		// Show initial placeholder (or hide if it's at original spot)
		_updatePlaceholder();

		document.addEventListener('mousemove', _handleDragMove);
		document.addEventListener('mouseup', _handleDragEnd);
		document.addEventListener('touchmove', _handleDragMove, { passive: false });
		document.addEventListener('touchend', _handleDragEnd);

		e.preventDefault();
	};

	/**
	 * Calculate new placeholder position based on mouse position
	 * Returns the ID of the item before which the placeholder should be, or null for the end.
	 */
	const _calculateTargetBeforeId = (clientY: number): string | null => {
		if (!container) return _dragState.placeholderBeforeItemId;

		const containerRect = container.getBoundingClientRect();
		const relativeY = clientY - containerRect.top;
		let cumulativeHeight = 0;

		// Consider all items *except* the one being dragged for position calculation
		const elementsToConsider = childElements.filter(
			(el) => el.dataset.dndId !== _dragState.draggedItemId
		);

		if (elementsToConsider.length === 0) return null;

		for (let i = 0; i < elementsToConsider.length; i++) {
			const child = elementsToConsider[i];
			// It's crucial to get the live bounding rect as items might have different heights
			const childRect = child.getBoundingClientRect();
			const childHeight = childRect.height;
			// childTop relative to container, considering current scroll
			const childTopInContainer = childRect.top - containerRect.top;

			// If mouse is in the top half of this child (relative to its current position)
			// The drop should be before this child
			if (relativeY < childTopInContainer + childHeight / 2) {
				return child.dataset.dndId!;
			}
		}
		// If cursor is below all elements
		return null; // Drop at the end
	};

	/**
	 * Check if placeholder should change position based on threshold
	 */
	const _shouldUpdatePlaceholder = (clientY: number, newBeforeId: string | null): boolean => {
		if (newBeforeId === _dragState.placeholderBeforeItemId) return false;

		// Only update if we've moved significantly from the last position where placeholder was updated
		const yDiff = Math.abs(clientY - _dragState.lastPlaceholderY);
		return yDiff > threshold;
	};

	/**
	 * Handle drag move
	 */
	const _handleDragMove = (e: MouseEvent | TouchEvent): void => {
		if (!_dragState.isDragging || !_dragState.draggedClone) return;

		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

		_dragState.currentY = clientY;

		// Position clone at fixed left position, only update Y
		const newTop = clientY - _dragState.mouseOffsetY;

		_dragState.draggedClone.style.left = `${_dragState.fixedLeft}px`; // Keep fixed left
		_dragState.draggedClone.style.top = `${newTop}px`;

		// Calculate new placeholder position with threshold check
		const newPlaceholderBeforeId = _calculateTargetBeforeId(clientY);

		if (_shouldUpdatePlaceholder(clientY, newPlaceholderBeforeId)) {
			_dragState.placeholderBeforeItemId = newPlaceholderBeforeId;
			_dragState.lastPlaceholderY = clientY; // Update Y pos for next threshold check
			_updatePlaceholder();
		}

		e.preventDefault();
	};

	/**
	 * Handle drag end
	 */
	const _handleDragEnd = (): void => {
		if (!_dragState.isDragging) return;

		// Restore original element opacity if it exists
		if (_dragState.draggedElement) {
			_dragState.draggedElement.style.opacity = '';
		}

		// Remove clone
		_removeDragClone();

		// Remove placeholder
		if (placeholder) {
			placeholder.remove();
			placeholder = null;
		}

		// Reorder elements if position changed
		if (
			_dragState.draggedElement &&
			_dragState.placeholderBeforeItemId !== _dragState.originalNextSiblingId
		) {
			const draggedItem = _dragState.draggedElement;

			// Remove from old position before inserting into new
			draggedItem.remove();

			// Insert at the new position
			if (_dragState.placeholderBeforeItemId === null) {
				container.appendChild(draggedItem);
			} else {
				const targetElement = container.querySelector(
					`[data-dnd-id="${_dragState.placeholderBeforeItemId}"]`
				);
				if (targetElement) {
					container.insertBefore(draggedItem, targetElement);
				} else {
					container.appendChild(draggedItem); // Fallback
				}
			}

			_updateChildren(); // Update after DOM change

			const newOrder = childElements.map((el) => el.id || el.dataset.dndId!);
			onreorder?.(newOrder);
		} else {
			// Item was not moved, or no dragged element.
			// If not moved, its opacity is restored. Ensure childElements is up-to-date.
			_updateChildren();
		}

		// Clean up event listeners
		document.removeEventListener('mousemove', _handleDragMove);
		document.removeEventListener('mouseup', _handleDragEnd);
		document.removeEventListener('touchmove', _handleDragMove);
		document.removeEventListener('touchend', _handleDragEnd);

		// Reset drag state
		_dragState.isDragging = false;
		_dragState.draggedItemId = null;
		_dragState.draggedElement = null;
		_dragState.placeholderBeforeItemId = null;
		_dragState.originalNextSiblingId = null;
		draggedItemHeight = 0;
	};

	/**
	 * Add drag handlers to all direct children
	 */
	const _setupDragHandlers = (): void => {
		if (!container || disabled) return;

		_updateChildren(); // Ensure children have IDs before attaching handlers

		childElements.forEach((child) => {
			child.style.cursor = 'move';
			child.style.userSelect = 'none';
			child.style.touchAction = 'none';

			// Remove existing listeners first to prevent duplicates if called multiple times
			if (child._dndMouseDown) {
				child.removeEventListener('mousedown', child._dndMouseDown);
			}
			if (child._dndTouchStart) {
				child.removeEventListener('touchstart', child._dndTouchStart);
			}

			const itemId = child.dataset.dndId!; // ID is guaranteed by _updateChildren

			// Create bound handlers
			const mouseDownHandler = (e: MouseEvent) => _handleDragStart(e, itemId);
			const touchStartHandler = (e: TouchEvent) => _handleDragStart(e, itemId);

			// Store handlers on element for later removal
			child._dndMouseDown = mouseDownHandler;
			child._dndTouchStart = touchStartHandler;

			// Add event listeners
			child.addEventListener('mousedown', mouseDownHandler);
			child.addEventListener('touchstart', touchStartHandler);
		});
	};

	onMount(() => {
		// Initial setup
		if (container) {
			_updateChildren(); // Ensure IDs are set on initial children
			_setupDragHandlers();
		}

		// Optional: Observe container for child changes if items can be added/removed externally
		// This would make it more robust to dynamic children not managed by this component's reordering.
		// For now, assuming _setupDragHandlers is sufficient for items managed by this DND.
	});
</script>

<div class="vertical-dnd-container" bind:this={container}>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.vertical-dnd-container {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	:global(.dnd-placeholder) {
		border: 2px dashed var(--liwe3-border-color, #ccc);
		border-radius: var(--liwe3-border-radius, 4px);
		background-color: var(--liwe3-background-alt, rgba(0, 0, 0, 0.05));
		margin: 0.3rem 0;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.7;
		transition: height 0.2s ease;
	}

	:global(.dnd-placeholder::after) {
		content: '';
		width: 30px;
		height: 2px;
		background-color: var(--liwe3-primary-color, #007acc);
		border-radius: 1px;
	}

	:global(.placeholder-line) {
		width: 30px;
		height: 2px;
		background-color: var(--liwe3-primary-color, #007acc);
		border-radius: 1px;
	}

	:global(.placeholder-text) {
		font-size: 0.9rem;
		color: var(--liwe3-color, #666);
		position: absolute;
	}

	:global(.dnd-clone) {
		position: fixed !important;
		z-index: 9999 !important;
		pointer-events: none !important;
		background-color: var(--liwe3-background, #fff) !important;
		border: 1px solid var(--liwe3-border-color, #ccc) !important;
		border-radius: var(--liwe3-border-radius, 4px) !important;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
	}

	:global(.vertical-dnd-container > *) {
		transition: opacity 0.2s ease;
	}

	:global(.vertical-dnd-container > *.dragging) {
		opacity: 0.1;
	}
</style>
