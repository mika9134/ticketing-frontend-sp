<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { addForm } from '../../../../../apis/form';
	import { host, token } from "../../../../../apis/config";
	import { sharedProducts as products } from '../salesProduct/salesProductStore';
	import SalesProduct from '../salesProduct/salesProduct.svelte';

	const submitUrl = `${host}sales/add-payment`;

	let selectedProducts = $state([]);
	let salesItemToSubmit = $state([]);
	let paymentAmount = $state();

	let subtotal = $state(0);
	let discount = $state(0);
	let total = $state(0);
	let query = $state();
	let salesType = $state();

	async function handleCheckout() {
		const id = query.get('id');
		const paymentItem = {
			amount: Number(paymentAmount),
			sales : Number(id),
			date: new Date().toISOString() 
		}
		try {
			await addForm(submitUrl, paymentItem, token);
			alert(`Paid ${total.toFixed(2)}`);
			goto('/sales');
		} catch (e) {
			console.error(e);
		}
	}
		

	async function handleFullPay(){
		paymentAmount = total;
	}

	onMount(() => {
		query = $page.url.searchParams;
		salesType = query.get("sales");
		products.subscribe((value) => {
			selectedProducts = value;
		});

		salesItemToSubmit = JSON.parse(JSON.stringify(selectedProducts));
		total = salesItemToSubmit.reduce((sum, item) => sum + item.total, 0);
		discount = salesItemToSubmit.reduce((sum, item) => sum + item.discount, 0);
		subtotal = salesItemToSubmit.reduce((sum, item) => sum + (item.total + item.discount), 0);
	});
</script>

<div class="min-h-screen flex items-center justify-center px-4">
	<div class="w-full max-w-2xl p-6 bg-white dark:bg-[#002a47] rounded-xl shadow-md">
		<h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Checkout Summary</h2>

		<!-- Product List -->
		<div class="space-y-4">
			{#each salesItemToSubmit as product, i}
				<div class="flex justify-between items-center border-b pb-2">
					<div>
						<p class="text-gray-900 dark:text-white font-medium">Product {i + 1}</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{product.quantity} × {product.unit_price} ETB
						</p>
					</div>
					<p class="text-gray-800 dark:text-white font-semibold">
						{(product.quantity * product.unit_price).toFixed(2)}ETB
					</p>
				</div>
			{/each}
		</div>

		<!-- Totals -->
		<div class="mt-6 border-t pt-4 space-y-2 text-gray-800 dark:text-white">
			<div class="flex justify-between">
				<span>Subtotal</span>
				<span>{subtotal.toFixed(2)}ETB</span>
			</div>
			<div class="flex justify-between text-red-500">
				<span>Discount</span>
				<span>- {discount.toFixed(2)}ETB</span>
			</div>
			<div class="flex justify-between font-bold text-lg">
				<span>Total Sales</span>
				<span>{total.toFixed(2)}ETB</span>
			</div>
		</div>

		<!-- Payment Method -->
		<!-- <div class="mt-6">
			<label for="payment" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
				Payment Method
			</label>
			<select
				id="payment"
				bind:value={paymentMethod}
				class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
			>
				<option value="Cash">Cash</option>
				<option value="Cheque">Cheque</option>
				<option value="Bank Transfer">Bank Transfer</option>
				<option value="Electronic">Electronic</option>
			</select>
		</div> -->

		{#if salesType === "Credit"}
		<div>Payment</div>
		<span>
			<input
			type="text"
			name="payment"
			bind:value={paymentAmount}
			class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
			placeholder="Enter Amount"
		  />

			<button
			
			class="mt-6 w-half p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
			onclick={handleFullPay}
		>
			Full Amount
		</button>
		</span>
		 
		{/if}

		<!-- Checkout Button -->
		<button
			onclick={handleCheckout}
			class="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
		>
			Checkout ${total.toFixed(2)}
		</button>
	</div>
</div>
