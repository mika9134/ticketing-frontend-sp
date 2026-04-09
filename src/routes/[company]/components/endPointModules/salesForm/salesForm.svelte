<script>
	import { onMount } from 'svelte';
	import { formatFieldNames } from '$lib/utils.js';
	import { fetchTable } from '../../../../../apis/table';
	import { addForm, fetchForm } from '../../../../../apis/form.js';
	import CheckoutModal from '$lib/modals/checkoutModal.svelte';
	import SuccessMessage from '$lib/message/successMessage.svelte';
	import ErrorMessage from '$lib/message/errorMessage.svelte';

	let {
		get_table_endpoint,
		get_form_endpoint,
		discount_endpoint,
		submitUrl,
		token,
		current_PoS,
		complete
	} = $props();

	let modal_visible = $state(false);
	let sales_items = $state(null);
	let form_info = $state(null);
	let max_items = 1000000;
	let point_of_sale = $state(current_PoS);
	let sub_total = $state(0);
	let tax = $state(0);
	let discount = $state(0);
	let total = $state(0);
	let grand_total = $state(0);
	let before_discount = $state(0);
	let total_before_tax = $state(0);
	let taxRate = 0.15;
	let discount_rate = $state(0);
	const sales_types = ['Cash', 'Credit'];
	const payment_modes = ['Cash', 'Cheque', 'Electronic'];
	let sales_type = $state('Cash');
	let payment_mode = $state('Cash');
	let payment_due_date = $state(null);
	let point_of_sale_keys = $state([]);
	let point_of_sale_values = $state([]);
	let cheque_number = $state('');
	let cheque_owner = $state('');
	let cheque_date = $state(null);
	let bank_name = $state('');
	let bank_branch = $state('');
	let safaricom_phone_number = $state(null);
	let successMessage = $state('');
	let errorMessage = $state('');

	const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
	function parseToFloat(value) {
		if (value == null) return 0;
		const cleaned = String(value).replace(/[,\sA-Za-z]/g, '');
		return parseFloat(cleaned) || 0;
	}

	function calculate() {
		if (point_of_sale !== null && sales_items.data !== null && sales_items.data.items != null) {
			sub_total = 0;
			tax = 0;
			discount = 0;
			total = 0;
			grand_total = 0;
			before_discount = 0;
			total_before_tax = 0;
			for (var i = 0; i < sales_items.data.items.length; i++) {
				if (sales_items.data.items[i].outlet_name == point_of_sale) {
					sub_total +=
						parseFloat(sales_items.data.items[i].unit_price_frontend.replace(/,/g, '')) *
						parseToFloat(sales_items.data.items[i].quantity_frontend);
					discount += parseFloat(sales_items.data.items[i].discount.replace(/,/g, ''));
					tax +=
						parseFloat(sales_items.data.items[i].sub_total.replace(/,/g, '')) -
						parseFloat(sales_items.data.items[i].before_tax.replace(/,/g, ''));
					total += parseFloat(sales_items.data.items[i].sub_total.replace(/,/g, ''));
					total_before_tax += parseFloat(sales_items.data.items[i].before_tax.replace(/,/g, ''));
				}
			}

			grand_total = formatter.format(total_before_tax + tax)
			before_discount = formatter.format(total + discount)

			sub_total = formatter.format(sub_total);
			discount = formatter.format(discount);
			tax = formatter.format(tax);
			total = formatter.format(total);
			total_before_tax = formatter.format(total_before_tax);
		}
	}

	async function checkout() {
		const form_submit_data = {
			point_of_sale: point_of_sale_keys[point_of_sale_values.indexOf(point_of_sale)],
			payment_mode: payment_mode,
			sales_type: sales_type,
			payment_due_date: payment_due_date,
			cheque_number: cheque_number,
			cheque_owner: cheque_owner,
			cheque_date: cheque_date,
			bank_name: bank_name,
			bank_branch: bank_branch,
			safaricom_phone_number: safaricom_phone_number
		};

		let result = await addForm(submitUrl, form_submit_data, token);

		if (!result.succeed) {
			successMessage = '';
			errorMessage = result.error;
		} else {
			successMessage = result.error;
			errorMessage = '';
			sales_items = null;
			sub_total = 0;
			grand_total = 0;
			discount = 0;
			tax = 0;
			total_before_tax = 0;
			total = 0;
			complete(result.data);
		}
	}
	onMount(async () => {
		form_info = await fetchForm(get_form_endpoint, token);
		sales_items = await fetchTable(get_table_endpoint, token, 1, max_items, '', '');
		if (current_PoS !== '') {
			discount_rate = await fetchTable(discount_endpoint, token, 1, max_items, '', '');
			discount_rate = discount_rate.data;
		}
		point_of_sale_keys = Object.keys(form_info.data.point_of_sale);
		point_of_sale_values = Object.values(form_info.data.point_of_sale);

		calculate();
	});
