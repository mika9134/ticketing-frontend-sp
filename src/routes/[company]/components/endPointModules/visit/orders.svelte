<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { host } from '../../../../../apis/config';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import { companyStore, getCompanyName, companyName } from '../../../../../stores/companyStore.js';
	import { goto } from '$app/navigation';
	import Proceed from '$lib/modals/proceedModal.svelte';

	let { changeToCartTab, clearCart, alreadyInCart, getPendingCarts, updateCartSelection } =
		$props();

	let route_order_hierarchy = $state({});
	let token = getAccessToken();

	let activeStatus = $state('List');

	let tabs = ['List', 'Map'];
	let updateTable = $state(false);
	// let {
	// 	fixedTerritory = undefined,
	// 	fixedRoute = undefined,

	// } = $props();
	let Map = $state();
	let TileLayer = $state();
	let Marker = $state();
	let Popup = $state();
	let Control = $state();
	let CircleMarker = $state();
	let isOpen = $state(false);
	let map = $state();
	let userLocationMarker = $state();
	let userPosition = $state();
	let followUser = $state(false);
	let centerLocation = $state([9.03, 38.74]);
	let proceedOpen = $state(false);
	let locationGot = $state(false);

	let current_PoS = $state({});
	let current_PoS_name = $state('');
	let current_PoS_name_search = $state([]);
	let current_PoS_landmark = $state('');

	let map_PoS = $state({});
	let map_PoS_name = $state('');
	let map_PoS_landmark = $state('');
	let approveActivated = $state(false);
	let proceedStatus = $state(false);
	let dialogRefProceed;
	let current_order = $state({});
	let location_successful = $state(false);
	let locationBuffer = [];


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

			if (result.succeed) {
				route_order_hierarchy = result.data;
			}
		}
	}

	onMount(async () => {
		load();
		renderMap();
	});

	async function mergeOrDelete(order_id, pos_id, pos_name, lat, lon, landmark) {
		current_order = { order_id, pos_id, pos_name, lat, lon };
		if (await alreadyInCart(pos_id)) {
			proceedOpen = true;
			dialogRefProceed.showModal();
		} else {
			await createSales(current_order);
			updateTable = !updateTable;
			console.log(current_order);
			await getPendingCarts();
			updateCartSelection(pos_id, pos_name, landmark);
		}
	}

	
// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }


// 	async function sendLocations() {
// 		try {
// 			console.log(routeSchedule, 'here we go');
// 			console.log(locationBuffer, 'location buffer');

// 			if (!routeSchedule) {
// 				console.warn('No routeSchedule ID available, skipping send.');
// 				return;
// 			}

// 			const payload = {
// 				route_schedule_id: routeSchedule,
// 				points: locationBuffer
// 			};

// 			console.log('Sending to backend:', payload);

// 			const totaldistance = `${host}travel/log-current-location`;

// 			const response = await fetch(totaldistance, {
// 				method: 'POST',
// 				headers: {
// 					'Content-Type': 'application/json',
// 					Authorization: `Bearer ${token}`
// 				},
// 				body: JSON.stringify(payload)
// 			});

// 			if (!response.ok) {
// 				throw new Error(`Server responded with ${response.status}`);
// 			}

// 			console.log('Successfully sent locations');
// 			locationBuffer = []; // clear buffer after successful send
// 		} catch (err) {
// 			console.error('Failed to send locations:', err);
// 			locationBuffer = []; // clear buffer even on error
// 		}
// 	}
// 	// Function to collect geolocation (using your watchPosition logic)
// 	function collectGeolocation() {
// 		if (navigator.geolocation) {
// 			if (!routeSchedule) {
// 				console.warn('No routeSchedule ID available, skipping send.');
// 				return;
// 			}
// 			navigator.geolocation.getCurrentPosition(
// 				async (position) => {
// 					const latitude = parseFloat(position.coords.latitude);
// 					const longitude = parseFloat(position.coords.longitude);

// 					const coords = {
// 						latitude: latitude,
// 						longitude: longitude
// 					};

