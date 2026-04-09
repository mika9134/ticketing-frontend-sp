<script>
    import { onMount } from 'svelte';
    import { host, token } from '../../../../../apis/config';
    import { goto } from '$app/navigation';
    import Proceed from '$lib/modals/proceedModal.svelte';
    import { get } from 'svelte/store';
    // Components
    import Header from '../../header/header.svelte';
    import Table from '../../tables/table.svelte';
    import Map from '$lib/map/map.svelte';
    import Details from '$lib/modals/details.svelte';
    import Customer from './../visit/customer.svelte';
    import Sales from '../orders/order.svelte'; 
    import OrderOptions from '$lib/modals/orderOptions.svelte';
    import { getCompanyName } from '../../../../../stores/companyStore.js';
    import {
            getRoutePoint,
     } from '../../../../../apis/get-pos';
	import { page } from '$app/stores';


    // --- State Management ---
    let isOpen = $state(false);
    let showOptionsDialog = $state(false); // Added for Dialog
    let activeTabMap = $state('List'); 
    let point_of_sales = $state([]);
    let result_detail = $state(null);
    let refreshTable = $state(false);
    let companyName = $state(getCompanyName());
    
    // Added to track selected POS for the dialog
    let selectedPOSData = $state({ id: '', name: '', landmark: '' });

    // Reference to the Sales component logic
    let salesRef = $state(); 
    let reloadMap = $state(true);
    	let oo = $state({});



    let {
        fixedTerritory = undefined,
        fixedRoute = undefined,
        routeSchedule = undefined,
        visitType = 'Planned Order Visit',
        onToggleSidebar

    } = $props();
    let sidebarToggle = true;


    const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
	};

    // --- Endpoints ---
    const tableEndpoint = `${host}planned/order/get-planned-order-visits`;
    const tableEndpointById = `${host}planned/order/order/get-planned-order-visit`;
    const searchEndpoint = `${host}planned/order/search`;
    const formEndpoint = `${host}planned/order/planned-order-visit-form`;
    const deleteUrl = `${host}planned/order/delete-planned-order-visit`;
    const table_name = 'Planned Order Visit';

    // --- UI Assets ---
    const start_svg_code = '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="#286692" stroke-width="1.5"><path d="M5 12L15 2h7v7L12 19z"/><path d="M5 6L2 9l3 3l6-6zm13 13l-3 3l-3-3l6-6zM7 17l-5 5m8-2l-2 2m-4-8l-2 2m14.516-8.516l-2.032 2.032"/></svg>';
    const finish_svg_code = '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="#286692" stroke-width="2" stroke-linecap="round"><path d="M5 13V3.5c0-.236 0-.354.073-.427C5.146 3 5.264 3 5.5 3h4.096c.2 0 .3 0 .39.036c.09.037.161.106.305.245l1.488 1.438c.144.139.216.208.306.245c.09.036.19.036.39.036h6.195c.243 0 .364 0 .407.078c.042.078-.023.18-.155.384L16.174 9.73c-.084.132-.127.197-.127.271c0 .073.043.14.127.27l2.748 4.268c.132.204.197.306.155.384c-.043.078-.164.078-.407.078h-6.196c-.2 0-.3 0-.39-.036c-.09-.037-.161-.106-.305-.245l-1.488-1.438c-.144-.139-.216-.208-.306-.245c-.09-.036-.19-.036-.39-.036zm0 0v6"/></svg>';
    
    let start_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${start_svg_code} Start </div>`;
    let finish_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${finish_svg_code} Finish </div>`;
    
    const start_styling = 'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
    const finish_styling = 'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-red-100 dark:hover:bg-red-600/20 border-1 border-black/25 rounded-lg !px-3';

    let button_names = [start_svg, finish_svg];
    let button_styles = [start_styling, finish_styling];
    let button_callbacks = [start, end];
    let is_redirected = $state(false);

onMount(() => {
        activeTabMap = 'Map';
        const url = get(page).url;
        const id = url.searchParams.get('id');
        const territory_id = url.searchParams.get('territory_id');
        const route_id = url.searchParams.get('route_id');
        const routeSchedule = url.searchParams.get('routeSchedule');

        if (id || territory_id || route_id || routeSchedule) {
            const result = { route_schedule_id: routeSchedule };  
            const data = {
                territory_id: territory_id,
                route_id: route_id,
                route_schedule_id: routeSchedule,
            };      
            is_redirected = true;
            openCustomerView(result, data);
        }
        else {
        is_redirected = false;
        }
    });

    function showbutton(row, button_name) {
            console.log("here data neede",row )

        return (
            
            row.status != 'Finished' &&
            ((row.status == 'New' && button_name == start_svg) ||
                (row.status == 'Started' && button_name == finish_svg) ||
                (row.status == 'Finished' && button_name == null))
                
        );
    }

    function handleMapSalesAction(status, order_id, pos_id) {
        const pos = point_of_sales.find(p => p.id === pos_id);
        
        if ((status === 'new') && pos) {
            handleSelect2(pos.id, pos.name, pos.landmark);
        }
    }

    // Logic: Opens the Dialog
    export async function handleSelect(id, name, landmark) {
        selectedPOSData = { id, name, landmark };
        showOptionsDialog = true;
    }

    // Logic: Final Redirection (Called when "New Order" is clicked in dialog)
    export async function handleSelect2(id, name, landmark) {
        const query = new URLSearchParams({
            id: id,
            name: name,
            landmark: landmark,
            territory_id:result_detail.territory_id,
            route_id: result_detail.route_id,
            routeSchedule: result_detail.id,
        }).toString();
        if(routeSchedule!== null){
        goto(`/${companyName}/order?${query}`);
    }
        else{
        goto(`/${companyName}/order`);


        }
    }

