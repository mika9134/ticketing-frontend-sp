<script>
	import { onMount } from 'svelte';
	import { host } from '../../apis/config';
	import { getAccessToken } from '../../stores/tokenStore';
	import { goto } from '$app/navigation';
	import Modal from '$lib/modals/createForm.svelte';

	let {
		isOpen = false,
		title,
		point_of_sale_id,
		route_schedule_id,
		handleClose,
		visitType,
		handleOrderClicked
	} = $props();

	let visitStarted = $state(false);
	let responseData = $state({});
	let token = getAccessToken();
	let hasOrder = $state(false);
	let isNewVisit = $state(false);
	let showForm = $state(isOpen);
	let order_id = $state();
	let showRejectionModal = $state(false);
	let selectedRowForRejection = $state(null);
	let reason = $state('');
	let refreshTable = $state(false);

	async function load() {
		token = getAccessToken();

		const response = await fetch(`${host}orders/orders/get-orders-new`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});

		if (response.ok) {
			let result = await response.json();
			let data = [];
			if (result.succeed) {
				let route_order_hierarchy = result.data;
				Object.keys(route_order_hierarchy).forEach((route_name) => {
					data = [data, ...route_order_hierarchy[route_name]];
				});

				data.forEach((pos) => {
					if (pos.pos_id === point_of_sale_id) {
						hasOrder = true;
						order_id = pos.id;
					}
				});
			}
		}
	}

	onMount(async () => {
		load();
		showForm = false;
		let response;
		console.log('Route Schedule ID on popuppp = ' + route_schedule_id)
		response = await fetch(`${host}planned/order/check-planned-order-visit`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				accept: 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				route_schedule_id: route_schedule_id,
				point_of_sale_id: point_of_sale_id
			})
		});

		const data = await response.json();

		isNewVisit = data.succeed;
		showForm = true;
	});

async function handleNewOrder() {
	try {
		token = getAccessToken();

		// Get user location first
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const latitude = parseFloat(position.coords.latitude);
				const longitude = parseFloat(position.coords.longitude);

				console.log("Sending:", {
					route_schedule_id,
					point_of_sale_id,
					latitude,
					longitude
				})

				// const response = await fetch(
				// 	`${host}planned/order/planned-order-visit/new-order`,
				// 	{
				// 		method: 'POST',
				// 		headers: {
				// 			Authorization: `Bearer ${token}`,
				// 			'Content-Type': 'application/json'
				// 		},
				// 		body: JSON.stringify({
				// 			route_schedule_id: route_schedule_id,
				// 			id: point_of_sale_id, 
				// 			latitude: latitude,
				// 			longitude: longitude
				// 		})
				// 	}
				// );

				// const data = await response.json();

				// if (response.ok && data.succeed) {
					visitStarted = true;
					handleOrderClicked('new', order_id, point_of_sale_id);
					isNewVisit = true;

				// } else {
					// console.error("Failed:", data);
			// 	}
			},
			(error) => {
				console.error("Location error:", error.message);
			},
			{
				enableHighAccuracy: false,
				timeout: 10000,
				maximumAge: 0
			}
		);
	} catch (error) {
		console.error("New order error:", error);
	}
}


	async function noSale(result) {
		selectedRowForRejection = result;
		showRejectionModal = true;
		
	}

	async function handleNoOrder(action, result) {
		// const id = selectedRowForRejection.id;
		const remark = result?.remark;
		token = getAccessToken();
		let data;
		try {
			await navigator.geolocation.getCurrentPosition(
				async (position) => {
					const latitude = parseFloat(position.coords.latitude);
					const longitude = parseFloat(position.coords.longitude);

					let response;
					reason = remark;
					response = await fetch(`${host}planned/order/planned-order-visit/no-order`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({
							latitude: latitude,
							longitude: longitude,
							route_schedule_id: route_schedule_id,
							rejection_remark: String(reason),
							id: point_of_sale_id
						})
					});

					let json_body = await response.json();

					responseData = json_body;

					if (response.ok) {
						console.log("it is okaaaaay")
						refreshTable = !refreshTable;
						handleOrderClicked('no', order_id, point_of_sale_id);
						showRejectionModal = !showRejectionModal;
						isNewVisit = true;


						visitStarted = true;
					} else {
						console.error('order data recoreded failed:', json_body);
					}
				},
				(error) => {
					console.error('Error getting location:', error.code, error.message);
				},
				{
					enableHighAccuracy: false,
					timeout: 10000,
					maximumAge: 0
				}
			);
			return responseData;
		} catch (error) {
			console.error('Start error:', error.message);
		}
	}
</script>

{#if isOpen && showForm}

<Modal
	table_name={'No Order Reason'}
	{token}
	get_form_endpoint={`${host}Unplanned/order/get-no-order-remark-form`}
	action_type={'Add'}
	bind:showFormModal={showRejectionModal}
	callback={handleNoOrder}
	disable_save_and_add={true}
/>

	{#if isNewVisit}
		<div
			class="flex items-center justify-center bg-transparent backdrop:bg-black/50 bg-opacity-50 overflow-scroll rounded-xl"
		>
			<div
				class="relative p-6 w-fit bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg"
			>
				<div class="text-center">
					<h3 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
					<div class="flex justify-center gap-4">
						<button
							class="btn btn-neutral mt-4 bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
							onclick={handleNewOrder}
						>
							New Order
						</button>
						<button
							class="btn btn-neutral mt-4 bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
							onclick={noSale}
						>
							No Order
						</button>

					</div>
					<div class="mt-6 flex justify-center">
						<button
							class="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
							onclick={handleClose}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
		<!-- </div> -->
	{:else}
		<p class="p-10 text-gray-900 bg-gray-100 text-sm" onclick={handleClose}>
			You have already visited this point of sale
		</p>
	{/if}
{/if}
