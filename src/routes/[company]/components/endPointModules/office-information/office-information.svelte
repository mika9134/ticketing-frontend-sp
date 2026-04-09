<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
	import Header from "../../header/header.svelte";

	const tableEndpoint = `${host}office-information/get-office-informationes`;
	const searchEndpoint = `${host}office-information/search`;
	const formEndpoint = `${host}office-information/office-information-form`;
	const table_id_data = `${host}office-information/get-office-information/`; 
	const submitUrl = `${host}office-information/create-office-information`;
	const updateUrl = `${host}office-information/update-office-information`;
	const deleteUrl = `${host}office-information/delete-office-information`;
	const table_name = "Office Info";

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
