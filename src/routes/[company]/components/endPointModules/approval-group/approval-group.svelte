<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';

	const tableEndpoint = `${host}approval-group/v2/get-approval-groups`;
	const table_id_data = `${host}approval-group/v2/get-approval-group/`;
	const formEndpoint = `${host}approval-group/v2/approval-group-form`;
	const submitUrl = `${host}approval-group/v2/create-approval-group`;
	const updateUrl = `${host}approval-group/v2/update-approval-group`;
	const deleteUrl = `${host}approval-group/v2/delete-approval-group`;
	const searchEndpoint = `${host}approval-group/v2/search`;
	const table_name = 'Group';

	let { onToggleSidebar } = $props();
	let sidebarToggle = $state(true);

	let button_names = [];
	let button_callbacks = [];
</script>

<div>
	<Header {onToggleSidebar} {sidebarToggle} />
	<Table
		get_table_endpoint={tableEndpoint}
		search_endpoint={searchEndpoint}
		get_table_endpoint_by_id={table_id_data}
		get_form_endpoint={formEndpoint}
		create_entry_url={submitUrl}
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
