<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import DetailsComponent from '$lib/modals/details-component.svelte';
	const tableEndpoint = `${host}territory/get-territory`;
	const searchEndpoint = `${host}territory/search`;

	const formEndpoint = `${host}territory/territory-form`;
	const tableEndpointById = `${host}territory/get-territory/`;

	const submitUrl = `${host}territory/create-territory`;
	const updateUrl = `${host}territory/update-territory`;
	const deleteUrl = `${host}territory/delete-territory`;
	const filterUrl = `${host}territory/all-filters`;
	const table_name = 'Territory';
	const exportEndpoint = `${host}territory/export-territory`;


	let detailsEndpointById = $state(`${host}territory/get-territory-details/`);
	let detailsOpen = $state(false);
	let detailsTitle = $state('Routes in Territory');
	let transactions = $state({});
	let myDialog = $state();

	const info_button =
		'<svg width="24px" height="24px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="#9ca3af"></path></g></svg>';


	let button_names = [info_button];
	let button_callbacks = [showBreakdown];

	async function showBreakdown(row) {
		try {
			console.log(row);

			const data = await fetchTable(`${detailsEndpointById}${row?.id}`, token);
			if (data.succeed === true) {
				detailsTitle = 'Territories in Region: ' + row?.territory_name;
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
		get_export_endpoint={exportEndpoint}
		get_table_endpoint_by_id={tableEndpointById}
		get_form_endpoint={formEndpoint}
		create_entry_url={submitUrl}
		update_entry_url={updateUrl}
		delete_entry_url={deleteUrl}
		filter_endpoint={filterUrl}
		{token}
		{table_name}
		module="Territory"
		get_id_bool={true}
		buttons_names={button_names}
		buttons_callbacks={button_callbacks}
	/>
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
</div>
