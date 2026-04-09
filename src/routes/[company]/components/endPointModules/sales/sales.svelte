<script>
	import { onMount } from 'svelte';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import { host } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import { fetchForm } from '../../../../../apis/form.js';
	import { formatFieldNames } from '$lib/utils.js';
	import Checkout from '../salesForm/salesForm.svelte';
	import Map from '$lib/map/map.svelte';
	import Details from '$lib/modals/details.svelte';
	import Header from '../../header/header.svelte';
	import VisitOptions from '$lib/modals/visitOptions.svelte';
	import Proceed from '$lib/modals/proceedModal.svelte';
	import { goto } from '$app/navigation';
	import { getCompanyName } from '../../../../../stores/companyStore.js';
	import { hasPrivilege } from '$lib/role';
	import { roles } from '../../../../../stores/roleStore';
	import Orders from '../visit/orders.svelte';
	import Customer from './../visit/customer.svelte';

	import { get } from 'svelte/store';
	import { page } from '$app/stores';

	let userRoles = $state({});

	let order_id = $state();
	let updateTable = $state(false);

	let {
		startTab = 'Sales History',
		fixedTerritory = undefined,
		fixedRoute = undefined,
		routeSchedule = undefined,
		visitType = 'Planned Visit',
		onToggleSidebar
	} = $props();

	let companyName = getCompanyName();
	let showCustomer = $state(false);
	let token = getAccessToken();
	let salesStatus = $state('');


	const tableEndpointItems = `${host}sales/sales-item/get-sales-item`;
	const tableEndpointByIdItems = `${host}sales/sales-item/get-sales-item/`;
	const searchEndpointItems = `${host}sales/sales-item/search`;
	const formEndpointItems = `${host}sales/sales-item/sales-item-form`;
	const submitUrlItems = `${host}sales/sales-item/create-sales-item`;
	const updateUrlItems = `${host}sales/sales-item/update-sales-item`;
	const deleteUrlItems = `${host}sales/sales-item/delete-sales-item`;
	const table_name_items = 'Sales Items';
	const itemsTabs = ['Map', 'List'];
	let current_PoS = $state({});
	let current_PoS_name = $state('');
	let current_PoS_name_search = $state([]);
	let current_PoS_landmark = $state('');
	let isOpen = $state(false);
	let reloadMap = $state(true);
	let dialogRef;

	let order_id_for_visit = $state('');
	let proceedOpen = $state(false);
	let dialogRefProceed;

	let proceedOpen2 = $state(false);
	let dialogRefProceed2;

	let map_PoS = $state({});
	let map_PoS_name = $state('');
	let map_PoS_landmark = $state('');
	let approveActivated = $state(false);

	let activeTabMap = $state('Map');
	let point_of_sales = $state([]);
	let activeType = $state('Cash');

	let orderID = $state();

	//Sales History
	const tableEndpoint = `${host}sales/sales/get-sales`;
	const exportEndpoint = `${host}sales/sales/export-sales`;
	const tableEndpointById = `${host}sales/sales/get-sales/`;
	const detailsEndpointById = `${host}sales/sales/get-transactions-sales/`;
	const summerizEndpoint = `${host}sales/sales/sales-summary/`;
	const filterEndpoint = `${host}sales/sales/all-filters`;

	const searchEndpoint = `${host}sales/sales/search`;
	const discountEndpoint = `${host}sales/sales/get-discount-rate/`;
	let formEndpoint = $state(`${host}sales/sales/sales-form`);
	const submitUrl = `${host}sales/sales/create-sales`;
	const updateUrl = `${host}sales/sales/update-sales`;
	const deleteUrl = `${host}sales/sales/delete-sales`;
	const voidUrl = `${host}sales/sales/void-sales`;
	const table_name = 'Sales';
	let tabs = $state(['Sales History', 'Customer', 'Cart', 'Orders']);
	let cartTabs = ['Cart Items', 'Checkout'];
	let currentRow = $state('');
	let activeCartTab = $state('Cart Items');

	let activeTab = $state(startTab);
	let detailsOpen = $state(false);

	let transactions = $state({});

	let locationBuffer = [];

	async function sendLocations() {
		try {
			console.log(routeSchedule, 'here we go');
			console.log(locationBuffer, 'location buffer');

			if (!routeSchedule) {
				console.warn('No routeSchedule ID available, skipping send.');
				return;
			}

			const payload = {
				route_schedule_id: routeSchedule,
				points: locationBuffer
			};

			console.log('Sending to backend:', payload);

			const totaldistance = `${host}travel/log-current-location`;

			const response = await fetch(totaldistance, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				throw new Error(`Server responded with ${response.status}`);
			}

			console.log('Successfully sent locations');
			locationBuffer = []; // clear buffer after successful send
		} catch (err) {
			console.error('Failed to send locations:', err);
			locationBuffer = []; // clear buffer even on error
		}
	}
	// Function to collect geolocation (using your watchPosition logic)
	function collectGeolocation() {
		if (navigator.geolocation) {
			if (!routeSchedule) {
				console.warn('No routeSchedule ID available, skipping send.');
				return;
			}
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const latitude = parseFloat(position.coords.latitude);
					const longitude = parseFloat(position.coords.longitude);

					const coords = {
						latitude: latitude,
						longitude: longitude
					};

					console.log(' yessssss Collected:', coords);
					if (
						locationBuffer.length === 0 ||
						locationBuffer[locationBuffer.length - 1].latitude !== coords.latitude ||
						locationBuffer[locationBuffer.length - 1].longitude !== coords.longitude
					) {
						locationBuffer.push(coords);
						console.log('new value', coords);
					}

					console.log('the lenght==', locationBuffer.length);
					if (locationBuffer.length >= 5) {
						console.log('greater than 5');
						sendLocations();
					}

					scheduleNext();
				},
				(error) => {
					console.error('Error getting geolocation', error);
					scheduleNext();
				},
				{
					enableHighAccuracy: true,
					timeout: 30000,
					maximumAge: 0
				}
			);
		} else {
			console.log('Geolocation is not supported by this browser.');
			scheduleNext();
		}
	}

	function scheduleNext() {
		setTimeout(collectGeolocation, 30000);
	}
	collectGeolocation();

	async function orderSale() {
		try {
			token = getAccessToken();
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const latitude = parseFloat(position.coords.latitude);
					const longitude = parseFloat(position.coords.longitude);

					let response = await fetch(`${host}planned/planned-visit/sale-order`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({
							latitude: latitude,
							longitude: longitude,
							id: current_PoS['point_of_sale'],
							route_schedule_id: routeSchedule,
							visit_type: visitType
						})
					});
				},
				(error) => {
					console.error('Error getting location:', error.code, error.message);
				},
				{
					enableHighAccuracy: true,
					timeout: 20000,
					maximumAge: 0
				}
			);
		} catch (error) {
			console.error('Start error:', error.message);
		}
	}
	function newSale() {
		try {
			token = getAccessToken();

			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const latitude = parseFloat(position.coords.latitude);
					const longitude = parseFloat(position.coords.longitude);

					let response;
					// if (visitType == 'Planned Visit') {
					response = await fetch(`${host}planned/planned-visit/new-sale`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({
							latitude: latitude,
							longitude: longitude,
							route_schedule_id: routeSchedule,
							id: current_PoS['point_of_sale'],
							visit_type: visitType
						})
					});
				},
				(error) => {
					console.error('Error getting location:', error.code, error.message);
				},
				{
					enableHighAccuracy: true,
					timeout: 20000,
					maximumAge: 0
				}
			);
		} catch (error) {
			console.error('Start error:', error.message);
		}
	}
	function changeToCart() {
		activeTab = 'Cart';
		showCustomer = false;
		//updateTable = !updateTable;
	}

	async function showCart(dialog = true) {
		await getPendingCarts();

		if ((await alreadyInCart(map_PoS)) && dialog) {
			proceedOpen = true;
			dialogRefProceed.showModal();
			//updateTable = !updateTable;
		} else {
			changeToCart();
		}
		updateTable = !updateTable;
	}

	function handleMarkerClicked(body) {
		console.log('DD', body);
		current_PoS_name_search = [];
		current_PoS = { point_of_sale: body['id'] };
		current_PoS_name = body['name'];
		current_PoS_name_search.push(body['name']);
		current_PoS_landmark = body['landmark'];
		let map_PoS_json = JSON.parse(JSON.stringify(body));
		map_PoS = map_PoS_json['id'];
		map_PoS_name = map_PoS_json['name'];
		map_PoS_landmark = map_PoS_json['landmark'];

		showCart();
	}

	export function handleSelect(id, name, landmark, dialog = true) {
		console.log('in sales');
		current_PoS = { point_of_sale: id };
		current_PoS_name_search = [];
		current_PoS_name = name;
		current_PoS_name_search.push(name);
		map_PoS = id;
		map_PoS_name = name;
		map_PoS_landmark = landmark;
		if (fixedTerritory !== undefined && fixedRoute !== undefined && dialog) {
			isOpen = true;
			dialogRef.showModal();
		} else {
			showCart(dialog);
		}

		if (order_id) {
			createSales(order_id, id, '');
		}
		updateTable = !updateTable;
		activeCartTab = 'Cart Items';
	}

	async function rowClicked(row) {
		try {
			currentRow = row;
			const data = await fetchTable(detailsEndpointById + row.id, token);

			if (data.succeed === true) {
				transactions = data.data;
				detailsOpen = true;
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function alreadyInCart(pos_id) {
		let result = false;

		if (pendingCarts) {
			pendingCarts.forEach((pos) => {
				if (pos.id == pos_id) {
					result = true;
				}
			});
		}
		return result;
	}

	async function reload() {
		try {
			const data = await fetchTable(detailsEndpointById + currentRow.id, token);
			//console.log("i am the reload data", data)

			if (data.succeed === true) {
				transactions = data.data;
				detailsOpen = true;
			}
		} catch (error) {
			console.log(error);
		}
	}

	let sidebarToggle = true;

	// Function to toggle sidebar visibility
	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
	};

	let pendingPointUrl = $state(`${host}sales/sales/get-point-of-sales/`);

	let pendingCarts = $state([]);

	async function clearCart(pos_id) {
		let current_pos_clear = pos_id;
		let response;
		response = await fetch(`${host}sales/sales-item/delete-by-pos/${current_pos_clear}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});

		getPendingCarts();
	}

	async function getPendingCarts() {
		try {
			if (token == '' || token === undefined) {
				token = getAccessToken();
			}
			pendingPointUrl = `${host}sales/sales/get-point-of-sales/`;
			pendingCarts = await fetchTable(pendingPointUrl, token);

			if (pendingCarts.succeed == true) {
				pendingCarts = pendingCarts.data;

				if (map_PoS_name == '') {
					current_PoS_name_search = [];
					current_PoS = { point_of_sale: pendingCarts[0]['id'] };
					current_PoS_name = pendingCarts[0]['name'];
					current_PoS_name_search.push(pendingCarts[0]['name']);
					current_PoS_landmark = pendingCarts[0]['landmark'];
					map_PoS = pendingCarts[0]['id'];
					map_PoS_name = pendingCarts[0]['name'];
					map_PoS_landmark = pendingCarts[0]['landmark'];
				}
			} else {
				throw new Error('No data');
			}
		} catch (error) {
			pendingCarts = [];
		}
	}
	onMount(() => {
		const url = get(page).url;
		const searchParams = url.searchParams;

		// 1. Extract all possible parameters
		const id = searchParams.get('id');
		const name = searchParams.get('name');
		const landmark = searchParams.get('landmark');
		const order = searchParams.get('order_id') || searchParams.get('order') || orderID;
		const territory = searchParams.get('territory');
		const route = searchParams.get('route');
		const routeSched = searchParams.get('routeschedule');
		console.log("Route Schedule ID = " + routeSched)

		// console.log('SR', id, name);

		// 2. Handle Role Subscription first so privileges are set
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
			if (hasPrivilege(userRoles['Sales'], 'D')) {
				formEndpoint = null;
				tabs = ['Sales History'];
			}
		});

		console.log("territory && route = " + territory + ' = ' + route)
		// 3. Logic for Redirected Filters (Territory/Route)
		if (territory && route) {
			fixedTerritory = territory;
			fixedRoute = route;
			routeSchedule = routeSched;
			activeCartTab = routeSched ? 'Cart Items' : 'Customer';
			showCustomer = routeSched ? false : true;
			activeTab = routeSched ? 'Cart' : 'Customer';
			console.log('salesStatus3' , salesStatus)
			console.log('order' , order)
			if(routeSchedule && typeof order != "undefined"){
				salesStatus = 'new';
				console.log('salesStatus2' , salesStatus)
			}
		}
		console.log("Route Schedule ID again = " + routeSchedule)

		// 4. Logic for Specific Customer/Order Redirection
		if (id && name) {
			if (order && order != 'undefined') {
				order_id = order; // Set global order state
				handleSalesFromVisit('order', order_id, id);
			}


			if (!order || order == 'undefined') {
				handleMarkerClicked({
					id: id,
					name: name ?? '',
					landmark: landmark ?? ''
				});
			}
		}

		// 5. Initial Data Fetch
		getPendingCarts();

		// 6. Return Cleanup Function
		return () => {
			if (unsubscribe) unsubscribe();
		};
	});
	$effect(() => {
		getPendingCarts();
	});

	async function createSales(order_id, pos_id, pos_name) {
		token = getAccessToken();

		const response = await fetch(
			`${host}sales/sales-item/create-sales-item-from-order/${order_id}`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			}
		);
	}

	async function handleSalesFromOrder(order, pos_id) {
		order_id_for_visit = order;
		if (await alreadyInCart(pos_id)) {
			proceedOpen2 = true;
			dialogRefProceed2.showModal();
		} else {
			await createSales(order, pos_id, '');

			await getPendingCarts();
			// updateCartSelection(pos_id, pos_name,landmark)
		}
		order_id = undefined;
		order_id_for_visit = undefined;
	}

	async function handleSalesFromVisit(salesStatusFromVisit, order_id, pos_id) {
		isOpen = false;
		dialogRef.close();
		console.log("salesStatusFromVisit", salesStatusFromVisit)
		salesStatus = salesStatusFromVisit;

		if (salesStatusFromVisit == 'order') {
			await handleSalesFromOrder(order_id, pos_id);
			// await showCart();
			// createSales(order_id, pos_id, '');
		} else if (salesStatusFromVisit == 'new') {
			await showCart();
		} else {
			await getPendingCarts();
			reloadMap = !reloadMap;
		}
	}
</script>

<dialog
	oncancel={() => {
		isOpen = false;
		dialogRef.close();
	}}
	bind:this={dialogRef}
	class="rounded-xl"
>
	{#if isOpen}
		<VisitOptions
			point_of_sale_id={map_PoS}
			route_schedule_id={routeSchedule}
			title="Visit Actions"
			bind:isOpen
			handleClose={async () => {
				isOpen = false;
				dialogRef.close();
			}}
			{visitType}
			handleSalesClicked={handleSalesFromVisit}
		/>
	{/if}
</dialog>

<dialog
	oncancel={() => {
		proceedOpen = false;
		dialogRefProceed.close();
	}}
	bind:this={dialogRefProceed}
	class="rounded-xl"
>
	{#if proceedOpen}
		<Proceed
			onCloseModal={() => {
				proceedOpen = false;
				dialogRefProceed.close();
				changeToCart();
				updateTable = !updateTable;
			}}
			onDelete={() => {
				proceedOpen = false;
				dialogRefProceed.close();
				clearCart(map_PoS);
				changeToCart();
				getPendingCarts();
				updateTable = !updateTable;
			}}
		/>
	{/if}
</dialog>

<dialog
	oncancel={() => {
		proceedOpen2 = false;
		dialogRefProceed2.close();
	}}
	bind:this={dialogRefProceed2}
	class="rounded-xl"
>
	{#if proceedOpen2}
		<Proceed
			onCloseModal={async () => {
				proceedOpen2 = false;
				dialogRefProceed2.close();
				await createSales(order_id_for_visit, map_PoS, map_PoS_name);
				await getPendingCarts();
				changeToCart();
				updateTable = !updateTable;
			}}
			onDelete={async () => {
				proceedOpen2 = false;
				dialogRefProceed2.close();
				await clearCart(map_PoS);
				await createSales(order_id_for_visit, map_PoS, map_PoS_name);
				await getPendingCarts();
				changeToCart();
				updateTable = !updateTable;
			}}
		/>
	{/if}
</dialog>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
	<!-- <div class="border-b border-gray-200 dark:border-[#00527c] m-4">
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => {
					activeType = 'Cash';
					approveActivated = !approveActivated;
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Cash'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Cash
			</button>

			<button
				type="button"
				onclick={() => {
					activeType = 'Credit';
					approveActivated = !approveActivated;
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Credit'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Credit
			</button>
		</div>
	</div> -->
	<div>
		{#key showCustomer}
			<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
				<div class="flex gap-2">
					{#each tabs as tab}
						{#if (tab === 'Customer' && showCustomer) || tab !== 'Customer'}
							<button
								type="button"
								onclick={() => {
									activeTab = tab;
									if (tab !== 'Customer') {
										showCustomer = false;
									}
								}}
								class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
            {activeTab === tab
									? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
									: 'bg-white'}"
							>
								{formatFieldNames(tab)}
							</button>
						{/if}
					{/each}
				</div>
			</div>
		{/key}

		{#if activeTab == 'Sales History'}
			<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => {
							activeType = 'Cash';
							approveActivated = !approveActivated;
							updateTable = !updateTable;
						}}
						class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Cash'
							? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
							: 'bg-white'}"
					>
						Cash
					</button>

					<button
						type="button"
						onclick={() => {
							activeType = 'Credit';
							approveActivated = !approveActivated;
							updateTable = !updateTable;
						}}
						class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Credit'
							? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
							: 'bg-white'}"
					>
						Credit
					</button>
				</div>
			</div>
			<!-- <Details
				isOpen={detailsOpen}
				title={'Transactions'}
				bind:data={transactions}
				{reload}
				handleClose={() => {
					detailsOpen = false;
				}}
			/>
			{#key approveActivated}
				<Table
					get_table_endpoint={tableEndpoint}
					get_export_endpoint={exportEndpoint}
					summerize_endpoint={summerizEndpoint}
					search_endpoint={searchEndpoint}
					get_table_endpoint_by_id={tableEndpointById}
					get_form_endpoint={formEndpoint}
					create_entry_url={formEndpoint ? null : undefined}
					update_entry_url={null}
					delete_entry_url={null}
					{token}
					{table_name}
					module="Sales"
					get_id_bool={true}
					row_clicked={rowClicked}
					add_callback={() => {
						activeTab = 'Customer';
						showCustomer = true;
					}}
					
					additional_param={{ sales_type: activeType }}
				/>
			{/key}
			{:else if activeTab == 'Customer'}
				<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
					<div class="flex gap-2">
						{#each itemsTabs as tab}
							<button
								type="button"
								onclick={() => {
									activeTabMap = tab;
								}}
								class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
				border border-b-0
				text-gray-700 hover:bg-gray-100
				dark:text-white dark:bg-[#002a47] dark:border-[#00527c] dark:hover:bg-[#003b5e]
				{activeTabMap === tab
									? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
									: 'bg-white'}"
							>
								{formatFieldNames(tab)}
							</button>
						{/each}
						{#if routeSchedule}
							<button
								type="button"
								onclick={() => {
									goto(`/${companyName}/warehouse-stop?routeschedule=${routeSchedule}`);
								}}
								class="flex gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
				border border-b-0
				text-gray-700 hover:bg-gray-100
				dark:text-white dark:bg-[#002a47] dark:border-[#00527c] dark:hover:bg-[#003b5e] bg-white"
							>
								<img src="/svgs/warehouse.svg" alt="Icon description" width="16" height="16" />
							</button>
						{/if}
					</div>
				</div>
			{#if activeTabMap == 'Map'}
				{#key reloadMap}
					<Map
						{fixedTerritory}
						{fixedRoute}
						{routeSchedule}
						{visitType}
						handleSalesClicked={async (status, order_id, pos_id) => {
							salesStatus = status;
							if (status == 'new' || status == 'order') await showCart();
							if (status == 'order') {
								createSales(order_id, pos_id, '');
							}
						}}
						on:handleMarkerClicked={(event) => {
							handleMarkerClicked(event.detail);
						}}
						on:updatePointOfSales={(event) => {
							point_of_sales = event.detail;
						}}
					/>
				{/key}
			{:else}
				<div class="flex flex-col items-center w-full">
					<div class="flex justify-center w-full overflow-y-auto mt-4">
						<table
							class="max-w-lg w-full divide-y divide-gray-200 dark:divide-gray-700
				text-sm text-left text-gray-700 dark:text-gray-300 m-4"
						>
							<thead
								class="bg-gray-200 dark:bg-[#326b92] text-xs text-gray-900 dark:text-gray-100 h-14"
							>
								<tr>
									<th scope="col" class="px-4 py-2">Point of Sale</th>
								</tr>
							</thead>

							<tbody>
								{#each point_of_sales as pos, i}
									<tr
										class={`bg-white dark:bg-[#22273c] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200`}
									>
										<td class="px-4 py-2 border-b border-primary-500 dark:border-gray-600">
											<div class="flex justify-between items-center h-14 gap-4">
												<div
													class="flex items-center gap-4 cursor-pointer"
													onclick={() => {
														handleSelect(pos.id, pos.name);
													}}
												>
													<div class="p-2 bg-[#e0effa] rounded-md">
														<svg
															fill="#286692"
															width="28px"
															height="28px"
															viewBox="0 0 20 20"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2 1.31 0 2.393-.764 2.552-1.75zM10 9c1.42 0 2.571-.896 2.571-2 0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875c-.002.041-.004.082-.004.125 0 1.104 1.151 2 2.571 2zm5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046zM18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9 17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5z"
															></path>
														</svg>
													</div>

													<div class="flex flex-col justify-center gap-y-1">
														<p class="text-md text-gray-900 dark:text-gray-100 font-bold">
															{pos.name}
														</p>
														<p class="text-sm text-gray-600 dark:text-gray-300">
															{pos.landmark}
														</p>
													</div>
												</div>

												<div
													class="flex items-center gap-2 cursor-pointer"
													onclick={() =>
														window.open(
															`http://maps.google.com/maps?z=12&t=m&q=loc:${pos.location[0]},${pos.location[1]}`
														)}
												>
													<svg
														fill="#758CA3"
														width="16px"
														height="16px"
														viewBox="0 0 32 32"
														xmlns="http://www.w3.org/2000/svg"
														stroke="#758CA3"
													>
														<path
															d="M16.114-0.011c-6.559 0-12.114 5.587-12.114 12.204 0 6.93 6.439 14.017 10.77 18.998 0.017 0.020 0.717 0.797 1.579 0.797h0.076c0.863 0 1.558-0.777 1.575-0.797 4.064-4.672 10-12.377 10-18.998 0-6.618-4.333-12.204-11.886-12.204zM16.515 29.849c-0.035 0.035-0.086 0.074-0.131 0.107-0.046-0.032-0.096-0.072-0.133-0.107l-0.523-0.602c-4.106-4.71-9.729-11.161-9.729-17.055 0-5.532 4.632-10.205 10.114-10.205 6.829 0 9.886 5.125 9.886 10.205 0 4.474-3.192 10.416-9.485 17.657zM16.035 6.044c-3.313 0-6 2.686-6 6s2.687 6 6 6 6-2.687 6-6-2.686-6-6-6zM16.035 16.044c-2.206 0-4.046-1.838-4.046-4.044s1.794-4 4-4c2.207 0 4 1.794 4 4 0.001 2.206-1.747 4.044-3.954 4.044z"
														></path>
													</svg>
													<span class="text-sm font-normal">View Location</span>
												</div>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if} -->

			<Details
				isOpen={detailsOpen}
				title={'Transactions'}
				bind:data={transactions}
				{reload}
				handleClose={() => {
					detailsOpen = false;
				}}
			/>
			{#key approveActivated}
				<Table
					get_table_endpoint={tableEndpoint}
					get_export_endpoint={exportEndpoint}
					summerize_endpoint={summerizEndpoint}
					search_endpoint={searchEndpoint}
					get_table_endpoint_by_id={tableEndpointById}
					filter_endpoint={filterEndpoint}
					get_form_endpoint={formEndpoint}
					create_entry_url={formEndpoint ? null : undefined}
					update_entry_url={null}
					delete_entry_url={null}
					{token}
					{table_name}
					module="Sales"
					get_id_bool={true}
					row_clicked={rowClicked}
					add_callback={() => {
						activeTab = 'Customer';
						showCustomer = true;
					}}
					additional_param={{ sales_type: activeType }}
				/>
			{/key}
		{:else if activeTab == 'Customer'}
			<Customer
				tabs={itemsTabs}
				bind:activeTab={activeTabMap}
				formatLabel={formatFieldNames}
				{routeSchedule}
				{companyName}
			/>

			{#if activeTabMap == 'Map'}
				{#key reloadMap}
					<Map
						{fixedTerritory}
						{fixedRoute}
						{routeSchedule}
						{visitType}
						handleSalesClicked={async (status, order_id, pos_id) => {
							salesStatus = status;
							if (status == 'new' || status == 'order') await showCart();
							if (status == 'order') {
								createSales(order_id, pos_id, '');
								hasorder = true;
							}
						}}
						on:handleMarkerClicked={(event) => {
							handleMarkerClicked(event.detail);
						}}
						on:updatePointOfSales={(event) => {
							point_of_sales = event.detail;
						}}
					/>
				{/key}
			{:else}
				<div class="flex flex-col items-center w-full">
					<div class="flex justify-center w-full overflow-y-auto mt-4">
						<table
							class="max-w-lg w-full divide-y divide-gray-200 dark:divide-gray-700
							text-sm text-left text-gray-700 dark:text-gray-300 m-4"
						>
							<thead
								class="bg-gray-200 dark:bg-[#326b92] text-xs text-gray-900 dark:text-gray-100 h-14"
							>
								<tr>
									<th scope="col" class="px-4 py-2">Point of Sale</th>
								</tr>
							</thead>

							<tbody>
								{#each point_of_sales as pos, i}
									<tr
										class={`bg-white dark:bg-[#22273c] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200`}
									>
										<td class="px-4 py-2 border-b border-primary-500 dark:border-gray-600">
											<div class="flex justify-between items-center h-14 gap-4">
												<div
													class="flex items-center gap-4 cursor-pointer"
													onclick={() => {
														handleSelect(pos.id, pos.name);
													}}
												>
													<div class="p-2 bg-[#e0effa] rounded-md">
														<svg
															fill="#286692"
															width="28px"
															height="28px"
															viewBox="0 0 20 20"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2 1.31 0 2.393-.764 2.552-1.75zM10 9c1.42 0 2.571-.896 2.571-2 0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875c-.002.041-.004.082-.004.125 0 1.104 1.151 2 2.571 2zm5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046zM18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9 17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5z"
															></path>
														</svg>
													</div>

													<div class="flex flex-col justify-center gap-y-1">
														<p class="text-md text-gray-900 dark:text-gray-100 font-bold">
															{pos.name}
														</p>
														<p class="text-sm text-gray-600 dark:text-gray-300">
															{pos.landmark}
														</p>
													</div>
												</div>

												<div
													class="flex items-center gap-2 cursor-pointer"
													onclick={() =>
														window.open(
															`http://maps.google.com/maps?z=12&t=m&q=loc:${pos.location[0]},${pos.location[1]}`
														)}
												>
													<svg
														fill="#758CA3"
														width="16px"
														height="16px"
														viewBox="0 0 32 32"
														xmlns="http://www.w3.org/2000/svg"
														stroke="#758CA3"
													>
														<path
															d="M16.114-0.011c-6.559 0-12.114 5.587-12.114 12.204 0 6.93 6.439 14.017 10.77 18.998 0.017 0.020 0.717 0.797 1.579 0.797h0.076c0.863 0 1.558-0.777 1.575-0.797 4.064-4.672 10-12.377 10-18.998 0-6.618-4.333-12.204-11.886-12.204zM16.515 29.849c-0.035 0.035-0.086 0.074-0.131 0.107-0.046-0.032-0.096-0.072-0.133-0.107l-0.523-0.602c-4.106-4.71-9.729-11.161-9.729-17.055 0-5.532 4.632-10.205 10.114-10.205 6.829 0 9.886 5.125 9.886 10.205 0 4.474-3.192 10.416-9.485 17.657zM16.035 6.044c-3.313 0-6 2.686-6 6s2.687 6 6 6 6-2.687 6-6-2.686-6-6-6zM16.035 16.044c-2.206 0-4.046-1.838-4.046-4.044s1.794-4 4-4c2.207 0 4 1.794 4 4 0.001 2.206-1.747 4.044-3.954 4.044z"
														></path>
													</svg>
													<span class="text-sm font-normal">View Location</span>
												</div>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{:else if activeTab == 'Orders'}
			<Orders
				changeToCartTab={() => {
					activeTab = 'Cart';
					activeCartTab = 'Cart Items';
				}}
				getPendingCarts={() => getPendingCarts()}
				updateCartSelection={(pos_id, pos_name, landmark) => {
					handleSelect(pos_id, pos_name, landmark, false);
				}}
				clearCart={(pos_to_clear) => {
					clearCart(pos_to_clear);
				}}
				alreadyInCart={(pos_id) => alreadyInCart(pos_id)}
			/>
		{:else}
			<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
				<div class="flex gap-2">
					{#each cartTabs as tab}
						{#key activeCartTab}
							<button
								type="button"
								onclick={() => {
									activeCartTab = tab;
								}}
								class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
            border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:border-[#00527c] dark:hover:bg-[#003b5e]
            {activeCartTab === tab
									? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
									: 'bg-white'}"
							>
								{formatFieldNames(tab)}
							</button>
						{/key}
					{/each}
				</div>
			</div>

			<div class="lg:flex ml-2 w-screen lg:w-full">
				<div class="mt-1 h-fit flex flex-row gap-2 lg:flex-col overflow-x-show">
					{#if activeCartTab == 'Cart Items'}
						{#if map_PoS_name !== ''}
							{#if current_PoS_name === map_PoS_name}
								<tr
									class="bg-white dark:bg-[#22273c] w-full px-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200 rounded-xl"
								>
									<td
										class="px-2 py-2 min-w-[10vw] whitespace-pre-wrap break-words rounded-lg border-none border-primary-500 dark:border-gray-600 cursor-pointer text-gray-900 dark:text-gray-200 font-bold"
										onclick={() => {
											handleSelect(map_PoS, map_PoS_name, map_PoS_landmark, false);
										}}
									>
										<div class="flex gap-2 justify-between">
											<div class="flex items-center justify-center gap-4">
												<div class="p-2 bg-[#e0effa] rounded-md">
													<svg
														fill="#286692"
														width="28px"
														height="28px"
														viewBox="0 0 20 20"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2 1.31 0 2.393-.764 2.552-1.75zM10 9c1.42 0 2.571-.896 2.571-2 0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875c-.002.041-.004.082-.004.125 0 1.104 1.151 2 2.571 2zm5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046zM18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9 17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5z"
														></path>
													</svg>
												</div>
												<div class="flex flex-col items-start justify-center">
													<p class="text-md text-gray-900 dark:text-gray-100 font-bold">
														{map_PoS_name}
													</p>
													<p class="font-normal text-sm text-gray-700 dark:text-gray-300">
														{map_PoS_landmark}
													</p>
												</div>
											</div>
										</div>
									</td>
								</tr>
							{:else}
								<tr
									class="bg-white dark:bg-[#22273c] w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200 rounded-xl"
								>
									<td
										class="px-2 py-2 min-w-[10vw] whitespace-pre-wrap break-words rounded-lg border-none border-primary-500 dark:border-gray-600 cursor-pointer text-gray-900 dark:text-gray-200"
										onclick={() => {
											handleSelect(map_PoS, map_PoS_name, map_PoS_landmark, false);
										}}
									>
										<div class="flex gap-2 justify-between">
											<div class="flex items-center justify-center gap-4">
												<div class="p-2 bg-[#e0effa] rounded-md">
													<svg
														fill="#286692"
														width="28px"
														height="28px"
														viewBox="0 0 20 20"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2 1.31 0 2.393-.764 2.552-1.75zM10 9c1.42 0 2.571-.896 2.571-2 0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875c-.002.041-.004.082-.004.125 0 1.104 1.151 2 2.571 2zm5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046zM18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9 17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5z"
														></path>
													</svg>
												</div>
												<div class="flex flex-col items-start justify-center">
													<p class="text-md text-gray-900 dark:text-gray-100 font-bold">
														{map_PoS_name}
													</p>
													<p class="font-normal text-sm text-gray-700 dark:text-gray-300">
														{map_PoS_landmark}
													</p>
												</div>
											</div>
										</div>
									</td>
								</tr>
							{/if}
						{/if}
						{#each pendingCarts as pending_pos, i}
							{#if pending_pos.name !== map_PoS_name}
								<tr
									class="bg-white dark:bg-[#22273c] w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200 rounded-xl"
								>
									{#if current_PoS_name == pending_pos.name}
										<td
											class="px-2 py-2 min-w-[10vw] whitespace-pre-wrap break-words rounded-lg border-none border-primary-500 dark:border-gray-600 cursor-pointer text-gray-900 dark:text-gray-200 font-bold"
											onclick={() => {
												handleSelect(pending_pos.id, pending_pos.name, pending_pos.landmark, false);
											}}
										>
											<div class="flex gap-2 justify-between">
												<div class="flex items-center justify-center gap-4">
													<div class="p-2 bg-[#e0effa] rounded-md">
														<svg
															fill="#286692"
															width="28px"
															height="28px"
															viewBox="0 0 20 20"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2 1.31 0 2.393-.764 2.552-1.75zM10 9c1.42 0 2.571-.896 2.571-2 0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875c-.002.041-.004.082-.004.125 0 1.104 1.151 2 2.571 2zm5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046zM18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9 17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5z"
															></path>
														</svg>
													</div>
													<div class="flex flex-col items-start justify-center">
														<p class="text-md text-gray-900 dark:text-gray-100 font-bold">
															{pending_pos.name}
														</p>
														<p class="font-normal text-sm text-gray-700 dark:text-gray-300">
															{pending_pos.landmark}
														</p>
													</div>
												</div>
											</div>
										</td>
									{:else}
										<td
											class="px-2 py-2 min-w-[10vw] whitespace-pre-wrap break-words rounded-lg border-none border-primary-500 dark:border-gray-600 cursor-pointer text-gray-900 dark:text-gray-200"
											onclick={() => {
												handleSelect(pending_pos.id, pending_pos.name, pending_pos.landmark, false);
											}}
										>
											<div class="flex gap-2 justify-between">
												<div class="flex items-center justify-center gap-4">
													<div class="p-2 bg-[#e0effa] rounded-md">
														<svg
															fill="#286692"
															width="28px"
															height="28px"
															viewBox="0 0 20 20"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2 1.31 0 2.393-.764 2.552-1.75zM10 9c1.42 0 2.571-.896 2.571-2 0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875c-.002.041-.004.082-.004.125 0 1.104 1.151 2 2.571 2zm5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046zM18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9 17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5z"
															></path>
														</svg>
													</div>
													<div class="flex flex-col items-start justify-center">
														<p class="text-sm text-gray-900 dark:text-gray-100">
															{pending_pos.name}
														</p>
														<p class="font-light text-sm text-gray-700 dark:text-gray-300">
															{pending_pos.landmark}
														</p>
													</div>
												</div>
											</div>
										</td>
									{/if}
								</tr>
							{/if}
						{/each}
					{/if}
				</div>

				<div class="w-full">
					{#if activeCartTab == 'Cart Items'}
						{#key updateTable}
							<Table
								get_table_endpoint={tableEndpointItems}
								search_endpoint={searchEndpointItems}
								get_table_endpoint_by_id={tableEndpointByIdItems}
								get_form_endpoint={formEndpointItems}
								create_entry_url={submitUrlItems}
								update_entry_url={updateUrlItems}
								delete_entry_url={deleteUrlItems}
								{token}
								table_name={table_name_items}
								module={'Cart'}
								get_id_bool={true}
								bind:form_override={current_PoS}
								bind:default_search_string={current_PoS_name_search}
								default_search_column={['outlet_name']}
								search_enabled={false}
							/>
						{/key}
					{:else}
						{#key current_PoS_name}
							<Checkout
								get_table_endpoint={tableEndpointItems}
								get_form_endpoint={formEndpointItems}
								discount_endpoint={`${discountEndpoint}${current_PoS.point_of_sale}`}
								bind:current_PoS={current_PoS_name}
								{submitUrl}
								complete={async (result) => {
									console.log('Result from checkout:', result, salesStatus);
									if (fixedTerritory == undefined && fixedRoute == undefined) {
										activeTab = 'Sales History';
										goto(`/${companyName}/finance/invoice?id=${result.id}`);
									} else {
										console.log('salesStatus = ', salesStatus)
										if (salesStatus == 'new') {
											await newSale();
										}
										if (salesStatus == 'order') {
											await orderSale();
										}
										activeTab = 'Customer';
										showCustomer = true;
										activeTabMap = 'List';
										await getPendingCarts();
										reloadMap = !reloadMap;
										goto(`/${companyName}/finance/invoice?id=${result.id}`);
									}
								}}
								{token}
							/>
						{/key}
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
