<script>
	import { formatFieldNames } from '$lib/utils';
	import { host, token } from '../../apis/config';
	import { fetchTable } from '../../apis/table';

	const transaction_endpoint = `${host}sales/sales/sales-transaction-form`;
	const transaction_create_url = `${host}sales/sales/create-sales-transaction`;
	// const balance_history_endpoint = `${host}sales/sales/balance-history`; // 👈 your new endpoint

	let {
		isOpen = false,
		title = '',
		endpoint = '',
		balance_history_endpoint = '',
		handleClose,
		onBack = undefined // New prop for Back functionality
	} = $props();

	let start_date = $state(new Date().toISOString().split('T')[0]);
	let end_date = $state(new Date().toISOString().split('T')[0]);

	let activeTab = $state('Transactions');
	let data = $state([]);
	let balanceHistory = $state([]);

	// pagination states for each tab
	let pageTransactions = $state(1);
	let pageHistory = $state(1);
	let pageSize = $state(10);

	async function loadTransactions() {
		if (!start_date || !end_date) return;
		if (endpoint == "") return;
		const result = await fetchTable(`${endpoint}/${start_date}/${end_date}`, token);
		if (result.succeed) data = result.data;
		pageTransactions = 1; // reset to first page
	}

	async function loadBalanceHistory() {
		if (!start_date || !end_date) return;
		if (balance_history_endpoint == "") return;
		const result = await fetchTable(`${balance_history_endpoint}/${start_date}/${end_date}`, token);
		if (result.succeed) balanceHistory = result.data;
		pageHistory = 1; // reset to first page
	}

	$effect(() => {
		if (activeTab === 'Transactions') loadTransactions();
		else if (activeTab === 'Balance History') loadBalanceHistory();
	});

	// derived pagination for transactions
	let totalTransactionPages = $derived(Math.ceil((data?.length ?? 0) / pageSize));
	let paginatedTransactions = $derived(
		data?.slice((pageTransactions - 1) * pageSize, pageTransactions * pageSize) ?? []
	);

	// derived pagination for balance history
	let totalHistoryPages = $derived(Math.ceil((balanceHistory?.length ?? 0) / pageSize));
	let paginatedHistory = $derived(
		balanceHistory?.slice((pageHistory - 1) * pageSize, pageHistory * pageSize) ?? []
	);

	function prevPageTransactions() {
		if (pageTransactions > 1) pageTransactions--;
	}
	function nextPageTransactions() {
		if (pageTransactions < totalTransactionPages) pageTransactions++;
	}

	function prevPageHistory() {
		if (pageHistory > 1) pageHistory--;
	}
	function nextPageHistory() {
		if (pageHistory < totalHistoryPages) pageHistory++;
	}
</script>

