<script>
	import { host, token } from "../../../../../apis/config";
	import Table from "../../tables/dynamicTable.svelte";
	import Maps from "../../../../lib/map/map.svelte";

	let activeType = $state('Planned Visit');


	const tableEndpoint = `${host}travel/travels`;
	const formEndpoint = `${host}travel/form`;
	const submitUrl = `${host}travel/create-travel`;
	const updateUrl = `${host}travel/update-travel`;
	const deleteUrl =`${host}travel/delete-travel`;
	const table_name = "Travel";
</script>
<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => {
					activeType = 'Planned Visit';
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Planned Visit'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Planned Visit
			</button>

			<button
				type="button"
				onclick={() => {
					activeType = 'Unplanned Visit';
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Unplanned Visit'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Unplanned Visit
			</button>
		</div>
	</div>

