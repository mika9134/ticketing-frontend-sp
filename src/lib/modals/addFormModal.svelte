<script>
	import { onMount } from 'svelte';

	// import AddForm from '../../forms/addForm.svelte';
	import { fetchTable } from '../../../apis/table';
	import Modal from '../../../lib/modals/formModal.svelte';
	let {
		table_endpoint,
		table_name,
		get_form_endpoint,
		submit_new_url,
		submit_update_url,
		submit_delete_url,
		token
	} = $props();
	let showModal = $state(false);

	let columns = $state(true);
	let table_data = $state([]);
	onMount(async () => {
		try {
			table_data = await fetchTable(table_endpoint, token);
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
		if (table_data && table_data.length > 0) {
			let cols = Object.keys(table_data[0]);
			if (cols.includes('id')) {
				cols = cols.filter((col) => col !== 'id');
				cols.unshift('id');
			}
			columns = cols;
		}
	});
</script>

<div class="text-black mx-4 p-2 px-5">
	<h1>{table_name}</h1>
	<button class="bg-green-400 p-1 px-3 my-4 rounded-lg" onclick={() => (showModal = true)}>
		Add {table_name}
	</button>
	<Modal
		{table_name}
		{token}
		get_endpoint_url={get_form_endpoint}
		submit_url={submit_new_url}
		action_type="Add"
		bind:showModal
	/>
	{#if table_data.length === 0}
		<p>No data available</p>
	{/if}
	<table>
		<thead>
			<tr>
				{#each columns as col}
					<th>{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each table_data as row}
                  <tr class="border-b dark:border-gray-700">
					{#each columns as col}
						{#if row[col] === null}
							<td>N/A</td>
						{:else}
							<td>{row[col]}</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	table {
		width: 90%;
		border-collapse: collapse;
	}
	th,
	td {
		border: 1px solid #ccc;
		padding: 8px;
		text-align: left;
	}
	th {
		background-color: #f2f2f2;
	}
</style>
