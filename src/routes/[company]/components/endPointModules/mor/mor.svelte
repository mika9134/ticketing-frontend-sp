<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
	import Header from "../../header/header.svelte";

	const tableEndpoint = `${host}mor-integration/get-mor-integrationes`;
	const searchEndpoint = `${host}mor-integration/search`;
	const formEndpoint = `${host}mor-integration/mor-integration-form`;
	const table_id_data = `${host}mor-integration/get-mor-integration/`; 
	const submitUrl = `${host}mor-integration/create-mor-integration`;
	const updateUrl = `${host}mor-integration/update-mor-integration`;
	const deleteUrl = `${host}mor-integration/delete-mor-integration`;
	const table_name = "Integration";

	let button_names = [];
	let button_callbacks = [];	
	
	let {
	  onToggleSidebar,
	} = $props();
	
	
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
	get_form_endpoint={formEndpoint}
	create_entry_url={submitUrl}
	get_table_endpoint_by_id = {table_id_data}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
	module="Administrative"
	get_id_bool={true}
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
/>
</div>
