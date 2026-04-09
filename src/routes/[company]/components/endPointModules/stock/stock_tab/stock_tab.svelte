<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { roles } from '../../../../../../stores/roleStore.js';
	import { hasPrivilege } from '$lib/role.js';

	export let status = 'Stock Balance'; 

	let has_stock_count = false;
	let has_stock_adjustment = false;
	let userRoles = {};

	const dispatch = createEventDispatcher();

	function setStatus(newStatus) {
		status = newStatus;
		dispatch('statusChange', { status });
	}

	onMount(() => {
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;

			has_stock_count = hasPrivilege(userRoles['Stock Count'], 'R');
			has_stock_adjustment = hasPrivilege(userRoles['Stock Adjustment'], 'R');
		});
	});
	let activeStatus = status;
</script>

<div class="p-2 h-fit w-fit flex gap-2 m-2">
	<div class="border-b border-gray-200 dark:border-[#00527c]">
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => {
					setStatus('Stock Balance');
					activeStatus = 'Stock Balance';
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Stock Balance'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Stock Balance
			</button>
			<button
				type="button"
				onclick={() => {
					setStatus('Stock Entry');
					activeStatus = 'Stock Entry';
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Stock Entry'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Stock Entry
			</button>
			<button
				type="button"
				onclick={() => {
					setStatus('Assets');
					activeStatus = 'Assets';
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Assets'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Asset Log
			</button>
			{#if has_stock_count}
				<button
					type="button"
					onclick={() => {
						setStatus('Stock Count');
						activeStatus = 'Stock Count';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Stock Count'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Stock Count
				</button>
			{/if}
			{#if has_stock_adjustment}
				<button
					type="button"
					onclick={() => {
						setStatus('Stock Adjustment');
						activeStatus = 'Stock Adjustment';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Stock Adjustment'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Stock Adjustment
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
