<script>

  export let onCloseModal;
  export let onDelete;
  
  function handleContinue() {
    onCloseModal(); // Close the modal
  }
  
  function handleDelete()
  {
    onDelete();
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center">
  <div class="relative p-4 w-full max-w-md bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg">
    <div class="text-center">
      <!-- Warning Icon -->
      <div class="flex justify-center items-center w-16 h-16 mx-auto">
        <svg class="w-11 h-11 mx-auto text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Modal Title -->

      <!-- Modal Description -->
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-300">
        You already have items in cart
      </p>


      <!-- Action Buttons -->
      <div class="mt-6 flex justify-center space-x-4">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-700 dark:text-gray-300 dark:hover:bg-blue-600 dark:focus:ring-blue-500"
          on:click={onCloseModal}
        >
          Merge
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          on:click={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</div>
