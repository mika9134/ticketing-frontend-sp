<script>
	import { onMount } from 'svelte';
	import { formatFieldNames } from '$lib/utils.js';
	import { fetchForm } from '../../apis/form.js';
	import Fileupload from './fileupload.svelte';
	import GetLocationButton from '$lib/button/get-location-button.svelte';
	import HierarchicalCheckbox from '$lib/custom-input/hierarchicalCheckbox.svelte';
	import ErrorMessage from '$lib/message/errorMessage.svelte';
	import SuccessMessage from '$lib/message/successMessage.svelte';
	import Table from '../../routes/[company]/components/tables/table.svelte';
	import { form } from '$app/server';
	import AutoComplete from './autocomplete.svelte';

	let {
		showFormModal = $bindable(),
		closeUpdateModal = $bindable(),
		action_type,
		table_name,
		get_form_endpoint,
		header_endpoint,
		file,
		form_data,
		token,
		callback,
		row_clicked,
		row_clicked_show = async (row) => {
			return true;
		},
		closeCallback = () => {},
		handleOnChange,
		closeAfterSubmit = true,
		form_override = {},
		buttons_show = () => {},
		buttons_names = [],
		button_styles = [],
		buttons_callbacks = [],
		disable_save_and_add = false,
		disable_approve_all = true,
		fields_show = (k, v, f) => {
			return true;
		},
		tabs_show = (row, tab_name) => {
			return true;
		},

        // tooltip_enabled = false, 
        // fetch_tooltip_data = async (row) => { return null; }, 
		// hide_tooltip_parent = false,
	} = $props();

	let dialog = $state();
	let image_values = $state(null);
	let reset_image = $state(false);
	let closesAfterSubmit = $state(closeAfterSubmit);
	let refreshMessage = $state(false);
	let refreshTables = $state(false);
	let allOveridees = $state([]);

	$effect(() => {
		currentID = form_data === undefined ? null : form_data['id'];
		if (showFormModal) {
			reset_image = true;
			updateFormData(showFormModal);
			dialog.showModal();
		}
	});

	$effect((form_info_data) => {
		updateConditions();
		updateDepends();
		updateTabSelector();
	});

	async function loadHeader() {
		if (header_endpoint !== undefined && currentID) {
			let response = await fetchForm(`${header_endpoint}/${currentID}`, token);
			if (response.succeed) {
				header = response.data;
			}
		}
	}

	let response_success = $state(false);
	let clear_content = $state(false);
	let form_info = $state(null);
	let form_info_data = $state(null);
	let form_keys = $state([]);
	let form_values = $state([]);
	let form_depends = $state({});
	let form_conditional_show = $state({});
	let tabs = $state({});
	let tab_selector = $state('');
	let tabs_selected = $state([]);
	let tabKeys = $state([]);
	let activeTab = $state('');
	let useTabs = $state(false);
	let errorMessage = $state();
	let successMessage = $state();
	let containsLocation = $state(false);
	let latitude = $state(null);
	let longitude = $state(null);
	let currentID = $state(null);
	let add_data = $state({});
	let header = $state('');
	let conditional_keys = $state(null);

	async function updateDepends() {
		let depend_keys = Object.keys(form_depends);
		let depend_values = Object.values(form_depends);
		for (let index = 0; index < depend_keys.length; index += 1) {
			let depend_index = form_keys.indexOf(depend_values[index]);

			form_info_data[depend_keys[index]] =
				form_info.data[depend_keys[index]][form_values[depend_index]];
		}
	}

	// TODO: Update the comments to explain better rather than just for products
	async function updateConditions() {
		if (form_info && form_info.conditional_show){
			form_conditional_show.forEach((condition_check, index) => {
				let variable = condition_check['variable'];
				let condidtion_shows = condition_check['shows'];
				let conditions = condition_check['conditions'];
		
				if (conditions && typeof form_values[form_keys.indexOf(variable)] != 'object' && form_info.html_types[variable] === 'select'){
					conditional_keys = condidtion_shows[conditions[form_values[form_keys.indexOf(variable)]]]
				} else if (conditions) {
					conditional_keys = condidtion_shows["Default"]
				}
			});
		}
	}

	async function updateTabSelector() {
		if (tab_selector !== '') {
			let tabSelectorIndex = form_keys.indexOf(tab_selector);
			if (
				typeof form_values[tabSelectorIndex] === 'string' ||
				(Array.isArray(form_values[tabSelectorIndex]) && form_values[tabSelectorIndex].length == 0)
			) {
				tabs_selected = form_info.selector[tab_selector][form_values[tabSelectorIndex]];
			} else if (
				Array.isArray(form_values[tabSelectorIndex]) &&
				form_values[tabSelectorIndex].length > 0
			) {
				tabs_selected = form_info.selector[tab_selector][form_values[tabSelectorIndex].toString()];
			}
		}
		if (
			tabs_selected !== undefined &&
			tabs_selected.length == 0 &&
			form_info &&
			form_info.selector
		) {
			if (tabKeys.length > 0) {
				tabs_selected = [tabKeys[0]];
			}
		}
	}
	async function updateFormData(showFormModal) {
		try {
			form_info = await fetchForm(get_form_endpoint, token);

			await loadHeader();
			form_info_data = JSON.parse(JSON.stringify(form_info.data));

			if (form_info.tabs && Object.keys(form_info.tabs).length > 0) {
				tabs = form_info.tabs;
				tabKeys = [];

				Object.keys(tabs).forEach((tab) => {
					if (tabs_show(form_data, tab)) {
						tabKeys.push(tab);
					}
				});
				// tabKeys = Object.keys(tabs)

				activeTab = tabKeys[0];

				useTabs = true;
			} else {
				useTabs = false;
			}

			if (form_data) {
				form_keys = Object.keys(form_data);

				form_values = Object.values(form_data);

				let override_keys = Object.keys(form_override);
				for (let i = 0; i < override_keys.length; i++) {
					form_values[form_keys.indexOf(override_keys[i])] = form_override[override_keys[i]];
				}
			} else {
				form_keys = Object.keys(form_info.data);
				form_values = Object.values(form_info.data);
				let override_keys = Object.keys(form_override);
				let html_types = Object.values(form_info.html_types);

				for (let i = 0; i < override_keys.length; i++) {
					form_values[form_keys.indexOf(override_keys[i])] = form_override[override_keys[i]];
				}

				for (let j = 0; j < form_values.length; j++) {
					if (html_types[j] === 'hierarchical-checkbox') {
						form_values[j] = [];
					}
				}
			}
			if (form_info.depends) {
				form_depends = form_info.depends;
				updateDepends();
			}
			if (form_info.conditional_show) {
				form_conditional_show = form_info.conditional_show;
				updateConditions();
			}
			if (form_info.selector) {
				tab_selector = Object.keys(form_info.selector)[0];
				updateTabSelector();
			}
			for (let i = 0; i < form_keys.length; i++) {
				if (form_keys[i] === 'latitude') {
					containsLocation = true;
					latitude = form_values[i];
				}
				if (form_keys[i] === 'longitude') {
					longitude = form_values[i];
				}
			}
		} catch (error) {
			console.error('Error fetching table data:', error);
			errorMessage = error;
		}
	}
	async function handleSubmit(e) {
		let form_submit_data = Object.fromEntries(form_keys.map((k, i) => [k, form_values[i]]));
		if (image_values && Object.keys(image_values).length > 0) {
			Object.entries(image_values).forEach(([field, file]) => {
				form_submit_data[field] = file;
			});
		}
		if (containsLocation) {
			if (latitude !== '' || latitude !== null) {
				form_submit_data['latitude'] = latitude;
			}
			if (longitude !== '' || longitude !== null) {
				form_submit_data['longitude'] = longitude;
			}
		}
		for (const key in form_submit_data) {
			if (form_info.html_types[key] == 'section') {
				delete form_submit_data[key];
			} else {
				if (
					(typeof form_submit_data[key] === 'object' &&
						form_submit_data[key] !== null &&
						Object.keys(form_submit_data[key]).length === 0) ||
					form_submit_data[key] === null ||
					((form_submit_data[key] === '' || typeof form_submit_data[key] == 'object') &&
						!Array.isArray(form_submit_data[key]) &&
						typeof form_info.data[key] === 'object')
				) {
					form_submit_data[key] = null;
				}
			}
		}
		let result;

		if (form_data !== undefined) {
			currentID = form_data['id'];
		}

		if (closesAfterSubmit) {
			form_submit_data['submit'] = true;
		} else {
			form_submit_data['submit'] = false;
		}
		if (!currentID || (!useTabs && action_type == 'Add')) {
			result = await callback('Add', form_submit_data);
			if (result && result.succeed && result.data && result.data.id) {
				currentID = result.data.id;
				add_data = result.data;
				refreshTables = !refreshTables;
			}
		} else {
			form_submit_data['id'] = currentID;
			result = await callback('Update', form_submit_data, false);
			add_data = result.data;
		}

		response_success = result.succeed;

		if (response_success) {
			successMessage = result.error;
		} else {
			errorMessage = result.error;
		}
		refreshMessage = !refreshMessage;

		if (closesAfterSubmit) {
			header = '';
			closeCallback();
			dialog.close();
		} else {
			await loadHeader();
		}
	}

	function load_override(overidees) {
		let d = {};
		overidees.forEach((item) => {
			if (add_data !== undefined && add_data[item] !== undefined) {
				d[item] = add_data[item];
			} else if (form_data !== undefined && form_data[item] !== undefined) {
				d[item] = form_data[item];
			}
		});

		return d;
	}

	async function onFileSelected(event) {
		let selectedFile = event.detail.selectedFile;

		let field = event.detail.field_name;

		image_values = {
			...image_values,
			[field]: selectedFile
		};
		reset_image = false;
	}

	async function onLocationSelected(event) {
		latitude = event.detail.latitude;
		longitude = event.detail.longitude;
	}
	let optionValue = '';

	onMount(async () => {
		errorMessage = '';
		successMessage = '';
		header = '';
	});
