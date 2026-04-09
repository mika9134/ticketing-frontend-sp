<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import Table from '../../tables/table.svelte';
	import { getCompanyName } from '../../../../../stores/companyStore';
	import { roles } from '../../../../../stores/roleStore';
	import { host, token } from '../../../../../apis/config';
	import Header from '../../header/header.svelte';
	import DetailsComponent from '$lib/modals/details-component.svelte';
	import { fetchTable } from '../../../../../apis/table';

	let tableEndpoint = $state(`${host}warehouse/get-assets`);
	const searchEndpoint = `${host}warehouse/get-asset-search`;
	const table_name = 'Assets';
	let id = $state();
	let warehouse_name = $state();

	let button_names = [];
	let button_callbacks = [];

	let activeStatus = $state('Regular');
	let refreshTable = $state(false);

	let detailsEndpointById = $state(`${host}warehouse/get-asset-details/`);
	let detailsOpen = $state(false);
	let detailsTitle = $state('');
	let transactions = $state({});
	let myDialog = $state();

	onMount(async () => {
		const query = $page.url.searchParams;
		id = query.get('id');
		warehouse_name = query.get('name');
		tableEndpoint = `${host}warehouse/get-assets/${id}`;
	});

	async function rowClicked(row) {
		try {
			const product_id = row.product_id;
			const stock_type = row.stock_type;
			const purchase_price = row.purchase_price_param;
			const warehouse_id = row.warehouse_id;
			console.log('row');
			console.log(row);
			let url = `${detailsEndpointById}${product_id}/${stock_type}/${purchase_price}/${warehouse_id}`
			console.log('object')
			console.log(url)

			const data = await fetchTable(`${detailsEndpointById}${product_id}/${stock_type}/${purchase_price}/${warehouse_id}`, token);
			if (data.succeed === true) {
				detailsTitle = 'Assets Information';
				transactions = data.data != null ? data.data : {};
				detailsOpen = true;
				if (myDialog) {
					myDialog.showModal();
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	let { onToggleSidebar } = $props();

	let sidebarToggle = true;

	function handleTasks(type) {
		console.log(type);
		tableEndpoint = `${host}warehouse/get-assets/${id}`;
		refreshTable = !refreshTable;
	}

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<div>
	<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => {
					activeStatus = 'Regular';
					handleTasks(activeStatus);
					refreshTable = !refreshTable;
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Regular'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Regular
			</button>

			<button
				type="button"
				onclick={() => {
					activeStatus = 'Promotional';
					handleTasks(activeStatus);
					refreshTable = !refreshTable;
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Promotional'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Promotional
			</button>
		</div>
	</div>

	{#key refreshTable}
		<dialog bind:this={myDialog}>
			<DetailsComponent
				isOpen={true}
				title={detailsTitle}
				bind:data={transactions}
				handleClose={() => {
					detailsOpen = false;
					myDialog.close();
				}}
			/>
		</dialog>
		<Table
			bind:get_table_endpoint={tableEndpoint}
			search_endpoint={searchEndpoint}
			{token}
			{table_name}
			get_id_bool={true}
			module={['Inventory Management', 'Procurement', 'Finance']}
			buttons_names={button_names}
			buttons_callbacks={button_callbacks}
			row_clicked={rowClicked}
			additional_param={{ stock_type: activeStatus }}
		/>
	{/key}
</div>
