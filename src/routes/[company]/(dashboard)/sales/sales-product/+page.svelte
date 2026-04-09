<script>
	import {goto} from "$app/navigation";
	import Products from '../../../components/endPointModules/productModule/products.svelte';
	import SalesProduct from '../../../components/endPointModules/salesProduct/salesProduct.svelte';
</script>

<!-- <SalesProduct /> -->
 <!-- <div> -->
	<!-- <Products /> -->

			<!-- Checkout Section -->
		<!-- <div
			class="flex justify-between items-center p-4 rounded-lg border border-gray-200 bg-white dark:bg-[#002a47] dark:border-gray-600 mt-4"
		>


			<button
				on:click={() => goto('sales/checkout')}
				class="ml-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
			>
				Proceed to Checkout
			</button>
		</div>
 </div> -->

<SalesProduct/>