# VerticalDND Component

A reusable Svelte 5 component that adds drag-and-drop functionality to any list of elements arranged vertically.

## Features

- ✅ **Easy to Use**: Simply wrap your list items with the `VerticalDND` component
- ✅ **Child-based**: Only direct children are considered draggable elements
- ✅ **Visual Feedback**: Shows a placeholder with the same height as the dragged element
- ✅ **Touch Support**: Works on both desktop (mouse) and mobile (touch) devices
- ✅ **Customizable**: Configurable placeholder text, threshold, and disable state
- ✅ **Performance**: Uses efficient DOM manipulation and threshold-based updates

## Basic Usage

```svelte
<script lang="ts">
    import VerticalDND from '$liwe3/components/VerticalDND.svelte';

    let items = ['Item 1', 'Item 2', 'Item 3'];

    const handleReorder = (newOrder: number[]) => {
        console.log('Items reordered:', newOrder);
        // Handle the reorder event here
    };
</script>

<VerticalDND onreorder={handleReorder}>
    {#snippet children()}
        {#each items as item}
            <div class="my-item">
                {item}
            </div>
        {/each}
    {/snippet}
</VerticalDND>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onreorder` | `(newOrder: number[]) => void` | `undefined` | Callback function called when items are reordered |
| `disabled` | `boolean` | `false` | Whether drag and drop is disabled |
| `placeholderText` | `string` | `''` | Text to show in the placeholder (optional) |
| `threshold` | `number` | `20` | Pixel threshold before updating placeholder position |

## Events

### `onreorder`

Called when the user completes a drag operation that results in a reorder.

**Parameters:**
- `newOrder: number[]` - Array of indices representing the new order

**Note:** The component reorders DOM elements directly. To get the actual new order of your data, you should read the DOM structure after the reorder event.

## Advanced Usage

### With Custom Placeholder Text

```svelte
<VerticalDND onreorder={handleReorder} placeholderText="Drop here">
    {#each items as item}
        <div class="item">{item}</div>
    {/each}
</VerticalDND>
```

### With Disable State

```svelte
<VerticalDND onreorder={handleReorder} disabled={isReadOnly}>
    {#each items as item}
        <div class="item">{item}</div>
    {/each}
</VerticalDND>
```

### Reading Reordered Data

Since the component reorders DOM elements directly, you should read the new order from the DOM:

```svelte
<script lang="ts">
    const handleReorder = (newOrder: number[]) => {
        // Get the reordered data by reading DOM attributes
        const container = document.querySelector('.vertical-dnd-container');
        if (container) {
            const reorderedItems = Array.from(container.children)
                .filter(child => child.hasAttribute('data-item-id'))
                .map(child => child.getAttribute('data-item-id'));

            // Update your data array based on reorderedItems
            items = reorderedItems.map(id => items.find(item => item.id === id));
        }
    };
</script>

<VerticalDND onreorder={handleReorder}>
    {#each items as item}
        <div class="item" data-item-id={item.id}>
            {item.name}
        </div>
    {/each}
</VerticalDND>
```

## Styling

The component provides several CSS classes that you can style:

```css
/* Container */
.vertical-dnd-container {
    /* Your container styles */
}

/* Placeholder shown during drag */
.dnd-placeholder {
    /* Customize placeholder appearance */
}

/* Placeholder text */
.placeholder-text {
    /* Style the placeholder text */
}

/* Placeholder line (default indicator) */
.placeholder-line {
    /* Style the default placeholder line */
}

/* Clone element during drag */
:global(.dnd-clone) {
    /* Customize the dragged clone appearance */
}
```

## CSS Custom Properties

The component uses CSS custom properties that you can override:

```css
:root {
    --liwe3-border-color: #ccc;
    --liwe3-border-radius: 4px;
    --liwe3-background: #fff;
    --liwe3-background-alt: rgba(0, 0, 0, 0.05);
    --liwe3-primary-color: #007acc;
    --liwe3-color: #666;
}
```

## Implementation Details

### How it Works

1. **Initialization**: The component scans for direct children and adds drag event listeners
2. **Drag Start**: Creates a visual clone and shows the initial placeholder
3. **Drag Move**: Updates clone position and placeholder location based on mouse/touch position
4. **Drag End**: Reorders DOM elements and cleans up

### Browser Support

- Modern browsers with ES6+ support
- Touch events for mobile devices
- Mouse events for desktop

### Performance Considerations

- Uses a configurable threshold to prevent excessive placeholder updates
- Efficient DOM manipulation with minimal reflows
- Event listeners are properly cleaned up

## Troubleshooting

### Items not draggable
- Ensure items are direct children of the VerticalDND component
- Check that `disabled` prop is not set to `true`

### Placeholder not showing
- Verify that the dragged element has a height
- Check CSS for conflicts with placeholder styles

### Reorder event not firing
- Make sure the `onreorder` prop is properly passed
- Ensure the drag operation actually results in a position change

## Migration from Built-in Drag and Drop

If you're migrating from a custom drag-and-drop implementation:

1. Remove custom drag state management
2. Remove drag event handlers
3. Remove placeholder creation logic
4. Wrap your draggable list with `VerticalDND`
5. Implement the `onreorder` callback
6. Update CSS to remove old drag-related styles

## License

This component is part of the liwe3 component library.
