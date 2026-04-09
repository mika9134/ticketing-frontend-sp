<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';
	import DetailsComponent from '$lib/modals/details-component.svelte';
	import { fetchTable } from '../../../../../apis/table';

	const tableEndpoint = `${host}region/get-regions`;
	const table_id_data = `${host}region/get-region/`;
	const searchEndpoint = `${host}region/search`;
	let formEndpoint = $state(`${host}region/region-form`);
	const formEndpointTabbed = `${host}region/region-form`;
	const formEndpointNonTabbed = `${host}region/region-form-no-tab`;
	const checkChildrenEndpoint = `${host}region/check-region-children/`;
	const summerizEndpoint = `${host}region/region-summary/`;

	const submitUrl = `${host}region/create-region`;
	const updateUrl = `${host}region/update-region/`;
	const deleteUrl = `${host}region/delete-region`;
	const table_name = 'Demarcation';

	let detailsEndpointById = $state(`${host}region/get-region-details/`);
	let detailsOpen = $state(false);
	let detailsTitle = $state('Territories in Region');
	let transactions = $state({});
	let myDialog = $state();

	const info_button =
		'<svg width="24px" height="24px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="#9ca3af"></path></g></svg>';

	async function rowClickedShow(row) {
		const response = await fetch(`${checkChildrenEndpoint}${row?.id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});

		const data = await response.json();
		if (response.ok && data.data.has_children) formEndpoint = formEndpointNonTabbed;
		else formEndpoint = formEndpointTabbed;
	}
	async function rowClicked(row) {
		// Do nothing
	}

	let button_names = [info_button];
	let button_callbacks = [showBreakdown];

	async function showBreakdown(row) {
		try {
			console.log(row);

			const data = await fetchTable(`${detailsEndpointById}${row?.id}`, token);
			if (data.succeed === true) {
				detailsTitle = 'Territories in Region: ' + row?.region_name;
				transactions = data.data != null ? data.data : {};
				detailsOpen = true;
				if (myDialog) {
					myDialog.showModal();
				}
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}

	function showbutton(row, button_name) {
		return info_button && row?.assigned == true
	}

	let { onToggleSidebar } = $props();
	let sidebarToggle = $state(true);

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
		get_form_endpoint={formEndpoint}
		create_entry_url={submitUrl}
		get_table_endpoint_by_id={table_id_data}
		summerize_endpoint={summerizEndpoint}

		update_entry_url={updateUrl}
		delete_entry_url={deleteUrl}
		{token}
		{table_name}
		module="Territory"
		get_id_bool={true}
		buttons_names={button_names}
		buttons_callbacks={button_callbacks}
		isHierarchical={true}
		row_clicked_show={rowClickedShow}
		row_clicked={rowClicked}
		buttons_show={showbutton}

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
