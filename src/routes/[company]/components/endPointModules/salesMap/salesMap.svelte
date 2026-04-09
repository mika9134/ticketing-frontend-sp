<script>
	import { goto } from '$app/navigation';
	import Map from '$lib/map/map.svelte';
	import Modal from '$lib/modals/formModal.svelte';
	import { host, token } from "../../../../../apis/config";

	let selectedPointOfSale = $state();
	let selectedRoute = $state();
	let showFormModalAdd = $state(false);
	let closeUpdateModal = $state(false);

	const get_table_endpoint = `${host}sales/sales`;
	const get_form_endpoint = `${host}sales/form`;
	const create_entry_url = `${host}sales/create-sale`;
	const table_name = 'Sales';

	function onPositionSelected(event) {
		selectedPointOfSale = event.detail.selectedPosition;
		selectedRoute = event.detail.selectedRoute;
		showFormModalAdd = true;
		const queryParams = new URLSearchParams({
			pointOfSale: JSON.stringify(selectedPointOfSale),
			route: JSON.stringify(selectedRoute)
		});
		goto(`/sales/sales-product?${queryParams}`);


	}
</script>

<div>
	<Map on:positionSelected={onPositionSelected} />
	<Modal
		bind:closeUpdateModal
		{table_name}
		{token}
		{get_form_endpoint}
		{get_table_endpoint}
		{create_entry_url}
		action_type={'Add'}
		route={selectedRoute}
		pointOfSale={selectedPointOfSale}
		bind:showFormModal={showFormModalAdd}
		form_data={[]}
	/>
</div>
