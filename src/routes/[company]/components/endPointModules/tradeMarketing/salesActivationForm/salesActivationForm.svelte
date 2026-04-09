<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { addForm } from '../../../../apis/form';
	import { host, token } from "../../../../../../apis/config";
	import { fetchTable } from '../../../../apis/table';
	import { sharedSales } from './salesActivationStore';

	let formData = $state({
		employee: null,
		date: '',
		payment_due_date: '',
		payment_mode: 'None',
		sales_type: 'Cash',
		bankId: '',
		cheque: '',
		payment_status: 'Not Paid',
		payment_date: '',
		discount: 0,
		status: 'New',
		total_sales: 0,
		total_quantity: 0,
		gross_sales: 0,
		total_sales_in_words: '',
		remark: ''
	});

	let paymentModes = $state([]);
	let employees = $state([]);

	let pointOfSale = $state();
	let route = $state();
	let employee = $state();

	const paymentMethodURL = `${host}sales/payment-modes`;
	const employeeURL = `${host}employee/employees`;
	const submitUrl = `${host}sales/create-sale`;

    // fetch payment methods
	async function getPaymentMethods() {
		try {
			paymentModes = await fetchTable(paymentMethodURL, token);
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}
	
	// fetch employees
	async function getEmployees() {
		try {
			employees = await fetchTable(employeeURL, token);
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}
   
	// submit sales
	async function handleSubmit(e) {
		const now = new Date();
		const timePart = now.toTimeString().split(' ')[0]; // HH:MM:SS
		const msPart = now.getMilliseconds().toString().padStart(3, '0');
		formData.date = new Date(`${formData.date}T${timePart}.${msPart}Z`).toISOString();
		formData.payment_date = new Date(
			`${formData.payment_date}T${timePart}.${msPart}Z`
		).toISOString();
		formData.payment_due_date = new Date(
			`${formData.payment_due_date}T${timePart}.${msPart}Z`
		).toISOString();
		formData.point_of_sale = pointOfSale;
		formData.route = route;
		formData.gross_sales = formData.total_sales + formData.discount;
		let salesData = JSON.parse(JSON.stringify(formData));
		console.log(formData);
		try {
			console.log('Final sales before submission', salesData);
			let salesItem = await addForm(submitUrl, salesData, token);

			const queryParams = new URLSearchParams({
				id: JSON.stringify(salesItem.id)
			});
			goto(`/sales/sales-product?${queryParams}`);
		} catch (e) {
			console.error(e);
		}

		//sharedSales.set(formData);
	}

	onMount(async () => {
		getPaymentMethods();
		getEmployees();
		let products = $page?.route?.state?.products ?? [];
		console.log($page?.route?.state);

		const query = $page.url.searchParams;
		pointOfSale = query.get('pointOfSale');
		route = query.get('route');
	});
</script>

<div class="p-8">
	<div class="relative p-8 w-full bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg">
		<div class="flex justify-between items-center pb-4 mb-4 border-b dark:border-gray-600">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Sales Form</h3>
		</div>
		<form on:submit|preventDefault={handleSubmit}>
			<div class="grid gap-4 mb-4 sm:grid-cols-2">
				<!-- Employee -->
				<div>
					<label for="employee" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Employee</label
					>
					<select
						id="employee"
						bind:value={formData.employee}
						class="select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
					>
						<option value="" disabled>Select employee</option>
						{#each employees as employee}
							<option value={employee.id}>Employee {employee.id}</option>
						{/each}
					</select>
				</div>

				<!-- Date -->
				<div>
					<label for="date" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Date</label
					>
					<input
						id="date"
						type="date"
						bind:value={formData.date}
						class="input w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
					/>
				</div>

				<!-- Payment Due Date -->
				<div>
					<label
						for="payment-date"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Payment Due Date</label
					>
					<input
						id="payment-date"
						type="date"
						bind:value={formData.payment_due_date}
						class="input shadow-theme-xs rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 dark:bg-gray-900 dark:text-white/90 [color-scheme:light] dark:[color-scheme:dark]"
					/>
				</div>

				<!-- Payment Mode -->
				<div>
					<label
						for="payment-mode"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Payment Mode</label
					>
					<select
						id="payment-mode"
						bind:value={formData.payment_mode}
						class="select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
					>
						<option disabled selected>Select mode</option>
						{#each paymentModes as paymentMode}
							<option value={paymentMode}>{paymentMode}</option>
						{/each}
					</select>
				</div>

				<!-- Sales Type -->
				<div>
					<label
						for="sales-type"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sales Type</label
					>
					<select
						id="sales-type"
						bind:value={formData.sales_type}
						class="select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
					>
						<option value="Cash">Cash</option>
						<option value="Credit">Credit</option>
					</select>
				</div>

				<!-- Show this only when paymentMode is 'bank' -->
				{#if formData.payment_mode === 'Bank Transfer'}
					<div>
						<label for="bank" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Bank</label
						>
						<select
							id="bank"
							bind:value={formData.bankId}
							class="select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
						>
							<option value="" disabled>Select bank</option>
							<!-- Dynamically populated options -->
							<option value="1">Bank A</option>
							<option value="2">Bank B</option>
						</select>
					</div>
				{/if}
				<!-- Show this only when paymentMode is 'bank' -->
				{#if formData.payment_mode === 'Cheque'}
					<div>
						<label for="cheque" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>Cheque</label
						>
						<input
							id="cheque"
							type="text"
							bind:value={formData.cheque}
							placeholder="Enter cheque number"
							class="input w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
						/>
					</div>
				{/if}

				<!-- Payment Status -->
				<div>
					<label
						for="payment-status"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Payment Status</label
					>
					<select
						id="payment-status"
						bind:value={formData.payment_status}
						class="select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
					>
						<option value="Not Paid">Not Paid</option>
						<option value="Paid">Paid</option>
						<option value="Partially Paid">Partially Paid</option>
					</select>
				</div>

				<!-- Payment Date -->
				<div>
					<label for="pay-date" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Payment Date</label
					>
					<input
						id="pay-date"
						type="date"
						bind:value={formData.payment_date}
						class="input w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
					/>
				</div>

				<!-- Discount -->
				<div>
					<label for="discount" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Discount</label
					>
					<input
						id="discount"
						type="number"
						min="0"
						bind:value={formData.discount}
						class="input w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
					/>
				</div>

				<!-- Status -->
				<div>
					<label for="status" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Status</label
					>
					<select
						id="status"
						bind:value={formData.status}
						class="select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
					>
						<option value="New">New</option>
						<option value="Closed">Closed</option>
						<option value="Void">Void</option>
					</select>
				</div>

				<!-- Total Quantity -->
				<!-- <div>
                    <label for="total-quant" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Total Quantity</label
                    >
                    <input
                        id="total-quant"
                        type="number"
                        min="0"
                        bind:value={formData.total_quantity}
                        class="input w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
                    />
                </div> -->

				<!-- Total Sales -->
				<!-- <div>
					<label for="total-sales" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Total Sales</label
					>
					<input
						id="total-sales"
						type="number"
						min="0"
						bind:value={formData.total_sales}
						class="input w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
					/>
				</div> -->

				<!-- Total Sales In Words -->
				<!-- <div class="sm:col-span-2">
					<label
						for="total-sales-word"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Total Sales (in words)</label
					>
					<textarea
						id="total-sales-word"
						bind:value={formData.total_sales_in_words}
						class="textarea w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
						rows="2"
					></textarea>
				</div> -->

				<!-- Remark -->
				<div class="sm:col-span-2">
					<label for="remark" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Remark</label
					>
					<textarea
						id="remark"
						bind:value={formData.remark}
						class="textarea w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 s-YELny2YSkg3s"
						rows="2"
					></textarea>
				</div>
			</div>

			<!-- Checkout Button -->
			<div class="flex justify-end pt-4">
				<button
					type="submit"
					class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
				>
					Submit
				</button>
			</div>
		</form>
	</div>
</div>
