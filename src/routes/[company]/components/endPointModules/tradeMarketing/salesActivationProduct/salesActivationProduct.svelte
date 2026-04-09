<script>
	import { host, token } from "../../../../../../apis/config";
	import Table from '../../../tables/dynamicTable.svelte'

	const tableEndpoint = `${host}products/products`;
	const formEndpoint = `${host}products/form`;
	const submitUrl = `${host}products/create-product`;
	const updateUrl = `${host}products/update-product`;
	const deleteUrl = `${host}products/delete-product`;
	const table_name = 'Add Promotion';
</script>

<Table
	get_table_endpoint={tableEndpoint}
	get_form_endpoint={formEndpoint}
	create_entry_url={submitUrl}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	{table_name}
/>
