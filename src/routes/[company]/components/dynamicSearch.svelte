<script>
    // Simulate props or data from backend
    export let tableData = []; // [{ request, response, status, date }, ...]
    export let statusOptions = []; // e.g., ["pending", "approved", "rejected"]
  
    let searchTerm = '';
    let selectedStatus = 'all';
  
    // ✅ Reactive filtered table data (no sorting)
    $: filteredData = tableData.filter(item => {
      const matchesSearch =
        item.request.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.response.toLowerCase().includes(searchTerm.toLowerCase());
  
      const matchesStatus =
        selectedStatus === 'all' || item.status === selectedStatus;
  
      return matchesSearch && matchesStatus;
    });
  </script>
  
  <!-- Search bar -->
  <div class="relative w-full max-w-md mb-4">
    <input
      type="text"
      bind:value={searchTerm}
      placeholder="Search requests and responses..."
      class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
    />
    <button
      id="search-button"
      class="absolute top-1/2 right-2.5 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
    >
      <span> ⌘ </span>
      <span> K </span>
    </button>
    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
    </svg>
  </div>
  
  <!-- Dynamic Status Filter Dropdown -->
  <select bind:value={selectedStatus} class="mb-4 border p-1 rounded">
    <option value="all">All Statuses</option>
    {#each statusOptions as status}
      <option value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
    {/each}
  </select>
  
  <!-- Table -->
  <table class="w-full border">
    <thead>
      <tr>
        <th>Request</th>
        <th>Response</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      {#each filteredData as row}
        <tr>
          <td>{row.request}</td>
          <td>{row.response}</td>
          <td>{row.status}</td>
          <td>{row.date}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  