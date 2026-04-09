<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { host } from '../../../../../apis/config';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import Table from '../../tables/table.svelte';
	import { getCompanyName } from '../../../../../stores/companyStore';
	import { roles } from '../../../../../stores/roleStore';
	import KpiTabs from './kpi-tabs/kpi-tabs.svelte';
	import RefreshButton from '../../buttons/refresh-button.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import { v4 as uuidv4 } from 'uuid';
	import Header from '../../header/header.svelte';
	import { hasPrivilege } from '$lib/role';
	import Details from '$lib/modals/details-component.svelte';
	import Modal from '$lib/modals/createForm.svelte';
	import { deleteItem, updateForm, addForm } from '../../../../../apis/form.js';

	let token = getAccessToken();
	let detailsOpen = $state(false);
	let employee_id = $state();
	let employee_name = $state();
	let role = $state();
	let form_default = $state();
	let subTableLoad;
	let myDialog = $state();

	const info_button =
		'<svg width="24px" height="24px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="#9ca3af"></path></g></svg>';
	const request_svg_code =
		'<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="#286692" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1Zm-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71Zm10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z"/></svg>';
	const product_svg_code = `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
	const approve_svg_code = `<svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg>`;
	const reject_svg_code = `<svg class="reject" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg>`;
	const category_svg_code = `<svg width="20px" height="20px" viewBox="0 0 32 32" fill="#9ca3af" id="icon" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.cls-1{fill:none;}</style></defs><title>category</title><path d="M27,22.1414V18a2,2,0,0,0-2-2H17V12h2a2.0023,2.0023,0,0,0,2-2V4a2.0023,2.0023,0,0,0-2-2H13a2.002,2.002,0,0,0-2,2v6a2.002,2.002,0,0,0,2,2h2v4H7a2,2,0,0,0-2,2v4.1421a4,4,0,1,0,2,0V18h8v4.142a4,4,0,1,0,2,0V18h8v4.1414a4,4,0,1,0,2,0ZM13,4h6l.001,6H13ZM8,26a2,2,0,1,1-2-2A2.0023,2.0023,0,0,1,8,26Zm10,0a2,2,0,1,1-2-2A2.0027,2.0027,0,0,1,18,26Zm8,2a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,26,28Z"></path><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"></rect></g></svg>`;
	
	const request_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	const approve_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	const reject_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-red-100 dark:hover:bg-red-600/20 border-1 border-black/25 rounded-lg !px-3';

	let request_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${request_svg_code}</div>`;
	let product_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${product_svg_code}</div>`;
	let approve_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${approve_svg_code}</div>`;
	let reject_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${reject_svg_code}</div>`;
	let category_svg = `<div class="flex items-center justify-center gap-x-2 h-6 w-6">${category_svg_code}</div>`;

	let isSR = $state(true);
	let table_name = $state();
	let detailsEndpointById = $state(`${host}performance/get-details`);
	let tableEndpoint = $state(`${host}performance/get-performances/`);
	let searchEndpoint = $state(`${host}performance/search`);
	let tableEndpointById = $state(`${host}performance/get-performance/`);
	let formEndpoint = $state(`${host}performance/performance-form/`);
	let submitUrl = $state(`${host}performance/create-performance/`);
	let updateUrl = $state(`${host}performance/update-performance`);
	let deleteUrl = $state(undefined);
	let approveUrl = $state(`${host}performance/approve-performance`);
	let rejectUrl = $state(`${host}performance/reject-performance`);
	let updateRequestUrl = $state(`${host}performance/request-update`);

	let posFormEndpoint = $state(`${host}kpi/penetration-target/penetration-breakdown-form`);
	let posFormEndpointDeleteID = $state(
		`${host}kpi/penetration-target/delete-penetration-breakdown/`
	);

	let company_name = $state('');
	let module_name = $state(['Sales', 'Order']);
	let access_policy = $state();
	let onAdd = $state('');
	let closeOnSubmit = $state(true);
	let tableRef = $state(undefined);
	let show_add_label = $state(false);
	let showApprove = $state(true);
	let activeTab = $state('General');

	let refreshTable = $state(false);
	let userRoles = $state({});

	let showRejectionModal = $state(false);
	let selectedRowForRejection = $state(null);
	let transactions = $state({});
	let currentRow = $state('');
	let reason = $state('');
	let is_remark = $state(false);
	let allowed = $state(false)
	let approveId = $state('');
	let detailsTitle = $state('KPI Target');

	let clickCallback = $state(rowClicked);

	async function rowClicked(row) {
		try {
			console.log('wwwwwwwwwwwwrow');
			console.log(row);
			if (row?.target == '') return false;
			const data = await fetchTable(`${detailsEndpointById}/${row.id}`, token);
			if (data.succeed === true) {
				if (row?.status == 'Rejected') {
					is_remark = true;
					transactions = data.data.items;
					console.log('transacation - ' + transactions);
					if (transactions == '') return;
				} else {
					is_remark = false;
					if (data.data.total) transactions = data.data.items;
					else transactions = data.data;
				}
				detailsOpen = true;
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function check_target_setter(user_id) {
		try {
			const response = await fetch(`${host}target-set/target-setter-check/${user_id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (response.ok) {
				const data = await response.json();
				console.log('Here')
				console.log(data)
				allowed = data?.data ?? false;
				console.log(`Here again ${allowed}`)
			} else {
				console.error('Failed to check useres permission');
			}
		} catch (err) {
			console.error('Error checking useres permission:', err);
		}
	}

	async function set_add_button(user_id){
		await check_target_setter(user_id);

		if (allowed == false){
			console.log("I shouldnt be here")
			submitUrl = undefined;
			deleteUrl = undefined;
		} else{
			console.log("I should be here")
			submitUrl = isSR ? undefined : `${host}performance/create-performance/${user_id}`;
			deleteUrl = isSR ? undefined : `${host}performance/delete-performance`;
		}
	}

	onMount(() => {
		const query = $page.url.searchParams;
		employee_id = query.get('id');
		employee_name = query.get('name');
		role = query.get('role');

		company_name = getCompanyName();
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
			if (hasPrivilege(userRoles['Sales'], 'D')) isSR = false;
			form_default = { employee: employee_id };

			set_add_button(employee_id);
			
			showApprove = true;
			table_name = 'Target';
			tableEndpoint = `${host}performance/get-performances/${employee_id}`;
			searchEndpoint = `${host}performance/search`;
			tableEndpointById = `${host}performance/get-performance/`;
			formEndpoint = `${host}performance/performance-form/`;
			updateUrl = `${host}performance/update-performance/${employee_id}`;
			approveUrl = `${host}performance/approve-performance`;
			rejectUrl = `${host}performance/reject-performance`;
			detailsEndpointById = `${host}performance/get-details`;
			detailsTitle = 'KPI Target';
			closeOnSubmit = true;
			show_add_label = false;
			clickCallback = rowClicked;
		});
	});

	let sidebarToggle = $state(true);

	let { onToggleSidebar } = $props();

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};

	function fields_show(k, v, f) {
		let period_index = k.indexOf('period');
		let territory_index = k.indexOf('territory');
		let route_index = k.indexOf('route');

		if (period_index == -1 && territory_index == -1 && route_index == -1) {
			return false;
		}

		let period = v[period_index];
		let territory = v[territory_index];
		let route = v[route_index];

		let yearly_list = ['yearly', 'yearly_(%)', 'yearly_(Pcs)', 'yearly_(ETB)', 'yearly_(PoS)'];
		let quarterly_list = ['quarterly', 'quarterly_(%)', 'quarterly_(Pcs)', 'quarterly_(ETB)', 'quarterly_(PoS)'];
		let monthly_list = ['monthly', 'monthly_(%)', 'monthly_(Pcs)', 'monthly_(ETB)', 'monthly_(PoS)'];
		let weekly_list = ['weekly', 'weekly_(%)', 'weekly_(Pcs)', 'weekly_(ETB)', 'weekly_(PoS)'];
		let daily_list = ['daily', 'daily_(%)', 'daily_(Pcs)', 'daily_(ETB)', 'daily_(PoS)'];

		let yearly_disallow = ['quarter', 'month', 'week', 'day'];
		let quarterly_disallow = ['year', 'month', 'week', 'day'];
		let monthly_disallow = ['quarter', 'year', 'week', 'day'];
		let weekly_disallow = ['quarter', 'month', 'year', 'day'];
		let daily_disallow = ['quarter', 'month', 'week', 'year'];

		let territory_disallow = ['breakdown', 'hidden', 'products'];

		if (
			typeof period === 'object' &&
			(yearly_disallow.includes(f) ||
				quarterly_disallow.includes(f) ||
				monthly_disallow.includes(f) ||
				weekly_disallow.includes(f) ||
				daily_disallow.includes(f))
		) {
			return false;
		}

		if (period == 'Yearly') {
			// if (territory == '0' && route == '0') return !territory_disallow.includes(f) && !yearly_disallow.includes(f);
			return !yearly_disallow.includes(f);
		}

		if (period == 'Quarterly') {
			// if (territory == '0' && route == '0')
			// 	return (
			// 		!territory_disallow.includes(f) &&
			// 		!yearly_list.includes(f) &&
			// 		!quarterly_disallow.includes(f)
			// 	);
			return !yearly_list.includes(f) && !quarterly_disallow.includes(f);
		}

		if (period == 'Monthly') {
			// if (territory == '0' && route == '0')
			// 	return (
			// 		!territory_disallow.includes(f) &&
			// 		!yearly_list.includes(f) &&
			// 		!quarterly_list.includes(f) &&
			// 		!monthly_disallow.includes(f)
			// 	);
			return (
				!yearly_list.includes(f) && !quarterly_list.includes(f) && !monthly_disallow.includes(f)
			);
		}

		if (period == 'Weekly') {
			// if (territory == '0' && route == '0')
			// 	return (
			// 		!territory_disallow.includes(f) &&
			// 		!yearly_list.includes(f) &&
			// 		!quarterly_list.includes(f) &&
			// 		!monthly_list.includes(f) &&
			// 		!weekly_disallow.includes(f)
			// 	);
			return (
				!yearly_list.includes(f) &&
				!quarterly_list.includes(f) &&
				!monthly_list.includes(f) &&
				!weekly_disallow.includes(f)
			);
		}

		if (period == 'Daily') {
			// if (territory == '0' && route == '0')
			// 	return (
			// 		!territory_disallow.includes(f) &&
			// 		!yearly_list.includes(f) &&
			// 		!quarterly_list.includes(f) &&
			// 		!monthly_list.includes(f) &&
			// 		!weekly_list.includes(f) &&
			// 		!daily_disallow.includes(f)
			// 	);
			return (
				!yearly_list.includes(f) &&
				!quarterly_list.includes(f) &&
				!monthly_list.includes(f) &&
				!weekly_list.includes(f) &&
				!daily_disallow.includes(f)
			);
		}

		// if (territory == '0' && route == '0') return !territory_disallow.includes(f);
		return true;
	}

	let button_names = [info_button, approve_svg, reject_svg, request_svg, category_svg, product_svg];
	let button_callbacks = [showBreakdown, approve, reject, requestUpdate, showCategoryBreakdown, showProductBreakdown];
	let button_styles = ['', approve_styling, reject_styling, request_styling, '', ''];

	function showbutton(row, button_name) {
		if (row?.show_approval == true) {
			if (row?.route == 'All') {
				return row?.show_breakdown_button == true
					? button_name == info_button || button_name == product_svg || button_name == category_svg
					: button_name == info_button;
			}
			return row?.show_breakdown_button == true
				? button_name == approve_svg || button_name == reject_svg || button_name == product_svg || button_name == category_svg
				: button_name == approve_svg || button_name == reject_svg;
		} else if (row?.show_request == true) {
			if (row?.route == 'All') {
				return row?.show_breakdown_button == true
					? button_name == info_button || button_name == product_svg || button_name == category_svg
					: button_name == info_button;
			}
			return row?.show_breakdown_button == true
				? button_name == request_svg || button_name == product_svg || button_name == category_svg
				: button_name == request_svg;
		} else {
			if (row?.route == 'All') {
				return row?.show_breakdown_button == true
					? button_name == info_button || button_name == product_svg || button_name == category_svg
					: button_name == info_button;
			}
			return row?.show_breakdown_button == true ? button_name == product_svg || button_name == category_svg : false;
		}
	}

	function showbuttonOld(row, button_name) {
		return row.route == 'All' && button_name == info_button;
	}

	async function showBreakdown(row) {
		try {
			const data = await fetchTable(`${host}performance/get-breakdown-details/${row.id}`, token);
			if (data.succeed === true) {
				if (row?.status == 'Rejected') {
					detailsTitle = 'KPI Target';
					is_remark = true;
					transactions = data.data.items;
					if (transactions == '') return;
					if (myDialog) {
						myDialog.showModal();
					}
				} else {
					detailsTitle = 'KPI Target';
					is_remark = false;
					if (data.data.total) transactions = data.data.items;
					else transactions = data.data;
					if (transactions == '') return;
					if (myDialog) {
						myDialog.showModal();
					}
				}
				detailsOpen = true;
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}

	async function showProductBreakdown(row) {
		try {
			const data = await fetchTable(
				`${host}performance/get-product-breakdown-details/${row.id}`,
				token
			);
			if (data.succeed === true) {
				if (row?.status == 'Rejected') {
					detailsTitle = 'Product Breakdowns';
					is_remark = true;
					transactions = data.data.items;
					if (transactions == '') return;
					if (myDialog) {
						myDialog.showModal();
					}
				} else {
					detailsTitle = 'Product Breakdowns';
					is_remark = false;
					if (data.data.total) transactions = data.data.items;
					else transactions = data.data;
					if (transactions == '') return;
					if (myDialog) {
						myDialog.showModal();
					}
				}
				detailsOpen = true;
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}

	async function showCategoryBreakdown(row) {
		try {
			const data = await fetchTable(
				`${host}performance/get-category-breakdown-details/${row.id}`,
				token
			);
			if (data.succeed === true) {
				if (row?.status == 'Rejected') {
					detailsTitle = 'Category Breakdowns';
					is_remark = true;
					transactions = data.data.items;
					if (transactions == '') return;
					if (myDialog) {
						myDialog.showModal();
					}
				} else {
					detailsTitle = 'Category Breakdowns';
					is_remark = false;
					if (data.data.total) transactions = data.data.items;
					else transactions = data.data;
					if (transactions == '') return;
					if (myDialog) {
						myDialog.showModal();
					}
				}
				detailsOpen = true;
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}

	function nobutton(row, button_name) {
		return null;
	}

	async function approve(result) {
		const approveId = result?.id;

		if (!approveId) {
			console.error('No ID found for approval');
			return;
		}
		try {
			const response = await fetch(`${approveUrl}/${approveId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			// if (response.ok) refreshTable = !refreshTable;
			// else console.error('Approval failed:', data);
			return data;
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	async function requestUpdate(result) {
		const request_id = result?.id;

		if (!request_id) {
			console.error('No ID found for approval');
			return;
		}
		try {
			const response = await fetch(`${updateRequestUrl}/${request_id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) refreshTable = !refreshTable;
			else console.error('Approval failed:', data);
			return data;
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	async function reject(result, loader) {
		if (result?.status == 'Deletion Requested') {
			if (!result?.id) {
				console.error('Rejection reason or selected row is missing.');
				return;
			}

			try {
				const response = await fetch(`${rejectUrl}/${result?.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({
						remark: String('')
					})
				});

				const data = await response.json();
				if (response.ok) {
					refreshTable = !refreshTable;
				} else console.error('Rejection failed:', data);

				// subTableLoad();
				return response;
			} catch (error) {
				console.error('Error while rejecting:', error);
			}
		} else {
			subTableLoad = loader;
			approveId = result?.id;
			showRejectionModal = true;
		}
	}

	async function handleRejectionSubmit(action, result) {
		const remark = result?.remark;

		if (!remark || !approveId) {
			console.error('Rejection reason or selected row is missing.');
			return;
		}

		try {
			reason = remark;
			const response = await fetch(`${rejectUrl}/${approveId}`, {
				method: 'PUT',
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
				refreshTable = !refreshTable;
				showRejectionModal = !showRejectionModal;
			} else console.error('Rejection failed:', data);
			subTableLoad();
			return response;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	function rowClickedShow(row) {
		if (row?.target == '' && row?.status != 'Incomplete') return true;
		return false;
	}
</script>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
	<div>
		<p class="text-sm text-gray-700 dark:text-gray-300 ml-4 my-4 font-bold">
			{employee_name} - Targets
		</p>

		{#key refreshTable}
			<Table
				bind:this={tableRef}
				bind:get_table_endpoint={tableEndpoint}
				bind:search_endpoint={searchEndpoint}
				bind:get_table_endpoint_by_id={tableEndpointById}
				bind:get_form_endpoint={formEndpoint}
				bind:create_entry_url={submitUrl}
				bind:update_entry_url={updateUrl}
				bind:delete_entry_url={deleteUrl}
				{token}
				{table_name}
				module={module_name}
				get_id_bool={true}
				buttons_names={button_names}
				buttons_callbacks={button_callbacks}
				{button_styles}
				buttons_show={showbutton}
				row_clicked={rowClicked}
				row_clicked_show={rowClickedShow}
				form_override={form_default}
				{fields_show}
				isHierarchical={true}
			/>
			<dialog bind:this={myDialog}>
				<Details
					isOpen={detailsOpen}
					title={detailsTitle}
					bind:data={transactions}
					handleClose={() => {
						detailsOpen = false;
						myDialog.close();
					}}
					isRemark={is_remark}
				/>
			</dialog>
			<Modal
				table_name={'Rejection'}
				{token}
				get_form_endpoint={`${host}performance/get-rejection-form`}
				action_type={'Add'}
				bind:showFormModal={showRejectionModal}
				callback={handleRejectionSubmit}
				disable_save_and_add={true}
			/>
		{/key}
	</div>
</div>