</script>

{#if modal_visible}
	<CheckoutModal
		onCloseModal={() => {
			modal_visible = false;
		}}
		onCheckout={checkout}
	/>
{/if}
{#if point_of_sale != ''}
	<div class="max-w-4xl mx-auto p-6 bg-white dark:bg-[#22273c] rounded shadow-sm my-6" id="invoice">
		<div>
			<label
				class="block text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white mb-2"
			>
				{point_of_sale}
			</label>
		</div>
		<!-- Invoice Items -->
		<div class="-mx-4 mt-8 flow-root sm:mx-0">
			<table class="min-w-full">
				<colgroup>
					<col class="w-full sm:w-1/5" />
					<col class="sm:w-1/9" />
					<col class="sm:w-1/9" />
					<col class="sm:w-1/9" />
					<col class="sm:w-1/9" />
					<col class="sm:w-1/9" />
					<col class="sm:w-1/9" />
				</colgroup>
				<thead class="border-b border-gray-300 text-gray-900 dark:text-gray-100">
					<tr class="">
						<th
							scope="col"
							class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-0"
							>Items</th
						>
						<th
							scope="col"
							class="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:table-cell"
							>Quantity / Amount</th
						>
						<th
							scope="col"
							class="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:table-cell"
							>Price</th
						>
						<th
							scope="col"
							class="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:table-cell"
						>
							Tax Type
						</th>
						<th
							scope="col"
							class="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:table-cell"
						>
							Discount ({discount_rate}%)
						</th>
						<th
							scope="col"
							class="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pr-0"
							>Before Tax</th
						>
						<th
							scope="col"
							class="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pr-0"
						>
							After Tax
						</th>
					</tr>
				</thead>
				<tbody>
					{#if sales_items !== null && sales_items.data !== null}
						{#each sales_items.data.items as prod}
							{#if prod.outlet_name == point_of_sale}
								<tr class="border-b border-gray-200">
									<td class="max-w-0 py-5 pl-4 pr-3 text-sm sm:pl-0">
										<div class="font-medium text-gray-900 dark:text-gray-100">{prod.product}</div>
									</td>
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
										>{prod.quantity_frontend}</td
									>
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
										>
										<!-- {prod.product_type == 'Standard' ? prod.unit_price_frontend.toLocaleString() : '-'} -->
										{prod.unit_price_frontend}

										</td
									>
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
									>
										{prod.tax_type}
									</td>
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
									>
										{prod.discount}
									</td>
									<td
										class="py-5 pl-3 pr-4 text-right text-sm text-gray-500 dark:text-gray-200 sm:pr-0"
										>{prod.before_tax}</td
									>
									<td
										class="py-5 pl-3 pr-4 text-right text-sm text-gray-500 dark:text-gray-200 sm:pr-0"
									>
										{formatter.format(
											parseFloat(prod.sub_total.replace(/,/g, ''))
										)} ETB
									</td>
								</tr>
							{/if}
						{/each}
					{/if}
				</tbody>
				<tfoot>
					<tr>
						<th
							scope="row"
							colspan="6"
							class="hidden pl-4 pr-3 pt-6 text-right text-sm font-normal text-gray-500 dark:text-gray-200 sm:table-cell sm:pl-0"
							>Sub Total (Before Tax)</th
						>
						<th
							scope="row"
							class="pl-6 pr-3 pt-6 text-left text-sm font-normal text-gray-500 dark:text-gray-200 sm:hidden"
							>Sub Total (Before Tax)</th
						>
						<td class="pl-3 pr-6 pt-6 text-right text-sm text-gray-500 dark:text-gray-200 sm:pr-0"
							>{total_before_tax} ETB</td
						>
					</tr>
					<tr>
						<th
							scope="row"
							colspan="6"
							class="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 dark:text-gray-200 sm:table-cell sm:pl-0"
							>Discount ({discount_rate}%)</th
						>
						<th
							scope="row"
							class="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 dark:text-gray-200 sm:hidden"
							>Discount</th
						>
						<td class="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 dark:text-gray-200 sm:pr-0"
							>{discount} ETB</td
						>
					</tr>
					<tr>
						<th
							scope="row"
							colspan="6"
							class="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 dark:text-gray-200 sm:table-cell sm:pl-0"
							>Tax Amount</th
						>
						<th
							scope="row"
							class="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 dark:text-gray-200 sm:hidden"
							>Tax Amount</th
						>
						<td class="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 dark:text-gray-200 sm:pr-0"
							>{tax} ETB</td
						>
					</tr>
					<tr>
						<th
							scope="row"
							colspan="6"
							class="hidden pl-4 pr-3 pt-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:table-cell sm:pl-0"
						>
							Grand Total
						</th>
						<th
							scope="row"
							class="pl-6 pr-3 pt-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:hidden"
						>
							Grand Total
						</th>
						<td
							class="pl-3 pr-4 pt-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pr-0"
							>{grand_total} ETB</td
						>
					</tr>
				</tfoot>
			</table>
		</div>

		<div>
			<label
				class="block text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white mb-2"
			>
				Sales Type
			</label>
			<select
				bind:value={sales_type}
				class="w-fit p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-800 focus:outline-none resize-none overflow-auto self-center"
				onchange={calculate}
			>
				{#each sales_types as optionLabel}
					<option value={optionLabel}>
						{optionLabel}
					</option>
				{/each}
			</select>
		</div>

		<div class="mt-2">
			<label
				class="block text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white mb-2"
			>
				Payment Mode
			</label>
			<select
				bind:value={payment_mode}
				class="w-fit p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-800 focus:outline-none resize-none overflow-auto self-center"
				onchange={calculate}
			>
				{#each payment_modes as optionLabel}
					<option value={optionLabel}>
						{optionLabel}
					</option>
				{/each}
			</select>
		</div>

		{#if sales_type == 'Credit'}
			<div class="mt-2">
				<label
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white"
					>Payment Due Date</label
				>
				<input
					type="date"
					bind:value={payment_due_date}
					class="input shadow-theme-xs rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 dark:bg-gray-900 dark:text-white/90 [color-scheme:light] dark:[color-scheme:dark]"
				/>
			</div>
		{/if}

		{#if payment_mode == 'Cheque'}
			<div class="grid grid-cols-2 mt-2">
				<div>
					<label
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white"
						>Cheque Number</label
					>

					<input
						type="text"
						bind:value={cheque_number}
						class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
						placeholder=""
					/>
				</div>
				<div>
					<label
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white"
						>Cheque Owner</label
					>

					<input
						type="text"
						bind:value={cheque_owner}
						class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
						placeholder=""
					/>
				</div>
				<div>
					<label
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white"
						>Bank Name</label
					>

					<input
						type="text"
						bind:value={bank_name}
						class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
						placeholder=""
					/>
				</div>
				<div>
					<label
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white"
						>Bank Branch</label
					>

					<input
						type="text"
						bind:value={bank_branch}
						class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
						placeholder=""
					/>
				</div>

				<div class="mt-2">
					<label
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white"
						>Cheque Date</label
					>
					<input
						type="date"
						bind:value={cheque_date}
						class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
					/>
				</div>
			</div>
		{/if}

		{#if payment_mode == 'Electronic'}
			<div class="mt-2">
				<label
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white"
					>Safaricom Number</label
				>

				<input
					type="text"
					bind:value={safaricom_phone_number}
					class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
					placeholder=""
				/>
			</div>
		{/if}
		{#if sales_items !== null && sales_items.data !== null && sales_items.data.items !== null && (sales_type == 'Cash' || (payment_due_date != null && sales_type == 'Credit'))}
			<button
				onclick={() => {
					modal_visible = true;
				}}
				class="btn btn-neutral mt-4 bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
			>
				Checkout
			</button>
		{/if}
		{#if errorMessage && errorMessage !== ''}
			<ErrorMessage message={errorMessage} />
		{/if}
		{#if successMessage && successMessage !== ''}
			<SuccessMessage message={successMessage} />
		{/if}
	</div>
{:else}
	<h1 class="m-4 text-gray-700 dark:text-gray-100">Please select a point of sale</h1>
{/if}
