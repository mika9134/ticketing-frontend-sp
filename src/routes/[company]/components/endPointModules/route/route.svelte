<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import { deleteItem, updateForm, addForm } from '../../../../../apis/form.js';
	import Modal from '$lib/modals/createForm.svelte';
	import Header from '../../header/header.svelte';
	import { hasPrivilege } from '$lib/role.js';
	import { onMount } from 'svelte';
	import { roles } from '../../../../../stores/roleStore';
	import Details from '$lib/modals/details-component.svelte';
	import { fetchTable } from '../../../../../apis/table';
	let showFormModalAdd = $state(false);
	let showFormModalRemove = $state(false);

	let form_data = $state(null);
	let userRoles = $state({});

	const tableEndpoint = `${host}route/get-route`;
	const searchEndpoint = `${host}route/search`;

	const formEndpoint = `${host}route/route-form`;
	const posFormEndpoint = `${host}route/add-route-pos-form`;
	const posFormEndpointDelete = `${host}route/delete-route-pos-form`;
	let posFormEndpointDeleteID = $state(`${posFormEndpointDelete}/`);
	const tableEndpointById = `${host}route/get-route/`;
	const exportEndpoint = `${host}route/export-route`;
	const filterndpoint = `${host}route/all-filters`;


	const addEndpoint = `${host}route/add-route-pos`;
	const deleteEndpoint = `${host}route/delete-route-pos`;
	const submitUrl = `${host}route/create-route`;
	const updateUrl = `${host}route/update-route`;
	const deleteUrl = `${host}route/delete-route`;
	const table_name = 'Route';
	const info_button = '<svg width="24px" height="24px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="#9ca3af"></path></g></svg>';

	let closeAfterSubmit = true;

	let action_type;

	let detailsEndpointById = $state(`${host}route/get-route-details/`);
	let detailsOpen = $state(false);
	let detailsTitle = $state('Point of Sales in Route');
	let transactions = $state({});
	let myDialog = $state();

	async function rowClicked(row) {
		// try {
		// 	console.log(row);

		// 	const data = await fetchTable(`${detailsEndpointById}${row?.id}`, token);
		// 	if (data.succeed === true) {
		// 		detailsTitle = 'Point of Sales in Route: ' + row?.route;
		// 		transactions = data.data.items != null ? data.data.items : {};
		// 		detailsOpen = true;
		// 		if (myDialog) {
		// 			myDialog.showModal();
		// 		}
		// 	}
		// } catch (error) {
		// 	console.log(error);
		// }
	}

	async function rowClickedShow(row) {
		console.log("===")
		if (hasPrivilege(userRoles['Route'], 'R')) {
			return false;
		} else {
			return true;
		}
	}

	let button_names = [
		info_button
	];
	let button_callbacks = [showBreakdown];

	async function showBreakdown(row) {
		try {
			console.log(row);

			const data = await fetchTable(`${detailsEndpointById}${row?.id}`, token);
			if (data.succeed === true) {
				detailsTitle = 'Point of Sales in Route: ' + row?.route;
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


	function addPointOfSale(result) {
		action_type = 'Add';
		form_data = result;
		showFormModalAdd = true;
	}

	function removePointOfSale(result) {
		action_type = 'Remove';
		form_data = result;

		posFormEndpointDeleteID = `${posFormEndpointDelete}/${form_data['id']}`;

		showFormModalRemove = true;
	}

	async function handleSubmit(form_submit_data) {
		let result;

		form_submit_data['id'] = form_data['id'];

		if (action_type == 'Add') {
			result = await addForm(addEndpoint, form_submit_data, token);
		} else {
			result = await deleteItem(deleteEndpoint, token, form_submit_data);
		}
		return result;
	}

	let form_name = 'Point Of Sale to Route';

	let sidebarToggle = true;

	let { onToggleSidebar } = $props();

	onMount(async () => {
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});
	});

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
	<Modal
		table_name={form_name}
		{token}
		get_form_endpoint={posFormEndpoint}
		action_type={'Add'}
		bind:showFormModal={showFormModalAdd}
		callback={handleSubmit}
		{closeAfterSubmit}
	/>

	<Modal
		table_name={form_name}
		{token}
		bind:get_form_endpoint={posFormEndpointDeleteID}
		action_type={'Remove'}
		bind:showFormModal={showFormModalRemove}
		callback={handleSubmit}
		{closeAfterSubmit}
	/>
	{#key showFormModalAdd || showFormModalRemove}
		<Table
			get_table_endpoint={tableEndpoint}
			search_endpoint={searchEndpoint}
			get_table_endpoint_by_id={tableEndpointById}
			get_export_endpoint={exportEndpoint}
			filter_endpoint={filterndpoint}
			get_form_endpoint={formEndpoint}
			create_entry_url={submitUrl}
			update_entry_url={updateUrl}
			delete_entry_url={deleteUrl}
			{token}
			{table_name}
			module="Route"
			get_id_bool={true}
			buttons_names={button_names}
			buttons_callbacks={button_callbacks}
			row_clicked={rowClicked}
			row_clicked_show={rowClickedShow}
			importEnabled={true}
		/>
		<dialog bind:this={myDialog}>
			<Details
				isOpen={true}
				title={detailsTitle}
				bind:data={transactions}
				handleClose={() => {
					detailsOpen = false;
					myDialog.close();
				}}
			/>
		</dialog>
	{/key}
</div>
