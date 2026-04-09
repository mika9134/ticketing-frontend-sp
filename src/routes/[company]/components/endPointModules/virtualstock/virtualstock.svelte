<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';
	import Modal from '$lib/modals/createForm.svelte';

	const tableEndpoint = `${host}virtual-stock/get-virtual-stock`;
	const searchEndpoint = `${host}virtual-stock/search`;
	let conversion_form = $state(`${host}vstock-permission/vstock-permission-conversion-form`);
	let conversion_endpoint = $state(`${host}vstock-permission/convert-virtual-stock`);

	const table_name = 'Vehicle';

	const convert_svg_code = '<svg fill="#286692" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 490.001 490.001" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M439.823,231.55c-12.7-7.6-23,0-27.1,5.2c-42.8,52.2-147.1,57.4-189.9,57.4c-2.1,0-4.2,0-5.2,0v-44.9 c0-20-21.9-25.9-33.4-15.6l-128.3,109.3c-9.8,8.3-9.8,23.3-0.1,31.7c39.5,33.9,128.4,110.5,128.4,110.5 c9.1,9.1,33.4,6.2,33.4-15.6v-41.7c0,0,0,0,0.1-0.1c42.9,1.2,166.5-10.6,230.5-171C452.323,247.25,448.323,236.65,439.823,231.55z M221.823,385.95c-12.5,0-20.9-1-20.9-1c-12.5-2.5-24,7.1-24,19.8v19.8l-77.2-65.7l77.2-65.7v19.8c0,11.5,8.3,19.8,18.8,20.9 c1,0,10.4,1,27.1,1c38.6,0,98.1-4.2,147.1-25C320.923,374.55,259.323,385.95,221.823,385.95z"></path> <path d="M77.323,253.15c42.8-52.2,147.1-57.4,189.9-57.4c2.1,0,4.2,0,5.2,0v44.9c0,20,21.9,25.9,33.4,15.6l128.3-109.2 c9.8-8.3,9.8-23.3,0.1-31.7c-39.5-34-128.5-110.5-128.5-110.5c-9.1-9.1-33.4-6.2-33.4,15.6v41.7c0,0,0,0-0.1,0.1 c-42.9-1.1-166.5,10.7-230.4,171.1c-4.2,9.4-0.1,20,8.3,25C62.823,265.95,73.123,258.35,77.323,253.15z M268.223,103.95 c12.5,0,20.9,1,20.9,1c12.5,2.5,24-7.1,24-19.8v-19.8l77.2,65.7l-77.2,65.7v-19.8c0-11.5-8.3-19.8-18.8-20.9c-1,0-10.4-1-27.1-1 c-38.6,0-98.1,4.2-147.1,25C169.123,115.45,230.623,103.95,268.223,103.95z"></path> </g> </g> </g></svg>';
	let convert_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${convert_svg_code} Convert </div>`;
	const convert_styling = 'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';

	let subTableLoad;
	let button_names = [convert_svg, ''];
	let button_callbacks = [conversion, ''];
	let button_styles = [convert_styling, ''];

	let showConversionModal = $state(false);
	let selectedRow = $state(null);

	const product_tabs = ['Standard', 'Non Standard'];
	const stock_tabs = ['Regular', 'Promotional'];

	let active_product_tab = $state('Standard');
	let active_stock_tab = $state('Regular');
	let refreshTable = $state(true);

	function showbutton(row, button_name) {
		return row.vstock_permission == true && row.status != 'Finished' && active_product_tab == 'Non Standard' && button_name == convert_svg;
	}

	async function conversion(result) {
		selectedRow = result;
		showConversionModal = true;
		return result;
	}

	async function handleConversionSubmit(action, result) {
		const id = selectedRow.id;
		console.log('Conversion Result');
		console.log(result);
		
		const product = result?.destination_SKU
		const stock_type = result?.destination_stock_type
		const quantity = result?.destination_quantity

		if (!id) {
			console.error('No ID found for Conversion');
			return;
		}
		try {
			const response = await fetch(`${conversion_endpoint}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					product_id: product,
					stock_type: stock_type,
					quantity: quantity
				})
			});

			const data = await response.json();
			if (response.ok) {
				showConversionModal = !showConversionModal;
				if (data.succeed == true)
					refreshTable = !refreshTable;
			} else {
				console.error('Conversion failed:', data);
			}

			return data;
		} catch (error) {
			console.error('Error while Conversion:', error);
		}
	}

	let { onToggleSidebar } = $props();

	let sidebarToggle = $state(true);

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<Modal
	table_name={'Conversion'}
	{token}
	get_form_endpoint={`${conversion_form}`}
	action_type={'Add'}
	bind:showFormModal={showConversionModal}
	callback={handleConversionSubmit}
	disable_save_and_add={true}
/>
<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />

	<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
		<div class="flex gap-2">
			{#each stock_tabs as tab}
				<button
					type="button"
					onclick={() => {
						active_stock_tab = tab;
						refreshTable = !refreshTable;
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
						border border-b-0
						text-gray-700 hover:bg-gray-100
						dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
						{active_stock_tab === tab
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					{tab}
				</button>
			{/each}
		</div>
	</div>

	<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
		<div class="flex gap-2">
			{#each product_tabs as tab}
				<button
					type="button"
					onclick={() => {
						active_product_tab = tab;
						refreshTable = !refreshTable;
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
						border border-b-0
						text-gray-700 hover:bg-gray-100
						dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
						{active_product_tab === tab
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					{tab}
				</button>
			{/each}
		</div>
	</div>

	{#key refreshTable}
		<Table
			get_table_endpoint={tableEndpoint}
			search_endpoint={searchEndpoint}
			{token}
			{table_name}
			module="Sales"
			get_id_bool={true}
			buttons_names={button_names}
			buttons_callbacks={button_callbacks}
			button_styles={button_styles}
			additional_param={{ 
				product_type: active_product_tab,
				stock_type: active_stock_tab 
			}}
			buttons_show={showbutton}
		/>
	{/key}
</div>