{#if isOpen}
	<div
		class="relative inset-0 bg-white dark:bg-[#22273c] z-50 min-w-md items-center justify-center p-4 w-full h-full"
	>
		<div class="sticky top-0 text-center bg-white dark:bg-[#22273c] rounded-lg">
			
			<div class="flex justify-center items-center relative">
				{#if onBack}
					<button
						type="button"
						class="absolute left-0 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
						onclick={onBack}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stroke-gray-900 dark:stroke-gray-100"><path d="m15 18-6-6 6-6"/></svg>
					</button>
				{/if}
				<p class="text-gray-900 dark:text-gray-100 font-bold text-xl">Bin Card</p>
			</div>

			<div class="flex gap-2 mt-4">
				<div class="w-full justify-start mb-2">
					<input
						type="date"
						bind:value={start_date}
						class="input shadow-theme-xs rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 dark:bg-gray-900 dark:text-white/90 [color-scheme:light] dark:[color-scheme:dark]"
					/>
				</div>
				<p class="text-gray-900 dark:text-gray-100 font-bold text-md self-center">-</p>
				<div class="w-full justify-start mb-2">
					<input
						type="date"
						bind:value={end_date}
						class="input shadow-theme-xs rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 dark:bg-gray-900 dark:text-white/90 [color-scheme:light] dark:[color-scheme:dark]"
					/>
				</div>
			</div>
		</div>

		{#if !onBack}
		<!-- Only show close button if not in back mode (handled by parent usually, but keeping for compatibility) -->
		<button
			type="button"
			class="absolute right-4 top-4"
			aria-label="close modal button"
			onclick={() => handleClose()}
		>
			<svg
				class="w-5 h-5 fill-black dark:fill-white"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
		{/if}

		<div class="overflow-y-scroll relative px-4 w-full bg-white dark:bg-[#22273c] rounded-lg">
			<div class="flex gap-4 mt-4 border-b border-gray-300 dark:border-gray-700">
				<button
					class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
						{activeTab === 'Transactions'
						? 'bg-[#f0f8ff] dark:bg-[#003b5e] text-[#3393ce] border-b-2 border-[#3393ce]'
						: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a3452]'}"
					onclick={() => (activeTab = 'Transactions')}
				>
					Transactions
				</button>
				<button
					class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
						{activeTab === 'Balance History'
						? 'bg-[#f0f8ff] dark:bg-[#003b5e] text-[#3393ce] border-b-2 border-[#3393ce]'
						: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a3452]'}"
					onclick={() => (activeTab = 'Balance History')}
				>
					Balance History
				</button>
			</div>
			{#if activeTab === 'Transactions'}
				{#if data.length > 0}
					<div class="py-4 text-sm w-full text-gray-600 dark:text-gray-300 text-left space-y-4">
						<table
							class="relative min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left"
						>
							<thead class="bg-gray-100 dark:bg-[#286692] text-xs text-gray-600 dark:text-gray-200">
								<tr>
									{#each Object.keys(data[0]) as item}
										{#if item != 'id'}
											<th class="px-4 py-4 border-b">{formatFieldNames(item)}</th>
										{/if}
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each paginatedTransactions as row}
									<tr>
										{#each Object.keys(row) as key}
											{#if key != 'id'}
												<td class="px-4 py-4 border-b">{row[key]}</td>
											{/if}
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>

						<div class="flex justify-between items-center mt-4 text-sm">
							<p class="text-gray-600 dark:text-gray-400">
								Page {pageTransactions} of {totalTransactionPages} ({data.length} total)
							</p>
							<div class="flex items-center gap-2">
								<button
									class="px-3 py-1 rounded border text-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
									onclick={prevPageTransactions}
									disabled={pageTransactions === 1}
								>
									Prev
								</button>
								<button
									class="px-3 py-1 rounded border text-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
									onclick={nextPageTransactions}
									disabled={pageTransactions === totalTransactionPages}
								>
									Next
								</button>
							</div>
						</div>
					</div>
				{:else}
					<p class="py-4 mt-2 italic text-gray-900 dark:text-gray-100">
						No transactions during this period
					</p>
				{/if}
			{:else if activeTab === 'Balance History'}
				{#if balanceHistory && balanceHistory.length > 0}
					<div class="py-4 text-sm w-full text-gray-600 dark:text-gray-300 text-left space-y-4">
						<table
							class="relative min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left"
						>
							<thead class="bg-gray-100 dark:bg-[#286692] text-xs text-gray-600 dark:text-gray-200">
								<tr>
									{#each Object.keys(balanceHistory[0]) as item}
										{#if item != 'id'}
											<th class="px-4 py-4 border-b">{formatFieldNames(item)}</th>
										{/if}
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each paginatedHistory as row}
									<tr>
										{#each Object.keys(row) as key}
											{#if key != 'id'}
												<td class="px-4 py-4 border-b">{row[key]}</td>
											{/if}
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>

						<!-- Pagination Controls -->
						<div class="flex justify-between items-center mt-4 text-sm">
							<p class="text-gray-600 dark:text-gray-400">
								Page {pageHistory} of {totalHistoryPages} ({balanceHistory ? balanceHistory.length : '0'} total)
							</p>
							<div class="flex items-center gap-2">
								<button
									class="px-3 py-1 rounded border text-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
									onclick={prevPageHistory}
									disabled={pageHistory === 1}
								>
									Prev
								</button>
								<button
									class="px-3 py-1 rounded border text-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
									onclick={nextPageHistory}
									disabled={pageHistory === totalHistoryPages}
								>
									Next
								</button>
							</div>
						</div>
					</div>
				{:else}
					<p class="py-4 mt-2 italic text-gray-900 dark:text-gray-100">
						No balance history during this period
					</p>
				{/if}
			{/if}
		</div>
	</div>
{/if}