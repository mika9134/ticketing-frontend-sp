<script>
	import { host, token } from "../../../../../../apis/config";
	import Table from "../../../tables/table.svelte";

    let filter = "Approved";

	const tableEndpoint = `${host}deposit/deposits?filter=${filter}`;
    console.log("filter is", tableEndpoint);

	const formEndpoint = `${host}deposit/form`;
	const submitUrl = `${host}deposit/create-deposit`;
	const updateUrl =`${host}deposit/update-deposit`;
	const deleteUrl = `${host}deposit/delete-deposit`;
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