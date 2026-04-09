<script>
    import { onMount } from 'svelte';
    import { getAccessToken } from '../../../../../stores/tokenStore';
    import { host } from '../../../../../apis/config';
    import Table from '../../tables/table.svelte';
    import { fetchTable } from '../../../../../apis/table';
    import { fetchForm } from '../../../../../apis/form.js';
    import { formatFieldNames } from '$lib/utils.js';
    import Checkout from '../orderForm/orderForm.svelte';
    import Map from '$lib/map/map.svelte';
    import Details from '$lib/modals/orderdetails.svelte';
    import Header from '../../header/header.svelte';
    import Proceed from '$lib/modals/proceedModal.svelte';
    import { getCompanyName } from '../../../../../stores/companyStore';
    import { roles } from '../../../../../stores/roleStore';
    import { hasPrivilege } from '$lib/role';
    import OrderOptions from '$lib/modals/orderOptions.svelte';
    import { get } from 'svelte/store';
    import { page } from '$app/stores';
    import { goto, beforeNavigate } from '$app/navigation'; 


    let proceedOpen = $state(false);
    let dialogRefProceed;

    let visitOpen = $state(false);
    let dialogRefVisit;

    const tableEndpointItems = `${host}orders/orders-item/get-orders-item`;
    const tableEndpointByIdItems = `${host}orders/orders-item/get-orders-item/`;
    const searchEndpointItems = `${host}orders/orders-item/search`;
    const formEndpointItems = `${host}orders/orders-item/orders-item-form`;
    const submitUrlItems = `${host}orders/orders-item/create-orders-item`;
    const updateUrlItems = `${host}orders/orders-item/update-orders-item`;
    const deleteUrlItems = `${host}orders/orders-item/delete-orders-item`;
    const discountEndpoint = `${host}sales/sales/get-discount-rate/`;
    const filterEndpoint = `${host}orders/orders/all-filters`;
    const table_name_items = 'Cart Items';
    const itemsTabs = ['Map', 'List'];
    let company_name = $state('');
    let userRoles = $state({});
    let current_PoS = $state({});
    let activeTabMap = $state('Map');
    let point_of_sales = $state([]);
    let current_PoS_name = $state('');
    let current_PoS_name_search = $state([]);
    let current_PoS_landmark = $state('');
    let token = getAccessToken();


    let order_status_state = $state('');

    let map_PoS = $state({});
    let map_PoS_name = $state('');
    let map_PoS_landmark = $state('');

    let cartTabs = ['Cart Items', 'Checkout'];
    let currentRow = $state('');
    let activeCartTab = $state('Cart Items');


    beforeNavigate(({ cancel }) => {
        if (my_routeschedule && activeCartTab === 'Cart Items') {
            const proceed = confirm("If you change the page, the data will be lost. Accept or decline?");
            if (!proceed) {
                cancel(); 
            }
        }
    });



    $effect((activeTab) => {
        if (activeTab == 'Orders') {
            activeCartTab = 'Cart Items';
        }
    });

    let my_id = $state(''); 
    let my_route = $state(''); 
    let my_territory= $state(''); 
    let my_routeschedule = $state(''); 

    //Sales History
    const tableEndpoint = `${host}orders/orders/get-orders`;
    const exportEndpoint = `${host}orders/orders/export-orders`;
    const tableEndpointById = `${host}orders/orders/get-orders/`;
    const detailsEndpointById = `${host}orders/orders/get-transactions-orders/`;
    const searchEndpoint = `${host}orders/orders/search`;
    const formEndpoint = `${host}orders/orders/sales-form`;
    const submitUrl = `${host}orders/orders/create-orders`;
    const updateUrl = `${host}orders/orders/update-orders`;
    const deleteUrl = `${host}orders/orders/delete-orders`;
    const voidUrl = `${host}orders/orders/void-orders`;
    const summerizEndpoint = `${host}orders/orders/orders-summary/`;

    const table_name = 'Orders';
    const tabs = ['Orders', 'Cart'];
    let activeTab = $state('Orders');
    let detailsOpen = $state(false);
    let transactions = {};
    let showCustomer = $state(false);

    let locationBuffer = [];


    let {
        startTab = 'Orders',
        fixedTerritory = undefined,
        fixedRoute = undefined,
        routeSchedule = undefined,
        visitType = 'Planned Order Visit',
        onToggleSidebar
    } = $props();



    onMount(async () => {
        company_name = getCompanyName();
        const unsubscribe = roles.subscribe((value) => {
            userRoles = value;
        });

        const url = get(page).url;
        const id = url.searchParams.get('id');
        const name = url.searchParams.get('name');
        const landmark = url.searchParams.get('landmark');

        const territory_id = url.searchParams.get('territory_id');
        const route_id = url.searchParams.get('route_id');
        const routeSchedule = url.searchParams.get('routeSchedule')
        console.log('order page mounted, query params:', { id, name, landmark });

        if (id || territory_id || routeSchedule) {
            my_id = id
            my_territory= territory_id
            my_route= route_id
            my_routeschedule = routeSchedule

            handleMarkerClicked({
                id: id,
                name: name ?? '',
                landmark: landmark ?? ''
            });

            // history.replaceState({}, '', get(page).url.pathname);
        }

        return () => {
            unsubscribe();
        };
    });


    async function reload() {
        try {
            const data = await fetchTable(detailsEndpointById + currentRow.id, token);

            if (data.succeed === true) {
                transactions = data.data;
                detailsOpen = true;
            }
        } catch (error) {
            console.log(error);
        }
    }

    function changeToCart() {
        activeTab = 'Cart';
        activeCartTab = 'Cart Items'
        showCustomer = false;
    }

    async function clearCart() {
        let response;
        // if (visitType == 'Planned Visit') {
        response = await fetch(`${host}orders/orders-item/delete-by-pos/${map_PoS}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
    }

    async function showCart(check = true) {

        await getPendingCarts();
        if ((await alreadyInCart(map_PoS)) && check) {
            proceedOpen = true;
            dialogRefProceed.showModal();
        } else {
            changeToCart();
        }

    }

    function handleMarkerClicked(body) {
        current_PoS = { point_of_sale: body['id'] };
        current_PoS_name_search = [];

        current_PoS_name = body['name'];

        current_PoS_name_search.push(body['name']);

        current_PoS_landmark = body['landmark'];
        let map_PoS_json = JSON.parse(JSON.stringify(body));
        map_PoS = map_PoS_json['id'];
        map_PoS_name = map_PoS_json['name'];
        map_PoS_landmark = map_PoS_json['landmark'];

        showCart();
    }

    export function handleSelect(id, name, landmark, check = true) {
        current_PoS = { point_of_sale: id };
        current_PoS_name_search = [];

        current_PoS_name = name;

        current_PoS_name_search.push(name);

        current_PoS_landmark = landmark;

        map_PoS = id;
        map_PoS_name = name;
        map_PoS_landmark = landmark;

        showCart(check);
    }

    async function alreadyInCart(pos_id) {
        let result = false;

        pendingCarts.forEach((pos) => {
            if (pos.id == pos_id) {
                result = true;
            }
        });

        return result;
    }

        async function sendLocations() {
        try {

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

                    // console.log(' yessssss Collected:', coords);
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


    async function rowClicked(row) {
        try {
            const data = await fetchTable(detailsEndpointById + row.id, token);
            transactions = data.data;
            detailsOpen = true;
        } catch (error) {
            console.log(error);
        }
    }

    let sidebarToggle = true;

    // Function to toggle sidebar visibility
    const toggleSidebar = () => {
        sidebarToggle = !sidebarToggle;
        onToggleSidebar();
    };

    let pendingCarts = $state([]);
    const pendingPointUrl = `${host}orders/orders/get-point-of-sales/`;

    async function getPendingCarts(form_submit_data) {
        console.log("hereeee",form_submit_data )
        try {
            if (token == '' || token === undefined) {
                token = getAccessToken();
            }
            pendingCarts = await fetchTable(pendingPointUrl, token);
            if (pendingCarts.succeed == true) {
                pendingCarts = pendingCarts.data;

                if (map_PoS_name == '' && pendingCarts.length > 0) {
                    current_PoS = { point_of_sale: pendingCarts[0]['id'] };
                    current_PoS_name_search = [];
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
            //console.error('Error fetching table data:', error);
        }
    }

    $effect(() => {
        getPendingCarts();
    });

    let searchQuery = $state('');

    // Filter point of sales by search query (case-insensitive)
    let filteredPoS = $derived(
        point_of_sales.filter((pos) => pos.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    async function handleOrderFromVisit(order_status, order_id, pos_id) {
        visitOpen = false;
        dialogRefVisit.close();
        order_status_state = order_status;
        
        if (order_status == 'new') {
            console.log("am calling order from visit to open cart")
            await showCart();
        } else {
            await getPendingCarts();
            reloadMap = !reloadMap;
        }
    }
</script>

<dialog
    oncancel={() => {
        visitOpen = false;
        dialogRefVisit.close();
    }}
    bind:this={dialogRefVisit}
    class="rounded-xl"
>
    {#if visitOpen}
        <OrderOptions
            point_of_sale_id={map_PoS}
            route_schedule_id={routeSchedule}
            title="Visit Actions"
            handleClose={async () => {
                visitOpen = false;
                dialogRefVisit.close();
            }}
            {visitType}
            handleOrderClicked={handleOrderFromVisit}
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
            }}
            onDelete={() => {
                proceedOpen = false;
                dialogRefProceed.close();
                clearCart();
                changeToCart();
            }}
        />
    {/if}
</dialog>

<div>
    <Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
    <div class="mt-4">
        {#if hasPrivilege(userRoles['Order'], 'U')}
            <div class="border-b border-gray-200 dark:border-[#00527c] m-4">
                <div class="flex gap-2">
                    {#each tabs as tab}
                        <button
                            type="button"
                            onclick={() => (activeTab = tab)}
                            class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                border border-b-0
                text-gray-700 border-gray-200 hover:bg-gray-100
                dark:text-white dark:bg-[#002a47] dark:border-[#00527c] dark:hover:bg-[#003b5e]
                {activeTab === tab
                                ? 'text-[#3393ce] border-[#3393ce] bg-gray-200 dark:bg-[#003b5e] dark:text-[#3393ce] dark:border-[#3393ce]'
                                : 'bg-white'}"
                        >
                            {formatFieldNames(tab)}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        {#if activeTab == 'Orders'}
            <Details
                isOpen={detailsOpen}
                title={'Transactions'}
                bind:data={transactions}
                {reload}
                handleClose={() => {
                    detailsOpen = false;
                }}
            />
            {#key detailsOpen}
                <Table
                    get_table_endpoint={tableEndpoint}
                    get_export_endpoint={exportEndpoint}
                    summerize_endpoint={summerizEndpoint}

                    search_endpoint={searchEndpoint}
                    get_table_endpoint_by_id={tableEndpointById}
                    filter_endpoint={filterEndpoint}
                    get_form_endpoint={formEndpoint}
                    create_entry_url={null}
                    update_entry_url={null}
                    delete_entry_url={null}
                    {token}
                    {table_name}
                    module="Order"
                    get_id_bool={true}
                    row_clicked={rowClicked}
                    add_callback={() => {
                        activeTab = 'Customer';
                        showCustomer = true;
                    }}
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
                </div>
            </div>
            {#if activeTabMap == 'Map'}
                <Map
                    {fixedTerritory}
                    {fixedRoute}
                    {routeSchedule}
                    {visitType}
                    handleOrderClicked={async (status, order_id, pos_id) => {
                        order_status_state = status;
                        if (status == 'new') await showCart();
                    }}
                    on:handleMarkerClicked={(event) => {
                        handleMarkerClicked(event.detail);
                    }}
                    on:updatePointOfSales={(event) => {
                        point_of_sales = event.detail;
                    }}
                />
            {:else}
                <div class="flex flex-col items-center w-full">
                    <div class="w-full max-w-lg mt-4">
                        <input
                            type="text"
                            placeholder="Search Point of Sale..."
                            bind:value={searchQuery}
                            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-[#1f2937] text-gray-900 dark:text-gray-100
                   placeholder-gray-400 focus:outline-none focus:ring-2
                   focus:ring-[#2371ac] transition duration-150"
                        />
                    </div>

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
                                {#if filteredPoS.length > 0}
                                    {#each filteredPoS as pos}
                                        <tr
                                            class={`bg-white dark:bg-[#22273c] hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200 ${
                                                current_PoS_name === pos.name ? 'font-bold dark:text-primary-400' : ''
                                            }`}
                                        >
                                            <td class="px-4 py-2 border-b border-primary-500 dark:border-gray-600">
                                                <div class="flex justify-between items-center h-14 gap-4">
                                                    <div
                                                        class="flex items-center gap-4 cursor-pointer"
                                                        onclick={() => handleSelect(pos.id, pos.name)}
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
                                                            <p class="text-md text-gray-900 dark:text-gray-100">{pos.name}</p>
                                                            <p class="text-sm text-gray-600 dark:text-gray-300">{pos.landmark}</p>
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
                                {:else}
                                    <tr>
                                        <td class="text-center py-4 text-gray-500 dark:text-gray-400">
                                            No Point of Sale found.
                                        </td>
                                    </tr>
                                {/if}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
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
                <div class="mt-1 h-fit flex flex-row gap-2 lg:flex-col overflow-x-scroll">
                    {#if activeCartTab == 'Cart Items'}
                        {#if map_PoS_name !== ''}
                            {#if current_PoS_name === map_PoS_name}
                                <tr
                                    class="bg-white dark:bg-[#22273c] w-fit hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200 rounded-xl"
                                >
                                    <td
                                        class="px-4 py-4 min-w-[10vw] whitespace-pre-wrap break-words rounded-lg border border-primary-500 dark:border-gray-600 hover:underline text-gray-900 dark:text-gray-200 font-bold"
                                        onclick={() => {
                                            handleSelect(map_PoS, map_PoS_name, map_PoS_landmark, false);
                                        }}
                                    >
                                        <div class="flex gap-2 justify-between">
                                            <div class="flex gap-4">
                                                <svg
                                                    fill="#758CA3"
                                                    width="16px"
                                                    height="16px"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    stroke="#758CA3"
                                                >
                                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                                    <g id="SVGRepo_iconCarrier">
                                                        <path d="M21.026,6.105a3.1,3.1,0,0,1-2.365,3.848A3.031,3.031,0,0,1,15.1,7.222l-.042-.5A3.03,3.03,0,0,1,12.041,10h-.082A3.03,3.03,0,0,1,8.94,6.719l-.031.375a3.121,3.121,0,0,1-2.83,2.9A3.03,3.03,0,0,1,2.941,6.236l.87-3.479A1,1,0,0,1,4.781,2H19.219a1,1,0,0,1,.97.757ZM18.121,12A5.021,5.021,0,0,0,20,11.631V21a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V11.631a4.914,4.914,0,0,0,4.907-.683A5.131,5.131,0,0,0,12.042,12a5.027,5.027,0,0,0,3.051-1.052A4.977,4.977,0,0,0,18.121,12ZM14,17a2,2,0,0,0-4,0v3h4Z"></path>
                                                    </g>
                                                </svg>
                                                <div>
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
                                    class="bg-white dark:bg-[#22273c] w-fit hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200 rounded-xl"
                                >
                                    <td
                                        class="px-4 py-4 min-w-[10vw] whitespace-pre-wrap break-words rounded-lg border border-primary-500 dark:border-gray-600 hover:underline text-gray-900 dark:text-gray-200"
                                        onclick={() => {
                                            handleSelect(map_PoS, map_PoS_name, map_PoS_landmark, false);
                                        }}
                                    >
                                        <div class="flex gap-2 justify-between">
                                            <div class="flex gap-4">
                                                <svg
                                                    fill="#758CA3"
                                                    width="16px"
                                                    height="16px"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    stroke="#758CA3"
                                                >
                                                    <path d="M21.026,6.105a3.1,3.1,0,0,1-2.365,3.848A3.031,3.031,0,0,1,15.1,7.222l-.042-.5A3.03,3.03,0,0,1,12.041,10h-.082A3.03,3.03,0,0,1,8.94,6.719l-.031.375a3.121,3.121,0,0,1-2.83,2.9A3.03,3.03,0,0,1,2.941,6.236l.87-3.479A1,1,0,0,1,4.781,2H19.219a1,1,0,0,1,.97.757ZM18.121,12A5.021,5.021,0,0,0,20,11.631V21a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V11.631a4.914,4.914,0,0,0,4.907-.683A5.131,5.131,0,0,0,12.042,12a5.027,5.027,0,0,0,3.051-1.052A4.977,4.977,0,0,0,18.121,12ZM14,17a2,2,0,0,0-4,0v3h4Z"></path>
                                                </svg>
                                                <div>
                                                    <p class="text-md text-gray-900 dark:text-gray-100">
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

                        {#each pendingCarts as pos}
                            {#if pos.id !== map_PoS}
                                <tr class="bg-white dark:bg-[#22273c] w-fit hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200 rounded-xl">
                                    <td class="px-4 py-4 min-w-[10vw] whitespace-pre-wrap break-words rounded-lg border border-primary-500 dark:border-gray-600 hover:underline text-gray-900 dark:text-gray-200" onclick={() => handleSelect(pos.id, pos.name, pos.landmark, false)}>
                                        <div class="flex gap-2 justify-between">
                                            <div class="flex gap-4">
                                                <svg fill="#758CA3" width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#758CA3">
                                                    <path d="M21.026,6.105a3.1,3.1,0,0,1-2.365,3.848A3.031,3.031,0,0,1,15.1,7.222l-.042-.5A3.03,3.03,0,0,1,12.041,10h-.082A3.03,3.03,0,0,1,8.94,6.719l-.031.375a3.121,3.121,0,0,1-2.83,2.9A3.03,3.03,0,0,1,2.941,6.236l.87-3.479A1,1,0,0,1,4.781,2H19.219a1,1,0,0,1,.97.757ZM18.121,12A5.021,5.021,0,0,0,20,11.631V21a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V11.631a4.914,4.914,0,0,0,4.907-.683A5.131,5.131,0,0,0,12.042,12a5.027,5.027,0,0,0,3.051-1.052A4.977,4.977,0,0,0,18.121,12ZM14,17a2,2,0,0,0-4,0v3h4Z"></path>
                                                </svg>
                                                <div>
                                                    <p class="text-md text-gray-900 dark:text-gray-100">{pos.name}</p>
                                                    <p class="font-normal text-sm text-gray-700 dark:text-gray-300">{pos.landmark}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            {/if}
                        {/each}
                    {/if}
                </div>

                <div class="w-full">
                    {#if activeCartTab == 'Cart Items'}
                        {#key current_PoS}
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
                                default_search_column={['outlet_name']}
                                bind:default_search_string={current_PoS_name_search}
                                search_enabled={false}
                                after_submit_callback={getPendingCarts}
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
								complete={async () => {
                                    
									activeTab = 'Orders';
									if (my_id != null) { 
										const companyName = getCompanyName();

										navigator.geolocation.getCurrentPosition(
											async (position) => {
												const latitude = position.coords.latitude;
												const longitude = position.coords.longitude;

												console.log("Sending order visit with geolocation:", {
													route_schedule_id: my_routeschedule,
													id: map_PoS,
													latitude,
													longitude
												});

												try {
													const response = await fetch(
														`${host}planned/order/planned-order-visit/new-order`,
														{
															method: 'POST',
															headers: {
																Authorization: `Bearer ${token}`,
																'Content-Type': 'application/json'
															},
															body: JSON.stringify({
																route_schedule_id: my_routeschedule,
																id: map_PoS, 
																latitude: latitude,
																longitude: longitude 
															})
														}
													);

													if (response.ok) {
														console.log("in okayyyyy")
												

														const query = new URLSearchParams({
															id: my_id,
															territory_id: my_territory,
															route_id: my_route,
															routeSchedule: my_routeschedule
														}).toString();

														console.log("Navigation query:", query);                      
                                                        if(routeSchedule!== null){
                                                            console.log("why are u here ",routeSchedule)
													        	goto(`/${companyName}/plannedorder/?${query}`);
                                                            }
                                                        else{
                                                                goto(`/${companyName}/order`);


        }
													}
												} catch (err) {
													console.error("API Call Failed:", err);
												}
											},
											(error) => {
												console.error("Geolocation failed:", error);
											},
											{ enableHighAccuracy: false, timeout: 10000 } 
										);
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