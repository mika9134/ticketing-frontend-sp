<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
	import Header from "../../header/header.svelte";

	const tableEndpoint = `${host}address/get-addresses`;
	const exportEndpoint = `${host}address/export-addresses`;
	const searchEndpoint = `${host}address/search`;
	const formEndpoint = `${host}address/address-form`;
	const table_id_data = `${host}address/get-address/`; 
	const submitUrl = `${host}address/create-address`;
	const updateUrl = `${host}address/update-address`;
	const deleteUrl = `${host}address/delete-address`;
	const table_name = "Address";

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
	get_export_endpoint={exportEndpoint}
	get_form_endpoint={formEndpoint}
	create_entry_url={submitUrl}
	get_table_endpoint_by_id = {table_id_data}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
	module="Address"
	get_id_bool={true}
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
	importEnabled={true}

/>
</div>
