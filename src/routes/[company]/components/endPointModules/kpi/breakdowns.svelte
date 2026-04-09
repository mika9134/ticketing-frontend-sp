<script>
	import { formatFieldNames } from '$lib/utils';
	import { onMount } from 'svelte';
	import { host, token } from '../../../../../apis/config.js';
	import { fetchTable } from '../../../../../apis/table';

	let {
		title = '',
		period = '',
		handleClose,
		pre_sales_toggle = false,
		order_conversion_progress = [],
		penetration_progress = [],
		sales_volume_progress = [],
		call_completion_progress = [],
		productivity_progress = [],
		order_conversion_info = '',
		sales_volume_info = '',
		penetration_info = '',
		call_completion_info = '',
		productivity_info = '',
		total_performance = '0%',
		employee_name
	} = $props();

	let selectedTabKey = $state(null);
	let activeTab = $derived(selectedTabKey ?? tabs[0]?.key);

	let dataMap = $derived({
		order_conversion_progress,
		penetration_progress,
		sales_volume_progress,
		call_completion_progress,
		productivity_progress
	});

	let tabs = $derived(
		[
			{ key: 'penetration_progress', label: 'Penetration' },
			{ key: 'sales_volume_progress', label: 'Sales Volume' },
			{ key: 'call_completion_progress', label: 'Call Completion' },
			{ key: 'productivity_progress', label: 'Productivity' },
			{ key: 'order_conversion_progress', label: 'Order Conversion' }
		].filter((tab) => dataMap[tab.key]?.length > 0)
	);

	let infoMap = $derived({
		order_conversion_progress: order_conversion_info,
		penetration_progress: penetration_info,
		sales_volume_progress: sales_volume_info,
		call_completion_progress: call_completion_info,
		productivity_progress: productivity_info
	});

	let detailsTitle = $state('Products Breakdown');
	let transactions = $state([]);
	let selected_territory = $state('');
	let selected_period = $state('');
	let is_parent_show = $state(true);
	let is_child_show = $state(false);
	let url = $state('');

	async function handleRowClick(row) {
		if (activeTab != 'sales_volume_progress' && activeTab != 'order_conversion_progress') return;
		console.log('====');
		console.log(row);
		console.log('tab = ' + activeTab);
		selected_territory = row?.territory;
		selected_period = row?.period;

		try {
			url =
				activeTab == 'sales_volume_progress'
					? 'performance-employee/get-sales-volume-products'
					: 'performance-employee/get-order-conversion-products';

			const data = await fetchTable(`${host}${url}/${row?.id}`, token);
			if (data.succeed && data.data != null) {
				transactions = data.data;
				is_parent_show = false;
				is_child_show = true;
			}
		} catch (error) {
			console.error(error);
		}
	}
	// Pagination states
	let page = $state(1);
	let pageSize = $state(10);
	let totalPages = $derived(Math.ceil((dataMap[activeTab]?.length ?? 0) / pageSize));
	let paginatedData = $derived(
		dataMap[activeTab]?.slice((page - 1) * pageSize, page * pageSize) ?? []
	);

	// Pagination controls
	function prevPage() {
		if (page > 1) page--;
	}

	function nextPage() {
		if (page < totalPages) page++;
	}

	function handleTabClick(key) {
		selectedTabKey = key;
		transactions = [];
		is_child_show = false;
		is_parent_show = true;
		page = 1;
	}

	onMount(() => {
		page = 1;
		if (tabs.length > 0) {
			activeTab = tabs[0].key;
		}
	});
</script>

