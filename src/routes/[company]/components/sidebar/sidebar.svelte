<script>
	import { onMount } from 'svelte';
	import { roles } from '../../../../stores/roleStore.js';
	import { companyStore, getCompanyName } from '../../../../stores/companyStore.js';
	import { hasPrivilege } from '$lib/role.js';
	import { afterNavigate } from '$app/navigation';

	let { sidebarToggle, refreshPage } = $props();

	let activeLink = $state('');

	let userRoles = $state($roles);
	// Subscribe to the roles store
	let company = getCompanyName();

	let image = $state('');
	let name = $state('');

	function load() {
		image = company['logo'];
		name = getCompanyName();
		company = name;
		activeLink = `/${location.pathname.split('/')[location.pathname.split('/').length - 1]}`; // Track the active link based on the URL
	}
	onMount(() => {
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});
		load();

		afterNavigate(() => {
			load();
		});

		if (typeof window !== 'undefined') {
			window.addEventListener('click', function (e) {
				if (
					(document.getElementById('mysidebar') &&
						document.getElementById('mysidebar').contains(e.target)) ||
					(document.getElementById('myheader') &&
						document.getElementById('myheader').contains(e.target))
				) {
					// Clicked in box
				} else {
					if (window.innerWidth < 1024 && $sidebarToggle == true) {
						sidebarToggle.set(!$sidebarToggle);
					}
				}
			});
		}
	});

	function setActiveLink(link) {
		activeLink = link;
		// Use history.pushState to navigate without reloading the page
		if (typeof window !== 'undefined') {
			window.history.pushState({}, '', link);
		}

		refreshPage();
	}
</script>

