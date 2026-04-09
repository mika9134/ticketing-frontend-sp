<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
			import Header from "../../header/header.svelte";

	const tableEndpoint = `${host}get-scope-groups`;
	const table_id_data = `${host}get-scope-group/`;
	const searchEndpoint = `${host}search`; 
	const formEndpoint = `${host}scope-group-form`;
	const submitUrl = `${host}create-scope-group`;
	const updateUrl = `${host}update-scope-group`;
	const deleteUrl =`${host}delete-scope-group`;
	const table_name = "Group";

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
	get_table_endpoint_by_id = {table_id_data}
	get_form_endpoint={formEndpoint}
	create_entry_url={submitUrl}
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

