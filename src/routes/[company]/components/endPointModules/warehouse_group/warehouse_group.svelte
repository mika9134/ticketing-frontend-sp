<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
	import Details from '$lib/modals/warehousedetails.svelte';
	import Header from '../../header/header.svelte';
	const tableEndpoint = `${host}warehouse/get-warehouse-groups`;
	const tableEndpointById = `${host}warehouse/get-warehouse-group/`;
	const searchEndpoint = `${host}warehouse/search-warehouse-group-name`;
	const formEndpoint = `${host}warehouse/warehouse-group-form`;
	const submitUrl = `${host}warehouse/create-warehouse-group`;
	const updateUrl = `${host}warehouse/update-warehouse-group`;
	const deleteUrl = `${host}warehouse/delete-warehouse-group`;
	const table_name = "Group";
	let detailsOpen = $state(false);
	let rowDetails = $state({});

	let button_names = [];
	let button_callbacks = [];	
	
	let refreshToggler = $state(true);
	
	async function rowClicked(row)
  {
    try {
        rowDetails = JSON.parse(JSON.stringify(row));;
				detailsOpen = true;		  
		} catch (error) {
			console.log(error);
		}
  }
  
  async function refresh(result, action_type)
  {
    refreshToggler = !refreshToggler;
  }
  
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
<Details
   isOpen={detailsOpen}
   title={"Update Warehouse Group"}
   bind:data={rowDetails}
   handleClose={() => {detailsOpen = false; refreshToggler = !refreshToggler;}}

/>

{#key refreshToggler}
<Table
	get_table_endpoint={tableEndpoint}
	get_table_endpoint_by_id={tableEndpointById}
	get_form_endpoint={formEndpoint}
  search_endpoint={searchEndpoint}
	create_entry_url={submitUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
	module="Warehouse"
	get_id_bool=true
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
	row_clicked={rowClicked}
	after_submit_callback={refresh}
/>
{/key}
<!---

<Table
	get_table_endpoint={table2Endpoint}
	get_table_endpoint_by_id={table2EndpointById}
	get_form_endpoint={form2Endpoint}
  get_update_form_endpoint={updateForm}
  search_endpoint={searchEndpoint}
	create_entry_url={submit2Url}
	update_entry_url={update2Url}
	delete_entry_url={delete2Url}
	{token}
	table_name= {table_name2}
	module="Inventory Management"
	get_id_bool=true
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
  
/>

--->
</div>
