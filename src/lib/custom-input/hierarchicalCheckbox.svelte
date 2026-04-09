<script>
	import { formatFieldNames } from '$lib/utils';
	import HierarchicalCheckboxElement from './hierarchicalCheckboxElement.svelte';

	let isAll = false;
	export let node;
	export let selected;

	let isExpanded = false;

	let all_children_id = [node.id];

	function getAll(entry) {
		for (let i = 0; i < entry.children.length; i++) {
			all_children_id.push(entry.children[i].id);
			getAll(entry.children[i]);
		}
	}

	getAll(node);

	function checkAll(selected) {
		isAll = selected.sort().join(',') === all_children_id.sort().join(',');
	}

	checkAll(selected);

	$: checkAll(selected);
</script>

<ul
	class="menu menu-xs text-gray-900 dark:text-white bg-white border-gray-200 dark:bg-[#051b33] dark:border-gray-900 rounded-box max-w-xs w-full"
>
	<li>
		{#if node.children.length !== 0}
			<div>
				<div class="flex gap-1">
					<input
						id="checkAll"
						type="checkbox"
						class="cyberpunk-checkbox"
						checked={isAll}
						onchange={() => {
							if (!isAll) {
								selected = all_children_id;
							} else {
								selected = [];
							}
						}}
					/>
					{node.name}
					{#if node.children && node.children.length > 0}
						{#if isExpanded}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								onclick={() => {
									isExpanded = !isExpanded;
								}}
								><path
									fill="currentColor"
									d="m12 6.586-8.707 8.707 1.414 1.414L12 9.414l7.293 7.293 1.414-1.414L12 6.586z"
								/></svg
							>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								onclick={() => {
									isExpanded = !isExpanded;
								}}
								><path
									fill="currentColor"
									d="M12 17.414 3.293 8.707l1.414-1.414L12 14.586l7.293-7.293 1.414 1.414L12 17.414z"
								/></svg
							>
						{/if}
					{/if}
				</div>
			</div>
			{#if isExpanded}
				<ul>
					{#each node.children as node_child}
						<HierarchicalCheckboxElement node={node_child} bind:selected />
					{/each}
				</ul>
			{/if}
		{:else}
			<a>
				<input
					id="checkAll"
					type="checkbox"
					class="cyberpunk-checkbox"
					checked={isAll}
					onchange={() => {
						if (!isAll) {
							selected = all_children_id;
						} else {
							selected = [];
						}
					}}
				/>
				{node.name}
			</a>
		{/if}
	</li>
</ul>

<style>
	/* From Uiverse.io by adamgiebl */
	.cyberpunk-checkbox {
		appearance: none;
		width: 12px;
		height: 12px;
		border: 2px solid #4d4d4d;
		border-radius: 2px;
		background-color: transparent;
		display: inline-block;
		position: relative;
		margin-right: 10px;
		cursor: pointer;
	}

	.cyberpunk-checkbox:before {
		content: '';
		background-color: #4d4d4d;
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(0);
		width: 6px;
		height: 6px;
		border-radius: 1px;
		transition: all 0.3s ease-in-out;
	}

	.cyberpunk-checkbox:checked:before {
		transform: translate(-50%, -50%) scale(1);
	}

	.cyberpunk-checkbox-label {
		font-size: 18px;
		color: #fff;
		cursor: pointer;
		user-select: none;
		display: flex;
		align-items: center;
	}
</style>
