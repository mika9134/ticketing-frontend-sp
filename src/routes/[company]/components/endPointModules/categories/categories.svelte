	 <script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
	import Header from "../../header/header.svelte";

	const tableEndpoint = `${host}category/get-categories`;
	const searchEndpoint = `${host}category/search`;
	const formEndpoint = `${host}category/category-form`;
	const submitUrl = `${host}category/create-category`;
	const table_id_data = `${host}category/get-category/`; 

	const updateUrl =`${host}category/update-category/`;
	const deleteUrl =`${host}category/delete-category`;
	const table_name = "	Category";
	const summerizEndpoint = `${host}category/category-summary`;
	
	let button_names = [];
	let button_callbacks = [];	
	
	let {
	  onToggleSidebar,
	} = $props();


	let sidebarToggle = $state(true);

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
	summerize_endpoint={summerizEndpoint}

	create_entry_url={submitUrl}
	get_table_endpoint_by_id = {table_id_data}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
	module="Category"
	get_id_bool={true}
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
	isHierarchical={true}
/>
</div>
