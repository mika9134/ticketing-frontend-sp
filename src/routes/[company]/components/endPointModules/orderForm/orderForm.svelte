<script>
	import { onMount } from 'svelte';
	import { formatFieldNames } from '$lib/utils.js';
	import { fetchTable } from '../../../../../apis/table';
	import { addForm, fetchForm } from '../../../../../apis/form.js';
	import ErrorMessage from '../../../../../lib/message/errorMessage.svelte';

	let {
		get_table_endpoint,
		get_form_endpoint,
		discount_endpoint,
		submitUrl,
		token,
		current_PoS,
		complete
	} = $props();

	let sales_items = $state(null);
	let form_info = $state(null);
	let max_items = 1000000;
	let point_of_sale = $state(current_PoS);
	let sub_total = $state(0);
	let tax = $state(0);
	let discount = $state(0);
	let total = $state(0);
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
	let remark = $state('');
	let errorMessage = $state('');

	const formatter = new Intl.NumberFormat('en-US', {
		// We don't want currency or decimals, just grouping (commas)
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
			for (var i = 0; i < sales_items.data.items.length; i++) {
				if (sales_items.data.items[i].outlet_name == point_of_sale) {
					sub_total +=
						parseFloat(sales_items.data.items[i].unit_price_frontend.replace(/,/g, '')) *
						parseToFloat(sales_items.data.items[i].quantity);
					discount += parseFloat(sales_items.data.items[i].discount.replace(/,/g, ''));
					tax +=
						parseFloat(sales_items.data.items[i].sub_total.replace(/,/g, '')) -
						parseFloat(sales_items.data.items[i].before_tax.replace(/,/g, ''));
					total += parseFloat(sales_items.data.items[i].sub_total.replace(/,/g, ''));
				}
			}
			sub_total = formatter.format(sub_total);
			discount = formatter.format(discount);
			tax = formatter.format(tax);
			total = formatter.format(total);
		}
	}

	async function checkout() {
		const form_submit_data = {
			point_of_sale: point_of_sale_keys[point_of_sale_values.indexOf(point_of_sale)],
			expected_date: payment_due_date,
			remark: remark
		};

		let message = await addForm(submitUrl, form_submit_data, token);

		if (message.succeed === false) {
			errorMessage = message.error;
			setTimeout(() => (errorMessage = ''), 3000);
		} else {
			errorMessage = '';
			complete();
		}
		discount = 0;
		tax = 0;
		total = 0;
		payment_due_date = null;
		remark = '';
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
					<tr>
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
							>Tax Type</th
						>

						<th
							scope="col"
							class="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:table-cell"
							>Discount ({discount_rate}%)</th
						>
						<th
							scope="col"
							class="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:table-cell"
							>Before Tax</th
						>
						<th
							scope="col"
							class="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pr-0"
							>After Tax</th
						>
					</tr>
				</thead>
				<tbody>
					{#if sales_items !== null && sales_items.data !== null}
						{#each sales_items.data.items as prod}
							{#if prod.outlet_name == point_of_sale}
								<tr class="border-b border-gray-200">
									<td class="max-w-0 py-5 pl-4 pr-3 text-sm sm:pl-0">
										<div class="font-medium text-gray-900 dark:text-gray-100">
											{prod.product}
										</div>
									</td>
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
										>{prod.quantity}</td
									>
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
										>{prod.unit_price.toLocaleString()}</td
									>
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
										>{prod.tax_type.toLocaleString()}</td
									>
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
										>{prod.discount}</td
									>
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
										>{prod.before_tax.toLocaleString()}</td
									>
									<!-- <td
										class="py-5 pl-3 pr-4 text-right text-sm text-gray-500 dark:text-gray-200 sm:pr-0"
										>{formatter.format(
											parseToFloat(prod.quantity) * parseFloat(prod.unit_price.replace(/,/g, ''))
										)} ETB</td
									> -->
									<td
										class="hidden px-3 py-5 text-right text-sm text-gray-500 dark:text-gray-200 sm:table-cell"
										>{prod.sub_total.toLocaleString()}</td
									>
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
							>{sub_total} ETB</td
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
							>Grand Total</th
						>
						<th
							scope="row"
							class="pl-6 pr-3 pt-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:hidden"
							>Grand Total</th
						>
						<td
							class="pl-3 pr-4 pt-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pr-0"
							>{total} ETB</td
						>
					</tr>
				</tfoot>
			</table>
			<!-- Invoice Totals -->
			<!-- <div class="mt-8 flex justify-end">
				<div class="w-full max-w-sm">
					<dl class="space-y-4">
						<div class="flex items-center justify-between">
							<dt class="text-sm text-gray-500 dark:text-gray-200">Subtotal</dt>
							<dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{sub_total} ETB</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt class="text-sm text-gray-500 dark:text-gray-200">Discount ({discount_rate}%)</dt>
							<dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{discount} ETB</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt class="text-sm text-gray-500 dark:text-gray-200">VAT</dt>
							<dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{tax} ETB</dd>
						</div>
						<div
							class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4"
						>
							<dt class="text-base font-semibold text-gray-900 dark:text-gray-100">Total</dt>
							<dd class="text-base font-semibold text-gray-900 dark:text-gray-100">{total} ETB</dd>
						</div>
					</dl>
				</div>
			</div> -->
		</div>

		<div>
			<div class="mt-2">
				<label
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white"
					>Expected Date</label
				>
				<input
					type="date"
					bind:value={payment_due_date}
					class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
				/>
			</div>

			<div>
				<label
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-white"
					>Remark</label
				>

				<input
					type="text"
					bind:value={remark}
					class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
					placeholder=""
				/>
			</div>
		</div>
		{#if sales_items !== null && sales_items.data !== null && sales_items.data.items !== null && payment_due_date !== null}
			<!-- Error message shows here if set -->
			<button
				type="submit"
				onclick={checkout}
				class="btn btn-neutral bg-[#1d6092] mt-4 w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
			>
				Order
			</button>
		{/if}
	</div>
{:else}
	<h1 class="m-4 text-gray-700 dark:text-gray-100">Please select a point of sale</h1>
{/if}

{#if errorMessage !== ''}
	<ErrorMessage bind:message={errorMessage} />
{/if}