function openCustomerView(result, data = {}) { 
    result_detail = {
        ...result,
        territory_id: data?.territory_id,
        route_id: data?.route_id,
        id: data?.route_schedule_id,
        route: result?.route
    };
    isOpen = true;
    showOptionsDialog = false;
}

    async function start(result) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const response = await fetch(`${host}planned/order/planned-order-visit/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    id: result.id
                })
            });
            const data = await response.json();
            if (response.ok) {
                refreshTable = !refreshTable;
                openCustomerView(result, data.data);
            }
        });
    }

    async function cont(result) {
        // console.log("the result", result)
        navigator.geolocation.getCurrentPosition(async (position) => {
            const response = await fetch(`${host}planned/order/planned-order-visit/continue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    id: result.id
                })
            });
            const data = await response.json();

            if (response.ok){
                openCustomerView(result, data.data);
            }
        });
    }

    async function rowClicked(row) {
        if (row.status == 'Started') cont(row);
                console.log("here data row clicked ",row )

    }

    async function end(result) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const response = await fetch(`${host}planned/order/planned-order-visit/end`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    id: result.id
                })
            });
            if (response.ok) {
                refreshTable = !refreshTable;
                isOpen = false;
            }
        });
    }
</script>


{#if is_redirected}
<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
{/if}
{#if isOpen}
    <div class="flex flex-col h-full bg-gray-50 dark:bg-[#1a1f2e]">

        {#if showOptionsDialog && isOpen}
            <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <OrderOptions 
                    isOpen={showOptionsDialog}
                    title="Order Options"
                    point_of_sale_id={selectedPOSData.id}
                    route_schedule_id={result_detail?.id}
                    {visitType}
                    handleClose={() => showOptionsDialog = false}
                    handleOrderClicked={

                    async (status, order_id, pos_id) => {
                        showOptionsDialog = false;
                        if (status === 'new') {
                            await handleSelect2(selectedPOSData.id, selectedPOSData.name, selectedPOSData.landmark);
                        }
                        else{

                        reloadMap = !reloadMap; // This handles the map
                        if(result_detail.route_id) {
                        point_of_sales = await getRoutePoint(result_detail.id);
                        }
                     }

                    }
                    
                    }
                />
            </div>
        {/if}
        
        <div class="flex justify-between items-center p-0 mt-0 shadow-sm bg-gray-100">
            <div class="mt-0 ml-4">
                <h2 class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                        bg-white border border-b-0 border-gray-200
                        text-gray-700 hover:bg-gray-50
                        dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]">
                    Customer
                </h2>
            </div>
        </div>


		<div class="ml-0">
			<Customer
				tabs={['Map', 'List']} 
				bind:activeTab={activeTabMap} 
				formatLabel={(n) => n}
				routeSchedule={result_detail?.id}
				{companyName}
        />
		</div>
            {#if activeTabMap === 'Map'}
		    <div class="relative z-0 w-full h-[50vh] bg-white dark:bg-[#002a47] shadow-md sm:rounded-lg">
				
				<div class="h-full w-full h-full">                  
                      <Map
                        fixedTerritory={result_detail.territory_id}
                        fixedRoute={result_detail.route_id}
                        routeSchedule={result_detail.id}
                        visitType="Planned Order Visit"
                        handleOrderClicked={handleMapSalesAction}
                        on:updatePointOfSales={(event) => {
                            point_of_sales = event.detail;
                        }}
                    />
                </div>
            </div>
            {:else}
        <div class="p-4">
                <div class="max-w-4xl mx-auto bg-white dark:bg-[#22273c] rounded-lg shadow overflow-hidden">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-gray-100 text-gray-900 dark:bg-[#326b92] dark:text-white uppercase text-xs h-12">
                            <tr><th class="px-6 py-4">Point of Sale</th></tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            {#key reloadMap}
                         
                            {#each point_of_sales as pos}
                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition h-16">
                                    <td class="px-6 py-4">
                                        <div class="flex justify-between items-center">
                                            <div 
                                                class="flex items-center gap-4 cursor-pointer" 
                                                onclick={() => handleSelect(pos.id, pos.name, pos.landmark)}
                                            >
                                                <div class="p-3 bg-[#e0effa] dark:bg-blue-900/30 rounded-lg">
                                                    <svg fill="#286692" width="24" height="24" viewBox="0 0 20 20"><path d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2 1.31 0 2.393-.764 2.552-1.75zM10 9c1.42 0 2.571-.896 2.571-2 0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875c-.002.041-.004.082-.004.125 0 1.104 1.151 2 2.571 2zm5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046zM18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9 17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5z"/></svg>
                                                </div>
                                                <div>
                                                    <p class="font-bold text-black text-base">{pos.name}</p>
                                                    <p class="text-xs text-gray-500">{pos.landmark || 'No Landmark'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                            {/key}

                        </tbody>
                    </table>
                </div>
            </div>
            {/if}
        </div>
{:else}
    <div class="mt-4">
        {#key refreshTable}
            <Table
                get_table_endpoint={tableEndpoint}
                search_endpoint={searchEndpoint}
                get_table_endpoint_by_id={tableEndpointById}
                get_form_endpoint={formEndpoint}
                {token}
                {table_name}
                module="Order"
                get_id_bool={true}
                buttons_names={button_names}
                buttons_callbacks={button_callbacks}
                button_styles={button_styles}
                buttons_show={showbutton}
                row_clicked={rowClicked}
                disable_date_filter={true}
            />
        {/key}
    </div>
{/if}