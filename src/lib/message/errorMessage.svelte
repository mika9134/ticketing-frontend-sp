<!-- src/components/ErrorMessage.svelte -->
<script>
	let { message = $bindable(), isNotify = false, icon = "/notify.svg" } = $props();

	$effect(() => {
		if (message) {
			// Remove HTML tags for accurate character counting
			const plainText = message.replace(/<[^>]*>?/gm, '');
			
			// Calculate duration: 70ms per character, minimum 3000ms
			const displayTime = Math.max(3000, plainText.length * 30);

			const timer = setTimeout(() => {
				message = '';
			}, displayTime);

			// Cleanup: clear timeout if message changes or component is destroyed
			return () => clearTimeout(timer);
		}
	});
</script>

{#if message}
	<div class="absolute top-0 right-0 w-full flex items-center justify-center" style="z-index: 1000;">
		<div class="flex flex-col gap-2 w-fit text-[10px] sm:text-xs mt-4">
			<div
				class="cursor-default flex items-center justify-between w-full h-12 sm:h-14 rounded-lg shadow-xl bg-gray-100 dark:bg-gray-800 px-[10px]"
				onclick={() => {
					message = '';
				}}
			>
				<div class="flex gap-2">
					<div
						class={`backdrop-blur-xl p-1 rounded-lg flex items-center justify-center ${isNotify ? 'bg-transparent' : 'bg-red-500 text-gray-200'}`}
					>
						{#if isNotify && icon}
							<img src={icon} alt="Notify" class="w-6 h-6" />
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
							</svg>
						{/if}
					</div>
					<div class="self-center">
						<p class="text-gray-700 dark:text-gray-100">{@html message}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}