<script>
  export let selectedRow;
  export let onCloseModal;
  export let onStatusChange;
  export let token;

  let comment = '';
  let isLoading = false;
  let error = '';

  async function handleStatusChange(status) {
    if (!comment.trim()) {
      error = 'Please provide a comment';
      return;
    }

    try {
      isLoading = true;
      error = '';
      await onStatusChange(selectedRow.id, status, comment);
    } catch (err) {
      error = err.message || 'Failed to update status';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop:bg-black/50 bg-opacity-50">
  <div class="relative p-4 w-full max-w-md bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg">
    <div class="text-center">
      <!-- Status Change Icon -->
      <div class="flex justify-center items-center w-16 h-16 mx-auto">
        <svg class="w-11 h-11 mx-auto text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Modal Title -->
      <h3 class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
        Change Status
      </h3>

      <!-- Modal Description -->
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-300">
        Please provide a comment for this status change.
      </p>

      <!-- Error Message -->
      {#if error}
        <p class="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      {/if}

      <!-- Comment Textarea -->
      <div class="mt-4">
        <textarea
          bind:value={comment}
          class="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows="4"
          placeholder="Enter your comment here..."
          disabled={isLoading}
        ></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex justify-center space-x-4">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          on:click={onCloseModal}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
          on:click={() => handleStatusChange('rejected')}
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="inline-block animate-spin mr-2">⟳</span>
          {/if}
          Reject
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
          on:click={() => handleStatusChange('approved')}
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="inline-block animate-spin mr-2">⟳</span>
          {/if}
          Approve
        </button>
      </div>
    </div>
  </div>
</div> 