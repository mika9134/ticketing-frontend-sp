<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';

	const tableEndpoint = `${host}global-access/get-global-accesss`;
	const table_id_data = `${host}global-access/get-global-access/`;
	const searchEndpoint = `${host}global-access/search`;
	const formEndpoint = `${host}global-access/global-access-form`;

	const submitUrl = `${host}global-access/create-global-access`;
	const updateUrl = `${host}global-access/update-global-access/`;
	const deleteUrl = `${host}global-access/delete-global-access`;
	const table_name = 'User Scope';

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