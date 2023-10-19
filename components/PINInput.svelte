<script lang="ts">
	import type { Color } from '$liwe3/types/types';

	export let value = '';
	export let size = 6;
	export let mode: Color = 'mode1';

	let fields: any[] = [];

	// generate an unique integer number
	const generateID = () => {
		return Math.floor(Math.random() * 1000000);
	};

	for (let i = 0; i < size; i++) {
		fields.push({
			id: `pin-${i}-${generateID()}`,
			name: `pin-${i}`
		});
	}

	if (value.length < size) {
		value = value.padEnd(size, '0');
	}

	// Updates the value of the PIN input with the given value at the given position
	const updateVALUE = (pos: number, val: string) => {
		const new_value = value.split('');
		new_value[pos] = val;

		value = new_value.join('');
	};

	const updatePIN = (e: Event) => {
		e.preventDefault();

		const target = e.target as HTMLInputElement;
		const name = target.name;
		const val = target.value;
		const pos = parseInt(name.split('-')[1]);

		updateVALUE(pos, val);
	};

	const onKeyPress = (e: KeyboardEvent) => {
		const target = e.target as HTMLInputElement;
		const name = target.name;
		const pos = parseInt(name.split('-')[1]);

		if (e.key === 'Backspace') {
			if (pos > 0) {
				target.value = '';

				// attempts to change focus to the previous input
				if (pos > 0) {
					const prevId = fields[pos - 1].id;
					const prev = document.getElementById(prevId) as HTMLInputElement;

					prev.focus();
				}
			}
		} else {
			// attempts to change focus to the next input
			if (pos < size - 1) {
				const nextId = fields[pos + 1].id;
				const next = document.getElementById(nextId) as HTMLInputElement;

				next.focus();
			}
		}
	};
</script>

<div class={`container ${mode}`}>
	{#each fields as field}
		<input
			type="text"
			name={field.name}
			id={field.id}
			required={true}
			maxLength={1}
			minLength={1}
			inputMode="numeric"
			on:input={updatePIN}
			on:keyup={onKeyPress}
		/>
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;

		padding: 1rem;
	}
	input {
		border-radius: var(--liwe-border-radius);
		border: 1px solid var(--border);

		text-align: center;

		padding: 1rem;
		width: 3rem;
	}
</style>
