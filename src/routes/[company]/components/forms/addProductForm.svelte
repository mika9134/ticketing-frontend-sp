<script>
	import Fileupload from "../../../lib/modals/fileupload.svelte";

  export let product;
  export let onAddProduct;
  export let onCloseModal;
  export let brands = []; // Assuming you will provide the available brands list

  function handleSubmit() {
    onAddProduct(product); // Trigger the addProduct event
    onCloseModal(); // Close the modal
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div class="relative p-4 w-full max-w-2xl max-h-full bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg">
    <div class="flex justify-between items-center pb-4 mb-4 border-b dark:border-gray-600">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Product</h3>
      <button
        type="button"
        class="text-gray-400 hover:bg-gray-200 rounded-lg p-1.5"
        aria-label="close modal button"
        on:click={onCloseModal}
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
    <form on:submit|preventDefault={handleSubmit}>
      <div class="grid gap-4 mb-4 sm:grid-cols-2">
        <div>
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
          <input
            type="text"
            id="name"
            bind:value={product.name}
            class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent  text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
            placeholder="Type product name"
            required
          />
        </div>


        <!-- Category Field -->
        <div>
          <label for="category" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
          <select
            id="category"
            bind:value={product.categoryId}
            class="select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-white dark:bg-[#002a47] text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white dark:placeholder:text-white"
          >
            <option value="" disabled class="text-gray-400 dark:text-white/60">Select category</option>
            <option value="1">TV/Monitors</option>
            <option value="2">PC</option>
            <option value="3">Gaming/Console</option>
            <option value="4">Phones</option>
          </select>
        </div>

        <!-- Brand Field (dropdown from available brands) -->
        <!-- <div>
          <label for="brand" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Brand</label>
          
          <details class="dropdown" closed>
            <summary class="text-gray-600 dark:text-white/90 cursor-pointer select-none">
              {product.brand || 'Select brand'}
            </summary>
            <ul
              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 dark:bg-dark-900 dark:text-white"
            >
              {#each brands as brand}
                <li>
                  <button
                    type="button"
                    class="w-full text-left"
                    on:click={() => (product.brand = brand.name)}
                  >
                    {brand.name}
                  </button>
                </li>
              {/each}
            </ul>
          </details>
        </div> -->

                <!-- Brand Field (dropdown from available brands) -->
                <div>
                  <label for="brand" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Brand</label>
                  <select
                    id="brand"
                    bind:value={product.brand}
                    class="select w-full dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border  bg-white dark:bg-[#002a47] border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 dark:placeholder:text-white focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white dark:placeholder:text-white"
                  >
                    <!-- <option value="" disabled>Select brand</option>
                    {#each brands as brand}
                      <option value={brand.id}>{brand.name}</option>
                    {/each} -->
                    <option value="" disabled class="text-gray-400 dark:text-white/60">Select brand</option>
                    <option value="1">Samsung</option>
                    <option value="2">LG</option>
                    <option value="3">Sony</option>
                  </select>
                </div>

        <!-- Price Field -->
        <div>
          <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</label>
          <input
            type="number"
            id="price"
            bind:value={product.price}
            class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white/90 dark:placeholder:text-white/30"
            placeholder="$2999"
            required
            min="0"
          />
        </div>

        <!-- Units of Measure (dropdown) -->
        <div>
          <label for="unitsOfMeasure" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Units of Measure</label>
          <select
            id="unitsOfMeasure"
            bind:value={product.unitsOfMeasure}
            class="select w-full dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border  bg-white dark:bg-[#002a47] border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 dark:placeholder:text-white focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white dark:placeholder:text-white"
            >
            <option value="" disabled>Select units</option>
            <option value="L">Liter</option>
            <option value="ml">Mililiter</option>
            <option value="kg">Kilogram(kg)</option>
            <option value="g">Gram(g)</option>
            <option value="mg">Milligram(ml)</option>
            <option value="L">Liter</option>
            <option value="unit">unit</option>
          </select>
        </div>
        <!-- Sku field -->
        <!-- <div>
          <label for="sku" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">SKU</label>
          <details class="dropdown" closed>
            <summary class="text-gray-600 dark:text-white/90 cursor-pointer select-none">
              {product.sku || 'Select amount'}
            </summary>
            <ul class="dropdown-content menu p-2 w-full dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white dark:placeholder:text-white">
              <li>
                <button type="button" class="w-full text-left hover:bg-gray-200 dark:hover:bg-transparent" on:click={() => (product.sku = '1L')}>1L</button>
              </li>
              <li>
                <button type="button" class="w-full text-left hover:bg-gray-200 dark:hover:bg-transparent" on:click={() => (product.sku = '2L')}>2L</button>
              </li>
              <li>
                <button type="button" class="w-full text-left" on:click={() => (product.sku = '5L')}>5L</button>
              </li>
              <li>
                <button type="button" class="w-full text-left" on:click={() => (product.sku = '1kg')}>1kg</button>
              </li>
              <li>
                <button type="button" class="w-full text-left" on:click={() => (product.sku = '2kg')}>2kg</button>
              </li>
              <li>
                <button type="button" class="w-full text-left" on:click={() => (product.sku = '5kg')}>5kg</button>
              </li>
            </ul>
          </details>
        </div> -->
        
        <div>
          <label for="sku" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">SKU</label>
          <select
            id="sku"
            bind:value={product.sku}
            class="select w-full dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border  bg-white dark:bg-[#002a47] border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 dark:placeholder:text-white focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white dark:placeholder:text-white"
            >
            <option value="" disabled>Select amount</option>
            <option value="1L">1L</option>
            <option value="2L">2L</option>
            <option value="5L">5L</option>
            <option value="1kg">1kg</option>
            <option value="2kg">2kg</option>
            <option value="5kg">5kg</option>
          </select>
        </div>
        <!-- file upload  -->
         <div>
          <label for="file-upload" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload Image</label>
          <Fileupload />
         </div>

        <!-- Description Field -->
        <div class="sm:col-span-2">
          <label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
          <textarea
            id="description"
            bind:value={product.description}
            rows="4"
            class="textarea w-full dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
            placeholder="Write product description here"
          ></textarea>
        </div>
      </div>
      <button type="submit" class="btn btn-neutral bg-[#3393ce] w-full text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50">Add new product</button>
    </form>
  </div>
</div>
