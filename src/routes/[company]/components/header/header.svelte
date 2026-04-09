<script>
	import { onMount } from 'svelte';
	import FilterButton from '../buttons/filter-button.svelte';
	import { themeStore } from '../../../../stores/themeStore';
	import { goto } from '$app/navigation';
	import { logout } from '../../../../stores/tokenStore';
	import {
		companyStore,
		companyName as cName,
		getCompanyName
	} from '../../../../stores/companyStore';
	import { fetchCurrentUser } from '../../../../apis/get-my-user';
	import { currentUser } from '../../../../stores/currentUser';
	import Modal from '$lib/modals/createForm.svelte';
	import { getAccessToken, setTokens } from '../../../../stores/tokenStore';
	import { host_super, host } from '../../../../apis/config';
	import { addForm } from '../../../../apis/form.js';

	// const changePasswordForm = `${host_super}password-form`;
	// const changePasswordEndpoint = `${host_super}change-password`;

	let changePasswordForm;
	let changePasswordEndpoint;

	let changePasswordModalVisible = false;

	export let isSuperAdmin;
	if (isSuperAdmin === true) {
		changePasswordForm = `${host_super}provider/password-form`;
		changePasswordEndpoint = `${host_super}provider/change-password`;
	} else {
		changePasswordForm = `${host}account/password-form`;
		changePasswordEndpoint = `${host}account/change-password`;
	}

	// Reactive variables
	import { getContext } from 'svelte';
	const sidebarToggle = getContext('message-context');
	let openDropDown = false;
	let dropdownOpen = false; // Controls the dropdown open/close state
	let notificationdropdownOpen = false;
	// user information variables
	let user_name = '';
	let user_email = '';
	let user_phone_number = '';
	let companyName = '';
	let company_code = '';
	let token = getAccessToken();
	let action_type = '';

	function toggleDropDown() {
		openDropDown = !openDropDown;
	}

	function toggleNotificationDropDown() {
		notificationdropdownOpen = !notificationdropdownOpen;
	}

	let notifying = true;

	const toggleDropdown = () => {
		dropdownOpen = !dropdownOpen;
	};

	const toggleNotificationDropdown = () => {
		notificationdropdownOpen = !notificationdropdownOpen;
		notifying = false;
	};

	// Reactive variable for dark mode state
	let darkMode = false;

	// Function to toggle dark mode
	function toggleDarkMode() {
		darkMode = !darkMode;
		if (darkMode) {
			themeStore.set('dark');
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			themeStore.set('light');
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	// Check and apply theme from local storage on mount
	onMount(() => {
		const user = fetchCurrentUser();
		try {
			companyName = $companyStore.organization;
			company_code = getCompanyName();
		} catch {
			handleSignOut();
		}
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme === 'dark') {
			darkMode = true;
			document.documentElement.classList.add('dark');
			themeStore.set('dark');
		}
	});

	export function handleSignOut() {
		setTokens(null, null);

		if (company_code !== 'provider') {
			goto(`/${company_code}/signin`);
		} else {
			goto('/signin'); // Redirect to the signin page
		}
	}

	async function handleSubmit(action, form_submit_data) {
		let result = await addForm(changePasswordEndpoint, form_submit_data, token);

		return result;
	}
</script>

{#if changePasswordModalVisible}
	<Modal
		table_name={'Password'}
		{token}
		get_form_endpoint={changePasswordForm}
		action_type={'Change'}
		showFormModal={changePasswordModalVisible}
		callback={handleSubmit}
		handleOnChange={() => {}}
		closeAfterSubmit={true}
	/>
{/if}

<header
	class="justify-between shadow-md bg-white dark:bg-[#22273c] border-b border-gray-200 dark:border-[#1f2937] sm:h-14 md:h-16 lg:h-16 sticky inset-x-0 top-0 z-50"
	id="myheader"
>
	<div class="flex grow items-center justify-between flex-row lg:px-6">
		<div
			class="flex w-screen items-center gap-2 border-b border-gray-200 px-3 py-1 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-2 dark:border-gray-800"
		>
			<!-- Hamburger Toggle BTN -->
			<button
				class="drawer-content flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-500 lg:h-11 lg:w-11 lg:border dark:border-none dark:text-gray-100"
				on:click={() => {
					sidebarToggle.set(!$sidebarToggle);
				}}
			>
				<!-- Hamburger Icon -->
				<svg
					class="fill-current lg:block"
					width="16"
					height="12"
					viewBox="0 0 16 12"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
						fill=""
					/>
				</svg>
			</button>
			<!-- Hamburger Toggle BTN -->

			<!-- Application nav menu button -->

			<span class="text-theme-sm mr-1 block font-medium text-black dark:text-white"
				>{companyName}</span
			>

			<div>
				<button
					class="hover:text-dark-900 relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
					aria-label="Toggle DarkMode menu"
					on:click={toggleDarkMode}
				>
					<!-- Sun icon (light mode) -->
					<svg
						class={darkMode ? 'hidden' : 'block'}
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M10 2V4M10 16V18M16 10H18M2 10H4M14.95 5.05L16.36 3.64M3.64 16.36L5.05 14.95M14.95 14.95L16.36 16.36M3.64 3.64L5.05 5.05M10 6C7.79 6 6 7.79 6 10C6 12.21 7.79 14 10 14C12.21 14 14 12.21 14 10C14 7.79 12.21 6 10 6Z"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>

					<!-- Moon icon (dark mode) -->
					<svg
						class={darkMode ? 'block' : 'hidden'}
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M16.24 14.37C14.44 14.81 12.43 14.48 10.79 13.41C9.15 12.33 8 10.61 7.68 8.71C7.36 6.81 7.92 4.89 9.18 3.41C9.44 3.1 9.04 2.68 8.69 2.85C6.13 4.11 4.64 7.01 5.06 9.9C5.48 12.79 7.6 15.17 10.34 15.92C13.08 16.68 16.07 15.61 17.78 13.28C18 12.97 17.59 12.53 17.25 12.72C16.91 12.91 16.56 13.11 16.24 14.37Z"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>
		</div>

		<div class="space-x-2">
			<!-- Dark Mode Toggler -->

			<!-- Dark Mode Toggler -->
			<!-- User Area -->
			<div class="dropdown dropdown-end z-50">
				<div class="flex items-center text-gray-700 dark:text-gray-100" tabindex="0" role="button">
					<!-- <span class="mr-3 h-11 w-11 overflow-hidden rounded-full">
						<img src="./images/user/user-25.jpg" alt="User" />
					</span> -->

					<span class="text-theme-sm mr-1 block font-medium text-black dark:text-white"
						>{$currentUser !== null ? $currentUser.username : ''}</span
					>

					<svg
						class="stroke-gray-500 dark:stroke-gray-400"
						width="18"
						height="20"
						viewBox="0 0 18 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
							stroke=""
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</div>

				<!-- Dropdown Start -->

				<!-- Show dropdown only when dropdownOpen is true -->
				<div
					class="dropdown-content mr-3 absolute right-0 z-200 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-[#3f495b] dark:bg-[#002a47]"
					tabindex="0"
				>
					<div>
						<span class="text-theme-sm block font-medium text-gray-700 dark:text-gray-100">
							{$currentUser !== null ? $currentUser.username : ''}
						</span>
						<span class="text-theme-xs mt-0.5 block text-gray-500 dark:text-gray-100">
							{$currentUser !== null ? $currentUser.email : ''}
						</span>
						<span class="text-theme-xs mt-0.5 block text-gray-400 dark:text-gray-300">
							{$currentUser !== null ? $currentUser.phone_number : ''}
						</span>
					</div>

					<ul class="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-[#3f495b]">
						<li>
							<a
								href="/support"
								on:click|preventDefault={() => {
									toggleDropdown();
									goto(`/${companyName}/support`);
								}}
								class="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-100 dark:hover:bg-white/5 dark:hover:text-gray-300"
							>
								<svg
									class="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM11.0991 7.52507C11.0991 8.02213 11.5021 8.42507 11.9991 8.42507H12.0001C12.4972 8.42507 12.9001 8.02213 12.9001 7.52507C12.9001 7.02802 12.4972 6.62507 12.0001 6.62507H11.9991C11.5021 6.62507 11.0991 7.02802 11.0991 7.52507ZM12.0001 17.3714C11.5859 17.3714 11.2501 17.0356 11.2501 16.6214V10.9449C11.2501 10.5307 11.5859 10.1949 12.0001 10.1949C12.4143 10.1949 12.7501 10.5307 12.7501 10.9449V16.6214C12.7501 17.0356 12.4143 17.3714 12.0001 17.3714Z"
										fill=""
									/>
								</svg>
								Support
							</a>
						</li>
					</ul>
					<button
						class="group text-theme-sm mt-3 flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-100 dark:hover:bg-white/5 dark:hover:text-gray-300"
						on:click={() => {
							changePasswordModalVisible = true;
						}}
					>
						<svg
							fill="#959ba4"
							height="24"
							width="24"
							version="1.1"
							id="Layer_1"
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
							viewBox="0 0 472.615 472.615"
							xml:space="preserve"
							stroke="#959ba4"
							><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
								id="SVGRepo_tracerCarrier"
								stroke-linecap="round"
								stroke-linejoin="round"
							></g><g id="SVGRepo_iconCarrier">
								<g>
									<g>
										<path
											d="M0,49.231v157.538h472.615V49.231H0z M127.644,139.133l-9.846,17.058l-19.337-11.165v22.328H78.769v-22.328 l-19.337,11.165l-9.846-17.058l19.335-11.163l-19.335-11.164l9.846-17.058l19.337,11.166V88.586h19.692v22.328l19.337-11.166 l9.846,17.058L108.31,127.97L127.644,139.133z M226.106,139.133l-9.846,17.058l-19.337-11.165v22.328h-19.692v-22.328 l-19.337,11.165l-9.846-17.058l19.335-11.163l-19.335-11.164l9.846-17.058l19.337,11.166V88.586h19.692v22.328l19.337-11.166 l9.846,17.058l-19.335,11.164L226.106,139.133z M324.568,139.133l-9.846,17.058l-19.337-11.165v22.328h-19.692v-22.328 l-19.337,11.165l-9.846-17.058l19.335-11.163l-19.335-11.164l9.846-17.058l19.337,11.166V88.586h19.692v22.328l19.337-11.166 l9.846,17.058l-19.335,11.164L324.568,139.133z M423.029,139.133l-9.846,17.058l-19.337-11.165v22.328h-19.692v-22.328 l-19.337,11.165l-9.846-17.058l19.335-11.163l-19.335-11.164l9.846-17.058l19.337,11.166V88.586h19.692v22.328l19.337-11.166 l9.846,17.058l-19.335,11.164L423.029,139.133z"
										></path>
									</g>
								</g>
								<g>
									<g>
										<path
											d="M384,315.051H204.486c-8.995-39.434-44.268-68.897-86.332-68.897c-48.837,0-88.615,39.679-88.615,88.615 c0,48.837,39.778,88.615,88.615,88.615c38.48,0,71.243-24.74,83.448-59.103h74.09l24.615,24.615l34.462-34.462l19.692,19.692H384 l29.538-29.538L384,315.051z M88.615,354.436c-10.876,0-19.692-8.817-19.692-19.692c0-10.876,8.816-19.692,19.692-19.692 c10.876,0,19.692,8.816,19.692,19.692C108.308,345.619,99.491,354.436,88.615,354.436z"
										></path>
									</g>
								</g>
							</g></svg
						>
						Change Password
					</button>
					<button
						class="group text-theme-sm mt-3 flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-100 dark:hover:bg-white/5 dark:hover:text-gray-300"
						on:click={handleSignOut}
					>
						<svg
							class="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
								fill=""
							/>
						</svg>

						Sign out
					</button>
				</div>
			</div>
		</div>
	</div>
</header>