// 					console.log(' yessssss Collected from order visit:', coords);
// 					if (
// 						locationBuffer.length === 0 ||
// 						locationBuffer[locationBuffer.length - 1].latitude !== coords.latitude ||
// 						locationBuffer[locationBuffer.length - 1].longitude !== coords.longitude
// 					) {
// 						locationBuffer.push(coords);
// 						console.log('new value', coords);
// 					}

// 					console.log('the lenght==', locationBuffer.length);
// 					if (locationBuffer.length >= 5) {
// 						console.log('greater than 5');
// 						sendLocations();
// 					}

// 					scheduleNext();
// 				},
// 				(error) => {
// 					console.error('Error getting geolocation', error);
// 					scheduleNext();
// 				},
// 				{
// 					enableHighAccuracy: true,
// 					timeout: 30000,
// 					maximumAge: 0
// 				}
// 			);
// 		} else {
// 			console.log('Geolocation is not supported by this browser.');
// 			scheduleNext();
// 		}
// 	}

// function scheduleNext() {
// 	setTimeout(collectGeolocation, 30000);
// }
// collectGeolocation();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function createSales(order_data) {
  try {
    const token = getAccessToken();
    let location_successful = false;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = parseFloat(position.coords.latitude);
        const longitude = parseFloat(position.coords.longitude);
        location_successful = true;

        await fetch(
          `${host}sales/sales-item/create-sales-item-from-order/${order_data.order_id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              latitude: latitude,   
              longitude: longitude, 
              route_schedule_id: ''
            })
          }
        );

        load();
        changeToCartTab();
      },
      (error) => {
        console.error('Error getting location:', error.code, error.message);
        createSales(order_data);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    while (!location_successful) {
      await sleep(100);
    }
  } catch (error) {
    console.error('Start error:', error.message);
  }
}

	$effect((route_order_hierarchy) => {
		if (route_order_hierarchy && map) {
			let routes = Object.keys(route_order_hierarchy);

			if (routes.length > 0) {
				let p = route_order_hierarchy[routes[0]];
				centerLocation = [p[0].latitude, p[0].longitude];
				map.setView(centerLocation, 46);
			}
		}
	});

	$effect(() => {
		if (followUser && map) {
			if (followUser) {
				map.setView(userPosition, 46);
			} else {
				map.setView(centerLocation, 46);
			}
		}
	});

	async function renderMap() {
		if (typeof window !== 'undefined') {
			const module = await import('sveaflet');
			Map = module.Map;
			TileLayer = module.TileLayer;
			Marker = module.Marker;
			CircleMarker = module.CircleMarker;
			Popup = module.Popup;
			Control = module.Control;

			// Get user's current location
			if (navigator.geolocation) {
				navigator.geolocation.watchPosition(
					(position) => {
						userPosition = [position.coords.latitude, position.coords.longitude];
						if (map && userLocationMarker && followUser) {
							// Move the marker to the user's position and update marker when user location update
							userLocationMarker.setLatLng(userPosition);
						}
					},
					(error) => {
						console.error('Error getting geolocation', error);
					},
					{
						enableHighAccuracy: true,
						timeout: 20000,
						maximumAge: 0
					}
				);
			} else {
				console.log('Geolocation is not supported by this browser.');
			}
		}
	}
</script>

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
			onCloseModal={async () => {
				proceedOpen = false;
				dialogRefProceed.close();
				await createSales(current_order);
				await getPendingCarts();
				await changeToCartTab();
				updateTable = !updateTable;
			}}
			onDelete={async () => {
				console.log(
					"in deleteeeee"
				)
				proceedOpen = false;
				dialogRefProceed.close();
				await clearCart(current_order.pos_id);
				await createSales(current_order);
				await getPendingCarts();
				await changeToCartTab();
				updateTable = !updateTable;
			}}
		/>
	{/if}
</dialog>

<div class="flex gap-2 m-4">
	{#each tabs as tab}
		<button
			type="button"
			onclick={() => {
				activeStatus = tab;
			}}
			class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
					border border-b-0
					text-gray-700 border-gray-200 hover:bg-gray-100
					dark:text-white dark:bg-[#002a47] dark:border-[#00527c] dark:hover:bg-[#c0c0c0]
				{activeStatus === tab
				? 'text-[#3393ce] border-[#3393ce] bg-gray-200 dark:bg-[#003b5e] dark:text-[#3393ce] dark:border-[#c0c0c0]'
				: 'bg-white'}"
		>
			{tab}
		</button>
	{/each}
</div>

{#if activeStatus == 'Map'}
	<div class="h-dvh z-0">
		<div class="p-6">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">Orders</h2>
			<h2 class="text-md text-gray-900 dark:text-gray-200 mb-2">Select Point of Sale</h2>
		</div>
		<div class="relative z-0 w-full h-[70vh] bg-white dark:bg-[#002a47] shadow-md sm:rounded-lg">
			<Map
				bind:instance={map}
				options={{
					center: followUser ? userPosition : centerLocation, // Center on the user's location or the selected position
					zoom: 16
				}}
				style="z-index:0;"
			>
				<TileLayer style="z-index: 0;" url={'https://tile.openstreetmap.org/{z}/{x}/{y}.png'} />

				{#if Object.keys(route_order_hierarchy).length > 0}
					{#each Object.keys(route_order_hierarchy) as route_name}
						{#each route_order_hierarchy[route_name] as pos}
							<Marker latLng={[pos.latitude, pos.longitude]}>
								<Popup onclick={() => {}}>
									{pos.name}
								</Popup>
							</Marker>
						{/each}
					{/each}
				{/if}

				<!-- Marker for user's current location -->
				{#if userPosition}
					<CircleMarker bind:instance={userLocationMarker} latLng={userPosition}>
						<Popup>My Location</Popup>
					</CircleMarker>
				{/if}

				<Control options={{ position: 'bottomright' }}>
					<button
						onclick={() => {
							followUser = !followUser;
						}}
						class="text-l font-semibold text-gray-900 dark:text-gray-200 mb-2"
					>
						<img src="/images/icons/followme.png" class="w-10 h-10" />
					</button>
				</Control>
			</Map>
		</div>
	</div>
{:else}
	<div class="m-4">
		<ul
			class="text-gray-600 dark:text-gray-100  rounded-box w-full">
			<li class="bg-transparent rounded-lg w-full pr-8">
				{#if Object.keys(route_order_hierarchy).length > 0}
					{#each Object.keys(route_order_hierarchy) as route_name}
						<div class="bg-white cursor-pointer dark:bg-[#002a47] rounded-lg mb-4 w-full">
							<details closed class="bg-transparent rounded-lg w-full">
								<summary class="text-md font-bold p-6">
									{route_name}
								</summary>

								<ul class="bg-transparent rounded-lg w-full py-4">
									{#each route_order_hierarchy[route_name] as pos}
										<li class="w-full p-2 dark:bg-[#002a47]">
											<div class="flex gap-2 mx-4 bg-gray-100 dark:bg-[#002a47] justify-center outline outline-2 outline-black/10 dark:outline-white/10 rounded-lg">
												<div class="flex gap-4 w-full p-2 bg-gray-100 dark:bg-[#002a47]">
													<div class="self-center dark:bg-[#002a47] p-2 rounded-lg">
														<img src="/svgs/order.svg" width="24" height="24" alt="order" />
													</div>
													<div>
														<p class="text-sm font-bold">{pos.name}</p>
														<p class="text-md text-green-500 italic">New Order</p>
														<p class="text-md italic">{pos.expected_date}</p>
													</div>
												</div>
												<button
													class="px-4 py-2 text-sm font-medium text-white bg-gray-200 dark:bg-[#002a47] rounded-lg active:bg-gray-300"
													onclick={() =>
														mergeOrDelete(
															pos.id,
															pos.pos_id,
															pos.name,
															pos.latitude,
															pos.longitude,
															pos.landmark
														)}
													aria-label='mergeOrDelete'
												>
													<img src="/svgs/products.svg" alt="products.svg" width="24" height="24" />
												</button>
											</div>
										</li>
									{/each}
								</ul>
							</details>
						</div>
					{/each}
				{:else}
					<p class="text-sm font-bold">No orders</p>
				{/if}
			</li>
		</ul>
	</div>
{/if}
