<script>
	import { onMount } from 'svelte';
	import { fetchremaningDepositVolume } from '../../../../apis/api-utils.js';
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';
	import { formatFieldNames } from '$lib/utils';
	import { exportCSV } from '../../../../apis/table.js'; // Adjust the path as needed

	export let timeline = 'Daily';
	export let span = 7;
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';

	let top_n = 5;
	let transactions = [];

	let currentTheme = get(themeStore);
	themeStore.subscribe(() => {
		// refetch on theme change if needed
		fetchData(span, timeline, territory, route, point_of_sale, top_n);
	});

	async function fetchData(
		selectedSpan,
		selectedTimeline,
		territory_id,
		route_id,
		point_of_sale_id,
		top_n
	) {
		try {
			const data = await fetchremaningDepositVolume(
				selectedSpan,
				selectedTimeline,
				territory_id,
				route_id,
				point_of_sale_id,
				top_n
			);
			transactions = data;
		} catch (error) {
			console.error('Error fetching Top Categories: ', error);
		}
	}

	$: fetchData(span, timeline, territory, route, point_of_sale, top_n);
</script>

<div class="flex-1 max-h-[400px]">
	{#if transactions.length > 0}
		<div class="my-2 py-4 text-sm w-full text-gray-600 dark:text-gray-300 text-left space-y-1">
		
		<table class="table bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0">
            <!-- head -->
            <thead class="text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-[#0f1727] sticky top-0 z-0">
              <tr>
              {#each Object.keys(transactions[0]) as key}
                <th>{formatFieldNames(key)}</th>
              {/each}
              <th><div onclick={() => {exportCSV(transactions);}} class="flex justify-end rounded-sm cursor-pointer bg-gray-200 dark:bg-[#0f1727]">
                <svg fill="#42A5F5" width="24px" height="24px" viewBox="0 0 36 36" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" stroke="#42A5F5"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>export-line</title> <path d="M6,13.61h7.61V6H24v8.38h2V6a2,2,0,0,0-2-2H10.87L4,10.87V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2H6Zm0-1.92L11.69,6H12v6H6Z" class="clr-i-outline clr-i-outline-path-1"></path><path d="M28.32,16.35a1,1,0,0,0-1.41,1.41L30.16,21H18a1,1,0,0,0,0,2H30.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L34,22Z" class="clr-i-outline clr-i-outline-path-2"></path> <rect x="0" y="0" width="36" height="36" fill-opacity="0"></rect> </g></svg>
               </div></th>
              </tr>
            </thead>
            <tbody>
              <!-- row 1 -->
              {#each transactions as row, i}
              <tr class={i % 2 > 0 == true ? "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer" : "bg-white dark:bg-[#002a47] dark:text-gray-100 cursor-pointer"}>
              {#each Object.keys(row) as data_key}
                <td>{row[data_key]}</td>
              {/each}
              <td></td>
              </tr>
              {/each}
            </tbody>
          </table>
		</div>
	{:else}
		<p class="mt-2 italic text-gray-900 dark:text-gray-100">
			No Deposit Remaning during this time span
		</p>
	{/if}
</div>