{#key activeLink}
	<aside
		class="w-64 bg-white overflow-y-scroll dark:bg-[#22273c] border-r border-gray-100 dark:border-black transition-transform duration-300 ease-in-out h-screen"
		id="mysidebar"
	>
		<!-- SIDEBAR HEADER -->
		<div
			class="drawer-header sticky inset-x-0 top-0 z-50 flex items-center gap-2 pb-7 pt-2 bg-white dark:bg-[#22273c]"
		>
			<a href="/">
				<span class="logo">
					<img
						class="dark:hidden m-2 w-40 border-none"
						src="/images/bluespark_sfa_logo.png"
						alt="logo"
					/>
					<img
						class="hidden dark:block m-2 w-40 border-none"
						src="/images/bluespark_sfa_darkmode_logo.png"
						alt="Logo"
					/>
				</span>
			</a>
		</div>
		<!-- SIDEBAR HEADER -->

		<div class="flex flex-col overflow-x-hidden duration-300 ease-linear">
			<!-- Sidebar Menu -->
			<nav>
				<!-- Menu Group -->
				<div class="flex-1">
					<ul class="menu rounded-box w-60 gap-4 text-gray-700 dark:text-white font-medium">
						<!-- Dashboard navigation -->

						{#if hasPrivilege(userRoles['Sales'], 'R') || hasPrivilege(userRoles['Finance'], 'D') || hasPrivilege(userRoles['Order'], 'R')}
							<li>
								<a
									href="/{name}/dashboard"
									on:click={() => setActiveLink('/dashboard')}
									class={activeLink === '/dashboard'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/dashboard.svg" alt="Icon description" width="24" height="24" />
									<span>Dashboard</span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Sales'], 'U') || hasPrivilege(userRoles['Order'], 'U') || userRoles['name'] === 'Higher Management' || hasPrivilege([userRoles['Finance']], 'D')}
							<li>
								<a
									href="/{name}/kpi"
									on:click={() => setActiveLink('/kpi')}
									class={activeLink === `/kpi`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/performance.png" alt="Icon description" width="24" height="24" />
									<span>KPI</span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Route Schedule'], 'R') && !(userRoles['name'] === 'Higher Management')}
							<li>
								<a
									href="/{name}/route-schedule"
									on:click={() => setActiveLink('/route-schedule')}
									class={activeLink === '/route-schedule'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img
										src="/svgs/route-schedule.svg"
										alt="Icon description"
										width="24"
										height="24"
									/>
									<span>Visit Schedule</span>
								</a>
							</li>
						{/if}
						{#if hasPrivilege(userRoles['Order'], 'R') || hasPrivilege([userRoles['Visit'], userRoles['Sales']], 'R') && !hasPrivilege([userRoles['Finance']], 'D') }
							<li>
								<a
									href="/{name}/visit"
									on:click={() => setActiveLink('/visit')}
									class={activeLink === `/visit`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/travel.svg" alt="Icon description" width="24" height="24" />
									<span>Visit </span>
								</a>
							</li>
						{/if}
						

						{#if hasPrivilege(userRoles['Order'], 'R')}
							<li>
								<a
									href="/{name}/order"
									on:click={(event) => setActiveLink('/order')}
									class={activeLink === '/order'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/order.svg" alt="Icon description" width="24" height="24" />
									<span>Order </span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Sales'], 'R')}
							<li>
								<a
									href="/{name}/sales"
									on:click={() => setActiveLink('/sales')}
									class={activeLink === '/sales'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/sales.svg" alt="Icon description" width="24" height="24" />
									<span>Sales </span>
								</a>
							</li>
						{/if}
						{#if hasPrivilege([userRoles['Deposit'], userRoles['Finance']], 'R')}
							<li class="hover:bg-gray-200 dark:hover:bg-transparent">
								<a
									href="/{name}/finance/invoice"
									on:click={() => setActiveLink('/invoice')}
									class={activeLink === '/invoice'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img
										src="/svgs/invoice.svg"
										activeClass="text-blue-500"
										alt="Icon description"
										width="24"
										height="24"
									/>
									<span>Invoice</span>
								</a>
							</li>
							<li>
								<a
									href="/{name}/deposit"
									on:click={() => setActiveLink('/deposit')}
									class={activeLink === '/deposit'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/money2.png" alt="Icon description" width="24" height="24" />
									<span>Deposit </span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Sales'], 'D') ||hasPrivilege(userRoles['Finance'], 'D') || userRoles['name'] === 'Higher Management'}

							<li class="hover:bg-gray-200 dark:hover:bg-transparent">
								<a
									href="/{name}/credit-limit"
									on:click={() => setActiveLink('credit-limit')}
									class={activeLink === '/credit-limit'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img
										src="/svgs/finance.svg"
										activeClass="text-blue-500"
										alt="Icon description"
										width="24"
										height="24"
									/>
									<span>Credit Limit</span>
								</a>
							</li>
						{/if}
						
						{#if hasPrivilege(userRoles['Classification'], 'R')}
							<li>
								<a
									href="/{name}/classification"
									on:click={() => setActiveLink('/classification')}
									class={activeLink === '/classification'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img
										src="/svgs/classification.svg"
										alt="Icon description"
										width="24"
										height="24"
									/>
									<span>Loyalty Program</span>
								</a>
							</li>
						{/if}

						<!-- {#if hasPrivilege(userRoles['Sales'], 'D') || userRoles['name'] === 'Higher Management'}
							<li class="hover:bg-gray-200 dark:hover:bg-transparent">
								<a
									href="/{name}/credit-limit"
									on:click={() => setActiveLink('credit-limit')}
									class={activeLink === '/credit-limit'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img
										src="/svgs/finance.svg"
										activeClass="text-blue-500"
										alt="Icon description"
										width="24"
										height="24"
									/>
									<span>Credit Limit</span>
								</a>
							</li>
						{/if} -->


						{#if hasPrivilege(userRoles['Finance'], 'D')}
							<li class="hover:bg-gray-200 dark:hover:bg-transparent">
								<a
									href="/{name}/bank-account"
									on:click={() => setActiveLink('/bank-account')}
									class={activeLink === '/bank-account'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img
										src="/svgs/bank.svg"
										activeClass="text-blue-500"
										alt="Icon description"
										width="24"
										height="24"
									/>
									<span>Bank Accounts</span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Product'], 'R')}
							<li>
								<a
									href="/{name}/products"
									on:click={() => setActiveLink('/products')}
									class={activeLink === '/products'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/products.svg" alt="Icon description" width="24" height="24" />
									<span>Products </span>
								</a>
							</li>
							

							{#if hasPrivilege(userRoles['Product'], 'U') || userRoles['name'] === 'Higher Management' || hasPrivilege([userRoles['Finance']], 'D')}
								<li>
									<a
										href="/{name}/commission"
										on:click={() => setActiveLink('/commission"')}
										class={activeLink === '/commission"'
											? 'bg-[#286692] text-gray-100'
											: 'hover:bg-gray-200 dark:hover:bg-transparent'}>
										<img src="/svgs/marketing.png" alt="Icon description" width="24" height="24" />
										<span>Commission</span>
									</a>
								</li>
							{/if}

						{/if}

						{#if hasPrivilege(userRoles['Warehouse'], 'R') || hasPrivilege(userRoles['Inventory Management'], 'R') || hasPrivilege(userRoles['Procurement'], 'R')}
							<li class="px-1 hover:bg-gray-200 dark:hover:bg-transparent">
								<a
									href="/{name}/warehouse"
									on:click={() => setActiveLink('/warehouse')}
									class={activeLink === `/warehouse`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/warehouse.svg" alt="Icon description" width="16" height="16" />
									<span>Warehouse Management</span>
								</a>
							</li>
						{/if}
						{#if hasPrivilege(userRoles['Vehicle'], 'R') && hasPrivilege(userRoles['Finance'], 'D')}
							<li class="px-1 hover:bg-gray-200 dark:hover:bg-transparent">
								<a
									href="/{name}/vehicle"
									on:click={() => setActiveLink('/vehicle')}
									class={activeLink === `/vehicle`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/vehicle.svg" alt="Icon description" width="16" height="16" />
									<span>Vehicle Registration</span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Trade Marketing'], 'R')}
							<li>
								<a
									href="/{name}/trade-marketing/sales-activation"
									on:click={() => setActiveLink('/sales-activation')}
									class={activeLink === '/sales-activation'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/marketing.png" alt="Icon description" width="24" height="24" />
									<span>Sales Activation</span>
								</a>
							</li>
							<li>
								<a
									href="/{name}/trade-marketing/shelf-share"
									on:click={() => setActiveLink('/shelf-share')}
									class={activeLink === '/shelf-share'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/shelf-share.svg" alt="Icon description" width="24" height="24" />
									<span>Brand Metrics</span>
								</a>
							</li>
							<li>
								<a
									href="/{name}/trade-marketing/complaint"
									on:click={() => setActiveLink('/complaint')}
									class={activeLink === '/complaint'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/complaint.svg" alt="Icon description" width="24" height="24" />
									<span>Complaint</span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Address'], 'R')}
							<!-- Address module navigation -->
							<li>
								<a
									href="/{name}/address"
									on:click={(event) => setActiveLink('/address')}
									class={activeLink === '/address'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/address.svg" alt="Icon description" width="24" height="24" />
									<span>Address </span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Penetration'], 'R') && !(userRoles['name'] == 'Higher Management')}
							<li>
								<a
									href="/{name}/penetration"
									on:click={() => setActiveLink('/penetration')}
									class={activeLink === '/penetration'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/penetration.svg" alt="Icon description" width="24" height="24" />
									<span>Penetration </span>
								</a>
							</li>
						{/if}
						{#if hasPrivilege(userRoles['Point Of Sale'], 'R') && (hasPrivilege(userRoles['Sales'], 'D') || userRoles['name'] == 'Limited System Admin') && !(userRoles['name'] == 'Higher Management')}
							<li>
								<a
									href="/{name}/point-of-sale"
									on:click={() => setActiveLink('/point-of-sale')}
									class={activeLink === `/point-of-sale`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<svg
										fill="#758CA3"
										width="24px"
										height="24px"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										stroke="#758CA3"
										><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
											id="SVGRepo_tracerCarrier"
											stroke-linecap="round"
											stroke-linejoin="round"
										></g><g id="SVGRepo_iconCarrier"
											><path
												d="M21.026,6.105a3.1,3.1,0,0,1-2.365,3.848A3.031,3.031,0,0,1,15.1,7.222l-.042-.5A3.03,3.03,0,0,1,12.041,10h-.082A3.03,3.03,0,0,1,8.94,6.719l-.031.375a3.121,3.121,0,0,1-2.83,2.9A3.03,3.03,0,0,1,2.941,6.236l.87-3.479A1,1,0,0,1,4.781,2H19.219a1,1,0,0,1,.97.757ZM18.121,12A5.021,5.021,0,0,0,20,11.631V21a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V11.631a4.914,4.914,0,0,0,4.907-.683A5.131,5.131,0,0,0,12.042,12a5.027,5.027,0,0,0,3.051-1.052A4.977,4.977,0,0,0,18.121,12ZM14,17a2,2,0,0,0-4,0v3h4Z"
											></path></g
										></svg
									>
									<span>Point Of Sale </span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Penetration'], 'R') && userRoles['name'] == 'Higher Management'}
							<li>
								<a
									href="/{name}/penetration"
									on:click={() => setActiveLink('/penetration')}
									class={activeLink === '/penetration'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/penetration.svg" alt="Icon description" width="24" height="24" />
									<span>Penetration </span>
								</a>
							</li>
						{/if}
						{#if hasPrivilege(userRoles['Point Of Sale'], 'R') && userRoles['name'] == 'Higher Management'}
							<li>
								<a
									href="/{name}/point-of-sale"
									on:click={() => setActiveLink('/point-of-sale')}
									class={activeLink === `/point-of-sale`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<svg
										fill="#758CA3"
										width="24px"
										height="24px"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										stroke="#758CA3"
										><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
											id="SVGRepo_tracerCarrier"
											stroke-linecap="round"
											stroke-linejoin="round"
										></g><g id="SVGRepo_iconCarrier"
											><path
												d="M21.026,6.105a3.1,3.1,0,0,1-2.365,3.848A3.031,3.031,0,0,1,15.1,7.222l-.042-.5A3.03,3.03,0,0,1,12.041,10h-.082A3.03,3.03,0,0,1,8.94,6.719l-.031.375a3.121,3.121,0,0,1-2.83,2.9A3.03,3.03,0,0,1,2.941,6.236l.87-3.479A1,1,0,0,1,4.781,2H19.219a1,1,0,0,1,.97.757ZM18.121,12A5.021,5.021,0,0,0,20,11.631V21a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V11.631a4.914,4.914,0,0,0,4.907-.683A5.131,5.131,0,0,0,12.042,12a5.027,5.027,0,0,0,3.051-1.052A4.977,4.977,0,0,0,18.121,12ZM14,17a2,2,0,0,0-4,0v3h4Z"
											></path></g
										></svg
									>
									<span>Point Of Sale </span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Point Of Sale'], 'R') && !(userRoles['name'] == 'Higher Management') && hasPrivilege(userRoles['Sales'], 'R') && !hasPrivilege(userRoles['Sales'], 'D')}
							<li>
								<a
									href="/{name}/point-of-sale"
									on:click={() => setActiveLink('/point-of-sale')}
									class={activeLink === `/point-of-sale`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<svg
										fill="#758CA3"
										width="24px"
										height="24px"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										stroke="#758CA3"
										><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
											id="SVGRepo_tracerCarrier"
											stroke-linecap="round"
											stroke-linejoin="round"
										></g><g id="SVGRepo_iconCarrier"
											><path
												d="M21.026,6.105a3.1,3.1,0,0,1-2.365,3.848A3.031,3.031,0,0,1,15.1,7.222l-.042-.5A3.03,3.03,0,0,1,12.041,10h-.082A3.03,3.03,0,0,1,8.94,6.719l-.031.375a3.121,3.121,0,0,1-2.83,2.9A3.03,3.03,0,0,1,2.941,6.236l.87-3.479A1,1,0,0,1,4.781,2H19.219a1,1,0,0,1,.97.757ZM18.121,12A5.021,5.021,0,0,0,20,11.631V21a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V11.631a4.914,4.914,0,0,0,4.907-.683A5.131,5.131,0,0,0,12.042,12a5.027,5.027,0,0,0,3.051-1.052A4.977,4.977,0,0,0,18.121,12ZM14,17a2,2,0,0,0-4,0v3h4Z"
											></path></g
										></svg
									>
									<span>Point Of Sale </span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Route'], 'R') || hasPrivilege(userRoles['Sales'], 'R')}
							<li>
								<a
									href="/{name}/route"
									on:click={() => setActiveLink('/route')}
									class={activeLink === '/route'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/route.svg" alt="Icon description" width="24" height="24" />
									<span>Route </span>
								</a>
							</li>
						{/if}
						{#if hasPrivilege(userRoles['Territory'], 'R') || hasPrivilege(userRoles['Sales'], 'R')}
							<li>
								<a
									href="/{name}/territory"
									on:click={() => setActiveLink('/territory')}
									class={activeLink === `/territory`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/territory.svg" alt="Icon description" width="24" height="24" />
									<span>Territory </span>
								</a>
							</li>
							<li>
								<a
									href="/{name}/regions"
									on:click={() => setActiveLink('/regions')}
									class={activeLink === `/regions`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/region.svg" alt="Icon description" width="24" height="24" />
									<span>Demarcation </span>
								</a>
							</li>
						{/if}

						{#if !hasPrivilege(userRoles['Order'], 'R') }
							{#if hasPrivilege([userRoles['Visit'], userRoles['Sales'], userRoles['Trade Marketing']], 'R') && !hasPrivilege([userRoles['Finance']], 'R') && !hasPrivilege([userRoles['Sales']], 'D')}
								<li>
									<a
										href="/{name}/warehouse-stop"
										on:click={() => setActiveLink('/warehouse-stop')}
										class={activeLink === `/warehouse-stop`
											? 'bg-[#286692] text-gray-100'
											: 'hover:bg-gray-200 dark:hover:bg-transparent'}
									>
										<img src="/svgs/warehouse.svg" alt="Icon description" width="24" height="24" />
										<span>Warehouse Requests</span>
									</a>
								</li>
							{/if}
							{#if hasPrivilege([userRoles['Visit'], userRoles['Sales'], userRoles['Trade Marketing']], 'R') && !hasPrivilege([userRoles['Finance']], 'R')}
								<li class="px-1 hover:bg-gray-200 dark:hover:bg-transparent">
									<a
										href="/{name}/virtual-stock"
										on:click={() => setActiveLink('/virtual-stock')}
										class={activeLink === `/virtual-stock`
											? 'bg-[#286692] text-gray-100'
											: 'hover:bg-gray-200 dark:hover:bg-transparent'}
									>
										<svg
											width="24px"
											height="24px"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											stroke="#758CA3"
											><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											></g><g id="SVGRepo_iconCarrier">
												<path
													d="M3 5.25C3 4.00736 4.00736 3 5.25 3H18.75C19.9926 3 21 4.00736 21 5.25V18.75C21 19.1642 20.6642 19.5 20.25 19.5H19.25V11.25C19.25 11.1406 19.238 11.0314 19.2143 10.9246L18.4753 7.59921C18.1703 6.2266 16.9528 5.25 15.5467 5.25H8.45326C7.04716 5.25 5.82972 6.2266 5.5247 7.59921L4.78572 10.9246C4.76198 11.0314 4.75 11.1406 4.75 11.25V19.5H3.75C3.33579 19.5 3 19.1642 3 18.75V5.25Z"
													fill="#ffffff"
												></path>
												<path
													d="M8.45326 6C7.39869 6 6.48561 6.73245 6.25684 7.76191L5.51786 11.0873C5.50599 11.1407 5.5 11.1953 5.5 11.25V20.25C5.5 21.2165 6.2835 22 7.25 22H8.75C9.7165 22 10.5 21.2165 10.5 20.25V19.5H13.5V20.25C13.5 21.2165 14.2835 22 15.25 22H16.75C17.7165 22 18.5 21.2165 18.5 20.25V11.25C18.5 11.1953 18.494 11.1407 18.4821 11.0873L17.7432 7.76191C17.5144 6.73245 16.6013 6 15.5467 6H8.45326ZM7.72112 8.0873C7.79737 7.74415 8.10173 7.5 8.45326 7.5H15.5467C15.8983 7.5 16.2026 7.74415 16.2789 8.0873L16.815 10.5H7.18496L7.72112 8.0873ZM7 20.25V19.5H9V20.25C9 20.3881 8.88807 20.5 8.75 20.5H7.25C7.11193 20.5 7 20.3881 7 20.25ZM17 19.5V20.25C17 20.3881 16.8881 20.5 16.75 20.5H15.25C15.1119 20.5 15 20.3881 15 20.25V19.5H17ZM10.75 16.5H13.25C13.6642 16.5 14 16.8358 14 17.25C14 17.6642 13.6642 18 13.25 18H10.75C10.3358 18 10 17.6642 10 17.25C10 16.8358 10.3358 16.5 10.75 16.5ZM10.0054 14C10.0054 14.5523 9.55766 15 9.00537 15C8.45309 15 8.00537 14.5523 8.00537 14C8.00537 13.4477 8.45309 13 9.00537 13C9.55766 13 10.0054 13.4477 10.0054 14ZM14.9998 15C14.4475 15 13.9998 14.5523 13.9998 14C13.9998 13.4477 14.4475 13 14.9998 13C15.552 13 15.9998 13.4477 15.9998 14C15.9998 14.5523 15.552 15 14.9998 15Z"
													fill="#ffffff"
												></path>
											</g></svg
										>
										<span>Vstock</span>
									</a>
								</li>
							{/if}
						{/if}
						{#if hasPrivilege(userRoles['Vehicle'], 'R') && !hasPrivilege(userRoles['Finance'], 'D')}
							<li class="px-1 hover:bg-gray-200 dark:hover:bg-transparent">
								<a
									href="/{name}/vehicle"
									on:click={() => setActiveLink('/vehicle')}
									class={activeLink === `/vehicle`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/vehicle.svg" alt="Icon description" width="16" height="16" />
									<span>Vehicle Registration</span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Category'], 'C')}
							<li>
								<a
									href="/{name}/categories"
									on:click={() => setActiveLink('/categories')}
									class={activeLink === '/categories'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/category.svg" alt="Icon description" width="24" height="24" />
									<span>Categories </span>
								</a>
							</li>
						{/if}

						<!-- {#if hasPrivilege([userRoles["Deposit"], userRoles["Finance"]], "R")} -->

						<!-- {/if} -->

						{#if hasPrivilege(userRoles['Inheritance'], 'R')}
							<li>
								<a
									href="/{name}/inheritance"
									on:click={() => setActiveLink('/inheritance')}
									class={activeLink === '/inheritance'
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/inheritance.svg" alt="Icon description" width="24" height="24" />
									<span>Inheritance Group</span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Warehouse'], 'R') && !(userRoles['name'] == 'Higher Management')}
							<li>
								<a
									href="/{name}/warehouse-group"
									on:click={() => setActiveLink('/warehouse-group')}
									class={activeLink === `/warehouse-group`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/user-role.svg" alt="Icon description" width="24" height="24" />
									<span>Warehouse Group </span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Organization'], 'R')}
							<li>
								<a
									href="/{name}/organization"
									on:click={() => setActiveLink(`/organization`)}
									class={activeLink === `/organization`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/organization.svg" alt="Icon description" width="24" height="24" />
									<span>Organization </span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege([userRoles['Administrative'], userRoles['Service Provider']], 'R')}
							<li>
								<details open class="dropdown">
									<summary>
										<img src="/svgs/user-role.svg" alt="Icon description" width="24" height="24" />

										<h3>User Management</h3>
									</summary>
									<ul>
										<li>
											<a
												href="/{name}/users"
												on:click={() => setActiveLink('/users')}
												class={activeLink === `/users`
													? 'bg-[#286692] text-gray-100'
													: 'hover:bg-gray-200 dark:hover:bg-transparent'}
											>
												<img src="/svgs/users.svg" alt="Icon description" width="24" height="24" />
												<span>Users </span>
											</a>
										</li>

										{#if hasPrivilege([userRoles['Administrative'], userRoles['Service Provider']], 'R')}
											<li>
												<a
													href="/{name}/role"
													on:click={() => setActiveLink('/role')}
													class={activeLink === `/role`
														? 'bg-[#286692] text-gray-100'
														: 'hover:bg-gray-200 dark:hover:bg-transparent'}
												>
													<img
														src="/svgs/user-role.svg"
														alt="Icon description"
														width="24"
														height="24"
													/>
													<span>Role </span>
												</a>
											</li>
											<li>
												<a
													href="/{name}/scope"
													on:click={() => setActiveLink('/scope')}
													class={activeLink === `/scope`
														? 'bg-[#286692] text-gray-100'
														: 'hover:bg-gray-200 dark:hover:bg-transparent'}
												>
													<img
														src="/svgs/user-role.svg"
														alt="Icon description"
														width="24"
														height="24"
													/>
													<span
														>{company == 'provider' ? 'Tenant Scope' : 'Organization Scope'}</span
													>
												</a>
											</li>
											{#if !hasPrivilege([userRoles['Tenant Management'], userRoles['Service Provider']], 'R')}
												<li>
													<a
														href="/{name}/office-information"
														on:click={() => setActiveLink('/office-information')}
														class={activeLink === `/office-information`
															? 'bg-[#286692] text-gray-100'
															: 'hover:bg-gray-200 dark:hover:bg-transparent'}
													>
														<img src="/svgs/office-information.svg" alt="Icon description" width="20" height="20" />
														<span>Office Information</span>
													</a>
												</li>
												<li>
													<a
														href="/{name}/approval-group"
														on:click={() => setActiveLink('/approval-group')}
														class={activeLink === `/approval-group`
															? 'bg-[#286692] text-gray-100'
															: 'hover:bg-gray-200 dark:hover:bg-transparent'}
													>
														<img src="/svgs/approved.svg" alt="Icon description" width="24" height="24" />
														<span>Approval Group</span>
													</a>
												</li>
												<li>
													<a
														href="/{name}/target-setters"
														on:click={() => setActiveLink('/target-setters')}
														class={activeLink === `/target-setters`
															? 'bg-[#286692] text-gray-100'
															: 'hover:bg-gray-200 dark:hover:bg-transparent'}
													>
														<img src="/svgs/setters.svg" alt="Icon description" width="24" height="24" />
														<span>Performance Scope</span>
													</a>
												</li>
												<li>
													<a
														href="/{name}/global-access"
														on:click={() => setActiveLink('/global-access')}
														class={activeLink === `/global-access`
															? 'bg-[#286692] text-gray-100'
															: 'hover:bg-gray-200 dark:hover:bg-transparent'}
													>
														<img src="/svgs/global-access.svg" alt="Icon description" width="24" height="24" />
														<span>Users Scope</span>
													</a>
												</li>
												<li>
													<a
														href="/{name}/vstock-permission"
														on:click={() => setActiveLink('/vstock-permission')}
														class={activeLink === `/vstock-permission`
															? 'bg-[#286692] text-gray-100'
															: 'hover:bg-gray-200 dark:hover:bg-transparent'}
													>
														<img src="/svgs/warehouse.svg" alt="Icon description" width="24" height="24" />
														<span>VStock Permission</span>
													</a>
												</li>
											{/if}
										{/if}
									</ul>
								</details>
							</li>
						{/if}

						{#if hasPrivilege(userRoles['Administrative'], 'R') && (!hasPrivilege(userRoles['Tenant Management'], 'R') && !hasPrivilege(userRoles['Service Provider'], 'R'))}
							<li>
								<a
									href="/{name}/mor-integration"
									on:click={() => setActiveLink(`/mor-integration`)}
									class={activeLink === `/mor-integration`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/mor.svg" alt="Icon description" width="24" height="24" />
									<span>MoR Integration</span>
								</a>
							</li>
						{/if}

						{#if hasPrivilege([userRoles['Service Provider'], userRoles['Tenant Management']], 'R')}
							<li>
								<a
									href="/{name}/service-provider"
									on:click={() => setActiveLink('/service-provider')}
									class={activeLink === `/service-provider`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/admin.svg" alt="Icon description" width="24" height="24" />
									<span>Tenant management</span>
								</a>
							</li>
							<li>
								<a
									href="/{name}/subscription"
									on:click={() => setActiveLink('/subscription')}
									class={activeLink === `/subscription`
										? 'bg-[#286692] text-gray-100'
										: 'hover:bg-gray-200 dark:hover:bg-transparent'}
								>
									<img src="/svgs/subscription.png" alt="Icon descriptipayment Subscribe iconon" width="24" height="24" />
									<span>Subscription</span>
								</a>
							</li>
						{/if}



					</ul>
				</div>
			</nav>
			<!-- Sidebar Menu -->
		</div>
	</aside>
{/key}
