<script>
	import Map from '$lib/map/map.svelte';
	import { formatFieldNames } from '$lib/utils';
	import { fade } from 'svelte/transition';

	let { title = '', handleClose, dataMap = {}, info = {}, tool_tip_on = '' } = $props();

	let activeTab = $state('');
	let page = $state(1);
	let pageSize = $state(10);

	let selectedImage = $state(null);

	let tabs = $derived(Object.keys(dataMap || {}));

	$effect(() => {
		if (tabs.length > 0 && (!activeTab || !tabs.includes(activeTab))) {
			activeTab = tabs[0];
		}
	});

	let totalPages = $derived(Math.ceil((dataMap[activeTab]?.length ?? 0) / pageSize));
	let paginatedData = $derived(
		dataMap[activeTab]?.slice((page - 1) * pageSize, page * pageSize) ?? []
	);
	let hasAnyTooltips = $derived(
		dataMap[activeTab]?.some(row => row.tool_tip !== undefined && row.tool_tip !== null && row.tool_tip !== '') ?? false
	);

	$effect(() => {
		page = 1;
	});

	function prevPage() {
		if (page > 1) page--;
	}
	function nextPage() {
		if (page < totalPages) page++;
	}
	function safeKey(row, index) {
		return row.id ?? index;
	}
</script>

{#if Object.keys(dataMap || {}).length > 0}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs overflow-y-auto"
		on:click={handleClose}
	>
		<div
			class="relative w-[95%] max-w-5xl bg-white dark:bg-[#1e2537] rounded-xl shadow-xl p-6 sm:p-8 mt-10 mb-10"
			on:click={(e) => e.stopPropagation()}
		>
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{@html title}</h2>
				<button
					type="button"
					class="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
					on:click={handleClose}
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

			{#if tabs.length > 0}
				<div class="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
					{#each tabs as tab}
						<button
							class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors {activeTab === tab
								? 'bg-[#f0f8ff] dark:bg-[#003b5e] text-[#3393ce] border-b-2 border-[#3393ce]'
								: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a3452]'}"
							on:click={() => (activeTab = tab)}
						>
							{formatFieldNames(tab)}
						</button>
					{/each}
				</div>
			{/if}

			{#if activeTab === 'Map' || activeTab === 'map'}
				<Map
					fixedTerritory={dataMap[activeTab]['territory_id']}
					fixedRoute={dataMap[activeTab]['route_id']}
					travelRouteSchedule={dataMap[activeTab]['route_schedule_id']}
				/>
			{:else if activeTab && dataMap[activeTab]?.length > 0}
				<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
					<table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
						<thead class="bg-gray-100 dark:bg-[#2b3b5f] text-sm font-semibold">
							<tr>
								{#each Object.keys(dataMap[activeTab][0]) as key}
									<!-- Hide IDs and Tooltip column from header -->
									{#if !key.includes('id') && key !== 'tool_tip'}
										<th class="px-4 py-3 whitespace-nowrap">
											<div class="flex items-center gap-1.5">
												<span
													>{key === 'view_location'
														? formatFieldNames('Location')
														: formatFieldNames(key)}</span
												>
											</div>
										</th>
									{/if}
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each paginatedData as row, index (safeKey(row, index))}
								<tr class="hover:bg-gray-50 dark:hover:bg-[#2a3452] transition-colors">
									{#each Object.keys(row) as key, i}
										<!-- Hide IDs and Tooltip text from standard cells -->
										{#if !key.includes('id') && key !== 'tool_tip'}
											<td class="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
												<div class="flex items-center gap-2">
													{#if key === 'image'}
														{#if row[key]}
															<button
																type="button"
																on:click={() => (selectedImage = row[key])}
																class="relative w-10 h-10 group/img"
															>
																<img
																	src={row[key]}
																	alt="image"
																	class="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-600 group-hover/img:opacity-80 transition-opacity"
																/>
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

													<!-- TOOLTIP ICON: Shown only in the first visible column if tooltip exists -->
													<!-- {#if hasAnyTooltips && tool_tip_on == '' && i === Object.keys(row).length - 2 && row.tool_tip !== undefined}
														<div class="absolute right-12 group/tooltip inline-block ml-2">
															<div
																class="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800/50 text-gray-400 group-hover/tooltip:bg-blue-50 dark:group-hover/tooltip:bg-blue-900/30 group-hover/tooltip:text-[#286692] transition-all duration-200 cursor-help"
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	viewBox="0 0 20 20"
																	fill="currentColor"
																	class="w-3.5 h-3.5"
																>
																	<path
																		fill-rule="evenodd"
																		d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
																		clip-rule="evenodd"
																	/>
																</svg>
															</div>

															<div
																class="absolute invisible opacity-0 translate-y-1 scale-95 group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100 absolute z-[700] bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 p-3 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-sm text-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] transition-all duration-200 ease-out pointer-events-none"
															>
																<div
																	class="text-[10px] uppercase tracking-wider font-bold text-blue-400 mb-1 border-b border-white/10 pb-1"
																>
																	Note
																</div>

																<div class="text-[11px] leading-relaxed font-medium text-slate-100">
																	{row.tool_tip}
																</div>

																<div
																	class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95 dark:border-t-slate-800/95"
																></div>
															</div>
														</div>
													{/if} -->
												</div>
											</td>
										{/if}
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="flex justify-between items-center mt-4 text-sm">
					<p class="text-gray-600 dark:text-gray-400">
						Page {page} of {totalPages} ({dataMap[activeTab]?.length ?? 0} total)
					</p>
					<div class="flex items-center gap-2">
						<button
							class="px-3 py-1 rounded border text-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
							on:click={prevPage}
							disabled={page === 1}>Prev</button
						>
						<button
							class="px-3 py-1 rounded border text-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
							on:click={nextPage}
							disabled={page === totalPages}>Next</button
						>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if selectedImage}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
		on:click={() => (selectedImage = null)}
		transition:fade={{ duration: 200 }}
	>
		<button
			class="absolute top-5 right-5 text-white hover:text-gray-300 transition-colors"
			on:click={() => (selectedImage = null)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2.5"
				stroke="currentColor"
				class="w-8 h-8"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<img
			src={selectedImage}
			alt="Enlarged view"
			class="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in duration-300"
			on:click={(e) => e.stopPropagation()}
		/>
	</div>
{/if}
