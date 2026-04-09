<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";


	const tableEndpoint = `${host}orders/get-order`;
	const searchEndpoint = `${host}orders/search`;
	const formEndpoint = `${host}orders/order-form`;
	const table_id_data = `${host}orders/get-order/`; 

	const submitUrl = `${host}orders/create-order`;
	const updateUrl = `${host}orders/update-order`;
	const deleteUrl = `${host}orders/delete-order`;
	const table_name = "Orders";

	let button_names = [];
	let button_callbacks = [];
</script>

<Table
	get_table_endpoint={tableEndpoint}
	search_endpoint={searchEndpoint}
	get_form_endpoint={formEndpoint}
	create_entry_url={submitUrl}
	get_table_endpoint_by_id = {table_id_data}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	table_name= {table_name}
	module="Product"
	get_id_bool={true}
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
/>


