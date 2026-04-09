<script>

  export let onCloseModal;
  export let onCheckout;

  function handleCheckout() {
    onCheckout(); // Call the delete function with the row ID
    onCloseModal(); // Close the modal
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop:bg-black/50 bg-opacity-50">
  <div class="relative p-4 w-full max-w-md bg-white dark:bg-[#22273c] rounded-lg shadow-lg dark:shadow-lg">
    <div class="text-center">
      <!-- Warning Icon -->
      <!-- Modal Title -->
      <h3 class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
        Confirm Checkout
      </h3>

      <!-- Modal Description -->
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-300">
        Are you sure you checkout
      </p>


      <!-- Action Buttons -->
      <div class="mt-6 flex justify-center space-x-4">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-700 dark:text-gray-300 dark:hover:bg-blue-600 dark:focus:ring-blue-500"
          on:click={onCloseModal}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          on:click={handleCheckout}
        >
         Proceed 
        </button>
      </div>
    </div>
  </div>
</div>
