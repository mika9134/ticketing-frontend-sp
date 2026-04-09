<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { host } from '../../apis/config';
	import { fetchTable } from '../../apis/table';
	import VisitOptions from '$lib/modals/visitOptions.svelte';



	import OrderOptions from '$lib/modals/orderOptions.svelte';

	import { getAccessToken } from '../../stores/tokenStore';

	let {
		fixedTerritory = undefined,
		fixedRoute = undefined,
		fixedRouteName = undefined,
		routeSchedule = undefined,
		travelRouteSchedule = undefined,
		visitType = 'Planned Visit',
		handleSalesClicked,
		handleOrderClicked,
		refreshPointOfSales,
	} = $props();

	let token = '';

	let reloadMap = $state(true);

	let loading = $state(false);

	const dispatch = createEventDispatcher();
	let refreshForced = $state(refreshPointOfSales);
	let currentPOS = $state();
	let currentPOSName = $state();
	let currentPOSLandmark = $state();
	let currentRouteSchedule = $state(routeSchedule);
	let Map = $state();
	let TileLayer = $state();
	let Marker = $state();
	let DivIcon = $state();
	let Popup = $state();
	let Control = $state();
	let CircleMarker = $state();
	let Polyline = $state();
	let map = $state();
	let userLocationMarker = $state();
	let selectedTerritory = $state('');
	let selectedRoute = $state('');
	let route_locations = $state([]);
	let travel_log_locations = $state([]);

	$effect(() => {
		dispatch('selected', { territory: selectedTerritory, route: selectedRoute });
	});

	let selectedPosition = $state();
	let isOpen = $state(false);
	let dialogRef;

	selectedRoute = fixedRoute === undefined ? '' : fixedRoute;
	selectedTerritory = fixedTerritory === undefined ? '' : fixedTerritory;

	let userPosition = $state();
	let userNode = $state({ dis: Infinity, node: 0 });
	let followUser = $state(false);
	let centerLocation = $state([9.03, 38.74]);
	let locationGot = $state(false);
	let selectedRouteName = $state('');

	const territoryUrl = `${host}territory/get-my-territory`;
	const routeUrl = `${host}route/get-by-territory-id/`;
	const routingUrl = `${host}travel/get-route`;
	const travelLogUrl = `${host}travel/get-travel-routes`;

	let routePointUrl = $state('');

	if (travelRouteSchedule !== undefined)
		routePointUrl = `${host}route/get-point-of-sales-details/${travelRouteSchedule}`;
	else if (fixedTerritory !== undefined)
		routePointUrl = `${host}route/get-point-of-sales-visit/${routeSchedule}`;
	else routePointUrl = `${host}route/get-point-of-sales`;



	// Territory List
	let territories = $state([]);

	async function getTerritories() {
		if (token == null || token == '') {
			token = getAccessToken();
		}
		try {
			let territory = await fetchTable(territoryUrl, token);
			if (territory.succeed == true) {
				// selectedTerritory = territory.data.id;
				territories = territory.data;
			}
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}

	let routes = $state([]);

	async function getRoutesByTerritory(territoryId) {
		try {
			if (token == null || token == '') {
				token = getAccessToken();
			}

			routes = await fetchTable(`${routeUrl}${territoryId}`, token);

			if (routes.succeed == true) {
				routes = routes.data;

				for (let x = 0; x < routes.length; x++) {
					if (fixedRoute == routes[x].id) {
						selectedRouteName = routes[x].name;
						break;
					}
				}
			} else {
				throw new Error('No data');
			}
		} catch (error) {
			routes = [];
			locations = [];
			selectedRoute = '';
			console.error('Error fetching table data:', error);
		}
	}

	$effect(() => {
		if (selectedTerritory) {
			getRoutesByTerritory(selectedTerritory);
		}
	});

	let locations = $state([]);

	async function getTravelLocations() {
		try {
			loading = true;
			const response = await fetch(travelLogUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					route_schedule_id: travelRouteSchedule
				})
			});
			const data = await response.json();
			travel_log_locations = data.data;
		} catch (err) {
			console.error('Route fetch error:', err);
		} finally {
			loading = false;
		}
	}

	async function getRoutePoint(routeId) {
		let routePoints;
		try {
			if (token == null || token == '') {
				token = getAccessToken();
			}
			locations = [];
			// Fetch Route Points
			routePoints = await fetchTable(routePointUrl, token, 1, 10, '', '', routeId);

			if (routePoints.succeed == true) {
				let routePointsTotal = routePoints.data.paginationInfo.totalItems;

				routePoints = await fetchTable(routePointUrl, token, 1, routePointsTotal, '', '', routeId);

				routePoints = routePoints.data.items;
			} else {
				throw new Error('No point of sales part of this route');
			}
			for (const point of routePoints) {
				//  Push posId and location to locations
				locations = [
					...locations,
					{
						id: point.id,
						name: point.name,
						location: [point.latitude, point.longitude],
						landmark: point.landmark,
						node_distance: Infinity,
						node: ''
					}
				];
			}

			dispatch('updatePointOfSales', locations);

			locationGot = true;
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}

	$effect(() => {
		if (selectedRoute) {
			getRoutePoint(selectedRoute);
		}
	});

	$effect(() => {
		if (locationGot && map) {
			if (locations.length > 0) {
				centerLocation = locations[0].location;
				map.setView(locations[0].location, 46);
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
			DivIcon = module.DivIcon;
			CircleMarker = module.CircleMarker;
			Popup = module.Popup;
			Control = module.Control;
			Polyline = module.Polyline;

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

	function handleMarkerClicked(pos_id, pos_name, pos_landmark) {
		dispatch('handleMarkerClicked', { id: pos_id, name: pos_name, landmark: pos_landmark });
	}

	onMount(async () => {
		getTerritories();
		console.log("Ahhhh = " + routeSchedule)
		if (travelRouteSchedule !== undefined) {
			getTravelLocations();
		}
		await renderMap();
	});

	// Handle marker click event
</script>

<dialog
	on:cancel={() => {
		isOpen = false;
		dialogRef.close();
	}}
	bind:this={dialogRef}
	class="rounded-xl"
>
    {#if isOpen}
        {#if visitType === "Planned Order Visit" || visitType === "UnPlanned Order Visit"}
            <OrderOptions
                point_of_sale_id={currentPOS}
                point_of_sale_name={currentPOSName}
                route_schedule_id={currentRouteSchedule}
                title="Order Options"
                bind:isOpen
                handleClose={() => {
                    isOpen = false;
                    dialogRef.close();
                    reloadMap = !reloadMap;
                }}
                {visitType}
                handleOrderClicked={(status, order_id, currentPOS) => {
                    isOpen = false;
                    dialogRef.close();
                    // This triggers the handleMarkerClicked if needed locally
                    if (status === 'new') {
                        handleMarkerClicked(currentPOS, currentPOSName, currentPOSLandmark);
                    }
                    getRoutePoint(selectedRoute);
                    // This calls the redirection function we put in planned.svelte
                    handleOrderClicked(status, order_id, currentPOS);
                    reloadMap = !reloadMap;
                }}
            />
        {:else}
            <VisitOptions
                point_of_sale_id={currentPOS}
                point_of_sale_name={currentPOSName}
                route_schedule_id={currentRouteSchedule}
                title="Sales Options"
                bind:isOpen
                handleClose={() => {
                    isOpen = false;
                    dialogRef.close();
                    reloadMap = !reloadMap;
                }}
                {visitType}
                handleSalesClicked={(status, order_id, currentPOS) => {
					console.log("as 11111", status,"orderrr_id",order_id, currentPOS)
                    isOpen = false;
                    dialogRef.close();
                    if ( status === 'order') {
						console.log("IS THERE ANY DF")
						isOpen = true;
                    }


                    if (status === 'new' || status === 'order') {
						console.log("as expected", currentPOS)
                        handleMarkerClicked(currentPOS, currentPOSName);
                    }
                    getRoutePoint(selectedRoute);
                    handleSalesClicked(status, order_id, currentPOS, currentPOSName);
                    reloadMap = !reloadMap;
                }}
            />
        {/if} 
    {/if} 
</dialog>

{#if loading}
	<div class="loading-overlay flex gap-4">
		<!-- Your loading spinner or message here -->
		<p>Calculating Route</p>
		<span class="loading loading-spinner loading-xl"></span>
	</div>
{/if}

<div class="m-6">
	{#if fixedTerritory === undefined && fixedRoute === undefined}
		<h2 class="text-md font-semibold text-gray-900 dark:text-gray-200 mb-2">
			Select Point of Sale
		</h2>

		<div class="my-4 grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Route Filter -->
			<div
				class="bg-gray-200 dark:bg-[#002a47] p-2 text-gray-700 rounded-lg shadow-lg dark:shadow-lg dark:text-white"
			>
				<label for="route" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Territory</label
				>

				<select
					id="territory"
					bind:value={selectedTerritory}
					class="select w-full rounded-lg border bg-gray-100 dark:bg-[#002a47] border-gray-200 text-sm text-gray-800 dark:border-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-[#002a47] disabled:text-gray-900 dark:disabled:text-white"
				>
					<option disabled selected value="">Select Territory</option>
					{#each territories as territory}
						<option value={territory.id}>{territory.name}</option>
					{/each}
				</select>
			</div>
			<div
				class="bg-gray-200 dark:bg-[#002a47] p-2 text-gray-700 rounded-lg shadow-lg dark:shadow-lg dark:text-white"
			>
				<label for="route" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Route</label
				>
				<select
					id="route"
					bind:value={selectedRoute}
					class="select w-full rounded-lg border bg-gray-100 dark:bg-[#002a47] border-gray-200 text-sm text-gray-800 dark:border-gray-800 dark:text-white disabled:bg-gray-100 disabled:dark:bg-[#002a47] disabled:text-gray-800 disabled:dark:text-white"
				>
					<option disabled selected value="">Select Route</option>
					{#each routes as route}
						<option value={route.id}>{route.name}</option>
					{/each}
				</select>
			</div>
		</div>
	{:else}
		<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">{selectedRouteName}</h2>
		<h2 class="text-md text-gray-900 dark:text-gray-200 mb-2">Select Point of Sale</h2>
	{/if}
	<div class="relative z-0 w-full h-[70vh] bg-white dark:bg-[#002a47] shadow-md sm:rounded-lg">
		{#if Map && TileLayer && Marker}
			<!-- To enable and disable follow user -->

			{#key reloadMap}
				<Map
					bind:instance={map}
					options={{
						center: followUser ? userPosition : centerLocation, // Center on the user's location or the selected position
						zoom: 16,
						attributionControl: false
					}}
					class="w-full z-1"
				>
					<TileLayer class="z-1" url={'https://tile.openstreetmap.org/{z}/{x}/{y}.png'} />

					<Polyline
						latLngs={route_locations}
						options={{
							color: '#0080ff',
							weight: 2,
							opacity: 1.0,
							smoothFactor: 0
						}}
					></Polyline>

					{#if travelRouteSchedule !== undefined}

							<Polyline
								latLngs={travel_log_locations}
								options={{
									color: '#0080ff',
									weight: 2,
									opacity: 1.0,
									smoothFactor: 0
								}}
							></Polyline>
					{/if}

					{#each locations as position, index}
						<Marker latLng={position.location}>
							<!-- options={
							icon: new Icon.Default()
						} -->
							{#if travelRouteSchedule !== undefined}
								<DivIcon
									options={{
										className: 'marker-parent'
									}}
								>
									<div class="relative">
										<svg
											width="40px"
											height="40px"
											viewBox="0 0 16 16"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											></g><g id="SVGRepo_iconCarrier">
												<path
													fill-rule="evenodd"
													clip-rule="evenodd"
													d="M3.37892 10.2236L8 16L12.6211 10.2236C13.5137 9.10788 14 7.72154 14 6.29266V6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6V6.29266C2 7.72154 2.4863 9.10788 3.37892 10.2236ZM8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z"
													fill="#267bdc"
												></path>
											</g></svg
										>

										<span class="absolute top-2 left-[10px] marker-number text-[0.75rem] transform">
											{index + 1}
										</span>
									</div>
								</DivIcon>
							{/if}

							<Popup>
								<div class="flex gap-4 items-center">
									<p
										on:click={async () => {
											if (fixedRoute && fixedTerritory) {
												currentPOS = position.id;
												currentPOSName = position.name;
												currentPOSLandmark = position.landmark;
												isOpen = true;
												dialogRef?.showModal?.();
											} else {
												handleMarkerClicked?.(position.id, position.name, position.landmark);
											}
										}}
										class="mx-auto text-lg cursor-pointer hover:underline"
									>
										{position.name}
									</p>
									<!-- <div
										class="bg-[#286692] py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer"
										on:click={() =>
											window.open(
												`http://maps.google.com/maps?z=12&t=m&q=loc:${position.location[0]},${position.location[1]}`
											)}
									>
										<svg
											fill="#ffffff"
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
										<span class="text-sm font-normal text-white">View Location</span>
									</div> -->

									<!-- Route icon -->
								</div>
							</Popup>
						</Marker>
					{/each}

					<!-- Marker for user's current location -->
					{#if userPosition}
						<CircleMarker bind:instance={userLocationMarker} latLng={userPosition}>
							<Popup>My Location</Popup>
						</CircleMarker>
					{/if}

					<Control class="flex gap-4" options={{ position: 'bottomright' }}>
						{#if routeSchedule !== undefined}
							<svg
								class="cursor-pointer hover:scale-110 transition-transform"
								on:click={async () => {
									try {
										loading = true;
										const response = await fetch(routingUrl, {
											method: 'POST',
											headers: {
												'Content-Type': 'application/json',
												Authorization: `Bearer ${token}`
											},
											body: JSON.stringify({
												start_lat: userPosition[0],
												start_lon: userPosition[1],
												route_schedule_id: routeSchedule
											})
										});
										const data = await response.json();
										route_locations = data.data;
										map.setView(userPosition, 46);
									} catch (err) {
										console.error('Route fetch error:', err);
									} finally {
										loading = false;
									}
								}}
								fill="#0080ff"
								width="32"
								height="32"
								viewBox="0 0 512 512"
								xmlns="http://www.w3.org/2000/svg"
								stroke="#002a47"
							>
								<path
									d="M502.61 233.32L278.68 9.39c-12.52-12.52-32.83-12.52-45.36 0L9.39 233.32c-12.52 12.53-12.52 32.83 0 45.36l223.93 223.93c12.52 12.53 32.83 12.53 45.36 0l223.93-223.93c12.52-12.53 12.52-32.83 0-45.36zm-100.98 12.56l-84.21 77.73c-5.12 4.73-13.43 1.1-13.43-5.88V264h-96v64c0 4.42-3.58 8-8 8h-32c-4.42 0-8-3.58-8-8v-80c0-17.67 14.33-32 32-32h112v-53.73c0-6.97 8.3-10.61 13.43-5.88l84.21 77.73c3.43 3.17 3.43 8.59 0 11.76z"
								/>
							</svg>
						{/if}
						<button
							on:click={async () => {
								followUser = !followUser;
							}}
							class="text-l font-semibold text-gray-900 dark:text-gray-200 mb-2"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 20 20"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								fill="#0080ff"
								stroke="#0080ff"
								><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
									id="SVGRepo_tracerCarrier"
									stroke-linecap="round"
									stroke-linejoin="round"
								></g><g id="SVGRepo_iconCarrier">
									<title>current_location [#0080ff589]</title> <desc>Created with Sketch.</desc>
									<defs> </defs>
									<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
										<g
											id="Dribbble-Light-Preview"
											transform="translate(-420.000000, -5559.000000)"
											fill="#0080ff"
										>
											<g id="icons" transform="translate(56.000000, 160.000000)">
												<polygon
													id="current_location-[#0080ff589]"
													points="364 5408.27971 373.894 5408.98556 374.78 5419 384 5399"
												>
												</polygon>
											</g>
										</g>
									</g>
								</g></svg
							>
						</button>
					</Control>
				</Map>
			{/key}
		{/if}
	</div>
</div>

<style>
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999; /* Ensure it's on top */
		color: white;
		font-size: 1.5em;
	}

	.marker-parent {
		background-color: transparent !important;
		color: transparent !important;
	}

	.marker-number {
		width: 20px;
		height: 20px;
		background-color: #267bdc;
		color: white;
		font-size: 11px;
		font-weight: bold;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
