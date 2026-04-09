<script>
	import { onMount } from 'svelte';
	import { fetchTopCategoriesTable } from '../../../../apis/api-utils.js';
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';
	import { formatFieldNames } from '$lib/utils';
	import TopProducts from '../charts/top-products.svelte';
	import { exportCSV } from '../../../../apis/table.js'; // Adjust the path as needed
	import CategoryFilter from '../filter/category_filter.svelte';

	export let region = '';
	export let timeline = 'Daily';
	export let span = 7;
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';
	export let parent_category = '';

	export let parentProduct = '';

	let maxItems = 10;

	let top_n = 3;
	let std = [];
	let nstd = []
	let category = '';
	let showFilters = false;

	let currentTheme = get(themeStore);
	themeStore.subscribe(() => {
		// refetch on theme change if needed
		fetchData(span, timeline, region, territory, route, point_of_sale, parent_category, top_n, parentProduct);
	});

	async function fetchData(
		selectedSpan,
		selectedTimeline,
		region_id,
		territory_id,
		route_id,
		point_of_sale_id,
		parent_category_id,
		top_n,
		parent_product_id,
	) {
		try {
			const std_data = await fetchTopCategoriesTable(
				selectedSpan,
				selectedTimeline,
				region_id,
				territory_id,
				route_id,
				point_of_sale_id,
				parent_category_id,
				top_n,
				"Standard",
				parentProduct
			);
			std = std_data;

			const nstd_data = await fetchTopCategoriesTable(
				selectedSpan,
				selectedTimeline,
				region_id,
				territory_id,
				route_id,
				point_of_sale_id,
				parent_category_id,
				top_n,
				"Non Standard",
				parentProduct
			);
			nstd = nstd_data;

		} catch (error) {
			console.error('Error fetching Top Categories: ', error);
		}
	}

	$: fetchData(span, timeline, region, territory, route, point_of_sale, parent_category, top_n, parentProduct);
</script>

{#if nstd.length == 0 && std.length == 0}
	<p class="p-2 text-gray-900 dark:text-gray-200">No product sales in this period</p>
{/if}
<div class={nstd.length == 0 || std.length == 0 ? "grid grid-cols-1 gap-4 bg-white dark:bg-[#002a47]" : "grid grid-cols-2 gap-4 bg-white dark:bg-[#002a47]"}>
<div>
	{#if std.length > 0 || nstd.length == 0}
	<TopProducts {span} {region} {timeline} {territory} {route} {point_of_sale} bind:category={parent_category} bind:parentProduct={parentProduct} {top_n} product_type={"Standard"} />
	<div class="overflow-y-scroll rounded-xl bg-white dark:bg-[#002a47]">
		<table class="table bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0 m-4">
			<!-- head -->
			<thead
				class="text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-[#0f1727] sticky top-0 z-0"
			>
				<tr>
					{#if std.length > 0}
						<th></th>
						{#each Object.keys(std[0]).slice(1) as key}
							<th>{formatFieldNames(key)}</th>
						{/each}
						<th
							><div
								onclick={() => {
									exportCSV(std);
								}}
								class="flex justify-end rounded-sm cursor-pointer bg-gray-200 dark:bg-[#0f1727]"
							>
								<svg
									fill="#42A5F5"
									width="24px"
									height="24px"
									viewBox="0 0 36 36"
									version="1.1"
									preserveAspectRatio="xMidYMid meet"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									stroke="#42A5F5"
									><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									></g><g id="SVGRepo_iconCarrier">
										<title>export-line</title>
										<path
											d="M6,13.61h7.61V6H24v8.38h2V6a2,2,0,0,0-2-2H10.87L4,10.87V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2H6Zm0-1.92L11.69,6H12v6H6Z"
											class="clr-i-outline clr-i-outline-path-1"
										></path><path
											d="M28.32,16.35a1,1,0,0,0-1.41,1.41L30.16,21H18a1,1,0,0,0,0,2H30.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L34,22Z"
											class="clr-i-outline clr-i-outline-path-2"
										></path> <rect x="0" y="0" width="36" height="36" fill-opacity="0"></rect>
									</g></svg
								>
							</div></th
						>
					{/if}
				</tr>
			</thead>
			<tbody>
				<!-- row 1 -->
				{#if std.length > 0}
					{#each std as row, i}
						{#if i < maxItems}
							<tr
								onclick={() => {
									
									if (category == row.id){
										category = '';
									} else {
										category = row.id;
									}
								}}
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{i + 1}</div></td>
								{#each Object.keys(row).slice(1) as data_key}
									<td>{row[data_key].toLocaleString()} {data_key.includes('quantity') ? 'Pcs' : data_key.includes('total') ? 'ETB' : ''}</td>
								{/each}
								<td></td>
							</tr>
						{/if}
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
	{/if}
	</div>
<div>
	{#if nstd.length > 0}
	<TopProducts {span} {region} {timeline} {territory} {route} {point_of_sale} bind:category={parent_category} bind:parentProduct={parentProduct} {top_n} product_type={"Non Standard"} />
	<div class="overflow-y-scroll rounded-xl bg-white dark:bg-[#002a47]">
		<table class="table bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0 m-4">
			<!-- head -->
			<thead
				class="text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-[#0f1727] sticky top-0 z-0"
			>
				<tr>
					{#if nstd.length > 0}
						<th></th>
						{#each Object.keys(nstd[0]).slice(1) as key}
							<th>{formatFieldNames(key)}</th>
						{/each}
						<th
							><div
								onclick={() => {
									exportCSV(nstd);
								}}
								class="flex justify-end rounded-sm cursor-pointer bg-gray-200 dark:bg-[#0f1727]"
							>
								<svg
									fill="#42A5F5"
									width="24px"
									height="24px"
									viewBox="0 0 36 36"
									version="1.1"
									preserveAspectRatio="xMidYMid meet"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									stroke="#42A5F5"
									><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									></g><g id="SVGRepo_iconCarrier">
										<title>export-line</title>
										<path
											d="M6,13.61h7.61V6H24v8.38h2V6a2,2,0,0,0-2-2H10.87L4,10.87V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2H6Zm0-1.92L11.69,6H12v6H6Z"
											class="clr-i-outline clr-i-outline-path-1"
										></path><path
											d="M28.32,16.35a1,1,0,0,0-1.41,1.41L30.16,21H18a1,1,0,0,0,0,2H30.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L34,22Z"
											class="clr-i-outline clr-i-outline-path-2"
										></path> <rect x="0" y="0" width="36" height="36" fill-opacity="0"></rect>
									</g></svg
								>
							</div></th
						>
					{/if}
				</tr>
			</thead>
			<tbody>
				<!-- row 1 -->
				{#if nstd.length > 0}
					{#each nstd as row, i}
						{#if i < maxItems}
							<tr
								onclick={() => {									
									if (category == row.id){
										category = '';
									} else {
										category = row.id;
									}
								}}
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{i + 1}</div></td>
								{#each Object.keys(row).slice(1) as data_key}
									<td>{row[data_key].toLocaleString()} {data_key.includes('quantity') ? 'Pcs' : data_key.includes('total') ? 'ETB' : ''}</td>
								{/each}
								<td></td>
							</tr>
						{/if}
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
	{/if}
	</div>
</div>

