<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';

	const tableEndpoint = `${host}target-set/get-target-sets`;
	const table_id_data = `${host}target-set/get-target-set/`;
	const searchEndpoint = `${host}target-set/search`;
	const formEndpoint = `${host}target-set/target-set-form`;

	const submitUrl = `${host}target-set/create-target-set`;
	const updateUrl = `${host}target-set/update-target-set/`;
	const deleteUrl = `${host}target-set/delete-target-set`;
	const table_name = 'Setters';

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