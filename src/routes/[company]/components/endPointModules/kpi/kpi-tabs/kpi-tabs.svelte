<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { roles } from '../../../../../../stores/roleStore.js';
	import { hasPrivilege } from '$lib/role.js';
	import { page } from '$app/stores';

	let isPreSales = false;
	let role = '';
	export let status = 'General';
	let userRoles = {};

	const dispatch = createEventDispatcher();

	function setStatus(newStatus) {
		status = newStatus;
		dispatch('statusChange', { status });
	}

	onMount(() => {
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});
		const query = $page.url.searchParams;
		role = query.get('role');
		isPreSales = role == "Pre-Sales" ? true : false
		// console.log(role)
	});
	let activeStatus = status;
</script>

<div class="p-2 h-fit w-fit flex gap-2 m-2">
	<div class="border-b border-gray-200 dark:border-[#00527c]">
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => {
					setStatus('General');
					activeStatus = 'General';
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'General'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				General
			</button>
			{#if isPreSales == true}
				<button
					type="button"
					onclick={() => {
						setStatus('Penetration Target');
						activeStatus = 'Penetration Target';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Penetration Target'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Penetration
				</button>
				<button
					type="button"
					onclick={() => {
						setStatus('Order Conversion Target');
						activeStatus = 'Order Conversion Target';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Order Conversion Target'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Order Conversion
				</button>
			{:else}
				<button
					type="button"
					onclick={() => {
						setStatus('Penetration Target');
						activeStatus = 'Penetration Target';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Penetration Target'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Penetration
				</button>
				<button
					type="button"
					onclick={() => {
						setStatus('Sales Volume Target');
						activeStatus = 'Sales Volume Target';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Sales Volume Target'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Sales Volume
				</button>
				<button
					type="button"
					onclick={() => {
						setStatus('Call Completion Target');
						activeStatus = 'Call Completion Target';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Call Completion Target'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Call Completion
				</button>
				<button
					type="button"
					onclick={() => {
						setStatus('Productivity Target');
						activeStatus = 'Productivity Target';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Productivity Target'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Productivity
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.active-button {
		background-color: #3498db; /* Change this to your preferred active button color */
		color: white;
	}
</style>
