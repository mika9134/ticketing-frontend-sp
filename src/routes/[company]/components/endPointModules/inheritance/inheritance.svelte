<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
  import Header from '../../header/header.svelte';
	
	let {
	  onToggleSidebar,
	  
	} = $props();



	const tableEndpoint = `${host}inheritance/get-inheritances`;
	const searchEndpoint = `${host}inheritance/search`;
	const formEndpoint = `${host}inheritance/inheritance-form`;
	const table_id_data = `${host}inheritance/get-inheritance/`; 

	const submitUrl = `${host}inheritance/create-inheritance`;
	const updateUrl = `${host}inheritance/update-inheritance`;
	const deleteUrl = `${host}inheritance/delete-inheritance`;
	const table_name = "Group";

	let button_names = [];
	let button_callbacks = [];	
	
	
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
	get_form_endpoint={formEndpoint}
	search_endpoint={searchEndpoint}
	create_entry_url={submitUrl}
	get_table_endpoint_by_id = {table_id_data}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
	module="Inheritance"
	get_id_bool={true}
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
/>
</div>
