<script>
	import { formatFieldNames } from '$lib/utils';
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		isOpen = false,
		title = '',
		data = [],
		handleClose,
		isRemark = false,
		description = 'Rejection Remark',
		onRowClick = undefined,
		hidden_fields = [],
		full_data = {}
	} = $props();

	// --- NEW STATE FOR IMAGE MODAL ---
	let selectedImage = $state(null);

	let default_hidden_fields = ['id', 'product_id', 'stock_type_back'];

	let page = $state(1);
	let pageSize = $state(10);

	let totalPages = $derived(Math.ceil(data.length / pageSize));
	let paginatedData = $derived(data.slice((page - 1) * pageSize, page * pageSize));
	let all_hidden_fields = $derived([...default_hidden_fields, ...hidden_fields]);

	function safeKey(row, index) {
		return row.id ?? index;
	}

	function prevPage() {
		if (page > 1) page--;
	}

	function nextPage() {
		if (page < totalPages) page++;
	}

	onMount(() => {
		page = 1;
	});

	onDestroy(() => {
		page = 1;
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] overflow-y-auto"
		onclick={handleClose}
	>
		<div
			class="relative w-[95%] max-w-4xl bg-white dark:bg-[#1e2537] rounded-xl shadow-xl p-6 sm:p-8 mt-10 mb-10"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{@html title}</h2>
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

			<!-- Remark Mode -->
			{#if isRemark}
				<p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
					{data}
				</p>
			{:else if data.length > 0}
				<!-- Table -->
				<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
					<table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
						<thead class="bg-gray-100 dark:bg-[#2b3b5f] text-md font-semibold">
							<tr>
								{#each Object.keys(data[0]) as key}
									{#if !all_hidden_fields.includes(key)}
										{#if key == 'view_location'}
											<th class="px-4 py-3 whitespace-nowrap">{formatFieldNames('Location')}</th>
										{:else}
											<th class="px-4 py-3 whitespace-nowrap">{formatFieldNames(key)}</th>
										{/if}
									{/if}
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each paginatedData as row, index (safeKey(row, index))}
								<tr
									class="hover:bg-gray-50 dark:hover:bg-[#2a3452] transition-colors {onRowClick
										? 'cursor-pointer'
										: ''}"
									onclick={() => {
										if (onRowClick) onRowClick(row);
									}}
								>
									{#each Object.keys(row) as key}
										{#if !all_hidden_fields.includes(key)}
											<td class="px-4 py-3 border-t border-gray-100 dark:border-gray-700 truncate">
												{#if key === 'image'}
													{#if row[key]}
														<button 
															type="button" 
															class="relative group w-10 h-10 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600"
															onclick={(e) => {
																e.stopPropagation(); // Prevent onRowClick
																selectedImage = row[key];
															}}
														>
															<img
																src={row[key]}
																alt="image"
																class="w-10 h-10 object-cover group-hover:scale-110 transition-transform duration-300"
															/>
															<div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
																<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="white" class="w-5 h-5">
																  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
																</svg>
															</div>
														</button>
													{:else}
														<span class="opacity-60">-</span>
													{/if}
												{:else if key === 'view_location'}
													{#if row[key]}
														{@const coords = row[key].split(',')}
														<a
															href={`https://www.google.com/maps?q=${coords[0].trim()},${coords[1].trim()}`}
															target="_blank"
															rel="noopener noreferrer"
															class="text-[#286692] hover:underline flex items-center gap-1"
															onclick={(e) => e.stopPropagation()}
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="currentColor"
																class="w-4 h-4"
															>
																<path
																	fill-rule="evenodd"
																	d="M12 2C8.13 2 5 5.13 5 9c0 4.73 6.58 11.74 6.84 12.03a.75.75 0 001.32 0C12.42 20.74 19 13.73 19 9c0-3.87-3.13-7-7-7zm0 9.75A2.75 2.75 0 1112 6.25a2.75 2.75 0 010 5.5z"
																	clip-rule="evenodd"
																/>
															</svg>
															View Location
														</a>
													{:else}
														<span>-</span>
													{/if}
												{:else}
													{@html row[key]}
												{/if}
											</td>
										{/if}
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				<div class="flex justify-between items-center mt-4 text-sm">
					<p class="text-gray-600 dark:text-gray-400">
						Page {page} of {totalPages} ({data.length} total)
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
			{:else}
				<p class="mt-6 text-center italic text-gray-600 dark:text-gray-300">{full_data ? full_data.error : 'No record found!'}</p>
			{/if}
		</div>
	</div>
{/if}

<!-- 
    IMAGE LIGHTBOX MODAL 
-->
{#if selectedImage}
	<div 
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4"
		onclick={() => selectedImage = null}
		transition:fade={{ duration: 150 }}
	>
		<button 
			class="absolute top-5 right-5 text-white hover:text-gray-300 transition-colors"
			onclick={() => selectedImage = null}
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
			  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<img 
			src={selectedImage} 
			alt="Enlarged view" 
			class="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
			onclick={(e) => e.stopPropagation()}
		/>
	</div>
{/if}