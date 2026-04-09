<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';

	const tableEndpoint = `${host}vstock-permission/get-vstock-permissions`;
	const table_id_data = `${host}vstock-permission/get-vstock-permission/`;
	const searchEndpoint = `${host}vstock-permission/search`;
	const formEndpoint = `${host}vstock-permission/vstock-permission-form`;

	const submitUrl = `${host}vstock-permission/create-vstock-permission`;
	const updateUrl = `${host}vstock-permission/update-vstock-permission/`;
	const deleteUrl = `${host}vstock-permission/delete-vstock-permission`;
	const table_name = 'Group';

	let button_names = [];
	let button_callbacks = [];

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
		update_entry_url={updateUrl}
		delete_entry_url={deleteUrl}
		{token}
		{table_name}
		module="Administrative"
		get_id_bool={true}
		buttons_names={button_names}
		buttons_callbacks={button_callbacks}
	/>
</div>