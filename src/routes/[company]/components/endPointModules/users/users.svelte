<script>
	import TenantResultModal from "$lib/modals/tenantResultModal.svelte";
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
  import Header from "../../header/header.svelte";

	const tableEndpoint = `${host}account/get-accounts`;
	const searchEndpoint = `${host}account/search`;
	const table_id_data = `${host}account/get-account/`; 
	const formEndpoint = `${host}account/account-form`;
	const updateFormEndpoint = `${host}account/account-form/`;
	const submitUrl = `${host}account/create-account`;
	const updateUrl = `${host}account/update-account`;
	const deleteUrl =`${host}account/delete-account`;
	const table_name = "Users";

  	let {
	  onToggleSidebar,
	} = $props();
	let sidebarToggle = $state(true);
	
	let button_names = [];
	let button_callbacks = [];	
	let tenantShowModal = $state(false)
	let tenantResult = $state({});

  function handleAfterSubmit(result, action_type) {
		if(result.domain && action_type == "Add"){
			tenantResult = result;
			tenantShowModal = true;

		}
	}
	
</script>


<div>
  <Header onToggleSidebar={onToggleSidebar} {sidebarToggle} />
	<Table
	get_table_endpoint={tableEndpoint}
	search_endpoint={searchEndpoint}
	get_table_endpoint_by_id={table_id_data}
	get_form_endpoint={formEndpoint}
	get_update_form_endpoint={updateFormEndpoint}
	create_entry_url={submitUrl}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
	module="Administrative"
	get_id_bool={true}
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
	disable_save_and_add={true}
	after_submit_callback={handleAfterSubmit}
/>

<TenantResultModal isTenant={false} isOpen={tenantShowModal} result={tenantResult} onClose={() => tenantShowModal = false} />


</div>


