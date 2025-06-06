<!-- VerticalDND.svelte - Vertical Drag and Drop Component -->
<script lang="ts">
    type PropsType = {
        onreorder?: (newOrder: number[]) => void;
        disabled?: boolean;
        placeholderText?: string;
        threshold?: number;
        children?: import('svelte').Snippet;
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

    // Drag and drop state
    let _dragState = $state({
        isDragging: false,
        draggedIndex: -1,
        draggedElement: null as HTMLElement | null,
        draggedClone: null as HTMLElement | null,
        placeholderIndex: -1,
        startY: 0,
        currentY: 0,
        lastPlaceholderY: 0,
        mouseOffsetY: 0,  // Mouse offset from element top edge
        fixedLeft: 0      // Fixed left position for clone
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

        // Don't show placeholder at the dragged item's original position
        if (_dragState.placeholderIndex === _dragState.draggedIndex) return;

        // Create new placeholder
        _createPlaceholder();

        // Insert placeholder at the correct position
        if (_dragState.placeholderIndex >= childElements.length) {
            if (placeholder) container.appendChild(placeholder);
        } else {
            const targetElement = childElements[_dragState.placeholderIndex];
            if (targetElement && placeholder) {
                container.insertBefore(placeholder, targetElement);
            }
        }
    };
    /**
     * Update children list when container content changes
     */
    const _updateChildren = (): void => {
        if (!container) return;
        childElements = Array.from(container.children).filter(child =>
            !child.classList.contains('dnd-placeholder')
        ) as HTMLElement[];
    };

    /**
     * Create a visual clone of the dragged element that follows mouse vertically only
     */
    const _createDragClone = (originalElement: HTMLElement, mouseX: number, mouseY: number): HTMLElement => {
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
    const _handleDragStart = (e: MouseEvent | TouchEvent, index: number): void => {
        if (disabled) return;

        const target = childElements[index];
        if (!target) return;

        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

        _dragState.isDragging = true;
        _dragState.draggedIndex = index;
        _dragState.draggedElement = target;
        _dragState.placeholderIndex = index;
        _dragState.startY = clientY;
        _dragState.currentY = clientY;
        _dragState.lastPlaceholderY = clientY;

        // Create visual clone that follows mouse vertically only
        _dragState.draggedClone = _createDragClone(target, clientX, clientY);
        target.style.opacity = '0.1';

        // Show initial placeholder
        _updatePlaceholder();

        document.addEventListener('mousemove', _handleDragMove);
        document.addEventListener('mouseup', _handleDragEnd);
        document.addEventListener('touchmove', _handleDragMove, { passive: false });
        document.addEventListener('touchend', _handleDragEnd);

        e.preventDefault();
    };

    /**
     * Calculate new placeholder index based on mouse position
     */
    const _calculatePlaceholderIndex = (clientY: number): number => {
        if (!container) return _dragState.placeholderIndex;

        const containerRect = container.getBoundingClientRect();
        const relativeY = clientY - containerRect.top;

        let cumulativeHeight = 0;
        let targetIndex = 0;

        for (let i = 0; i < childElements.length; i++) {
            const child = childElements[i];
            const childHeight = child.getBoundingClientRect().height;

            if (relativeY < cumulativeHeight + childHeight / 2) {
                targetIndex = i;
                break;
            }

            cumulativeHeight += childHeight;
            targetIndex = i + 1;
        }

        // Clamp to valid range
        return Math.max(0, Math.min(childElements.length, targetIndex));
    };

    /**
     * Check if placeholder should change position based on threshold
     */
    const _shouldUpdatePlaceholder = (clientY: number, newIndex: number): boolean => {
        if (newIndex === _dragState.placeholderIndex) return false;

        // Only update if we've moved significantly from the last position
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
        const newPlaceholderIndex = _calculatePlaceholderIndex(clientY);

        if (_shouldUpdatePlaceholder(clientY, newPlaceholderIndex)) {
            _dragState.placeholderIndex = newPlaceholderIndex;
            _dragState.lastPlaceholderY = clientY;
            _updatePlaceholder();
        }

        e.preventDefault();
    };

    /**
     * Handle drag end
     */
    const _handleDragEnd = (): void => {
        if (!_dragState.isDragging) return;

        // Restore original element opacity
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
        if (_dragState.draggedIndex !== _dragState.placeholderIndex) {
            const draggedElement = childElements[_dragState.draggedIndex];

            if (draggedElement && container) {
                // Remove the dragged element temporarily
                draggedElement.remove();

                // Insert at the new position
                if (_dragState.placeholderIndex >= childElements.length) {
                    container.appendChild(draggedElement);
                } else {
                    // Calculate the correct target element after the draggedElement was removed
                    const remainingChildren = Array.from(container.children).filter(child =>
                        !child.classList.contains('dnd-placeholder')
                    ) as HTMLElement[];

                    const targetElement = remainingChildren[_dragState.placeholderIndex];
                    if (targetElement) {
                        container.insertBefore(draggedElement, targetElement);
                    } else {
                        container.appendChild(draggedElement);
                    }
                }

                // Update children list and notify parent
                _updateChildren();

                // Create order array with new indices (this is for compatibility,
                // but parent should read the actual DOM order)
                const newOrder = Array.from({ length: childElements.length }, (_, i) => i);
                onreorder?.(newOrder);
            }
        }

        // Clean up event listeners
        document.removeEventListener('mousemove', _handleDragMove);
        document.removeEventListener('mouseup', _handleDragEnd);
        document.removeEventListener('touchmove', _handleDragMove);
        document.removeEventListener('touchend', _handleDragEnd);

        // Reset drag state
        _dragState.isDragging = false;
        _dragState.draggedIndex = -1;
        _dragState.draggedElement = null;
        _dragState.placeholderIndex = -1;
        draggedItemHeight = 0;
    };

    /**
     * Add drag handlers to all direct children
     */
    const _setupDragHandlers = (): void => {
        if (!container || disabled) return;

        _updateChildren();

        childElements.forEach((child, index) => {
            child.style.cursor = 'move';
            child.style.userSelect = 'none';
            child.style.touchAction = 'none';

            // Remove existing listeners first
            if (child._dndMouseDown) {
                child.removeEventListener('mousedown', child._dndMouseDown);
            }
            if (child._dndTouchStart) {
                child.removeEventListener('touchstart', child._dndTouchStart);
            }

            // Create bound handlers
            const mouseDownHandler = (e: MouseEvent) => _handleDragStart(e, index);
            const touchStartHandler = (e: TouchEvent) => _handleDragStart(e, index);

            // Store handlers on element for later removal
            child._dndMouseDown = mouseDownHandler;
            child._dndTouchStart = touchStartHandler;

            // Add event listeners
            child.addEventListener('mousedown', mouseDownHandler);
            child.addEventListener('touchstart', touchStartHandler);
        });
    };

    // Setup drag handlers when container or children change
    $effect(() => {
        if (container) {
            _setupDragHandlers();
        }
    });

    // Re-setup when disabled state changes
    $effect(() => {
        if (container) {
            if (disabled) {
                childElements.forEach(child => {
                    child.style.cursor = '';
                    if (child._dndMouseDown) {
                        child.removeEventListener('mousedown', child._dndMouseDown);
                    }
                    if (child._dndTouchStart) {
                        child.removeEventListener('touchstart', child._dndTouchStart);
                    }
                });
            } else {
                _setupDragHandlers();
            }
        }
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
