
<script>

	import { goto } from '$app/navigation';
	import Table from '../../tables/table.svelte';
	import Sales from '../sales/sales.svelte';
	import Checkout from '../salesForm/salesForm.svelte';
	import Map from '$lib/map/map.svelte';
	import Details from '$lib/modals/details.svelte';
	import VisitOptions from '$lib/modals/visitOptions.svelte';
    import Customer from './../visit/customer.svelte';

	import { getLocation } from '$lib/location.js';
	import { hasPrivilege } from '$lib/role';
	import { getCompanyName } from '../../../../../stores/companyStore.js';
	import { roles } from '../../../../../stores/roleStore';
	import Modal from '$lib/modals/createForm.svelte';
    import {
            getRoutePoint,
     } from '../../../../../apis/get-pos';


    import { onMount } from 'svelte';
    import { host, token } from '../../../../../apis/config';


    let isOpen = $state(false);
    let isVisitOptionsOpen = $state(false);

    let userRoles = $state({});

    let activeTabMap = $state('List');
    let point_of_sales = $state([]);
    let result_detail = $state(null);
    let refreshTable = $state(false);
    let reloadMap = $state(false);
    let current_point_of_sale = $state("");
    let current_point_of_sale_name = $state("");
    let company_name = $state('');
    let companyName = $state(getCompanyName());
    let dialogRef = $state();
    let salesRef = $state();
    let routeSchedule = $state();
	let selected_point_of_sale = $state(null);
    let visitStarted = $state(false);
    let golobal_result
    let golobal_data

    let {
        fixedTerritory = undefined,
        fixedRoute = undefined,
        visitType = 'Unplanned Visit'
    } = $props();

    const tableEndpoint = `${host}Unplanned/get-unplanned-visit`;
    let submitUrl = $state(`${host}Unplanned/create-unplanned-visit`);
	let updateUrl = $state(`${host}Unplanned/update-unplanned-visit`);
    const tableEndpointById = `${host}Unplanned/get-unplanned-visit/`;
    const searchEndpoint = `${host}Unplanned/search`;
    const formEndpoint = `${host}Unplanned/unplanned-visit-form`;
    const deleteUrl = `${host}Unplanned/delete-unplanned-visit`;
    // const table_name = 'Unplanned Visit';
	const table_name = 'Request';
	const tabs = ['Unplanned Visit', 'Planned Visit'];
	let activeTab = $state('Unplanned Visit');
    let refreshActivated = $state(false);
	let tableEndpointPointOfSaleDynamic = $state(`${host}Unplanned/get-point-of-sales`);


    // const start_svg_code = '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="#286692" stroke-width="1.5"><path d="M5 12L15 2h7v7L12 19z"/></svg>';
    // const finish_svg_code = '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="#286692" stroke-width="2" stroke-linecap="round"><path d="M5 13V3.5"/></svg>';

    // let start_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${start_svg_code} Start </div>`;
    // let finish_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${finish_svg_code} Finish </div>`;

    const start_styling = 'bg-white/10 hover:bg-green-200 border rounded-lg !px-3';
    const finish_styling = 'bg-white/10 hover:bg-red-200 border rounded-lg !px-3';


	const start_svg_code = '<svg width="20px" height="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#286692"><g fill="none" stroke="#286692" stroke-width="1.5"><path d="M5 12L15 2h7v7L12 19z"/><path d="M5 6L2 9l3 3l6-6zm13 13l-3 3l-3-3l6-6zM7 17l-5 5m8-2l-2 2m-4-8l-2 2m14.516-8.516l-2.032 2.032"/></g></svg>'
	const finish_svg_code = '<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-width="2" d="M5 13V3.5c0-.236 0-.354.073-.427C5.146 3 5.264 3 5.5 3h4.096c.2 0 .3 0 .39.036c.09.037.161.106.305.245l1.488 1.438c.144.139.216.208.306.245c.09.036.19.036.39.036h6.195c.243 0 .364 0 .407.078c.042.078-.023.18-.155.384L16.174 9.73c-.084.132-.127.197-.127.271c0 .073.043.14.127.27l2.748 4.268c.132.204.197.306.155.384c-.043.078-.164.078-.407.078h-6.196c-.2 0-.3 0-.39-.036c-.09-.037-.161-.106-.305-.245l-1.488-1.438c-.144-.139-.216-.208-.306-.245c-.09-.036-.19-.036-.39-.036zm0 0v6"/></svg>'
	let start_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${start_svg_code} Start </div>`;
	let finish_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${finish_svg_code} Finish </div>`;

	const approve_styling = 'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3'
	const reject_styling = 'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-red-100 dark:hover:bg-red-600/20 border-1 border-black/25 rounded-lg !px-3'
	let approve_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg></div>`;
	let reject_svg = '<div class="flex items-center justify-center gap-x-2 h-6"><svg class="reject" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg></div>';



    // let button_names = [start_svg, finish_svg];
    // let button_styles = [start_styling, finish_styling];
    // let button_callbacks = [start, end];

	onMount(() => {
        activeTabMap = 'Map'; 
		company_name = getCompanyName();
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;

			if (hasPrivilege(userRoles['Sales'], 'D')) {
				updateUrl = undefined;
				submitUrl = undefined;
			} else {
			}
		});
	});


	function showbutton(row, button_name) {
		if (hasPrivilege(userRoles['Visit'], 'D')) {
			return row.approval == 'Pending' && (button_name == approve_svg || button_name == reject_svg);
		}
		if (hasPrivilege(userRoles['Visit'], 'U')) {
			return (
				(row.status === 'Started' && row.approval == 'Approved' && button_name == finish_svg) ||
				(row.status === 'New' && row.approval == 'Approved' && button_name == start_svg)
			);
		}
	}

	let detailsOpen = $state(false);
	let transactions = {};
	let button_names = [approve_svg, reject_svg, start_svg, finish_svg];
	let button_styles = [approve_styling, reject_styling, approve_styling, reject_styling];
	let button_callbacks = [approve, reject, start, end];

	async function approve(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			const response = await fetch(`${host}Unplanned/unplanned-visit/${id}/accept`, {
				method: 'PUT', // use POST if your backend expects that
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
				refreshActivated = !refreshActivated;
				console.log('Request approved:', data);
			} else {
				console.error('Approval failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	async function reject(result) {
		selectedRowForRejection = result;
		showRejectionModal = true;
	}

	async function handleRejectionSubmit(action, result) {
		try {
			const id = selectedRowForRejection?.id;
			const remark = result?.remark;

			if (!id) {
				console.error('No ID found in selected row');
				return;
			}
			if (!remark || !selectedRowForRejection) {
				console.error('Rejection reason or selected row is missing.');
				return;
			}

			showRejectionModal = false; // Hide the modal

			reason = remark;

			const response = await fetch(`${host}Unplanned/unplanned-visit/${id}/reject`, {
				method: 'PUT', // use POST if your backend expects that
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					remark: String(reason)
				})
			});

			const data = await response.json();
			if (response.ok) {
				refreshActivated = !refreshActivated;
				showRejectionModal = !showRejectionModal;
				console.log('Request rejected:', data);
			} else {
				console.error('rejection failed:', data);
			}
			return data;
			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

    // function handleMapSalesAction(status, order_id, pos_id) {
    //     if ((status === 'new' || status === 'order') && pos_id) {
    //         handleSelect(current_point_of_sale, current_point_of_sale_name);
    //         if (status === 'order' && order_id && salesRef?.loadOrder) {
    //             salesRef.loadOrder(order_id);
    //         }
    //     }
    // }

    export async function handleSelect(id, name) {
        const query = new URLSearchParams({
            id: id,
            name: name,
            routeschedule: routeSchedule,
            territory: result_detail.territory_id,
            route: result_detail.route_id,
        }).toString();

        goto(`/${companyName}/sales?${query}`);
    }

    async function fetchPOS(id) {
        try {
            const response = await fetch(`${host}Unplanned/get-point-of-sales/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            point_of_sales = data.data || [];
        } catch (error) {
            console.error(error);
        }
    }

