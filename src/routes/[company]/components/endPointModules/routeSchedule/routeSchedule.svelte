<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
	import Header from "../../header/header.svelte";

	let activeTab = $state('sales');
	let visit_type = $state('Planned Visit');
	let refreshKey = $state(0); 

	
	const tableEndpoint = `${host}route-schedule/get-route-schedules`;
	const searchEndpoint = `${host}route-schedule/search`;
	const formEndpoint = `${host}route-schedule/route-schedule-form`;
	const table_id_data = `${host}route-schedule/get-route-schedule/`;

	const filterUrl = `${host}route-schedule/all-filters`;
	const submitUrl = `${host}route-schedule/create-route-schedule`;
	const updateUrl = `${host}route-schedule/update-route-schedule`;
	const deleteUrl = `${host}route-schedule/delete-route-schedule`;

	const table_name = "Schedule";

	
	let button_names = [];
	let button_callbacks = [];
	let sidebarToggle = true;

	let { onToggleSidebar } = $props();

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar && onToggleSidebar();
	};

	
	function switchToSales() {
		activeTab = 'sales';
		visit_type = 'Planned Visit';
		refreshKey += 1; 
	}

	function switchToPresales() {
		activeTab = 'presales';
		visit_type = 'Planned Order Visit';
		refreshKey += 1; 
	}
</script>

<div class="flex flex-col w-full">
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />

	<div class="flex gap-2 px-4 pt-4 border-b">
		<button
			class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
				border border-b-0
				text-gray-700 hover:bg-gray-100
				dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeTab === 'sales'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
							: 'bg-white'}"
			onclick={switchToSales}
		>
			Sales Visit
		</button>

		<button
			class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
				border border-b-0
				text-gray-700 hover:bg-gray-100
				dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeTab === 'presales'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
							: 'bg-white'}"
			onclick={switchToPresales}
		>
			Order Visit
		</button>
	</div>

	<div class="p-4">
		{#key refreshKey}
			<Table
				get_table_endpoint={tableEndpoint}
				search_endpoint={searchEndpoint}
				get_form_endpoint={formEndpoint}
				create_entry_url={submitUrl}
				get_table_endpoint_by_id={table_id_data}
				update_entry_url={updateUrl}
				delete_entry_url={deleteUrl}
				filter_endpoint={filterUrl}
				{token}
				table_name={table_name}
				module="Route Schedule"
				get_id_bool={true}
				buttons_names={button_names}
				buttons_callbacks={button_callbacks}
				additional_param={{ visit_type }}
			/>
		{/key}
	</div>
</div>

