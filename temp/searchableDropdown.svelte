<script>
    let showDropdown = false;
    let query = '';
    const links = [
      { href: '#about', label: 'About' },
      { href: '#base', label: 'Base' },
      { href: '#blog', label: 'Blog' },
      { href: '#contact', label: 'Contact' },
      { href: '#custom', label: 'Custom' },
      { href: '#support', label: 'Support' },
      { href: '#tools', label: 'Tools' }
    ];
  
    $: filteredLinks = links.filter(link =>
      link.label.toLowerCase().includes(query.toLowerCase())
    );
  
    const toggleDropdown = () => {
      showDropdown = !showDropdown;
    };
  </script>
  

  <h2 class="text-2xl font-semibold mb-2">Search/Filter Dropdown</h2>
  <p class="text-gray-600 mb-4">Click on the button to open the dropdown menu, and use the input field to search for a specific dropdown link.</p>
  
  <div class="relative inline-block text-left">
    <button
      on:click={toggleDropdown}
      class="bg-white dark:bg-[#002147] hover:bg-green-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      Dropdown
    </button>
  
    {#if showDropdown}
      <div class="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
        <div class="py-2">
          <input
            type="text"
            placeholder="Search..."
            bind:value={query}
			class="w-full h-22 p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-800 focus:outline-none resize-none overflow-auto"
			/>
  
          {#each filteredLinks as { href, label }}
            <a
              href={href}
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              {label}
            </a>
          {/each}
  
          {#if filteredLinks.length === 0}
            <div class="px-4 py-2 text-sm text-gray-400">No matches found.</div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  