function handleMapSalesAction(status, order_id, pos_id) {

    if ((status === 'new' || status === 'order') && pos_id) {

                    handleSelect(pos_id, current_point_of_sale_name, "");
            
            if (status === 'order' && order_id && salesRef?.loadOrder) {
                salesRef.loadOrder(order_id);
            }
       
        }
    else if(status === "no"){
              let golobal_data = {
                                territory_id: result_detail.territory_id,
                                route_id: result_detail.route_id,
                                route_schedule_id: result_detail.id
                            };
                    openCustomerView(golobal_result, golobal_data);

                
            }   
    }

    function openCustomerView(result, data) {
        result_detail = {
            ...result,
            territory_id: data.territory_id,
            route_id: data.route_id,
            id: data.route_schedule_id,
        };
        routeSchedule = data.route_schedule_id;
        fetchPOS(data.route_schedule_id);
        isOpen = true;
    }

    async function start(result) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const response = await fetch(`${host}Unplanned/unplanned-visit/start`, {
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
                golobal_result = result
                golobal_data == data.data
                openCustomerView(result, data.data);
            }
        });
    }
	async function continuevisit(result) {
        golobal_result = result

		if (result.status == 'Finished') {
			return;
		}
		try {
			const id = result?.id;
			if (!id) return;

			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const latitude = parseFloat(position.coords.latitude);
					const longitude = parseFloat(position.coords.longitude);

					const response = await fetch(`${host}Unplanned/unplanned-visit/continue`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({
							latitude: latitude,
							longitude: longitude,
							id: id
						})
					});

					const data = await response.json();

					if (response.ok) {

                        golobal_result = result
                        golobal_data = data.data
                        openCustomerView(result, data.data);
                        // golobal_result = result
                        // golobal_data == data.data

						// refreshActivated = !refreshActivated;

						// tableEndpointPointOfSaleDynamic = `${host}Unplanned/get-point-of-sales/${result.id}`;
						// visitStarted = true;
						// result_detail = result;
						// isOpen = true;
                        // openCustomerView(result, data.data);
						// goto(
						// 	`sales?territory=${data.data.territory_id}&route=${data.data.route_id}&routeschedule=${data.data.route_schedule_id}`
						// );
					} else {
						console.error('Start failed:', data);
					}
					return data;
				},
				(error) => {
					console.error('Error getting location:', error.code, error.message);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0
				}
			);
		} catch (error) {
			console.error('Start error:', error.message);
		}
	}

	async function rowClickedShow(row){
		// console.log(row)
		if (row.approval != 'Pending'){
			return true;
		} 
		else {
			return false;
		}
	}

	async function rowClicked(row) {
		try {
			routeSchedule = row.id;
			if (row.status == 'Started') {
				continuevisit(row);
			}
		} catch (error) {
			console.log(error);
		}
	}    async function end(result) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const response = await fetch(`${host}Unplanned/unplanned-visit/end`, {
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


<dialog
    oncancel={() => {
        isVisitOptionsOpen = false;
        dialogRef.close();
    }}
    bind:this={dialogRef}
    class="rounded-xl"
>
{#key current_point_of_sale}
    <VisitOptions
        point_of_sale_id={current_point_of_sale}
        point_of_sale_name={current_point_of_sale_name}
        route_schedule_id={routeSchedule}
        title="Sales Options"
        bind:isOpen={isVisitOptionsOpen}
        handleClose={() => {
            isVisitOptionsOpen = false;
            dialogRef.close();
            reloadMap = !reloadMap;
        }}
        {visitType}
        handleSalesClicked={async(status, order_id, currentPOS) => {
            console.log("calling it for no sales")
            isOpen = false;
            isVisitOptionsOpen = false;
            dialogRef.close();
            handleMapSalesAction(status, order_id, currentPOS);
            if(result_detail.route_id) {
                        point_of_sales = await getRoutePoint(result_detail.id);
             }
            reloadMap = !reloadMap;

        }}
    />
{/key}
</dialog>



{#if isOpen}

    <div class="flex flex-col h-full bg-gray-50 dark:bg-[#1a1f2e]">
        <div class="hidden" aria-hidden="true">
            {#if result_detail}
                <Sales 
                    bind:this={salesRef}
                    fixedRoute={result_detail.route_id}
                    fixedTerritory={result_detail.territory_id}
                    routeSchedule={result_detail.id}
                    visitType="Planned Visit"
                />
            {/if}
        </div>
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
		<div class="mt-0">

			<Customer
				tabs={['Map', 'List']} 
				bind:activeTab={activeTabMap} 
				formatLabel={(n) => n}
				routeSchedule={result_detail?.id}
				{companyName}
        />
        </div>

        <div class="flex-1 overflow-y-auto">
            {#if activeTabMap === 'Map'}
		        <div class="relative z-0 w-full h-[vh] bg-white dark:bg-[#002a47] shadow-md sm:rounded-lg">
                        
                            <Map
                                fixedTerritory={result_detail.territory_id}
                                fixedRoute={result_detail.route_id}
                                routeSchedule={result_detail.id}
                                visitType="Planned Visit"
                                handleSalesClicked={(status, order_id, pos_id, pos_name) => {current_point_of_sale = pos_id; current_point_of_sale_name = pos_name; handleMapSalesAction(status, order_id, pos_id)}}
                                on:updatePointOfSales={(event) => {
                                    point_of_sales = event.detail;
                                }}
                            />
                    </div>
            {:else}
                <div class="p-4">
                    <div class="max-w-4xl mx-auto bg-white dark:bg-[#22273c] rounded-lg shadow overflow-hidden">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-gray-100 text-gray-900 dark:bg-[#326b92] dark:text-white uppercase text-xs h-12">
                                <tr><th class="px-6 py-4">Point of Sale</th></tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                {#each point_of_sales as pos}
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition h-16">
                                        <td class="px-6 py-4">
                                            <div class="flex justify-between items-center">
                                                <div 
                                                    class="flex items-center gap-4 cursor-pointer" 
                                                        onclick={() => {
                                                            current_point_of_sale = pos.id;
                                                            current_point_of_sale_name = pos.name;
                                                            isVisitOptionsOpen = true;
                                                            isOpen = true;
                                                            dialogRef.showModal();
                                                        }}                                                >
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
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
        </div>
    </div>
{:else}
    {#key refreshTable}
			<Table
				get_table_endpoint={tableEndpoint}
				search_endpoint={searchEndpoint}
				get_table_endpoint_by_id={tableEndpointById}
				get_form_endpoint={formEndpoint}
				create_entry_url={submitUrl}
				update_entry_url={updateUrl}
				delete_entry_url={deleteUrl}
				{token}
				{table_name}
				module="Sales"
				get_id_bool={true}
				buttons_names={button_names}
				buttons_callbacks={button_callbacks}
				button_styles={button_styles}
				buttons_show={showbutton}
				row_clicked={rowClicked}
				row_clicked_show={rowClickedShow}
				disable_date_filter={true}
			/>
    {/key}
{/if} 