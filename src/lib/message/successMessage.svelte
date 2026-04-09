<!-- src/components/ErrorMessage.svelte -->
<script>
	let { message } = $props();

	$effect(() => {
		setTimeout(() => {
			message = '';
		}, 3 * 1000);
	});
</script>

{#if message}
	<!-- From Uiverse.io by seyed-mohsen-mousavi -->
	<div class="absolute top-0 right-0 w-full flex items-center justify-center" style="z-index: 1000;">
		<div
			class="flex flex-col gap-2 w-60 w-fit text-[10px] sm:text-xs mt-4"
		>
			<div
				class="cursor-default flex items-center justify-between w-full h-12 sm:h-14 rounded-lg shadow-xl bg-gray-100 dark:bg-gray-800 px-[10px]"
				onclick={() => {
						message = '';
					}}
			>
				<div class="flex gap-2">
					<div
						class="text-gray-200 bg-green-500 backdrop-blur-xl p-1 rounded-lg"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"></path>
						</svg>
					</div>
					<div class="self-center">
						<p class="text-gray-700 dark:text-gray-300">{message}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
