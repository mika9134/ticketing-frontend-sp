<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
	import Header from '../../header/header.svelte';
	const tableEndpoint = `${host}organization/get-organizations`;
	const searchEndpoint = `${host}organization/search`;
	const tableEndpointById = `${host}organization/get-organization/`
	const formEndpoint = `${host}organization/organization-form`;
	const submitUrl = `${host}organization/create-organization`;
	const updateUrl = `${host}organization/update-organization`;
	const deleteUrl =`${host}organization/delete-organization`;
	const table_name = "Organization";

	let button_names = [];
	let button_callbacks = [];
	
	let sidebarToggle = true;
	
	let {
	  onToggleSidebar,
	} = $props();

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
	get_table_endpoint_by_id={tableEndpointById}
	get_form_endpoint={formEndpoint}
	create_entry_url={submitUrl}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
	module="Organization"
	get_id_bool={true}
	isHierarchical={true}
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
/>
</div>
