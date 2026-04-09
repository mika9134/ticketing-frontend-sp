<script>
	import { onMount } from 'svelte';
	import SalesDashboard from './salesdashboard.svelte';
	import ProductDashboard from './top-customers.svelte';
	import EmployeeDashboard from './employeeDashboard.svelte';
	import FinanceDashboard from './Finance.svelte';
	import Header from '../../header/header.svelte';
	import FilterSection from '../../filter/filter.svelte';

	import { roles } from '../../../../../stores/roleStore.js';
	import { hasPrivilege } from '$lib/role.js';

	let userRoles = $state({});
	let activeDashboard = $state('');

	onMount(() => {
		activeDashboard = '';
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;

			if (!(Object.keys(userRoles).length === 0 && userRoles.constructor === Object)) {
				if (userRoles['name'] == 'Higher Management') {
					activeDashboard = 'Sales';
				} else if (hasPrivilege(userRoles['Finance'], 'D')) {
					activeDashboard = 'Finance';
				} else if (hasPrivilege(userRoles['Sales'], 'D')) {
					activeDashboard = 'Sales';
				} else {
					activeDashboard = 'Performance';
				}
			}
		});
	});
</script>

<div class="sticky top-0 bg-gray-100 dark:bg-[#0f1727] z-10">
	<Header />

	<div class="top-16 h-20 border-b border-gray-200 dark:border-[#00527c] ml-4 pt-4 mr-4">
		<div class="flex gap-2">
			{#if hasPrivilege(userRoles['Sales'], 'D') || userRoles['name'] == 'Higher Management'}
				<button
					type="button"
					onclick={() => {
						activeDashboard = 'Sales';
					}}
					class="flex gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
						text-gray-700 hover:bg-gray-100
						dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeDashboard === 'Sales'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					<svg
						fill="#758CA3"
						version="1.1"
						id="Capa_1"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						width="24px"
						height="24px"
						viewBox="0 0 31.294 31.294"
						xml:space="preserve"
						stroke="#758CA3"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier">
							<g>
								<g>
									<circle cx="24.724" cy="3.235" r="3.235"></circle>
									<path
										d="M27.434,7.715l-2.71,3.74l-2.678-3.488L18.84,11.91l-2.572-2.285c-0.54-0.481-1.367-0.432-1.852,0.108 c-0.478,0.541-0.432,1.369,0.109,1.851l3.595,3.194c0.239,0.214,0.548,0.332,0.867,0.332c0.032,0,0.062-0.001,0.098-0.006 c0.354-0.028,0.686-0.201,0.913-0.478l1.423-1.769v4.872c0,0.61,0,1.181,0.325,1.668v10.617c0,0.727,0.66,1.28,1.385,1.28 s1.387-0.499,1.387-1.335h0.35c0,0.836,0.596,1.335,1.319,1.335c0.723,0,1.322-0.555,1.322-1.28V19.396 c0.325-0.49,0.325-1.058,0.325-1.668v-4.23c0.558,1.169,0.579,2.706,0.573,4.665c-0.001,0.726,0.667,1.341,1.394,1.341h0.001 c0.722,0,1.309-0.607,1.312-1.334C31.13,11.448,28.95,8.757,27.434,7.715z"
									></path>
									<path
										d="M26.232,6.808l-0.768,0.33C25.306,6.87,25.02,6.69,24.684,6.69c-0.337,0-0.624,0.183-0.778,0.454l-0.768-0.323 c-0.111-0.048-0.268-0.035-0.366,0.031c-0.103,0.068-0.188,0.181-0.188,0.304v0.96c0,0.115,0.078,0.224,0.17,0.292 c0.095,0.068,0.226,0.089,0.338,0.057c0.306-0.094,0.693-0.207,0.908-0.273c0.167,0.191,0.416,0.312,0.685,0.312 c0.284,0,0.534-0.13,0.703-0.33c0.213,0.065,0.586,0.179,0.888,0.271c0.11,0.032,0.19,0.012,0.284-0.056s0.114-0.176,0.114-0.292 V7.142c0-0.122-0.028-0.233-0.13-0.301C26.44,6.772,26.346,6.762,26.232,6.808z"
									></path>
									<path
										d="M11.773,12.094c-0.133-0.132-0.311-0.207-0.498-0.207c-0.186,0-0.366,0.075-0.497,0.207l-2.231,2.232 c-0.298,0.297-0.777,0.297-1.074,0L4.01,10.868c-0.106-0.108-0.167-0.254-0.167-0.405c0-0.151,0.061-0.297,0.167-0.404 l0.684-0.681c0.071-0.07,0.094-0.177,0.054-0.269C4.709,9.015,4.62,8.954,4.52,8.954H0.982c-0.216,0-0.421,0.087-0.571,0.24 C0.261,9.347,0.178,9.554,0.181,9.77l0.053,3.473c0.001,0.099,0.062,0.188,0.153,0.226c0.092,0.037,0.197,0.016,0.268-0.055 l0.805-0.806c0.105-0.108,0.253-0.167,0.402-0.167c0.153-0.001,0.299,0.06,0.407,0.167l5.205,5.205 c0.142,0.143,0.336,0.223,0.536,0.223c0.201,0,0.395-0.08,0.538-0.223l2.192-2.193c0.142-0.143,0.336-0.222,0.536-0.222 c0.202,0,0.394,0.08,0.537,0.222l4.023,4.021c0.275,0.275,0.723,0.275,0.997,0l0.748-0.746c0.132-0.133,0.207-0.312,0.207-0.498 c0-0.187-0.075-0.365-0.207-0.498L11.773,12.094z"
									></path>
								</g>
							</g>
						</g></svg
					>
					Sales
				</button>

				<button
					type="button"
					onclick={() => {
						activeDashboard = 'Product';
					}}
					class="flex gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeDashboard === 'Product'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					<svg
						width="24px"
						height="24px"
						viewBox="0 0 24 24"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						fill="#758CA3"
						stroke="#758CA3"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier">
							<title></title>
							<g fill="none" fill-rule="evenodd" id="页面-1" stroke="none" stroke-width="1">
								<g id="导航图标" transform="translate(-325.000000, -80.000000)">
									<g id="编组" transform="translate(325.000000, 80.000000)">
										<polygon
											fill="#758CA3FFFFFF"
											fill-opacity="0.01"
											fill-rule="nonzero"
											id="路径"
											points="24 0 0 0 0 24 24 24"
										></polygon>
										<polygon
											id="路径"
											points="22 7 12 2 2 7 2 17 12 22 22 17"
											stroke="#758CA3"
											stroke-linejoin="round"
											stroke-width="1.5"
										></polygon>
										<line
											id="路径"
											stroke="#758CA3"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											x1="2"
											x2="12"
											y1="7"
											y2="12"
										></line>
										<line
											id="路径"
											stroke="#758CA3"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											x1="12"
											x2="12"
											y1="22"
											y2="12"
										></line>
										<line
											id="路径"
											stroke="#758CA3"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											x1="22"
											x2="12"
											y1="7"
											y2="12"
										></line>
										<line
											id="路径"
											stroke="#758CA3"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											x1="17"
											x2="7"
											y1="4.5"
											y2="9.5"
										></line>
									</g>
								</g>
							</g>
						</g></svg
					>

					Top Products
				</button>
			{/if}
			{#if ((hasPrivilege(userRoles['Sales'], 'R') || hasPrivilege(userRoles['Order'], 'R')) && !hasPrivilege(userRoles['Finance'], 'U')) || userRoles['name'] == 'Higher Management'}
				<button
					type="button"
					onclick={() => {
						activeDashboard = 'Performance';
					}}
					class="flex gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeDashboard === 'Performance'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					<svg
						width="24px"
						height="24px"
						viewBox="0 0 24 24"
						version="1.1"
						xml:space="preserve"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						fill="#758CA3"
						stroke="#758CA3"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier">
							<style type="text/css">
								.st0 {
									opacity: 0.2;
									fill: none;
									stroke: #758ca3;
									stroke-width: 5e-2;
									stroke-miterlimit: 10;
								}
							</style> <g id="grid_system"></g>
							<g id="_icons">
								<path
									d="M10.3,3.1c-4.1,0.7-7.5,4-8.2,8.1C1.8,13.1,2,15,2.7,16.7c0,0,0,0,0,0c0,0,0,0,0,0c0,0.1,0.1,0.2,0.2,0.3c0,0,0,0,0.1,0.1 c0.1,0.1,0.1,0.1,0.2,0.2c0,0,0,0,0,0c0,0,0,0,0,0c0.1,0,0.2,0.1,0.3,0.1c0,0,0,0,0,0c0.1,0,0.3,0,0.4-0.1l3.6-1.5 c0.1-0.1,0.2-0.1,0.3-0.2c0,0,0-0.1,0.1-0.1c0-0.1,0.1-0.1,0.1-0.2c0,0,0-0.1,0-0.1c0-0.1,0-0.1,0-0.2c0-0.1,0-0.1,0-0.2 c0-0.1,0-0.1,0-0.2C8.1,14.1,8,13.7,8,13.3C8,10.9,9.8,9,12,9c1.1,0,2.1,0.4,2.8,1.2c0.8,0.8,1.2,1.9,1.2,3c0,0.4-0.1,0.8-0.2,1.2 c0,0.1,0,0.1,0,0.2c0,0.1,0,0.1,0,0.2c0,0.1,0,0.1,0,0.2c0,0,0,0.1,0,0.1c0,0.1,0.1,0.1,0.1,0.2c0,0,0,0.1,0.1,0.1 c0.1,0.1,0.2,0.2,0.3,0.2l3.6,1.5c0.1,0.1,0.3,0.1,0.4,0.1c0.1,0,0.2,0,0.3-0.1c0,0,0,0,0,0c0,0,0,0,0,0c0.1,0,0.2-0.1,0.2-0.2 c0,0,0,0,0.1-0.1c0.1-0.1,0.1-0.2,0.2-0.3c0,0,0,0,0,0c0,0,0,0,0,0c0.5-1.2,0.7-2.4,0.7-3.7c0-2.7-1-5.2-2.9-7.1 C16.8,3.6,13.5,2.6,10.3,3.1z M4.1,11.6C4.3,10.3,4.9,9.1,5.8,8l1.7,1.1C6.6,10.3,6,11.7,6,13.3c0,0.3,0,0.6,0.1,0.9l-1.3,0.6 L4.2,15C4,13.9,3.9,12.7,4.1,11.6z M9,7.8L7.2,6.6c1-0.7,2.2-1.3,3.4-1.5c2.2-0.4,4.4,0.2,6.2,1.5L15,7.8C14.1,7.3,13.1,7,12,7 C10.9,7,9.9,7.3,9,7.8z M19.8,15l-1.8-0.8c0-0.3,0.1-0.6,0.1-0.9c0-1.5-0.5-3-1.5-4.1L18.3,8c1.1,1.4,1.7,3.1,1.7,5 C20,13.7,19.9,14.3,19.8,15z"
								></path>
								<path
									d="M12,20c1.1,0,2-0.9,2-2c0-0.4-0.1-0.7-0.3-1l-0.4-2l-0.2-1c-0.1-0.3-0.1-0.7-0.2-1c0-0.5-0.4-0.9-0.9-0.9 c-0.6,0-1,0.4-1.1,0.9c0,0.3-0.1,0.7-0.2,1l-0.2,1l-0.4,2c-0.2,0.3-0.3,0.7-0.3,1C10,19.1,10.9,20,12,20z"
								></path>
							</g>
						</g></svg
					>
					Performance
				</button>
			{/if}

			{#if hasPrivilege(userRoles['Finance'], 'U') || userRoles['name'] == 'Higher Management'}
				<button
					type="button"
					onclick={() => {
						activeDashboard = 'Finance';
					}}
					class="flex gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeDashboard === 'Finance'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					<svg
						width="24px"
						height="24px"
						viewBox="0 0 64 64"
						id="Layer_1"
						version="1.1"
						xml:space="preserve"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						fill="#758CA3"
						stroke="#758CA3"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier">
							<style type="text/css">
								.st0 {
									fill: none;
									stroke: #758ca3;
									stroke-width: 2;
									stroke-miterlimit: 10;
								}
								.st1 {
									fill: none;
									stroke: #758ca3;
									stroke-width: 2;
									stroke-linecap: round;
									stroke-linejoin: round;
									stroke-miterlimit: 10;
								}
								.st2 {
									fill: none;
									stroke: #758ca3;
									stroke-width: 2;
									stroke-linecap: round;
									stroke-linejoin: round;
									stroke-miterlimit: 10;
									stroke-dasharray: 6, 5;
								}
							</style>
							<g>
								<path
									class="st1"
									d="M52,16c0,1.1-0.5,2.1-1.2,2.8C50.1,19.5,49.1,20,48,20h-2v-4H18v4h-2c-2.2,0-4-1.8-4-4c0-1.1,0.5-2.1,1.2-2.8 c0.7-0.7,1.7-1.2,2.8-1.2h32C50.2,12,52,13.8,52,16z"
								></path> <line class="st1" x1="48" x2="46" y1="16" y2="16"></line>
								<path class="st1" d="M46,16v36h-7c0-3.9-3.1-7-7-7s-7,3.1-7,7h-7V16H46z"></path>
								<line class="st1" x1="18" x2="16" y1="16" y2="16"></line>
							</g> <line class="st2" x1="18" x2="46" y1="36.8" y2="36.8"></line>
						</g></svg
					>
					Finance
				</button>
			{/if}
		</div>
	</div>
</div>
{#if activeDashboard === 'Sales'}
	<SalesDashboard />
{/if}
{#if activeDashboard === 'Product'}
	<ProductDashboard />
{/if}
{#if activeDashboard === 'Performance'}
	<EmployeeDashboard />
{/if}
{#if activeDashboard === 'Finance'}
	<FinanceDashboard />
{/if}
