<script lang="ts">
	import { setTokens, getAccessToken } from '../../../../stores/tokenStore.js';
	import { onMount, onDestroy } from 'svelte';
	import { login, login_superadmin } from '../../../../apis/api-utils.js';
	import { companyStore, getCompanyName, companyName } from '../../../../stores/companyStore.js';
	import { goto } from '$app/navigation';
	import { host, host_super } from '../../../../apis/config.js';
	import { fetchForm, updateForm } from '../../../../apis/form.js';
	import { Eye, EyeOff } from 'lucide-svelte';
	import ErrorMessage from '$lib/message/errorMessage.svelte';
	import { error } from '@sveltejs/kit';
	import { fetchTenant } from '../../../../apis/get-my-tenant';
	import { fetchRoles } from '../../../../stores/roleStore.js';
	import Modal from '$lib/modals/createForm.svelte';
	import { addForm } from '../../../../apis/form.js';
	import SuccessMessage from '$lib/message/successMessage.svelte';

	import { get } from 'svelte/store';

	let changePasswordForm;
	let changePasswordEndpoint;

	let changePasswordModalVisible = $state(false);

	let { isSuperAdmin } = $props();
	if (isSuperAdmin === true) {
		changePasswordForm = `${host_super}provider/password-form`;
		changePasswordEndpoint = `${host_super}provider/change-password`;
	} else {
		changePasswordForm = `${host}account/password-form`;
		changePasswordEndpoint = `${host}account/change-password`;
	}

	let dialog;
	let username = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let tempToken = $state('');
	let request_deletion_endpoint = $state(null);
	let isNotify = $state(false); // Added state to track if the error is just a notification

	const get_company_url = `${host}organization/get-my-organization/`;

	let company = $companyStore;
	let company_name = getCompanyName();

	let userRoles = '';

	let current_module = $state('');
	let module_path = {
		Sales: 'sales',
		'Service Provider': 'service-provider',
		'Tenant Management': 'service-provider',
		Administrative: 'users',
		Address: 'address',
		Category: 'categories',
		Classification: 'classification',
		Dashboard: 'dashboard',
		Deposit: 'deposit',
		Finance: 'deposit',
		Product: 'products',
		Penetration: 'penetration',
		Inheritance: 'inheritance',
		'Inventory Management': 'warehouse',
		Order: 'order',
		Organization: 'organization',
		Stock: 'warehouse',
		'Scope Group': 'scope',
		Role: 'role',
		Route: 'route',
		'Route Schedule': 'route-schedule',
		'Trade Marketing': 'trade-marketing/shelf-share',
		Territory: 'territory',
		'Point Of Sale': 'point-of-sale',
		Users: 'users',
		Visit: 'visit',
		Vehicle: 'vehicle',
		Warehouse: 'warehouse',
		'Warehouse-stop': 'visit',
		Procurement: 'warehouse'
	};

	// Use the $ store subscription to reactively get the token values
	async function load() {
		let access_token = getAccessToken();

		company_name = getCompanyName();

		if (!access_token) {
			return;
		}

		if (access_token) {
			let userRoles = await fetchRoles(`${host}role/my-role`, access_token);

			if (userRoles.succeed) {
				userRoles = userRoles.data;
			}

			let viewPermissionIndex = Object.values(userRoles).indexOf('view');
			let editPermissionIndex = Object.values(userRoles).indexOf('edit');
			let contibutePermissionIndex = Object.values(userRoles).indexOf('contribute');
			let managePermissionIndex = Object.values(userRoles).indexOf('manage');

			let roleIndex;
			current_module = undefined;
			if (userRoles['Dashboard'] !== undefined) {
				current_module = module_path['Dashboard'];
			} else {
				for (let x = 2; x < Object.keys(userRoles).length; x += 1) {
					if (
						x == viewPermissionIndex ||
						x == editPermissionIndex ||
						x == contibutePermissionIndex ||
						x == managePermissionIndex
					) {
						roleIndex = x;

						current_module = module_path[Object.keys(userRoles)[roleIndex]];

						break;
					}
				}
			}
		}

		if (current_module == undefined) {
			return;
		}

		try {
			if (company_name && company_name !== '' && company_name !== 'provider') {
				fetchTenant(company_name);
			}
		} catch (error) {}
		if (
			company_name &&
			company_name !== 'signup' &&
			company_name !== 'signin' &&
			company_name !== 'provider'
		) {
			if (access_token) {
				goto(`/${company_name}/${current_module}`);
			} else {
				goto(`/${company_name}/signin`);
			}
		} else if (company_name !== '' && company_name !== 'provider') {
			if (access_token) {
				goto(`/${company_name}/${current_module}`);
			} else if (company_name !== 'provider') {
				goto(`/${company_name}/signin`);
			} else {
				goto(`/signin`);
			}
		} else {
			const check_url = `${host_super}has-superadmin`;
			const isRegistered = await fetchForm(check_url, '');

			if (access_token) {
				goto(`/provider/${current_module}`);
			} else if (!isRegistered) {
				goto(`/signup`);
			}
		}
	}
	onMount(async () => {
		
		const urlParams = new URLSearchParams(window.location.search);
		request_deletion_endpoint = urlParams.get('request_endpoint');
		load();
	});

	// async function handleRequestDeletion() {
	// 	try {
			
	// 	} catch (error) {
			
	// 	} finally {
	// 		successMessage = '';
	// 		errorMessage = '';
	// 	}
	// }

	const handleLogin = async () => {
		try {
			errorMessage = '';
			isNotify = false; // Reset notification flag on new attempt
			const { access_token, refresh_token } = isSuperAdmin
				? await login_superadmin(username, password)
				: await login(username, password);

			if (access_token) {
				if (request_deletion_endpoint != null) {
					
					const request_message = await updateForm(request_deletion_endpoint, null, access_token);
					const request_message_data = await request_message.json();

					if (request_message_data.ok) {
						successMessage = request_message.error;
						errorMessage = '';
						console.log('Request Confirmed!');
						request_deletion_endpoint = null;
					} else {
						successMessage = '';
						errorMessage = request_message.error;
					}
				}

				setTokens(access_token, refresh_token);
				username = '';
				password = '';
				errorMessage = '';
				const company = await fetchForm(get_company_url, access_token);

				companyStore.set(company);

				if (company.hash) {
					companyName.set(company.hash);
				} else {
				}

				window.location.reload();
			}
		} catch (error) {
			const error_msg = JSON.parse(error.message);

			if (error_msg.changePassword) {
				successMessage = '';
				errorMessage = 'Password Change Required';
				isNotify = true; // Flag this as a generic notification, not a red error
				tempToken = error_msg.message;
				changePasswordModalVisible = true;
			} else {
				errorMessage = error_msg.message;
				successMessage = '';
				isNotify = false; // Standard red error
			}
		}
	};

	let activeSlide = $state(1);
	let interval: number;
	let slides = [
		{
			icon: '/landingPage/Street_map.png',
			title: 'Welcome to BlueSpark Sales Force Automation',
			content: 'A Sales Force Automation App to enhance your sales productivity.'
		},
		{
			icon: '/landingPage/Salesprocess.png',
			title: 'Sales Process/Activity Management',
			content:
				'Streamline your sales process and activities to increase efficiency and close rates.'
		},
		{
			icon: '/landingPage/ethiopia.png',
			title: 'Sales Territory Management',
			content:
				'Optimize sales territories and manage your team effictively with our automation tool'
		},
		{
			icon: '/landingPage/poss.png',
			title: 'Point-of-sale Management',
			content: 'Manage your POS system and track performance with real-time data to improve sales.'
		},
		{
			icon: '/landingPage/productmanagement.png',
			title: 'Product and Knowledge Management',
			content:
				"Centralize product information and enhance your team's product knowledge for better sales results."
		},
		{
			icon: '/landingPage/trademarketing.png',
			title: 'Trade Marketing Management',
			content:
				'Enhnace trade marketing efforts and measure ROI to boost brand visibility and sales.'
		},
		{
			icon: '/landingPage/getstarted.png',
			title: 'Get Started',
			content: "You're all set to streamline your sales process."
		}
	];

	function nextSlide() {
		activeSlide = activeSlide < slides.length ? activeSlide + 1 : 1;
	}

	onMount(() => {
		interval = setInterval(nextSlide, 3000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	function setSlide(index: number) {
		activeSlide = index;
		clearInterval(interval);
		interval = setInterval(nextSlide, 5000);
	}

	async function handleSubmit(action, form_submit_data) {
		let result = await addForm(changePasswordEndpoint, form_submit_data, tempToken);

		if (result.succeed) {
			successMessage = 'Password changed successfully';
			errorMessage = ''; // Clear out the notification message on success
			isNotify = false;
			changePasswordModalVisible = false;
		} else {
			errorMessage = result.error;
			isNotify = false;
		}
		return result;
	}
</script>

<main>
	{#if changePasswordModalVisible}
		<Modal
			table_name={'Password'}
			token={tempToken}
			get_form_endpoint={changePasswordForm}
			action_type={'Change'}
			bind:showFormModal={changePasswordModalVisible}
			callback={handleSubmit}
			handleOnChange={() => {}}
			closeAfterSubmit={true}
			form_override={{ password: password }}
		/>
	{/if}
	<dialog
		bind:this={dialog}
		onclick={(e) => {
			if (e.target === dialog) dialog.close();
		}}
		class="bg-[#002a47] text-gray-200 text-lg p-6 rounded-lg backdrop-blur-xl"
	>
		{#if username != ''}
			<h1>A password reset link has been sent to your email</h1>
		{:else}
			<h1>Please enter your username</h1>
		{/if}
	</dialog>

	<!-- The button to open modal -->
	<!-- Put this part before </body> tag -->
	<input type="checkbox" id="my_modal_6" class="modal-toggle" />
	<div class="modal bg-[#002a47]" role="dialog">
		<div class="modal-box bg-[#002a47]">
			<h3 class="text-lg font-bold">Forgot Password</h3>
			{#if username != ''}
				<p class="py-4">A password reset link has been sent to your email</p>
			{:else}
				<p class="py-4">Please enter your username</p>
			{/if}
			<div class="modal-action">
				<label
					for="my_modal_6"
					class="btn py-2 px-4 rounded-md shadow-sm font-bold text-[#1a1a1a] bg-[#d3d3d3] hover:text-[#ffffff] hover:bg-[#3497d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
					>Close!</label
				>
			</div>
		</div>
	</div>

	<div class="min-h-screen flex flex-col bg-white">
		<header class="bg-[#f2f2f2] px-10 tracking-wide">
			<div class="flex gap-8">
				<div class="lg:flex lg:items-center">
					<img class="w-40 mb-2 border-none" src="/images/BlueSpark.png" alt="BlueSpark" />
				</div>
			</div>
		</header>

		<div class="flex-grow lg:grid grid-cols-2 bg-white h-full overflow-auto self-center w-full">
			<div class="lg:flex self-center">
				<div class="relative w-full">
					<div class="p-10">
						{#each slides as slide, index (index)}
							{#if activeSlide === index + 1}
								<div class="p-2 text-[#1a1a1a] text-center rounded-lg">
									<img src={slide.icon} alt="slide Icons" class="slide-icon mx-auto" />
									<div class="w-full lg:w-4/5 mx-auto">
										<h1 class="mt-10 text-3xl lg:text-4xl font-bold text-[#1c467e]">
											{slide.title}
										</h1>
									</div>

									<div class="w-5/6 my-10 mx-auto">
										<h3 class="text-[#4a4a4a]">
											{slide.content}
										</h3>
									</div>
								</div>
							{/if}
						{/each}
					</div>

					<div class="absolute bottom-4 w-full grid justify-center">
						<div class="px-6">
							{#each slides as slide, index (index)}
								<button
									class="w-4 h-2 mt-4 mx-2 mb-0 rounded-full transition-all duration-300 ease-out"
									aria-label="carousal slide"
									class:bg-[#2a4c6b]={activeSlide === index + 1}
									class:bg-[#c8d9e6]={activeSlide !== index + 1}
									class:w-8={activeSlide === index + 1}
									onclick={() => setSlide(index + 1)}
								></button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Login Form -->
			<div class="flex justify-center self-center text-[#1a1a1a] m-2">
				<div class="bg-[#1c467e] shadow-2xl w-full max-w-md rounded-xl mx-auto p-8">
					<h2
						class="text-xl lg:text-3xl font-bold text-[#ffffff] mb-4 flex justify-between items-center"
					>
						Sign In
						<img
							src={!isSuperAdmin && $companyStore ? $companyStore.logo : '/images/BlueSpark2.png'}
							alt=""
							class="w-32"
						/>
					</h2>

					<form onsubmit={handleLogin} class="text-sm lg:text-base">
						<div class="mb-8">
							<label for="username" class="block text-[#ffffff]">Username</label>
							<input
								id="username"
								type="text"
								bind:value={username}
								required
								placeholder="User12"
								class="bg-white mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-300 focus:border-blue-300 sm:text-sm"
							/>
						</div>

						<div class="mb-6 relative">
							<label for="password" class="block text-white">Password</label>
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								required
								placeholder="••••••••"
								class="bg-white mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-300 focus:border-blue-300 sm:text-sm"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3 top-10 text-gray-500"
								tabindex="-1"
							>
								{#if showPassword}
									<EyeOff size={20} />
								{:else}
									<Eye size={20} />
								{/if}
							</button>
							<div class="mt-4">
								<label
									for="my_modal_6"
									onclick={() => {
										fetch(host + 'send-otp?username=' + username, { method: 'POST' });
									}}
									class="font-medium text-gray-100 hover:text-blue-400">Forgot your password?</label
								>
							</div>
						</div>
						<div class="flex justify-center">
							<button
								type="submit"
								class="py-2 px-4 rounded-md shadow-sm font-bold text-[#1a1a1a] bg-[#d3d3d3] hover:text-[#ffffff] hover:bg-[#3497d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
							>
								Log In
							</button>
						</div>
					</form>

					<!-- Passes the new props down to standard component -->
					{#if errorMessage && errorMessage !== '' && successMessage === ''}
						<ErrorMessage
							message={errorMessage}
							{isNotify}
							icon={isNotify ? '/svgs/alert.svg' : null}
						/>
					{/if}
					{#if successMessage !== ''}
						<SuccessMessage message={successMessage} />
					{/if}
				</div>
			</div>
		</div>
	</div>

	<footer class="bg-[#f5f5f0] pt-2 pb-2 px-10 tracking-wide">
		<div class="flex gap-8">
			<img class="w-24 h-auto" src="/images/BlueSpark.png" alt="BlueSpark" />
			<p class="text-[#1a1a1a] text-xs self-center grow text-center">
				© 2025 BlueSpark Business Technology, Inc.
			</p>
		</div>
	</footer>
</main>

<style global lang="postcss">
	.slide-icon {
		width: auto;
		height: 220px;
		margin-bottom: 5px;
	}
</style>
