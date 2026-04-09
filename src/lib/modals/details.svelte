<script>
	import { formatFieldNames } from '$lib/utils';
	import { host } from '../../apis/config';
	import { getAccessToken } from '../../stores/tokenStore';
	import { addForm } from '../../apis/form.js';
	const get_form_endpoint = `${host}sales/sales/sales-transaction-form`;
	const create_entry_url = `${host}sales/sales/create-sales-transaction`;
	const table_name = 'Transaction';

	import Modal from '$lib/modals/createForm.svelte';

	let { isOpen = false, title = '', data = {}, handleClose, reload } = $props();

	let tabs = ['General', 'Transactions', 'Products'];
	let activeTab = $state('General');
	let showFormModalAdd = $state(false);

	let form_default = {};

	$effect(() => {
		form_default['id'] = data['sales_id'];
		token = getAccessToken();

		console.log('Hello');
		console.log(data);
	});

	let token = getAccessToken();

	async function handleSubmit(action, form_submit_data) {
		let result = await addForm(create_entry_url, form_submit_data, token);

		if (result.succeed == true) {
			reload();
		}

		return result;
	}
</script>

{#if isOpen}
	<Modal
		{table_name}
		{token}
		{get_form_endpoint}
		action_type={'Add'}
		bind:showFormModal={showFormModalAdd}
		callback={handleSubmit}
		closeAfterSubmit={true}
		bind:form_override={form_default}
	/>

	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop:bg-black/50 bg-opacity-50 overflow-scroll"
	>
		<div class="relative p-6 w-fit bg-white dark:bg-[#22273c] rounded-lg shadow-lg dark:shadow-lg">
			<div class="text-center">
				<!-- Icon -->
				<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
					<div class="flex gap-2">
						{#each tabs as tab}
							<button
								type="button"
								onclick={() => (activeTab = tab)}
								class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                  border border-b-0
                  text-gray-700 hover:bg-gray-100
                  dark:text-white dark:bg-[#002a47] dark:border-[#00527c] dark:hover:bg-[#003b5e]
                  {activeTab === tab
									? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
									: 'bg-white'}"
							>
								{formatFieldNames(tab)}
							</button>
						{/each}
					</div>
				</div>

				<!-- Result Info -->
				{#if activeTab === 'General'}
					<div class="grid grid-cols-2 m-2 p-10 space-between justify-items-start mx-auto gap-4">
						<h3 class="mt-2 text-sm text-gray-900 dark:text-white">
							<span class="font-bold">Point of Sale</span>: {data.point_of_sale}
						</h3>
						<h3 class="mt-2 text-sm text-gray-900 dark:text-white">
							<span class="font-bold">Date</span>: {data.date}
						</h3>
						<h3 class="mt-2 text-sm text-gray-900 dark:text-white">
							<span class="font-bold">Payment Status</span>: {data.payment_status}
						</h3>
						{#if data.payment_due_date && data.payment_due_date !== ''}
							<h3 class="mt-2 text-sm text-gray-900 dark:text-white">
								<span class="font-bold">Payment Due Date</span>: {data.payment_due_date}
							</h3>
						{/if}
						<h3 class="mt-2 text-sm text-gray-900 dark:text-white">
							<span class="font-bold">Sales Type</span>: {data.sales_type}
						</h3>
					</div>
				{:else if activeTab == 'Transactions'}
					<div class="mt-6 flex justify-end">
						{#if data.payment_status !== 'Fully Paid'}
							<button
								type="button"
								class="button"
								onclick={() => {
									showFormModalAdd = true;
								}}
							>
								<span class="button__text">Add</span>

								<span class="button__icon"
									><svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										viewBox="0 0 24 24"
										stroke-width="2"
										stroke-linejoin="round"
										stroke-linecap="round"
										stroke="currentColor"
										height="24"
										fill="none"
										class="svg"
										><line y2="19" y1="5" x2="12" x1="12"></line><line
											y2="12"
											y1="12"
											x2="19"
											x1="5"
										></line></svg
									></span
								>
							</button>
						{/if}
					</div>

					{#if data.sales_type == 'Credit'}
						<p class="dark:text-gray-300 text-left text-gray-900 text-sm p-4 pb-2 m-2 mt-4">
							Remaining: {data.remaining} ETB
						</p>
					{/if}

					<div class="m-2 p-4 text-sm w-fit text-gray-600 dark:text-gray-300 text-left space-y-1">
						<table
							class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left text-gray-700 dark:text-gray-300"
						>
							<thead class="bg-gray-100 dark:bg-[#286692] text-xs text-gray-600 dark:text-gray-200">
								<tr>
									{#if data.transactions.length > 0}
										{#each Object.keys(data.transactions[0]) as item}
											<th
												class="px-4 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400"
												>{formatFieldNames(item)}</th
											>
										{/each}
									{/if}
								</tr>
							</thead>
							<tbody>
								{#each data.transactions as row}
									<tr>
										{#each Object.keys(row) as data_key}
											<td
												class="px-4 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400"
												>{row[data_key]}</td
											>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="m-2 p-4 text-sm w-fit text-gray-600 dark:text-gray-300 text-left space-y-1">
						<table
							class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left text-gray-700 dark:text-gray-300"
						>
							<thead class="bg-gray-100 dark:bg-[#286692] text-xs text-gray-600 dark:text-gray-200">
								<tr>
									{#if data.purchased_new.length > 0}
										{#each Object.keys(data.purchased_new[0]) as item}
											<th
												class="px-4 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400"
											>
												{formatFieldNames(item)}
											</th>
										{/each}
									{/if}
								</tr>
							</thead>
							<tbody>
								{#each data.purchased_new as row}
									<!-- Added 'last:' classes here -->
									<tr
										class="last:bg-indigo-50/50 dark:last:bg-indigo-900/30 last:font-bold transition-colors"
									>
										{#each Object.keys(row) as data_key}
											<td
												class="px-4 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400 last:border-b-0"
											>
												{row[data_key]}
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
			<button
				type="button"
				class="absolute right-4 top-4"
				aria-label="close modal button"
				onclick={() => {
					activeTab = 'General';
					handleClose();
				}}
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
		</div>
	</div>
{/if}

<style>
	.button {
		position: relative;
		width: 150px;
		height: 40px;
		cursor: pointer;
		display: flex;
		align-items: center;
		border: 1px solid #2371ac;
		background-color: #2371ac;
	}

	.button,
	.button__icon,
	.button__text {
		transition: all 0.3s;
	}

	.button .button__text {
		transform: translateX(30px);
		color: #fff;
		font-weight: 600;
	}

	.button .button__icon {
		position: absolute;
		transform: translateX(109px);
		height: 100%;
		width: 39px;
		background-color: #1d6092;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.button .svg {
		width: 30px;
		stroke: #fff;
	}

	.button:hover {
		background: #e8e8e8;
	}

	.button:hover .button__text {
		color: transparent;
	}

	.button:hover .button__icon {
		width: 148px;
		transform: translateX(0);
	}

	.button:active .button__icon {
		background-color: #e8e8e8;
	}

	.button:active {
		border: 1px solid #e8e8e8;
	}
</style>
