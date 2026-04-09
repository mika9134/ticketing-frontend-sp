<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { getAccessToken } from '../../../../stores/tokenStore.js';
	import { host } from '../../../../apis/config.js';
	import { fetchTable } from '../../../../apis/table.js';

	/* PROPS */
	export let category = '';
	export let parentProduct = '';
	export let product = '';
	export let warehouse = '';
	export let stock_type = '';
	export let disabled = false;
	export let warehouse_enabled = false;
	export let category_enabled = true;
	export let product_enabled = true;
	export let sku_enabled = true;

	const dispatch = createEventDispatcher();

	const categoryURL = `${host}dashboard-volume/get-categories`;
	const parentProductURL = `${host}dashboard-volume/get-parent-products-by-category/`;
	const productURL = `${host}dashboard-volume/get-products-by-category/`;
	const warehouseURL = `${host}dashboard-volume/get-warehouses/`;

	let token = '';
	let categories = [];
	let parentProducts = [];
	let products = [];
	let warehouses = [];
	let stock_types = ['Regular', 'Promotional', 'Defect'];

	async function ensureToken() {
		if (!token) token = getAccessToken();
	}

	async function loadCategories() {
		try {
			await ensureToken();
			const res = await fetchTable(categoryURL, token);
			categories = res?.succeed ? res.data : [];
		} catch (e) {
			categories = [];
			category = '';
		}
	}

	async function loadParentProducts(categoryId) {
		try {
			if (!categoryId) {
				parentProducts = [];
				return;
			}
			await ensureToken();
			const res = await fetchTable(`${parentProductURL}${categoryId}`, token);
			parentProducts = res?.succeed ? res.data : [];
		} catch (e) {
			parentProducts = [];
			parentProduct = '';
		}
	}

	async function loadProducts(parentProduct) {
		try {
			if (!parentProduct) {
				products = [];
				return;
			}
			await ensureToken();
			const res = await fetchTable(`${productURL}${parentProduct}`, token);
			products = res?.succeed ? res.data : [];
		} catch (e) {
			products = [];
			product = '';
		}
	}

	async function loadWarehouses() {
		try {
			await ensureToken();
			const res = await fetchTable(warehouseURL, token);
			warehouses = res?.succeed ? res.data : [];
		} catch (e) {
			warehouses = [];
			warehouse = '';
		}
	}

	function onCategoryChange(category_event) {
		parentProduct = '';
		product = '';
		loadParentProducts(category);
		dispatch('change', { category, parentProduct, product, warehouse, stock_type });
	}

	function onParentProductChange() {
		product = '';
		loadProducts(parentProduct);
		dispatch('change', { category, parentProduct, product, warehouse, stock_type });
	}

	function onProductChange() {
		dispatch('change', { category, parentProduct, product, warehouse, stock_type });
	}

	function onWarehouseChange() {
		dispatch('change', { category, parentProduct, product, warehouse, stock_type });
	}

	function onStockTypeChange() {
		dispatch('change', { category, parentProduct, product, warehouse, stock_type });
	}

	function clearFilter() {
		category = '';
		parentProduct = '';
		product = '';
		warehouse = '';
		stock_type = '';
		dispatch('change', { category, parentProduct, product, warehouse, stock_type });
	}
	$: onCategoryChange(category);

	onMount(() => {
		loadCategories();
		loadWarehouses();
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-2">
		<span class="font-bold text-sm text-gray-800 dark:text-gray-100 uppercase tracking-tight"
			>Product Selection</span
		>
		<button
			on:click={() => clearFilter()}
			class="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
		>
			Clear
		</button>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div class={`${category_enabled ? 'flex flex-col gap-1' : 'hidden'}`}>
			<label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1"
				>Category</label
			>
			<select
				class="select select-sm w-full rounded-md border text-sm transition-all
					bg-white dark:bg-[#002a47]
					text-gray-900 dark:text-white
					border-gray-900 dark:border-gray-800"
				bind:value={category}
				on:change={onCategoryChange}
				{disabled}
				>
				<option value="">All</option>
				{#each categories as c}
				<option value={c.id}>{@html c.name}</option>
				{/each}
			</select>
		</div>
		
		<div class={`${product_enabled ? 'flex flex-col gap-1' : 'hidden'}`}>
			<label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1"
				>Product</label
			>
			<select
				class="select select-sm w-full rounded-md border text-sm transition-all
					bg-white dark:bg-[#002a47]
					text-gray-900 dark:text-white
					border-gray-900 dark:border-gray-800
					disabled:opacity-50"
				bind:value={parentProduct}
				on:change={onParentProductChange}
				disabled={!category || disabled}
			>
				<option value="">All</option>
				{#each parentProducts as p}
					<option value={p.id}>{p.name}</option>
				{/each}
			</select>
		</div>

		<div class={`${sku_enabled ? 'flex flex-col gap-1' : 'hidden'}`}>
			<label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1"
				>SKU</label
			>
			<select
				class="select select-sm w-full rounded-md border text-sm transition-all
					bg-white dark:bg-[#002a47]
					text-gray-900 dark:text-white
					border-gray-900 dark:border-gray-800
					disabled:opacity-50"
				bind:value={product}
				on:change={onProductChange}
				disabled={!category || !parentProduct || disabled}
			>
				<option value="">All</option>
				{#each products as p}
					<option value={p.id}>{p.name}</option>
				{/each}
			</select>
		</div>

		{#if warehouse_enabled}
			<div class="flex flex-col gap-1">
				<label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1"
					>Warehouse</label
				>
				<select
					class="select select-sm w-full rounded-md border text-sm transition-all
                       bg-white dark:bg-[#002a47]
                       text-gray-900 dark:text-white
                       border-gray-900 dark:border-gray-800"
					bind:value={warehouse}
					on:change={onWarehouseChange}
				>
					<option value="">All Warehouses</option>
					{#each warehouses as w}
						<option value={w.id}>{w.name}</option>
					{/each}
				</select>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1"
					>Stock Type</label
				>
				<select
					class="select select-sm w-full rounded-md border text-sm transition-all
                       bg-white dark:bg-[#002a47]
                       text-gray-900 dark:text-white
                       border-gray-900 dark:border-gray-800"
					bind:value={stock_type}
					on:change={onStockTypeChange}
				>
					<option value="">None</option>
					{#each stock_types as s}
						<option value={s}>{s}</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>
</div>
