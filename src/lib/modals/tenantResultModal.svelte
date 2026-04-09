<script>
    export let isOpen = false;
    export let onClose = () => {};
    export let result = null; // expects { message, tenant, admin_username, admin_password }
    export let isTenant = false;
  
    const handleClose = () => {
      onClose();
    };
  </script>
  
  {#if isOpen && result}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop:bg-black/50 bg-opacity-50">
      <div class="relative p-6 w-30 bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg">
        <div class="text-center">
          <!-- Icon -->
          <div class="flex justify-center items-center w-30 h-20 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 20 20" fill="green">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L9 13.414l4.707-4.707z" clip-rule="evenodd"/>
            </svg>
                      
          </div>
          <!-- Title -->
          <h3 class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {result.message}
          </h3>
  
          <!-- Result Info -->
          <div class="mt-4 text-sm text-gray-600 dark:text-gray-300 text-left space-y-1">
            {#if isTenant}
            <p><strong>Tenant:</strong> {result.tenant}</p>
            {/if}
           
            <p><strong>Domain:</strong> {result.domain}</p>
            <p><strong>{isTenant?"Admin Username":"Username"}:</strong> {result.username}</p>
             <p><strong>{isTenant?"Admin Password":"Password"}:</strong> {result.password}</p>
           
          </div>
  
          <!-- Close Button -->
          <div class="mt-6 flex justify-center">
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              on:click={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  