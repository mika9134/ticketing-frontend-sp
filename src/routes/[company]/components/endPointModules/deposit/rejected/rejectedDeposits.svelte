<script>
	import { host, token } from "../../../../../../apis/config";
	import Table from "../../../../tables/table.svelte";


	const tableEndpoint = `${host}warehouse/warehouses`;
	const formEndpoint = `${host}warehouse/form`;
	const submitUrl = `${host}warehouse/create-warehouse`;
	const updateUrl = `${host}warehouse/update-warehouse`;
	const deleteUrl = `${host}warehouse/delete-warehouse`;
	const table_name = "Deposit";
</script>

<Table
	get_table_endpoint={tableEndpoint}
	get_form_endpoint={formEndpoint}
	create_entry_url={submitUrl}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
/>


