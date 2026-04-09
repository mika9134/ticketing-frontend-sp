<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";


	const tableEndpoint = `${host}point-of-sale/get-outlet`;
	const formEndpoint = `${host}point-of-sale/outlet-form`;
	const tableEndpointById = `${host}point-of-sale/get-outlet/`

	const submitUrl = `${host}point-of-sale/create-outlet`;
	const updateUrl = `${host}point-of-sale/update-outlet`;
	const deleteUrl = `${host}point-of-sale/delete-outlet`;
	const table_name = "Outlet";
</script>

<Table
	get_table_endpoint={tableEndpoint}
	get_table_endpoint_by_id={tableEndpointById}

	get_form_endpoint={formEndpoint}
	create_entry_url={submitUrl}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
	module="Point Of Sale"
	get_id_bool = {true}	

/>