</script>

{#if !useTabs || (useTabs && tabKeys.indexOf(activeTab) == tabKeys.length - 1)}
	{#key refreshMessage}
		{#if errorMessage && errorMessage !== ''}
			<ErrorMessage message={errorMessage} />
		{/if}
		{#if successMessage && successMessage !== ''}
			<SuccessMessage message={successMessage} />
		{/if}
	{/key}
{/if}
<dialog
	class="p-2 border-none bg-transparent backdrop:bg-black/50 w-full lg:w-fit"
	bind:this={dialog}
	onclose={async () => {
		showFormModal = false;
		errorMessage = '';
		header = '';
	}}
	onclick={(e) => {
		if (e.target === dialog) {
			dialog.close();
		}
	}}
>
	<!-- Modal Content Container -->
	{#key clear_content}
		<div
			class="relative overflow-x-hidden overflow-y-show p-4 w-full min-w-[520px] lg:w-fit h-fit bg-white dark:bg-[#0c1d37] rounded-lg shadow-lg dark:shadow-lg"
		>
			<!-- Header -->
			<div
				class="flex justify-between items-center pb-4 mb-4 {useTabs
					? 'border-none'
					: 'border-b'} dark:border-gray-600"
			>
				<div>
					<h3 class="text-xs lg:text-lg font-semibold text-gray-900 dark:text-white">
						{action_type}
						{table_name}
					</h3>
					<div class="text-black dark:text-gray-100 text-xs lg:text-sm pt-4 w-full">
						{@html header}
					</div>
				</div>
				<div class="flex justify-end gap-4">
					<button
						type="button"
						class="absolute top-4 right-4"
						aria-label="close modal button"
						onclick={async () => {
							dialog.close();

							if (action_type == 'Add' && currentID) {
								await callback('DELETE', { id: currentID });
							}
							closeCallback();
						}}
					>
						<svg
							class="w-5 h-5 fill-black dark:fill-white"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Tab -->
			{#if useTabs}
				<div class="border-b border-gray-200 dark:border-[#00527c] mb-4">
					<div class="flex gap-2">
						{#each tabKeys as tab, i}
							{#if form_info && tabs_show(form_data, tab)}
								{#if tabs_selected && ((tabs_selected.length > 0 && tabs_selected.includes(tab)) || tabs_selected.length == 0)}
									<!-- <span class="text-red-500">{Object.keys(form_info.tabs)[i]}</span>
									<span class="text-green-500">{tab}</span> -->
									<button
										type="button"
										onclick={() => {}}
										class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
            border border-b-0
            text-gray-700 bg-white hover:bg-gray-100
            dark:text-white dark:bg-[#0c1d37] dark:border-[#00527c] dark:hover:bg-[#003b5e]
            {activeTab === tab
											? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
											: 'bg-white'}"
									>
										{formatFieldNames(tab)}
									</button>
								{/if}
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			<form method="POST" action="javascript:void(0);">
				<!-- Grid for other inputs -->
				<div class="grid gap-4 mb-4 lg:grid-cols-4 sm:grid-cols-1">
					{#if form_info && form_keys && form_values && form_info.html_types}
						{#each form_keys as field, i}
							{#if fields_show(form_keys, form_values, field) && ((conditional_keys && conditional_keys.includes(field)) || !conditional_keys) && (!useTabs || (useTabs && tabs[activeTab].includes(field)) || (useTabs && tabs[activeTab].includes(`!${field}`) && tabs_selected.includes(field)))}
								{#if form_info.html_types[field] === 'hidden'}
									<input type="hidden" name={field} value={form_values[i]} />
								{:else if form_info.html_types[field] === 'section'}
									<div class="col-span-full mb-4">
										<p class="text-sm font-medium text-gray-900 dark:text-white">
											{formatFieldNames(field)}
										</p>
										<hr class="border-1 border-gray-400 mt-2" />
									</div>
								{:else if form_info.html_types[field] === 'text' && field !== 'latitude' && field !== 'longitude'}
									<!-- Text Input -->
									<div>
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
											>{formatFieldNames(field)}</label
										>

										<input
											type="text"
											id={field}
											name={field}
											disabled={form_info.disabled &&
												form_info.disabled.includes(field) &&
												form_data &&
												form_data[field] != null &&
												form_data[field] != ''}
											bind:value={form_values[i]}
											class="input w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
											placeholder="Enter {formatFieldNames(field)}"
										/>
									</div>
								{:else if form_info.html_types[field] === 'select'}
									<div class="h-full">
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
											>{formatFieldNames(field)}</label
										>

										<AutoComplete
											is_number={false}
											form_keys={Object.keys(Object.values(form_info_data)[i] || {})}
											form_values={Object.values(Object.values(form_info_data)[i] || {})}
											bind:current_key={form_values[i]}
											current_value={(form_data || form_values) &&
											form_info_data[field] !== undefined
												? form_info_data[field][
														form_values[i] != '' || form_data == undefined
															? form_values[i]
															: form_data[field]
													]
												: ''}
											disabled={form_info.disabled &&
												form_info.disabled.includes(field) &&
												form_data &&
												form_data[field] != null &&
												form_data[field] != ''}
											onchange={() => {
												updateDepends();
												updateTabSelector();
												updateConditions();
											}}
										/>
									</div>
								{:else if form_info.html_types[field] === 'select number'}
									<div>
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
											>{formatFieldNames(field)}</label
										>

										<AutoComplete
										
											is_number={true}
											form_keys={Object.keys(Object.values(form_info_data)[i] || {})}
											form_values={Object.values(Object.values(form_info_data)[i] || {})}
											bind:current_key={form_values[i]}
											current_value={(form_data || form_values) &&
											form_info_data[field] !== undefined
												? form_info_data[field][
														form_values[i] != '' ? form_values[i] : form_data[field]
													]
												: ''}
											disabled={form_info.disabled &&
												form_info.disabled.includes(field) &&
												form_data &&
												form_data[field] != null &&
												form_data[field] != ''}
											onchange={() => {
												updateDepends();
												updateTabSelector();
												updateConditions();
											}}

										/>
									</div>
								{:else if form_info.html_types[field] === 'radio'}
									<div>
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
										>
											{formatFieldNames(field)}
										</label>
										<div class="space-y-2 text-black">
											{#each Object.entries(Object.values(form_info.data)[i] || {}) as [optionKey, optionLabel]}
												<label
													class="flex items-center space-x-2 text-sm text-gray-700 dark:text-white"
												>
													<input
														type="radio"
														name={field}
														value={optionKey}
														bind:group={form_values[i]}
														checked={form_info.radio_depends &&
														form_info.radio_depends[field] &&
														form_data
															? optionKey ==
																form_data['permissions'][
																	form_values[form_keys.indexOf(form_info.radio_depends[field])]
																]
															: form_values[i] == optionKey}
														class="accent-brand-500"
													/>
													<span>{formatFieldNames(optionKey)}</span>
												</label>
											{/each}
										</div>
									</div>
								{:else if form_info.html_types[field] === 'select multiple'}
									<div>
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
										>
											{formatFieldNames(field)}
										</label>
										<select
											bind:value={form_values[i]}
											id={field}
											name={field}
											multiple
											class="w-full h-22 p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-800 focus:outline-none resize-none overflow-auto"
										>
											<option value="" disabled={form_values[i]?.length > 0}>None</option>
											{#each Object.entries(Object.values(form_info.data)[i] || {}) as [optionKey, optionLabel]}
												<option
													value={optionKey}
													selected={form_values[i]?.hasOwnProperty(optionKey)}
												>
													{optionLabel}
												</option>
											{/each}
										</select>
									</div>
								{:else if form_info.html_types[field] === 'select multiple number'}
									<div>
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
										>
											{formatFieldNames(field)}
										</label>
										<select
											bind:value={form_values[i]}
											id={field}
											name={field}
											multiple
											class="w-full h-22 p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-800 focus:outline-none resize-none overflow-auto"
										>
											<option value="" disabled={form_values[i]?.length > 0}>None</option>
											{#each Object.entries(Object.values(form_info.data)[i] || {}) as [optionKey, optionLabel]}
												<option
													value={!isNaN(+optionKey) ? +optionKey : optionKey}
													selected={form_values[i]?.hasOwnProperty(optionKey)}
												>
													{optionLabel}
												</option>
											{/each}
										</select>
									</div>
								{:else if form_info.html_types[field] === 'number'}
									<!-- Number Input -->
									<div>
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
											>{formatFieldNames(field)}</label
										>
										<input
											type="text"
											id={field}
											name={field}
											onchange={(evt) => {
												form_values[i] = Number(evt.target.value);
											}}
											disabled={form_info.disabled &&
												form_info.disabled.includes(field) &&
												form_data &&
												form_data[field] != null &&
												form_data[field] != ''}
											value={form_values[i]}
											class="input w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
											placeholder={`Enter ${formatFieldNames(field)}`}
											min="0"
										/>
									</div>
								{:else if form_info.html_types[field] === 'password'}
									<div>
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
											>{formatFieldNames(field)}</label
										>
										<input
											type="password"
											id={field}
											name={field}
											bind:value={form_values[i]}
											class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
											placeholder="••••••••"
										/>
									</div>
								{:else if form_info.html_types[field] === 'datetime-local'}
									<!-- Date/Time local Input -->
									<div>
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
											>{formatFieldNames(field)}</label
										>
										<input
											type="datetime-local"
											id={field}
											name={field}
											bind:value={form_values[i]}
											class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
										/>
									</div>
								{:else if form_info.html_types[field] === 'date'}
									<!-- Date Input -->
									<div>
										<label
											for={field}
											class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
											>{formatFieldNames(field)}</label
										>
										<input
											type="date"
											id={field}
											name={field}
											disabled={form_info.disabled &&
												form_info.disabled.includes(field) &&
												form_data &&
												form_data[field] != null &&
												form_data[field] != ''}
											bind:value={form_values[i]}
											class="input [color-scheme:light] dark:[color-scheme:dark] shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"/>
									</div>
								{:else if form_info.html_types[field] === 'hierarchical-checkbox'}
									{#if field !== 'hidden'}
										<label
											for={field}
											class="mb-2 text-sm font-medium text-gray-900 dark:text-white"
											>{formatFieldNames(field)}</label
										>
									{/if}
									{#each form_info.data[field] as node}
										<HierarchicalCheckbox {node} bind:selected={form_values[i]} />
									{/each}
								{:else if form_info.html_types[field] === 'table'}
									<div class="col-span-full overflow-x-scroll">
										{#key refreshTables}
											<Table
												get_table_endpoint={`${form_info.data[field]['get_many']}/${currentID}`}
												search_endpoint={form_info.data[field]['search']}
												get_form_endpoint={form_info.data[field]['form']}
												get_update_form_endpoint={form_info.data[field]['update_form']}
												get_table_endpoint_by_id={form_info.data[field]['get_by_id']}
												create_entry_url={form_info.data[field]['create_by_id']}
												update_entry_url={form_info.data[field]['update_by_id'] !== undefined
													? form_info.data[field]['update_by_id'] + '/' + currentID
													: undefined}
												delete_entry_url={form_info.data[field]['delete_by_id'] + '/' + currentID}
												header_endpoint={form_info.data[field]['header_endpoint'] + '/' + currentID}
												{token}
												table_name={`${form_info.data[field]['table_name']}`}
												module={form_info.data[field]['module']}
												get_id_bool={true}
												search_enabled={form_info.data[field]['search_enabled'] || true}
												form_override={form_info.data[field]['override'] === true
													? load_override(form_info.data[field]['overridee'])
													: {}}
												show_add_label={true}
												buttons_names={form_info.data[field]['inherit_buttons']
													? buttons_names
													: []}
												button_styles={form_info.data[field]['inherit_buttons']
													? button_styles
													: []}
												buttons_callbacks={form_info.data[field]['inherit_buttons']
													? buttons_callbacks
													: []}
												{buttons_show}
												copyable_fields={form_info.data[field]['copyable_fields']}
												after_submit_callback={() => {
													loadHeader();
												}}
												{row_clicked}
												{row_clicked_show}
												{fields_show}
												reset_current_page={true}

											/>
										{/key}
									</div>
								{/if}
							{/if}
						{/each}
						<!-- Render Get Location button and location fields together -->
					{:else}
						<p>Loading form fields...</p>
					{/if}
				</div>

				<!-- File/Image Input -->
				{#if form_info && form_keys && form_values}
					{#each form_keys as field, i}
						{#if fields_show(form_keys, form_values, field) && ((conditional_keys && conditional_keys.includes(field)) || !conditional_keys) && (!useTabs || (useTabs && tabs[activeTab].includes(field)) || (useTabs && tabs[activeTab].includes(`!${field}`) && tabs_selected.includes(field)))}
							{#if form_info.html_types[field] === 'file'}
								<div class="mb-4">
									<label
										for="file-upload"
										class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
										>Upload Image</label
									>
									<Fileupload
										field_name={field}
										image_value={form_values[i]}
										docTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp']}
										on:change={onFileSelected}
										bind:reset={reset_image}
									/>
								</div>
							{/if}
						{/if}
					{/each}
				{/if}

				{#if form_info && form_keys && form_values}
					{#each form_keys as field, i}
						{#if !useTabs || (useTabs && tabs[activeTab].includes(field))}
							{#if form_info.html_types[field] === 'pdf'}
								<div class="mb-4">
									<label
										for="file-upload"
										class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
										>Upload PDF</label
									>
									<Fileupload
										field_name={field}
										image_value={form_values[i]}
										on:change={onFileSelected}
										bind:reset={reset_image}
										docTypes={['application/pdf']}
									/>
								</div>
							{/if}
						{/if}
					{/each}
				{/if}

				<!-- Textarea (Description) -->
				{#if form_info && form_keys && form_values}
					{#each form_keys as field, i}
						{#if !useTabs || (useTabs && tabs[activeTab].includes(field))}
							{#if form_info.html_types[field] === 'textarea'}
								<div class="mb-4">
									<label
										for={field}
										class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
										>{formatFieldNames(field)}</label
									>
									<textarea
										id={field}
										name={field}
										bind:value={form_values[i]}
										class="textarea shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 w-full"
										placeholder={`Enter ${formatFieldNames(field)}`}
									></textarea>
								</div>
							{/if}
						{/if}
					{/each}
				{/if}

				{#if form_info && form_keys && form_values}
					{#each form_keys as field, i}
						{#if !useTabs || (useTabs && tabs[activeTab].includes(field))}
							{#if form_info.html_types[field] === 'checkbox'}
								<label
									for={field}
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>{formatFieldNames(field)}</label
								>
								{#each Object.entries(Object.values(form_info.data)[i] || {}) as [optionKey, optionLabel]}
									<div class="">
										<label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
											<input
												type="checkbox"
												id={optionKey}
												name={optionKey}
												value={!isNaN(+optionKey) ? +optionKey : optionKey}
												selected={form_values[i]?.hasOwnProperty(optionKey)}
												bind:group={form_values[i]}
												class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
											/>
											{formatFieldNames(optionLabel)}
										</label>
									</div>
								{/each}
							{/if}
						{/if}
					{/each}
				{/if}
				{#if form_keys.includes('latitude') && form_keys.includes('longitude')}
					{#if !useTabs || (useTabs && (tabs[activeTab].includes('latitude') || tabs[activeTab].includes('longitude')))}
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
							<div>
								<label
									for="latitude"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>Latitude</label
								>
								<input
									type="text"
									id="latitude"
									name="latitude"
									bind:value={latitude}
									class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
									placeholder="Enter Latitude"
								/>
							</div>

							<div>
								<label
									for="longitude"
									class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
									>Longitude</label
								>
								<input
									type="text"
									id="longitude"
									name="longitude"
									bind:value={longitude}
									class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
									placeholder="Enter Longitude"
								/>
							</div>
						</div>
						<div class="col-span-full mt-4">
							<GetLocationButton on:location={onLocationSelected} />
						</div>
					{/if}
				{/if}
				<!-- {#if containsLocation}
				{#if !useTabs || (useTabs && tabs[activeTab].includes('latitude'))}
					<GetLocationButton on:location={onLocationSelected} />
				{/if}
			{/if} -->

				<!-- Submit Button -->
				<div class="flex gap-4 justify-end">
					{#if !useTabs}
						{#if !disable_save_and_add || action_type == 'Update'}
							{#if action_type == 'Update' && !disable_approve_all}
								<button
									class="btn btn-neutral bg-black/10 w-fit text-white hover:bg-black/40 disabled:opacity-50"
								>
									Approve All
								</button>
							{/if}
							<button
								onclick={() => {
									if (action_type == 'Update' || action_type == 'Change') {
										closesAfterSubmit = true;
										handleSubmit({});
									} else {
										closesAfterSubmit = false;
										handleSubmit({});
									}
									for (let i = 0; i < form_keys.length; i++) {
										if (!Object.keys(form_override).includes(form_keys[i])) {
											if (
												form_info.selector !== undefined &&
												Object.keys(form_info.selector).includes(form_keys[i])
											) {
												if (Array.isArray(form_values[i])) form_values[i] = [];
												else form_values[i] = '';
											} else form_values[i] = Object.values(form_info.data)[i];
										}
									}

									clear_content = !clear_content;
									if (useTabs) {
										tab_selector = Object.keys(form_info.selector)[0];
										form_data = undefined;
										activeTab = tabKeys[0];
									}
									if (!Object.keys(form_override).includes('id')) {
										currentID = null;
									}
								}}
								class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
							>
								Save & {action_type}
							</button>
						{/if}
						{#if action_type == 'Add'}
							<button
								onclick={() => {
									closesAfterSubmit = true;
									handleSubmit({});
								}}
								class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
							>
								Submit
							</button>
						{/if}
					{:else}
						{#if tabKeys.indexOf(activeTab) > 0}
							<button
								onclick={() => {
									closesAfterSubmit = false;
									if (form_info.create_on.includes(activeTab)) {
										handleSubmit({});
									}
									if (!form_info.selector) {
										activeTab = tabKeys[tabKeys.indexOf(activeTab) - 1];
									} else {
										activeTab = tabs_selected[tabs_selected.indexOf(activeTab) - 1];
									}
								}}
								class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
							>
								Previous
							</button>
						{/if}
						{#if tabKeys.indexOf(activeTab) < tabKeys.length - 1}
							{#if (tabs_selected && form_info.selector !== undefined && tabs_selected.indexOf(activeTab) < tabs_selected.length - 1) || !form_info.selector}
								<button
									onclick={() => {
										closesAfterSubmit = false;
										if (form_info.create_on.includes(activeTab)) {
											handleSubmit({});
										}
										if (!form_info.selector) {
											activeTab = tabKeys[tabKeys.indexOf(activeTab) + 1];
										} else {
											activeTab = tabs_selected[tabs_selected.indexOf(activeTab) + 1];
										}
									}}
									class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
								>
									Next
								</button>
							{:else}
								{#if !disable_save_and_add}
									<button
										onclick={() => {
											if (action_type == 'Update' || action_type == 'Change') {
												closesAfterSubmit = true;
												handleSubmit({});
											} else {
												closesAfterSubmit = false;
												handleSubmit({});
											}

											for (let i = 0; i < form_keys.length; i++) {
												if (!Object.keys(form_override).includes(form_keys[i])) {
													if (
														form_info.selector !== undefined &&
														Object.keys(form_info.selector).includes(form_keys[i])
													) {
														if (Array.isArray(form_values[i])) form_values[i] = [];
														else form_values[i] = '';
													} else {
														form_values[i] = Object.values(form_info.data)[i];
													}
												}
											}
											clear_content = true;
											if (useTabs) {
												tab_selector = Object.keys(form_info.selector)[0];
												form_data = undefined;

												activeTab = tabKeys[0];
											}
											currentID = null;
										}}
										class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
									>
										Save & {action_type}
									</button>
								{/if}
								{#if action_type == 'Add'}
									<button
										onclick={() => {
											closesAfterSubmit = true;
											handleSubmit({});
										}}
										class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
									>
										Submit
									</button>
								{/if}
							{/if}
						{:else}
							{#if !disable_save_and_add}
								<button
									onclick={() => {
										if (action_type == 'Update' || action_type == 'Change') {
											closesAfterSubmit = true;
											handleSubmit({});
										} else {
											closesAfterSubmit = false;
											handleSubmit({});
										}
										for (let i = 0; i < form_keys.length; i++) {
											if (!Object.keys(form_override).includes(form_keys[i])) {
												if (
													form_info.selector !== undefined &&
													Object.keys(form_info.selector).includes(form_keys[i])
												) {
													if (Array.isArray(form_values[i])) form_values[i] = [];
													else form_values[i] = '';
												} else form_values[i] = Object.values(form_info.data)[i];
											}
										}
										clear_content = !clear_content;
										if (useTabs) {
											tab_selector = Object.keys(form_info.selector)[0];
											form_data = undefined;

											activeTab = tabKeys[0];
										}
										currentID = null;
									}}
									class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
								>
									Save & {action_type}
								</button>
							{/if}
							{#if action_type == 'Add'}
								<button
									onclick={() => {
										closesAfterSubmit = true;
										handleSubmit({});
									}}
									class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
								>
									Submit
								</button>
							{/if}
						{/if}
					{/if}
				</div>
			</form>
		</div>
	{/key}
</dialog>
