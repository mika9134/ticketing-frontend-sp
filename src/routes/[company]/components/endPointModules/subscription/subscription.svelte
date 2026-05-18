<script>
	import { host_super as host, token } from "../../../../../apis/config";
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';

	const tableEndpoint = `${host}provider/subscription/get-subscriptions`;
	const table_id_data = `${host}provider/subscription/get-subscription/`;
	const searchEndpoint = `${host}provider/subscription/search`;
	const formEndpoint = `${host}provider/subscription/subscription-form`;

	const submitUrl = `${host}provider/subscription/create-subscription`;
	const updateUrl = `${host}provider/subscription/update-subscription`;
	const deleteUrl = `${host}provider/subscription/delete-subscription`;
	const table_name = 'Subscription';

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
		module="Service Provider"
		get_id_bool={true}
		buttons_names={button_names}
		buttons_callbacks={button_callbacks}
	/>
</div>