{#if true}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto">
		<div
			class="relative w-[95%] max-w-6xl bg-white dark:bg-[#1e2537] rounded-xl shadow-xl p-6 sm:p-8 mt-10 mb-10"
		>
			<!-- Header -->
			<div class="flex justify-between items-center mb-4">
				<h2
					class="flex flex-row items-center justify-between flex-grow text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 pr-8"
				>
					<span
						>{employee_name}
						<span class="text-md font-light ml-2 pl-2 border-l border-black/30 dark:border-white/30"
							>Total Performance {total_performance}</span
						></span
					>
					<span class="text-md font-normal">{period}</span>
				</h2>
				<button
					type="button"
					class="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
					onclick={handleClose}
					aria-label="Close modal"
				>
					<svg class="w-5 h-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
						<path
							fill-rule="evenodd"
							fill="#086692"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>

			<!-- Tabs -->
			<div class="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-600 mb-4">
				{#each tabs as tab}
					<button
						type="button"
						onclick={() => handleTabClick(tab.key)}
						class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150
                {activeTab === tab.key
							? 'bg-gray-100 dark:bg-[#003b5e] text-[#3393ce] border-b-2 border-[#3393ce]'
							: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3452]'}"
					>
						{tab.label}
					</button>
				{/each}
			</div>

			<!-- Content -->
			<div class="space-y-4 text-sm text-gray-700 dark:text-gray-300">
				{#if activeTab && dataMap[activeTab]?.length > 0}
					{#if is_parent_show}
						{#if infoMap[activeTab]}
							<p class="text-sm bg-gray-50 dark:bg-black/5 py-3 px-4 rounded-md">
								<span class="font-semibold">Progress / Weight:</span>
								<span class="ml-1">{infoMap[activeTab]}</span>
							</p>
						{/if}

						<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
							<table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
								<thead class="bg-gray-100 dark:bg-[#2b3b5f] text-xs uppercase font-semibold">
									<tr>
										{#each Object.keys(dataMap[activeTab][0]) as key}
											{#if key !== 'id' && key !== 'period'}
												<th class="px-4 py-3 whitespace-nowrap">{formatFieldNames(key)}</th>
											{/if}
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each paginatedData as row}
										<tr
											class="cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a3452] transition-colors"
											onclick={() => handleRowClick(row)}
										>
											{#each Object.keys(row) as k}
												{#if k !== 'id' && k !== 'period'}
													<td
														class="px-4 py-3 border-t border-gray-100 dark:border-gray-700 truncate"
													>
														{row[k]}
													</td>
												{/if}
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
							<!-- Pagination -->
						</div>
						<div class="flex justify-between items-center mt-4 text-sm">
							<p class="text-gray-600 dark:text-gray-400">
								Page {page} of {totalPages} ({dataMap[activeTab]?.length ?? 0} total)
							</p>
							<div class="flex items-center gap-2">
								<button
									class="px-3 py-1 rounded border text-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
									onclick={prevPage}
									disabled={page === 1}
								>
									Prev
								</button>
								<button
									class="px-3 py-1 rounded border text-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
									onclick={nextPage}
									disabled={page === totalPages}
								>
									Next
								</button>
							</div>
						</div>
					{/if}
				{:else}
					<p class="text-center italic text-gray-600 dark:text-gray-400">
						No performance data available for this period.
					</p>
				{/if}

				<!-- Details / Products Breakdown -->
				{#if (activeTab == 'sales_volume_progress' || activeTab == 'order_conversion_progress') && is_child_show}
					<div class="mt-4">
						<div
							class="flex items-center justify-between bg-gray-50 dark:bg-[#1e293b] px-4 py-3 rounded-md mb-2"
						>
							<div>
								<h3 class="font-semibold text-gray-800 dark:text-gray-100">{detailsTitle}</h3>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									{selected_territory} — {selected_period}
								</p>
							</div>
							<button
								class="flex flex-row items-center justify-center gap-x-2 px-3 py-2 rounded-md bg-black/5 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
								onclick={() => {
									transactions = [];
									is_parent_show = true;
									is_child_show = false;
								}}
							>
								<svg
									width="24px"
									height="24px"
									viewBox="0 0 1024 1024"
									fill="#ffffff"
									class="icon"
									version="1.1"
									xmlns="http://www.w3.org/2000/svg"
									><g id="SVGRepo_bgCarrier" stroke-width="1"></g><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									></g><g id="SVGRepo_iconCarrier"
										><path
											d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z"
											fill=""
										></path></g
									></svg
								> Back
							</button>
						</div>

						{#if transactions.length > 0}
							<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
								<table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
									<thead class="bg-gray-100 dark:bg-[#2b3b5f] text-xs uppercase font-semibold">
										<tr>
											{#each Object.keys(transactions[0]) as key}
												{#if key !== 'id'}
													<th class="px-4 py-3 whitespace-nowrap">{formatFieldNames(key)}</th>
												{/if}
											{/each}
										</tr>
									</thead>
									<tbody>
										{#each transactions as row}
											<tr class="hover:bg-gray-50 dark:hover:bg-[#2a3452] transition-colors">
												{#each Object.keys(row) as key}
													{#if key !== 'id'}
														<td
															class="px-4 py-3 border-t border-gray-100 dark:border-gray-700 truncate"
														>
															{row[key]}
														</td>
													{/if}
												{/each}
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<p class="text-gray-500 dark:text-gray-300 italic py-2">
								Product Breakdown was not assigned.
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
