<script>
	import { onMount } from 'svelte';
	import { host } from "../../../../../apis/config";
	import { getAccessToken } from '../../../../../stores/tokenStore';

	import { writable } from 'svelte/store';
    import Details from '$lib/modals/details.svelte';
	import Table from "../../tables/table.svelte";
	import { deleteItem, updateForm, addForm } from '../../../../../apis/form.js';
	import Modal from '$lib/modals/createForm.svelte';
	import Header from '../../header/header.svelte';
	import { hasPrivilege } from '$lib/role';
  	import { getCompanyName } from '../../../../../stores/companyStore.js';
	import { roles } from '../../../../../stores/roleStore';
	let token = getAccessToken();
  	let showFormModalAdd = $state(false);
  	let showFormModalRemove = $state(false);
	let approveActivated = $state(false);
  	let rejectActivated = $state(false);
	let userRoles = $state({});
  	let company_name = $state("");	


	const tableEndpoint = `${host}bank-account/get-bank-accounts`;
	const searchEndpoint = `${host}bank-account/search`;	
	const table_id_data = `${host}bank-account/get-bank-account/`
	const formEndpoint = `${host}bank-account/bank-account-form`;
	const submitUrl = `${host}bank-account/create-bank-account`;
	const updateUrl = `${host}bank-account/update-bank-account`;
	const deleteUrl =`${host}bank-account/delete-bank-account`;
	const table_name = "Account";
</script>

<div>
	<Header />
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
	module="Finance"
	get_id_bool={true}
/>
</div>
