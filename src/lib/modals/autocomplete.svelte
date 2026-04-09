<script>
	export let form_keys = [];
	export let form_values = [];
	export let current_key = null;
	export let current_value = '';
	export let disabled = false;
	export let onchange = () => {};
	export let is_number = false;

	let filteredItems = [];
	let open = false;

	// Called when a suggestion is chosen
	function onItemClicked(item) {
		current_value = item;
		current_key = is_number
			? +form_keys[form_values.indexOf(item)]
			: form_keys[form_values.indexOf(item)];

		open = false;
		onchange();
	}

	// reactive filter
	$: filteredItems = Array.isArray(form_values)
		? form_values.filter((item) =>
				item.toLowerCase().includes(current_value || current_value == '' ? current_value.toLowerCase() : '')
			)
		: [];

	function onInputFocus() {
		open = true;
		if(!current_value)
		{
			current_value = '';
		}
	}

	function onInputChange() {
		// Open while typing, but DO NOT auto-select here (prevents backspace problems)
		open = true;
	}

	// Autocomplete behavior restored:
	// Select the single remaining suggestion when the input "changes" (i.e. loses focus with changed content)
	// This mirrors native <input onChange> behavior and avoids interfering while typing.
	function onInputChangeCommitted() {
		if (filteredItems.length === 1) {
			onItemClicked(filteredItems[0]);
		}
		console.log(filteredItems.length, form_values.length);
		if (filteredItems.length === form_values.length && current_value == "")
		{
			current_key = null;
			onchange();
		}
	}

	// Keyboard: Enter selects first suggestion if dropdown open
	function onInputKeyDown(e) {
		if(filteredItems.length == form_values.length && current_value == '') {
			current_key = null;
			onchange();
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			if (filteredItems.length > 0 && filteredItems.length < form_values.length) {
				onItemClicked(filteredItems[0]);
			}
			
		} else if (e.key === 'Escape') {
			open = false;
		}
	}

	// Optional: close dropdown when clicking outside
	// We'll add a simple handler that closes dropdown on blur — but keep selection working via mousedown on items
	function onInputBlur() {
		// small timeout to allow mousedown on suggestion to fire first
		setTimeout(() => {
			open = false;
		}, 100);
	}
</script>

<div class="dropdown w-full relative">
	<input
		type="text"
		placeholder=""
		{disabled}
		bind:value={current_value}
		on:input={onInputChange}
		on:keydown={onInputKeyDown}
		on:focus={onInputFocus}
		on:dblclick={() => {open=false; current_key = null; current_value = ''; onchange();}}
		class={`
      select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 
      dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-white 
      dark:bg-[#0c1d37] text-sm text-gray-800 placeholder:text-gray-400 
      focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white 
      dark:placeholder:text-white
      ${disabled ? 'opacity-50 disabled:bg-gray-200 disabled:text-gray-700 cursor-not-allowed' : ''}
    `}
	/>

	{#if open && filteredItems.length > 0}
		<ul
			tabindex="0"
			class="fixed mt-1 z-[100] bg-gray-100 rounded-md
             max-h-40 overflow-y-auto border border-gray-300 shadow-md"
		>
			{#each filteredItems as item}
				<li class="p-0 border-b border-gray-200 last:border-0">
					<a
						class="block w-full px-3 py-2 text-left text-gray-900 text-xs hover:bg-gray-200 cursor-pointer select-none"
						on:mousedown|preventDefault={() => onItemClicked(item)}
					>
						{item}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
