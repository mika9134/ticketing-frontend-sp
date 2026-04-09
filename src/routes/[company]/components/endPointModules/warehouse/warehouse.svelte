<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { host, token } from '../../../../../apis/config';
	import { getCompanyName } from '../../../../../stores/companyStore';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';
	const tableEndpoint = `${host}warehouse/get-warehouses`;
	const searchEndpoint = `${host}warehouse/search`;
	const tableEndpointById = `${host}warehouse/get-warehouse/`;
	const formEndpoint = `${host}warehouse/warehouse-form`;
	const submitUrl = `${host}warehouse/create-warehouse`;
	const updateUrl = `${host}warehouse/update-warehouse`;
	const deleteUrl = `${host}warehouse/delete-warehouse`;
	const table_name = 'Warehouse';
	import { hasPrivilege } from '$lib/role.js';
	import { roles } from '../../../../../stores/roleStore.js';
	let userRoles = $state({});
	let company_name = $state('');
	let rowAction = $state(rowClicked);

	let { onToggleSidebar } = $props();

	async function rowClicked(row) {
		viewStock(row);
	}

	function viewStock(result) {
		const queryParams = new URLSearchParams({
			id: result.id,
			name: result.warehouse
		});
		const url = new URL(window.location);

		if (url.searchParams.get('id')) url.searchParams.set('id', result.id);
		else url.searchParams.append('id', result.id);

		if (url.searchParams.get('name')) url.searchParams.set('name', result.warehouse);
		else url.searchParams.append('name', result.warehouse);

		goto(`/${company_name}/warehouse/stock?${url.searchParams}`);
	}

	let button_names = [];
	let button_callbacks = [];

	onMount(async () => {
		company_name = getCompanyName();

		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;

			if (hasPrivilege(userRoles['Warehouse'], 'D')) {
				rowAction = undefined;
			} else {
				rowAction = rowClicked;
			}
		});
	});

	let sidebarToggle = true;

	// Function to toggle sidebar visibility
	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
	<Table
		get_table_endpoint={tableEndpoint}
		search_endpoint={searchEndpoint}
		get_table_endpoint_by_id={tableEndpointById}
		get_form_endpoint={formEndpoint}
		create_entry_url={submitUrl}
		update_entry_url={updateUrl}
		delete_entry_url={deleteUrl}
		{token}
		{table_name}
		module={['Warehouse']}
		get_id_bool="true"
		buttons_names={button_names}
		buttons_callbacks={button_callbacks}
		bind:row_clicked={rowAction}
	/>
</div>
