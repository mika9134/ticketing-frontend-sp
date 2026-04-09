<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/dynamicTable.svelte";


	const tableEndpoint = `${host}point-of-sale/walk-in-customer`;
	const formEndpoint = `${host}point-of-sale/walk-in-customer-form`;
	const submitUrl = `${host}point-of-sale/create-outlet`;
	const updateUrl = `${host}point-of-sale/update-walk-in-customer`;
	const deleteUrl = `${host}point-of-sale/delete-point-of-sale`;
	const table_name = "Walk-in Customer";
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
