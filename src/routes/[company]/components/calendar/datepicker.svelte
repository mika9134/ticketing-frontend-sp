<script>
  export let startDate = '';
  export let endDate = '';
  $: isInvalidRange =
    startDate && endDate && new Date(startDate) > new Date(endDate);
</script>

<div class="w-full flex flex-col gap-4">
  <h3 class="text-lg font-semibold text-black dark:text-white">Select Date Range</h3>

  <div class="flex gap-4">
    <div class="flex flex-col w-full">
      <label class="text-sm mb-1 text-black dark:text-white">Start Date</label>
      <input
        type="date"
        class="input input-bordered w-full bg-white text-black border border-gray-300
               dark:bg-gray-800 dark:text-white dark:border-gray-600
               [color-scheme:light] dark:[color-scheme:dark]"
        bind:value={startDate}
      />
    </div>

    <div class="flex flex-col w-full">
      <label class="text-sm mb-1 text-black dark:text-white">End Date</label>
      <input
        type="date"
        class="input input-bordered w-full bg-white text-black border border-gray-300
               dark:bg-gray-800 dark:text-white dark:border-gray-600
               [color-scheme:light] dark:[color-scheme:dark]"
        bind:value={endDate}
        min={startDate}
      />
    </div>
  </div>

  {#if isInvalidRange}
    <p class="text-sm text-red-500">
      End date cannot be before start date
    </p>
  {/if}
</div>
