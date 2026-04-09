<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/dynamicTable.svelte";


	const tableEndpoint = `${host}employee/employees`;
	const formEndpoint = `${host}employee/form`;
	const submitUrl = `${host}employee/create-employee`;
	const updateUrl = `${host}employee/update-employee`;
	const deleteUrl = `${host}employee/delete-employee`;
	const table_name = "Employee";
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

