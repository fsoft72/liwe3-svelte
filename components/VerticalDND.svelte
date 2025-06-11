<!-- VerticalDND.svelte - Vertical Drag and Drop Component -->
<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte'; // onMount removed, $effect will handle setup

	type PropsType = {
		disabled?: boolean;
		placeholderText?: string;
		threshold?: number;
		children?: Snippet;
		handlePosition?: 'left' | 'right';
		onreorder?: (newOrder: any[]) => void;
		items?: any[]; // Optional items list to reorder
	};

	let {
		onreorder,
		disabled = false,
		placeholderText = '',
		threshold = 20,
		handlePosition = 'right', // Not used in this version, but can be extended
		items: _items = [], // Optional items list to reorder
		children
	}: PropsType = $props();

	let container: HTMLDivElement;
	let childElements = $state<HTMLElement[]>([]); // These will be the wrapper elements
	let draggedItemHeight = $state(0);
	let placeholder: HTMLDivElement | null = null;
	let observer: MutationObserver;

	let dndIdToOriginalItemMap = new Map<string, any>(); // Maps dndId of wrapper to original item object

	let dndIdCounter = 0;
	const base = new Date().getTime().toString(36); // Base for unique IDs
	const getUniqueDndId = () => `dnd-${base}-${dndIdCounter++}`;

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
			line.className = 'placeholder-line'; // Ensure this class is styled if you prefer it over ::after
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
	 * Update children list when container content changes.
	 * Wraps raw children with a dnd-item-wrapper and adds a drag handle.
	 */
	const _updateChildren = (): void => {
		if (!container) return;
		// Clear previous childElements
		const newWrappedElements: HTMLElement[] = [];
		const childrenToProcess = Array.from(container.children); // Snapshot

		childrenToProcess.forEach((childNode) => {
			if (childNode instanceof HTMLElement && !childNode.classList.contains('dnd-placeholder')) {
				if (childNode.classList.contains('dnd-item-wrapper')) {
					// Already a wrapper, ensure dndId and add to list
					if (!childNode.dataset.dndId) {
						childNode.dataset.dndId = getUniqueDndId();
					}
					// If handlePosition could change dynamically, we might need to re-adjust handle order here.
					// For now, assuming it's set on init.
					newWrappedElements.push(childNode);
				} else {
					// This is a content element, needs to be wrapped
					const contentElement = childNode;
					const wrapper = document.createElement('div');
					wrapper.className = 'dnd-item-wrapper';
					wrapper.dataset.dndId = getUniqueDndId(); // Wrapper gets its own unique ID

					const handle = document.createElement('div');
					handle.className = 'dnd-drag-handle';
					handle.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display: block;">
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
                        </svg>
                    `;
					handle.setAttribute('aria-label', 'Drag handle');

					// Insert wrapper before contentElement
					container.insertBefore(wrapper, contentElement);

					if (handlePosition === 'left') {
						wrapper.appendChild(handle);
						wrapper.appendChild(contentElement); // Moves the original content element
						handle.style.marginRight = '8px';
						handle.style.marginLeft = '0px';
					} else {
						// 'right' or default
						wrapper.appendChild(contentElement); // Moves the original content element
						wrapper.appendChild(handle);
						handle.style.marginLeft = '8px';
						handle.style.marginRight = '0px';
					}

					newWrappedElements.push(wrapper);
				}
			}
		});
		childElements = newWrappedElements; // These are all wrappers
	};

	/**
	 * Build map from dnd-id to original item object.
	 * Assumes childElements and _items are in corresponding initial order.
	 */
	const _buildInitialDndIdToItemMap = (): void => {
		dndIdToOriginalItemMap.clear();
		if (_items.length > 0 && childElements.length === _items.length) {
			childElements.forEach((wrapper, index) => {
				const dndId = wrapper.dataset.dndId;
				if (dndId && _items[index] !== undefined) {
					dndIdToOriginalItemMap.set(dndId, _items[index]);
				}
			});
		} else if (_items.length > 0 && childElements.length !== _items.length) {
			console.warn(
				'VerticalDND: Mismatch between items count and rendered children count during map creation. Item mapping may be incorrect.'
			);
		}
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
		clone.style.width = `${rect.width - 10}px`;
		clone.style.height = `${rect.height - 10}px`;
		clone.style.boxSizing = 'border-box'; // Add for consistent sizing
		clone.style.zIndex = '9999';
		clone.style.transform = 'scale(1.03)';
		clone.style.opacity = '0.9';
		clone.style.pointerEvents = 'none';
		clone.style.backgroundColor = 'transparent'; // Use original background color
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

		// _updateChildren(); // Not needed here, $effect handles it. childElements are wrappers.
		const targetWrapper = childElements.find((el) => el.dataset.dndId === itemId);
		if (!targetWrapper) return;

		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

		_dragState.isDragging = true;
		_dragState.draggedItemId = itemId;
		_dragState.draggedElement = targetWrapper; // This is the wrapper

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
		_dragState.draggedClone = _createDragClone(targetWrapper, clientX, clientY);

		// Make the original element faint instead of removing it, for touch compatibility
		targetWrapper.style.opacity = '0.1';
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

			_updateChildren(); // Update childElements to reflect new DOM order

			if (_items.length > 0) {
				// Use the map to get the reordered list of original item objects
				const reorderedItems = childElements
					.map((el) => dndIdToOriginalItemMap.get(el.dataset.dndId!))
					.filter((item) => item !== undefined); // Filter out undefined if any dndId wasn't in map

				if (reorderedItems.length === _items.length) {
					onreorder?.(reorderedItems);
				} else {
					console.warn(
						'VerticalDND: Could not map reordered items. Item count mismatch. Falling back to IDs.'
					);
					const newOrderIds = childElements.map((el) => el.dataset.dndId!);
					onreorder?.(newOrderIds);
				}
			} else {
				// No _items prop, just pass the dnd-ids
				const newOrderIds = childElements.map((el) => el.dataset.dndId!);
				onreorder?.(newOrderIds);
			}
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

	// Extend HTMLElement interface for custom properties if not using a more robust WeakMap approach
	// This is often implicitly handled by TypeScript in Svelte files for DOM elements.
	// interface HTMLElement {
	// 	_dndMouseDown?: (e: MouseEvent) => void;
	// 	_dndTouchStart?: (e: TouchEvent) => void;
	// }

	/**
	 * Add drag handlers to all direct children's drag handles
	 */
	const _setupDragHandlers = (): void => {
		if (!container) return;

		// _updateChildren() is called by $effect before this, ensuring wrappers and IDs

		childElements.forEach((wrapper) => {
			// Iterate over wrappers
			const handle = wrapper.querySelector('.dnd-drag-handle') as HTMLElement | null;

			if (!handle) {
				// console.warn('DND: Drag handle not found in wrapper', wrapper);
				return;
			}

			// Clear any existing styles that might interfere if re-running
			handle.style.cursor = '';
			// @ts-expect-error _dndMouseDown is a custom property
			if (handle._dndMouseDown) {
				// @ts-expect-error _dndMouseDown is a custom property
				handle.removeEventListener('mousedown', handle._dndMouseDown);
			}
			// @ts-expect-error _dndTouchStart is a custom property
			if (handle._dndTouchStart) {
				// @ts-expect-error _dndTouchStart is a custom property
				handle.removeEventListener('touchstart', handle._dndTouchStart);
			}

			if (disabled) {
				// If disabled, ensure no drag interactions are possible on handle
				// Listeners are not added below.
				return;
			}

			handle.style.cursor = 'move';
			// touchAction: 'none' is set via CSS on .dnd-drag-handle

			const itemId = wrapper.dataset.dndId!; // ID of the wrapper

			// Create bound handlers
			const mouseDownHandler = (e: MouseEvent) => {
				e.stopPropagation(); // Prevent event from bubbling to parent elements
				_handleDragStart(e, itemId);
			};
			const touchStartHandler = (e: TouchEvent) => {
				e.stopPropagation(); // Prevent event from bubbling
				_handleDragStart(e, itemId);
			};

			// Store handlers on element for later removal
			// @ts-expect-error _dndMouseDown is a custom property
			handle._dndMouseDown = mouseDownHandler;
			// @ts-expect-error _dndTouchStart is a custom property
			handle._dndTouchStart = touchStartHandler;

			// Add event listeners
			handle.addEventListener('mousedown', mouseDownHandler);
			handle.addEventListener('touchstart', touchStartHandler, { passive: false });
		});
	};

	onMount(() => {
		// Initial setup of children and drag handlers
		if (container) {
			// Observe changes to the container's children for async elements rendering
			observer = new MutationObserver(() => {
				_updateChildren();
				_buildInitialDndIdToItemMap();
				_setupDragHandlers();
			});
			observer.observe(container, { childList: true });

			// Initial run
			_updateChildren(); // Wrap children in dnd-item-wrapper and assign dnd-ids
			_buildInitialDndIdToItemMap(); // Build the map from dnd-ids to original items
			_setupDragHandlers(); // Setup drag handlers for the wrapped items
		}
	});

	// Clean up event listeners on document when component is destroyed
	onDestroy(() => {
		document.removeEventListener('mousemove', _handleDragMove);
		document.removeEventListener('mouseup', _handleDragEnd);
		document.removeEventListener('touchmove', _handleDragMove);
		document.removeEventListener('touchend', _handleDragEnd);
		if (_dragState.draggedClone) {
			_removeDragClone();
		}

		if (observer) observer.disconnect();
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

	:global(.dnd-item-wrapper) {
		display: flex;
		align-items: center; /* Vertically align content and handle */
		position: relative;
		/* Optional: add some visual separation or styling for wrappers */
		/* margin-bottom: 2px; */
		/* background-color: rgba(0,0,0,0.02); */
	}

	:global(.dnd-drag-handle) {
		width: 32px;
		height: 32px;
		padding: 4px; /* Makes the touch target a bit larger */
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: move;
		/* margin-left: 8px; */ /* Removed: Will be set dynamically based on handlePosition */
		flex-shrink: 0; /* Prevent handle from shrinking */
		touch-action: none; /* Crucial for touch dragging without page scroll */
		color: var(--liwe3-color-subtle, #555); /* Icon color */
		border-radius: var(--liwe3-border-radius, 4px);
	}
	:global(.dnd-drag-handle:hover) {
		background-color: var(--liwe3-background-alt, rgba(0, 0, 0, 0.05));
	}
	:global(.dnd-drag-handle svg) {
		width: 20px; /* Adjust icon size */
		height: 20px;
		display: block; /* Remove extra space below SVG */
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
		/* background-color: var(--liwe3-background, #fff) !important; */
		/* background-color: red !important; Temporary for visibility */
		/* border-radius: var(--liwe3-border-radius, 4px) !important; */
		/* box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important; */
	}

	:global(.vertical-dnd-container > *) {
		/* This now targets .dnd-item-wrapper */
		transition: opacity 0.2s ease;
	}

	:global(.vertical-dnd-container > *.dragging) {
		/* This class is not explicitly added, opacity is set directly */
		opacity: 0.1; /* This style is applied to the original dragged item (wrapper) */
	}
</style>
