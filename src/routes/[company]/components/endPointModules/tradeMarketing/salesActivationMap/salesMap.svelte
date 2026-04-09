<script>
	import { goto } from '$app/navigation';
	import Map from '$lib/map/map.svelte';
	import Modal from '$lib/modals/formModal.svelte';
	import { host, token } from "../../../../../../apis/config";
	let selectedPointOfSale = $state();
	let selectedRoute = $state();
	let selectedTerritory = $state();
	let showFormModalAdd = $state(false);
	let closeUpdateModal = $state(false);

	const get_table_endpoint = `${host}marketing/promotions`;
	const get_form_endpoint = `${host}marketing/form`;
	const create_entry_url = `${host}marketing/create-promotion`;
	const table_name = "Promotion";

	function onPositionSelected(event) {
		selectedPointOfSale = event.detail.selectedPosition;
		selectedRoute = event.detail.selectedRoute;
		selectedTerritory = event.detail.selectedTerritory;
		console.log(selectedRoute);
		showFormModalAdd = true;
		const queryParams = new URLSearchParams({
			territory: JSON.stringify(selectedTerritory),
			pointOfSale: JSON.stringify(selectedPointOfSale),
			route: JSON.stringify(selectedRoute)
		});
		//goto(`/trade-marketing/sales-activation/sales-activation-product?${queryParams}`);

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
		territory={selectedTerritory}
		bind:showFormModal={showFormModalAdd}
		form_data={[]}
	/>
</div>


