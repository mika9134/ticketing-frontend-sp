<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/dynamicTable.svelte";


	const tableEndpoint = `${host}period/periods`;
	const formEndpoint = `${host}period/form`;
	const submitUrl = `${host}period/create-period`;
	const updateUrl =`${host}period/update-period`;
	const deleteUrl = `${host}period/delete-period`;
	const table_name = "Period";
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

