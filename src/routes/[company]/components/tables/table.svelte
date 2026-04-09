<script>
	import { onMount, tick } from 'svelte';
	import { goto, onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		fetchTable,
		fetchHiddenFields,
		fetchSearchColumns,
		exportCSV,
		fetchSummary,
		fetch_all_filters
	} from '../../../../apis/table';
	import { deleteItem, updateForm, addForm, fetchForm } from '../../../../apis/form.js';
	import { formatFieldNames } from '$lib/utils';
	import RefreshButton from '../buttons/refresh-button.svelte';

	import { hasPrivilege } from '$lib/role.js';
	import { roles } from '../../../../stores/roleStore.js';
	import { host } from '../../../../apis/config';
	import { getAccessToken } from '../../../../stores/tokenStore';
	import DeleteModal from '$lib/modals/deleteModal.svelte';
	import ReverseModal from '$lib/modals/reverseModal.svelte';
	import Modal from '$lib/modals/createForm.svelte';
	import { getCompanyName } from '../../../../stores/companyStore.js';
	import ErrorMessage from '$lib/message/errorMessage.svelte';
	import SuccessMessage from '$lib/message/successMessage.svelte';
	import StatusChangeModal from '$lib/modals/statusChangeModal.svelte';
	import ImportModal from '$lib/modals/import.svelte';
	import AutoComplete from '../../../../lib/modals/autocomplete.svelte';

	import DatePicker from '../calendar/datepicker.svelte';

	let showDatePicker = $state(false);

	let startDate = '';
	let endDate = '';
	let pickerKey = 0;
	let current_columns = [];
	let current_filter_values = [];

	function openDatePicker() {
		showDatePicker = true;
	}

	function closeDatePicker() {
		showDatePicker = false;

		startDate = '';
		endDate = '';
		showDatePicker = false;

		// pickerKey += 1;
	}

	async function updateFormData(showFormModal) {
		try {
			form_info = await fetch_all_filters(get_form_endpoint, token);

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

	function exportWithDates() {
		exportData(startDate, endDate, additional_param);
		closeDatePicker();
	}

	let {
		form_data,
		showFormModal = $bindable(),
		get_table_endpoint,
		summerize_endpoint,
		search_endpoint,
		table_name,
		get_form_endpoint,
		get_update_form_endpoint,
		get_table_endpoint_by_id,
		get_export_endpoint,
		header_endpoint,
		create_entry_url,
		update_entry_url,
		delete_entry_url,
		void_entry_url,
		approve_request_url,
		reject_request_url,
		reverse_status_endpoint_by_id,
		get_id_bool,
		token,
		module,
		buttons_names = [],
		buttons_callbacks = [],
		button_styles = [],
		after_submit_callback,
		statusOptions = [],
		isHierarchical = false,
		handleOnChange,
		closeAfterSubmit = true,
		importEnabled = false,
		min_access_policy,
		add_callback,
		condition_check,
		form_override = {},
		row_clicked,
		row_clicked_show = async (row) => {
			return true;
		},
		buttons_show = () => {
			return true;
		},
		default_search_string = [],
		default_search_column = [],
		search_enabled = true,
		kebab_enabled = false,
		show_add_label = true,
		is_double_click = false,
		hide_buttons_parent = false,
		disable_save_and_add = false,
		fields_show = (k, v, f) => {
			return true;
		},
		tabs_show = (row, tab_name) => {
			return true;
		},
		enable_print = false,
		disable_date_filter = false,
		print_html = async (row_id) => {},
		additional_param = {},
		copyable_fields = [],
		reset_current_page = false,
		filter_endpoint = undefined

		// tooltip_enabled = false,
		// fetch_tooltip_data = async (row) => { return null; },
		// tooltip_endpoint,
		// hide_tooltip_parent = false,
	} = $props();
	let form_values = $state([]);
	let form_depends = $state({});

	let form_info = $state(null);
	let form_info_data = $state(null);
	let form_keys = $state([]);

	let filter_result = $state({});
	let importDialog;
	let highlight_row = $state('');
	let refreshMessage = $state(false);
	let current_page = $state(1);
	let search_string = $state([]);
	let start_date = $state('');
	let end_date = $state('');
	let pageSize = $state(10);
	let columnSearch = $state([]);
	let columnsToSearch = $state([]);
	let maxPages = $state(1);
	let total_items = $state(0);
	let selectedRow = $state(null);
	let uses_get_by_id = $state(get_id_bool);
	let showFormModalAdd = $state(false);
	let showFormModalUpdate = $state([]);
	let showDeleteModal = $state(false);
	let showReverseModal = $state(false);
	let pageNumber = $state(1);
	let userRoles = $state({});
	let columns = $state(true);
	let company_name = $state();
	let table_data = $state([]);
	let table_id_data = $state([]);
	let table_data_total = $state([]);
	let expanded_row_id = $state([]);
	let expanded_row_level = $state([]);
	let expanded_row_level_id = $state([]);
	let openDropdownId = $state(null);
	let errorMessage = $state();
	let successMessage = $state();
	let action_type = '';
	let importOpen = $state(false);
	let userRolesPrivilege = $state([]);
	let selected = $state([]);
	let logRefNode;
	let summaryData = $state(null);
	let showSummaryBox = $state(false);
	let html_print = $state(false);
	let reload_modal = $state(false);
	// let hoveredRowIndex = $state(null);
	// let tooltipData = $state(null);
	// let tooltipLoading = $state(false);
	// let mouseX = $state(0);
	// let mouseY = $state(0);

	// let tooltip_data = $state({});

	let deletePopupMessage = $state("Are you sure you want to delete this item? This action cannot be undone.");

	$effect(() => {
		if (search_enabled == false) {
			search_string = default_search_string;
			columnSearch = default_search_column;
		}
		if (showFormModal) {
			updateFormData(showFormModal);
		}
	});

	// async function updateDepends() {
	// 	let depend_keys = Object.keys(form_depends);
	// 	let depend_values = Object.values(form_depends);
	// 	for (let index = 0; index < depend_keys.length; index += 1) {
	// 		let depend_index = form_keys.indexOf(depend_values[index]);

	// 		form_info_data[depend_keys[index]] =
	// 			form_info.data[depend_keys[index]][form_values[depend_index]];
	// 	}
	// }

	// async function updateTabSelector() {
	// 	if (tab_selector !== '') {
	// 		let tabSelectorIndex = form_keys.indexOf(tab_selector);
	// 		if (
	// 			typeof form_values[tabSelectorIndex] === 'string' ||
	// 			(Array.isArray(form_values[tabSelectorIndex]) && form_values[tabSelectorIndex].length == 0)
	// 		) {
	// 			tabs_selected = form_info.selector[tab_selector][form_values[tabSelectorIndex]];
	// 		} else if (
	// 			Array.isArray(form_values[tabSelectorIndex]) &&
	// 			form_values[tabSelectorIndex].length > 0
	// 		) {
	// 			tabs_selected = form_info.selector[tab_selector][form_values[tabSelectorIndex].toString()];
	// 		}
	// 	}
	// 	if (
	// 		tabs_selected !== undefined &&
	// 		tabs_selected.length == 0 &&
	// 		form_info &&
	// 		form_info.selector
	// 	) {
	// 		if (tabKeys.length > 0) {
	// 			tabs_selected = [tabKeys[0]];
	// 		}
	// 	}
	// }

	function updateRoles(module) {
		if (typeof module === 'string') {
			if (userRoles[module] !== undefined) {
				userRolesPrivilege.push(userRoles[module]);
			}
		} else {
			module.forEach((m) => {
				if (userRoles[m] !== undefined) {
					userRolesPrivilege.push(userRoles[m]);
				}
			});
		}
	}

	async function print_callback(row) {
		html_print = await print_html(row);

		if (html_print.succeed === false) {
			errorMessage = html_print.error;
			successMessage = '';
			return;
		}

		var printContents = html_print.html;
		let w = window.open();
		w.document.write(printContents);
		w.print();
		w.close();
	}

	async function openUpdateModal(row) {
		selectedRow = row;
		await tick(); // wait for DOM to reflect form_data
		// showUpdateModal = true;
		table_data[0]['show'] = true;
	}

	async function closeUpdateModal() {
		table_data = await fetchTable(get_table_endpoint, token);
	}

	function openDeleteModal(row) {
		selectedRow = row;
		showDeleteModal = true;
	}
	// Close the modal
	function closeDeleteModal() {
		showDeleteModal = false;
		selectedRow = null;
	}

	function openReverseModal(row) {
		selectedRow = row;
		showReverseModal = true;
	}
	// Close the modal
	function closeReverseModal() {
		showReverseModal = false;
		selectedRow = null;
	}

	async function handleSubmit(action, form_submit_data) {
		let result;

		if (action == 'Add' && create_entry_url !== null) {
			result = await addForm(create_entry_url, form_submit_data, token);
		} else if (action == 'Update' && update_entry_url !== null) {
			result = await updateForm(update_entry_url, form_submit_data, token);
		} else if (action == 'DELETE' && delete_entry_url !== null) {
			result = await handleDelete(form_submit_data['id']);
		} else {
			result = {
				succeed: false,
				error: 'Feature not supported',
				data: null
			};
		}
		if (result.succeed == true) {
			successMessage = result.error;
			errorMessage = '';

			if (after_submit_callback) {
				after_submit_callback(result, action_type);
			}
		} else {
			errorMessage = result.error;
			successMessage = '';
		}

		refreshMessage = !refreshMessage;
		return result;
	}

	$effect(async (search_endpoint) => {
		await loadTable();
	});

	export async function loadTable() {
		try {
			if (token == null || token == '') {
				token = getAccessToken();
			}

			if (token === null || token === '' || token === undefined) {
				return;
			}

			maxPages = 1;
			total_items = 0;

			if (search_endpoint != '' && search_endpoint !== undefined) {
				let temp = await fetchSearchColumns(search_endpoint, token);

				columnsToSearch = temp.data;

				if (columnsToSearch && columnsToSearch.length) {
					columnsToSearch.forEach((i) => {
						search_string.push('');
						columnSearch.push(i);
					});
				}
			}

			// Fetch hidden fields

			const hiddenFields = await fetchHiddenFields(table_name, token);

			let current_columns = [];
			let current_filter_values = [];
			search_string.forEach((item, i) => {
				if (item) {
					current_columns.push(columnSearch[i]);
					current_filter_values.push(search_string[i]);
				}
				// Fetch table data
			});

			if (isHierarchical) {
				expanded_row_id = [];

				table_data_total = await fetchTable(
					get_table_endpoint,
					token,
					current_page,
					pageSize,
					current_columns,
					current_filter_values,
					(additional_param = additional_param),
					(start_date = start_date),
					(end_date = end_date)
				);
				if (table_data_total.succeed == false) {
					errorMessage = table_data_total.error;
				} else {
					if (table_data_total.data != null) {
						maxPages = table_data_total.data.paginationInfo.totalPages;
						total_items = table_data_total.data.paginationInfo.totalItems;

						if (table_data_total.data.deletePopupMessage) {
							deletePopupMessage = table_data_total.data.deletePopupMessage;
						}
						table_data_total = table_data_total.data.items;
						table_data = table_data_total;
						expanded_row_level = [];
						expanded_row_level_id = [];

						for (let x = 0; x < table_data.length; x++) {
							expanded_row_level.push(1);
							expanded_row_level_id.push(table_data[x]['id']);
						}
					}
				}
			} else {
				table_data = await fetchTable(
					get_table_endpoint,
					token,
					current_page,
					pageSize,
					current_columns,
					current_filter_values,
					(additional_param = additional_param),
					(start_date = start_date),
					(end_date = end_date)
				);

				if (table_data.succeed == false) {
					errorMessage = table_data.error;
				} else {
					if (table_data.data != null) {
						maxPages = table_data.data.paginationInfo.totalPages;
						total_items = table_data.data.paginationInfo.totalItems;
                    
						if (table_data.data.deletePopupMessage) {
							deletePopupMessage = table_data.data.deletePopupMessage;
						}
						table_data = table_data.data.items;
					}
				}
			}

			if (table_data && table_data.length > 0) {
				let cols = Object.keys(table_data[0]);

				// Exclude hidden fields
				cols = cols.filter((col) => !hiddenFields.includes(col));

				if (cols.includes('id')) {
					cols = cols.filter((col) => col !== 'id');
					cols.unshift('id');
				}

				for (let i = 0; i < table_data.length; i++) {
					await tick();
					showFormModalUpdate[i] = false;
				}

				columns = cols; // Set the filtered columns
			}

			reload_modal = !reload_modal;
		} catch (error) {
			errorMessage = error;
		}
	}

	// export async function loadToolTipData(row) {
	// 	try {
	// 		if (token == null || token == '') {
	// 			token = getAccessToken();
	// 		}

	// 		if (token === null || token === '' || token === undefined) {
	// 			return;
	// 		}

	// 		// let temporary_endpoint = new URL(`${tooltip_endpoint}`);
	// 		// temporary_endpoint.searchParams.append('link_id', territory);

	// 		const tooltip_response = await fetchTable(
	// 			tooltip_endpoint + `/${row.id}`,
	// 			token,
	// 			current_page,
	// 		);

	// 		if (tooltip_response.succeed == false) {
	// 			errorMessage = tooltip_response.error;
	// 		} else {
	// 			if (tooltip_response.data != null) {
	// 				tooltip_data = tooltip_response.data;
	// 			}
	// 		}
	// 	} catch (error) {
	// 		errorMessage = error;
	// 	}
	// }

	async function fetchUpdate_table_by_Id(id) {
		try {
			if (uses_get_by_id) {
				table_id_data = await fetchTable(get_table_endpoint_by_id + id, token);
				table_id_data = table_id_data.data;
				return table_id_data;
			} else {
				table_id_data = table_data[id];
				return table_data[id];
			}
		} catch (error) {
			errorMessage = error;
		}
	}

	async function handleReversal(id) {
		const url = `${reverse_status_endpoint_by_id}/${id}`;

		let result = await updateForm(url, null, token);

		if (result) {
			if (!result.succeed) {
				errorMessage = result.error;
			} else {
				successMessage = result.error;
				loadTable();
				if (after_submit_callback) {
					after_submit_callback({}, action_type);
				}
			}
		}
		closeReverseModal();

		return result;
	}

	async function handleDelete(id) {
		const url = `${delete_entry_url}/${id}`; // Append the row ID to the delete URL

		let result = await deleteItem(url, token);

		if (result) {
			if (!result.succeed) {
				errorMessage = result.error;
			} else {
				successMessage = result.error;
				loadTable();
				if (after_submit_callback) {
					after_submit_callback({}, action_type);
				}
			}
		}
		// Remove the deleted row from the table
		closeDeleteModal();

		return result;
	}

	function expandTableItem(row) {
		if (!expanded_row_id.includes(row['id'])) {
			expanded_row_id.push(row['id']);

			table_data.splice(table_data.indexOf(row) + 1, 0, ...row['hidden']);

			let x = 1;
			for (let i = 0; i < row['hidden'].length; i++) {
				expanded_row_level.splice(
					table_data.indexOf(row) + x,
					0,
					expanded_row_level[table_data.indexOf(row)] + 1
				);
				expanded_row_level_id.splice(table_data.indexOf(row) + x, 0, row['hidden'][i]['id']);
				x += 1;
			}
		}
	}

	function extractHiddenHeirarchy(row) {
		let x = [];

		for (let i = 0; i < row['hidden'].length; i++) {
			x.push(row['hidden'][i]);
			x.push(...extractHiddenHeirarchy(row['hidden'][i]));
		}

		return x;
	}
	function collapseTableItem(row) {
		let all_children = extractHiddenHeirarchy(row);

		if (expanded_row_id.includes(row['id'])) {
			expanded_row_id.splice(expanded_row_id.indexOf(row['id']), 1);

			for (let i = 0; i < all_children.length; i++) {
				let index = table_data.indexOf(all_children[i]);

				if (index > -1) {
					table_data.splice(index, 1);
				}
			}

			all_children.forEach((child) => {
				if (expanded_row_level_id.includes(child['id'])) {
					let index = expanded_row_level_id.indexOf(child['id']);
					expanded_row_level_id.splice(index, 1);
					expanded_row_level.splice(index, 1);
				}
			});
		}
	}

	async function init() {
		company_name = getCompanyName();
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
			updateRoles(module);
		});

		if (token == null) {
			token = getAccessToken();
		}
		loadTable();
	}

	onMount(async () => {
		init();
		if (filter_endpoint != undefined) {
			const response = await fetch_all_filters(filter_endpoint, token);
			filter_result = response.data;
		}

		logRefNode = document.getElementById('log_title');

		const searchParams = new URLSearchParams(window.location.search);

		if (searchParams.get('page')) {
			current_page = parseInt(searchParams.get('page'));
		}

		if (reset_current_page) {
			current_page = 1;
		}
		if (searchParams.get('row')) {
			highlight_row = searchParams.get('row');
		}
	});

	function toggleDropdown(id) {
		openDropdownId = openDropdownId === id ? null : id;
	}

	function closeDropdown() {
		openDropdownId = null;
	}

	let getStatusButtonClass = (status) => {
		return 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-gray-300';
	};

	async function downloadTemplate() {
		let form_info = await fetchForm(get_form_endpoint, token);
		let form_data = form_info.data;
		let columnNames = Object.keys(form_data);

		let csvContent = 'data:text/csv;charset=utf-8,' + columnNames.join(',');

		var encodedUri = encodeURI(csvContent);
		window.open(encodedUri);
	}

	async function exportData(startdate, enddate, additional_param) {
		let export_data = await fetchTable(
			get_export_endpoint,
			token,
			1,
			10,
			'',
			'',
			additional_param,
			startdate,
			enddate
		);

		if (export_data.succeed == false) {
			errorMessage = export_data.error;
		}

		// --- DEBUG SECTION: Check the console for these outputs ---
		// console.log("Full export_data:", export_data.data.items);
		const itemsList = export_data?.data?.items?.items || [];
		const productsList = export_data?.data?.items?.products || [];
		const orderedList = export_data?.data?.items?.ordered || [];

		const name1 = export_data?.data?.items?.file_names[0];
		const name2 = export_data?.data?.items?.file_names[1];
		const name3 = export_data?.data?.items?.file_names[2];

		exportCSV([itemsList, productsList, orderedList], [name1, name2, name3]);
	}
	function logData(text) {
		var newMessageNode = document.createElement('li');
		newMessageNode.innerHTML = text;
		var list = document.getElementById('import_history');
		list.insertBefore(newMessageNode, logRefNode.nextSibling);

		logRefNode = newMessageNode;
	}

	async function importData(csv_file) {
		var lis = document.querySelectorAll('#import_history li');

		for (var i = 1; i < lis.length; i++) {
			lis[i].parentNode.removeChild(lis[i]);
		}

		importDialog.showModal();

		let form_info = await fetchForm(get_form_endpoint, token);
		let form_data = form_info.data;
		let columnNames = Object.keys(form_data);
		let columnTypes = Object.values(form_info.html_types);
		let form_depends = {};

		if (form_info.depends) {
			form_depends = form_info.depends;
		}

		csv_file.text().then(async (csv_data) => {
			let lines = csv_data.split('\n');
			let row_index = 0;
			for (var row in lines) {
				let row_data = lines[row].replace(/^\s+|\s+$/g, '').split(',');

				let form_submit_data = {};

				if (row > 0 && row_data.length === columnNames.length) {
					for (var column in row_data) {
						if (columnTypes[column] == 'section') {
							continue;
						}
						if (
							((columnTypes[column] == 'text' || columnTypes[column] == 'hidden') &&
								typeof form_data[columnNames[column]] === 'string') ||
							form_data[columnNames[column]] === null
						) {
							let float_data = parseFloat(row_data[column]);

							if (!isNaN(float_data) && columnTypes[column] == 'hidden') {
								form_submit_data[columnNames[column]] = float_data;
							} else {
								form_submit_data[columnNames[column]] = row_data[column];
							}
						} else if (columnTypes[column] == 'number') {
							form_submit_data[columnNames[column]] = parseFloat(row_data[column]);
						} else if (columnTypes[column] == 'date') {
							form_submit_data[columnNames[column]] = row_data[column];
						} else if (
							columnTypes[column] == 'select' ||
							columnTypes[column] == 'select number' ||
							columnTypes[column] == 'hidden'
						) {
							let data_keys = Object.keys(form_data[columnNames[column]]);

							let data_values = [];

							if (Object.keys(form_depends).includes(columnNames[column])) {
								let parent = form_depends[columnNames[column]];

								let data_parent = row_data[columnNames.indexOf(parent)];

								if (typeof form_data[parent][Object.keys(form_data[parent])[0]] == 'string') {
									data_parent = Object.keys(form_data[parent])[
										Object.values(form_data[parent]).indexOf(data_parent)
									];
								}
								if (data_parent == undefined) {
									errorMessage = `${row_data[columnNames.indexOf(parent)]} does not correspond to a known ${parent}`;

									logData(`Entry ${row_index}: ${errorMessage}`);
								}
								let data_dependant = form_data[columnNames[column]][data_parent];

								data_values = Object.values(data_dependant);

								let dropdownIndex = data_values.indexOf(row_data[column]);

								if (dropdownIndex !== -1) {
									form_submit_data[columnNames[column]] =
										Object.keys(data_dependant)[dropdownIndex];
								} else {
									errorMessage = `${row_data[column]} is an invalid ${columnNames[column]}. Stopping!`;
									refreshMessage = !refreshMessage;
									logData(`Entry ${row_index}: ${errorMessage}`);
									logData(`Stopped`);
									return;
								}
							} else {
								data_values = Object.values(form_data[columnNames[column]]);

								let dropdownIndex = data_values.indexOf(row_data[column]);

								if (dropdownIndex !== -1) {
									form_submit_data[columnNames[column]] = data_keys[dropdownIndex];
								}
							}
						}
					}
					let result = await addForm(create_entry_url, form_submit_data, token);

					if (result.succeed) {
						successMessage = result.error;
						loadTable();
						logData(`Entry ${row_index}: ${successMessage}`);
					} else {
						errorMessage = result.error;
						logData(`Entry ${row_index}: ${errorMessage}`);
					}
				}
				row_index += 1;
			}
			logData(`Finished`);
		});
	}

	// function updateMousePosition(e) {
	//     const tooltipWidth = 280; // approximate width of the tooltip box
	//     const tooltipHeight = 150; // approximate height

	//     // If too close to the RIGHT edge, flip it to the LEFT of the mouse
	//     if (window.innerWidth - e.clientX < tooltipWidth) {
	//         mouseX = e.clientX - tooltipWidth;
	//     } else {
	//         mouseX = e.clientX + 15;
	//     }

	//     // If too close to the BOTTOM edge, flip it UPWARDS
	//     if (window.innerHeight - e.clientY < tooltipHeight) {
	//         mouseY = e.clientY - tooltipHeight;
	//     } else {
	//         mouseY = e.clientY + 15;
	//     }
	// }

	// async function handleMouseEnter(e, row, index) {
	//     hoveredRowIndex = index;
	//     tooltipLoading = true;
	//     tooltipData = null;

	//     // Calculate position safely
	//     updateMousePosition(e);

	//     // Capture the current index to prevent race conditions
	//     let currentIndex = index;

	//     if (tooltip_data) {
	//         try {
	//             let data = await loadToolTipData(row);
	//             if (hoveredRowIndex === currentIndex) {
	//                 tooltipData = data;
	//             }
	//         } catch (error) {
	//             if (hoveredRowIndex === currentIndex) {
	//                 tooltipData = { error: "Failed to load data" };
	//             }
	//         }
	//     }

	//     if (hoveredRowIndex === currentIndex) {
	//         tooltipLoading = false;
	//     }
	// }

	// function handleMouseMove(e) {
	//     if (hoveredRowIndex !== null) {
	//         updateMousePosition(e);
	//     }
	// }

	// function handleMouseLeave() {
	//     hoveredRowIndex = null;
	//     tooltipData = null;
	//     tooltipLoading = false;
	// }
</script>

<div class="m-1 w-full">
	<ImportModal
		isOpen={importOpen}
		template_callback={downloadTemplate}
		browse_callback={importData}
		handleClose={() => {
			importOpen = false;
		}}
	/>

	{#each table_data as row, index}

		<Modal
			bind:closeUpdateModal
			{table_name}
			{token}
			get_form_endpoint={get_update_form_endpoint !== undefined
				? get_update_form_endpoint
				: get_form_endpoint}
			action_type={'Update'}
			bind:showFormModal={showFormModalUpdate[index]}
			form_data={table_id_data}
			callback={handleSubmit}
			{handleOnChange}
			{closeAfterSubmit}
			{form_override}
			{header_endpoint}
			closeCallback={() => {
				if (!isHierarchical) loadTable();
			}}
			{buttons_show}
			{buttons_names}
			{buttons_callbacks}
			{button_styles}
			{row_clicked}
			{row_clicked_show}
			{disable_save_and_add}
			{fields_show}
			{tabs_show}
		/>
	{/each}

	<!-- add form modal section -->
	{#key reload_modal}
	<Modal
		bind:closeUpdateModal
		{table_name}
		{token}
		{get_form_endpoint}
		action_type={'Add'}
		bind:showFormModal={showFormModalAdd}
		callback={handleSubmit}
		{handleOnChange}
		{closeAfterSubmit}
		{form_override}
		{header_endpoint}
		closeCallback={() => {
			loadTable();
		}}
		{buttons_show}
		{buttons_names}
		{buttons_callbacks}
		{button_styles}
		{disable_save_and_add}
		{fields_show}
		{tabs_show}
	/>
	{/key}
	<main class="overflow-y-visible mx-auto sm:p-4 bg-gray-100 dark:bg-[#1c2639] sm:rounded-lg">
		<!-- Start block -->
		<section class="h-full w-full overflow-visible z-200">
			<!---{#if table_name !== ""}
	  <p class="px-2 lg:px-4 pb-2 max-w-[12rem] whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">{table_name}</p>
	  {/if}
	  --->
			<div class="bg-white dark:bg-[#22273c] relative shadow-md sm:rounded-lg">
				<!-- Dynamic table header -->
				<div
					class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4"
				>
					<div class="w-full h-full">
						<!-- Search bar -->
						<div class="flex relative w-full gap-2 self-center justify-end">
							{#if search_enabled}
								<div class="dropdown dropdown-end">
									<div
										tabindex="0"
										role="button"
										class="btn bg-gray-100 dark:bg-[#22273c] border-none"
									>
										<svg
											width="32px"
											height="32px"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											stroke="#42A5F5"
											><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											></g><g id="SVGRepo_iconCarrier">
												<path
													fill-rule="evenodd"
													clip-rule="evenodd"
													d="M3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7ZM6 12C6 11.4477 6.44772 11 7 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H7C6.44772 13 6 12.5523 6 12ZM9 17C9 16.4477 9.44772 16 10 16H14C14.5523 16 15 16.4477 15 17C15 17.5523 14.5523 18 14 18H10C9.44772 18 9 17.5523 9 17Z"
													fill="#42A5F5"
												></path>
											</g></svg
										>
									</div>

									<div
										tabindex="-1"
										class="dropdown-content absolute right-0 mt-2 z-[999] bg-white dark:bg-[#1c2639] text-gray-800 dark:text-gray-100 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-6"
										style="width: {showSummaryBox
											? '750px'
											: '400px'}; transition: width 0.3s ease;"
									>
										<div class="max-h-[600px] flex flex-row gap-6 overflow-y-scroll">
											<div class="w-[400px] space-y-4">
												<div class="flex justify-between items-center mb-6">
													<div class="text-xl font-bold text-gray-900 dark:text-gray-100">
														Filter
													</div>

													<div class="flex gap-2 w-1/2">
														{#if summerize_endpoint !== undefined}
															<button
																onclick={async (e) => {
																	e.stopPropagation();

																	let clms = [];
																	let vals = [];

																	search_string.forEach((item, i) => {
																		if (item !== '') {
																			clms.push(columnSearch[i]);
																			vals.push(item);
																		}
																	});

																	const result = await fetchSummary(
																		summerize_endpoint,
																		token,
																		1,
																		10,
																		clms,
																		vals,
																		additional_param,
																		start_date,
																		end_date
																	);

																	if (result?.succeed) {
																		summaryData = result.data;
																		showSummaryBox = true;
																	}
																}}
																class="flex-1 px-3 py-2 text-sm font-semibold text-white
													bg-[#2371ac] hover:bg-[#1d6092]
													transition-colors shadow-sm"
															>
																Summary
															</button>
														{/if}

														<button
															onclick={() => {
																search_string = [];
																current_page = 1;
																start_date = undefined;
																end_date = undefined;
																showSummaryBox = false;
																loadTable();
															}}
															class="flex-1 px-3 py-2 text-sm font-semibold text-white
												bg-[#2371ac] hover:bg-[#1d6092]
												shadow-sm"
														>
															Clear
														</button>
													</div>
												</div>
												{#if !disable_date_filter}
													<div class="space-y-4">
														<li
															class="grid grid-cols-3 justify-center items-center gap-x-2 list-none"
														>
															<label class="col-span-1 text-sm font-medium">Start Date</label>
															<input
																type="date"
																bind:value={start_date}
																onchange={() => loadTable()}
																class="col-span-2 input shadow-theme-xs rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 dark:bg-gray-900 dark:text-white/90 [color-scheme:light] dark:[color-scheme:dark]"
															/>
														</li>

														<li
															class="grid grid-cols-3 justify-center items-center gap-x-2 list-none"
														>
															<label class="col-span-1 text-sm font-medium">End Date</label>
															<input
																type="date"
																bind:value={end_date}
																onchange={() => loadTable()}
																class="col-span-2 input shadow-theme-xs rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 dark:bg-gray-900 dark:text-white/90 [color-scheme:light] dark:[color-scheme:dark]"
															/>
														</li>
													</div>
												{/if}

												{#if filter_endpoint === undefined}
													<ul class="space-y-4">
														{#each columnsToSearch as c, i}
															<li
																class="grid grid-cols-3 justify-center items-center gap-x-2 list-none"
															>
																<label
																	class="col-span-1 text-sm font-medium text-gray-900 dark:text-gray-100"
																>
																	{formatFieldNames(c)}
																</label>

																<input
																	type="text"
																	placeholder="Search..."
																	bind:value={search_string[i]}
																	onchange={() => {
																		current_page = 1;
																		loadTable();
																	}}
																	onkeydown={() => {
																		current_page = 1;
																		loadTable();
																	}}
																	class="col-span-2 pl-3 py-2 border border-gray-200
																	dark:border-gray-600 rounded-lg
																	focus:outline-none focus:ring-2 focus:ring-blue-500
																	bg-white dark:bg-gray-700
																	text-black dark:text-white"
																	disabled={!search_enabled}
																/>
															</li>
														{/each}
													</ul>
												{/if}

												{#if filter_endpoint !== undefined}
													<div class="space-y-4">
														{#each columnsToSearch as c, i}
															<li
																class="grid grid-cols-3 justify-center items-center gap-x-2 list-none"
															>
																<label class="col-span-1 text-sm font-medium"
																	>{formatFieldNames(c)}</label
																>
																<!-- <div>{Object.values(Object.keys(filter_result).includes(c) ? filter_result[c] : {})}</div> -->
																<!-- <div>{Object.values(Object.keys(filter_result))}</div>
																<br />
																<div>{c}</div> -->
																{#if Object.values(Object.keys(filter_result)).includes(c)}
																	<div class="col-span-2">
																		<AutoComplete
																			is_number={false}
																			form_keys={filter_endpoint !== undefined
																				? Object.values(
																						Object.keys(filter_result).includes(c)
																							? filter_result[c]
																							: {}
																					)
																				: {}}
																			form_values={filter_endpoint !== undefined
																				? Object.values(
																						Object.keys(filter_result).includes(c)
																							? filter_result[c]
																							: {}
																					)
																				: {}}
																			bind:current_key={search_string[i]}
																			current_value={search_string[i]}
																			disabled={false}
																			onchange={() => {
																				loadTable();
																			}}
																		/>
																	</div>
																{:else}
																	<input
																		type="text"
																		placeholder=""
																		bind:value={search_string[i]}
																		onchange={() => {
																			current_page = 1;
																			loadTable();
																		}}
																		onkeydown={() => {
																			current_page = 1;
																			loadTable();
																		}}
																		class="col-span-2 pl-3 py-2 border border-gray-200
																	dark:border-gray-600 rounded-lg
																	focus:outline-none focus:ring-2 focus:ring-blue-500
																	bg-white dark:bg-gray-700
																	text-black dark:text-white"
																		disabled={!search_enabled}
																	/>
																{/if}
															</li>
														{/each}
													</div>
												{/if}
											</div>

											{#if showSummaryBox && summaryData}
												<div
													class="w-[300px] border-l border-gray-300 dark:border-gray-700 pl-6 flex flex-col animate-in slide-in-from-right-2 duration-300"
												>
													<div class="flex justify-between items-center mb-6">
														<div class="text-xl font-bold text-gray-900 dark:text-gray-100">
															Summary
														</div>
														<button
															onclick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																showSummaryBox = false;
															}}
															class="text-gray-400 hover:text-red-500 transition-colors text-2xl"
														>
															&times;
														</button>
													</div>

													<div class="space-y-2 overflow-y-scroll h-full pr-2 custom-scrollbar">
														{#if Array.isArray(summaryData)}
															{#each summaryData as item}
																{#each Object.entries(item) as [key, value]}
																	{#if key.startsWith('##') && key.endsWith('##')}
																		<!-- Section Separator -->
																		<div class="flex items-center gap-2 my-3">
																			<div
																				class="flex-1 border-t border-gray-300 dark:border-gray-700"
																			></div>

																			<div
																				class="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap"
																			>
																				{value.replace(/##/g, '').replace(/_/g, ' ')}
																			</div>

																			<div
																				class="flex-1 border-t border-gray-300 dark:border-gray-700"
																			></div>
																		</div>
																	{:else}
																		<!-- Normal Summary Card -->
																		<div
																			class="flex flex-col p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all"
																		>
																			<span
																				class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
																			>
																				{key.replace(/_/g, ' ')}
																			</span>

																			<span
																				class="text-md font-black text-gray-900 dark:text-white"
																			>
																				{value}
																			</span>
																		</div>
																	{/if}
																{/each}
															{/each}
														{:else}
															<div
																class="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
															>
																<p class="text-gray-400 italic">
																	No summary data found for this selection.
																</p>
															</div>
														{/if}
													</div>
												</div>
											{/if}
										</div>
									</div>

									<style>
										.custom-scrollbar::-webkit-scrollbar {
											width: 4px;
										}
										.custom-scrollbar::-webkit-scrollbar-track {
											background: transparent;
										}
										.custom-scrollbar::-webkit-scrollbar-thumb {
											background: #cbd5e1;
											border-radius: 10px;
										}
										.dark .custom-scrollbar::-webkit-scrollbar-thumb {
											background: #334155;
										}
									</style>
								</div>
							{/if}
						</div>
					</div>

					<div
						class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0"
					>
						{#if get_export_endpoint !== undefined}
							<div class="relative w-fit">
								<!-- EXPORT ICON -->
								<div class="btn bg-gray-100 dark:bg-[#22273c] border-none">
									<svg
										onclick={() => openDatePicker()}
										fill="#42A5F5"
										width="32px"
										height="32px"
										viewBox="0 0 36 36"
										xmlns="http://www.w3.org/2000/svg"
									>
										<title>export-line</title>
										<path
											d="M6,13.61h7.61V6H24v8.38h2V6a2,2,0,0,0-2-2H10.87L4,10.87V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2H6Zm0-1.92L11.69,6H12v6H6Z"
										/>
										<path
											d="M28.32,16.35a1,1,0,0,0-1.41,1.41L30.16,21H18a1,1,0,0,0,0,2H30.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L34,22Z"
										/>
									</svg>
								</div>

								{#if showDatePicker}
									<div
										class="absolute right-0 mt-2 z-50 bg-white dark:bg-[#22273c] p-4 rounded-lg shadow-lg w-[320px]"
									>
										<DatePicker bind:startDate bind:endDate />

										<div class="flex gap-2 mt-4 justify-end">
											<!-- Cancel button -->
											<button
												class="btn btn-sm bg-gray-200 dark:bg-gray-700
           text-gray-900 dark:text-gray-100
           border border-gray-300 dark:border-gray-600
           hover:bg-gray-300 dark:hover:bg-gray-600
           rounded-md px-3 py-1"
												onclick={closeDatePicker}
											>
												Cancel
											</button>

											<!-- Export button -->
											<button
												class="btn btn-sm bg-[#0f75fa] text-white
													border border-[#1d6092]
													hover:bg-[#1d6092]
													rounded-md px-3 py-1"
												onclick={exportWithDates}
											>
												Export
											</button>
										</div>
									</div>
								{/if}
							</div>
						{/if}

						{#if hasPrivilege(userRolesPrivilege, 'C') && importEnabled}
							<div class="w-fit btn bg-gray-100 dark:bg-[#22273c] border-none">
								<svg
									onclick={() => {
										importOpen = true;
									}}
									fill="#42A5F5"
									width="24px"
									height="24px"
									viewBox="0 0 1920 1920"
									xmlns="http://www.w3.org/2000/svg"
									stroke="#42A5F5"
								>
									<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
									<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
									<g id="SVGRepo_iconCarrier">
										<path
											d="m807.186 686.592 272.864 272.864H0v112.94h1080.05l-272.864 272.978 79.736 79.849 409.296-409.183-409.296-409.184-79.736 79.736ZM1870.419 434.69l-329.221-329.11C1509.688 74.07 1465.979 56 1421.48 56H451.773v730.612h112.94V168.941h790.584v451.762h451.762v1129.405H564.714v-508.233h-112.94v621.173H1920V554.52c0-45.176-17.619-87.754-49.58-119.83Zm-402.181-242.37 315.443 315.442h-315.443V192.319Z"
											fill-rule="evenodd"
										/>
									</g>
								</svg>
							</div>
						{/if}

						{#if isHierarchical}
							<div class="w-fit mr-2">
								<RefreshButton />
							</div>
						{/if}

						{#if hasPrivilege(userRolesPrivilege, 'C') && create_entry_url !== undefined}
							<div class="w-fit mr-2">
								<button
									type="button"
									class="button"
									onclick={() => {
										action_type = 'Add';
										if (add_callback) {
											add_callback();
										} else if (create_entry_url !== '') {
											showFormModalAdd = true;
										}
									}}
								>
									{#if show_add_label}
										<span class="button__text">{table_name}</span>
									{:else}
										<span class="button__text">Add</span>
									{/if}

									<span class="button__icon"
										><svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											viewBox="0 0 24 24"
											stroke-width="2"
											stroke-linejoin="round"
											stroke-linecap="round"
											stroke="currentColor"
											height="24"
											fill="none"
											class="svg"
											><line y2="19" y1="5" x2="12" x1="12"></line><line
												y2="12"
												y1="12"
												x2="19"
												x1="5"
											></line></svg
										></span
									>
								</button>
							</div>
						{/if}
					</div>
				</div>

				<!-- Table section -->
				{#if table_data.length === 0 || table_data == undefined || table_data == []}
					<p class="h=[60%] flex justify-self-center text-gray-800 dark:text-white">
						No data available
					</p>
				{:else}
					<div class="overflow-x-scroll overflow-y-visible max-h-5xl">
						<table
							class="min-w-full w-fit divide-y divide-gray-200 dark:divide-gray-700 text-xs lg:text-sm text-left text-gray-700 dark:text-gray-300"
						>
							<thead>
								<tr class="text-left">
									<!-- Check All Checkbox in the th -->
									<th scope="col" class="px-2 lg:px-4 py-4">
										<div class="flex items-center">
											<!-- Select All Checkbox -->
											<input
												id="checkAll"
												onchange={(e) => {
													table_data.forEach((row_data) => {
														if (selected.includes(row_data.id) && e.target.checked == false) {
															selected.splice(selected.indexOf(row_data.id), 1);
														}

														if (!selected.includes(row_data.id) && e.target.checked == true) {
															selected.push(row_data.id);
														}
													});
												}}
												type="checkbox"
												class="cyberpunk-checkbox"
											/>
											<label for="checkAll" class="sr-only">Select All</label>
										</div>
									</th>
									{#each columns as col}
										{#if col !== 'hidden'}
											<th scope="col" class="px-2 lg:px-4 py-3">{formatFieldNames(col)}</th>
										{/if}
									{/each}
									<!-- action row -->
									<th scope="col" class="flex px-2 py-4 justify-end">
										{#if hasPrivilege([userRolesPrivilege[0]], 'D') && delete_entry_url !== undefined}
											<!-- DELETE -->
											<button
												type="button"
												class="py-2 px-3 flex items-center text-xs lg:text-sm font-semibold dark:text-gray-200
																						text-gray-400 rounded-lg
																						hover:bg-red-100 dark:hover:bg-red-700
																						focus:ring-4 focus:outline-none
																						focus:ring-primary-200 dark:focus:ring-primary-800
																						transition duration-200 ease-in-out transform hover:scale-105"
												onclick={() => {
													openDeleteModal(selected);
													closeDropdown();
												}}
											>
												<svg
													class="w-4 h-4 mr-2"
													fill="currentColor"
													viewBox="0 0 20 20"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														fill-rule="evenodd"
														d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
														clip-rule="evenodd"
													/>
												</svg>
											</button>
										{/if}
									</th>
								</tr>
							</thead>
							<tbody>
								{#each table_data as row, i}
									<tr
										class={row.id == highlight_row
											? 'px-2 lg:px-4 py-4 max-w-[12rem] border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400 bg-gray-200 dark:bg-gray-700'
											: 'px-2 lg:px-4 py-4 max-w-[12rem] border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'}
									>
										<td
											class={row['hidden'] && row['hidden'].length > 0
												? 'px-2 lg:px-4 py-4 max-w-[16rem] dark:bg-[#22273c] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'
												: 'px-2 lg:px-4 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'}
										>
											<div class="flex items-center">
												<input
													id="checkbox-{row.id}"
													checked={selected.includes(row.id)}
													onchange={() => {
														if (selected.includes(row.id)) {
															selected.splice(selected.indexOf(row.id), 1);
														} else {
															selected.push(row.id);
														}
													}}
													type="checkbox"
													class="cyberpunk-checkbox"
												/>
												<label for="checkbox-{row.id}" class="sr-only">checkbox</label>
											</div>
										</td>
										{#each columns as col, j}
											{#if row[col] === null}
												<td
													class={row['hidden'] && row['hidden'].length > 0
														? 'px-2 lg:px-4 py-4 max-w-[16rem] bg-gray-50 dark:bg-[#22273c] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'
														: 'px-2 lg:px-4 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'}
													onclick={async () => {
														if (row && row.id) {
															highlight_row = row.id;
														}
														if (row_clicked != null && (await row_clicked_show(row))) {
															row_clicked(row);
															const url = new URL(window.location);
															url.searchParams.set('page', current_page);
															url.searchParams.set('row', highlight_row);
															goto(url.href);
														} else {
															if (
																update_entry_url !== undefined &&
																hasPrivilege(userRolesPrivilege, 'U') &&
																!is_double_click
															) {
																action_type = 'Update';
																table_id_data = await fetchUpdate_table_by_Id(row.id);
																const url = new URL(window.location);
																url.searchParams.set('page', current_page);
																url.searchParams.set('row', highlight_row);
																goto(url.href);
																showFormModalUpdate[i] = true;
															}
														}
													}}
													ondblclick={async () => {
														if (row_clicked != null && (await row_clicked_show(row))) {
															row_clicked(row);
														} else {
															if (
																update_entry_url !== undefined &&
																hasPrivilege(userRolesPrivilege, 'U') &&
																is_double_click
															) {
																action_type = 'Update';
																table_id_data = await fetchUpdate_table_by_Id(row.id);
																showFormModalUpdate[i] = true;
															}
														}
													}}>N/A</td
												>
											{:else if typeof row[col] === 'string' && row[col].startsWith('data:image')}
												<!-- Apply special styling to display images column -->
												<td
													class={row['hidden'] && row['hidden'].length > 0
														? 'px-2 lg:px-4 py-4 max-w-[16rem] bg-gray-50 dark:bg-[#22273c] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'
														: 'px-2 lg:px-4 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'}
													onclick={async () => {
														if (row && row.id) {
															highlight_row = row.id;
														}
														if (row_clicked != null && (await row_clicked_show(row))) {
															row_clicked(row);
															const url = new URL(window.location);
															url.searchParams.set('page', current_page);
															url.searchParams.set('row', highlight_row);
															goto(url.href);
														} else {
															if (
																update_entry_url !== undefined &&
																hasPrivilege(userRolesPrivilege, 'U') &&
																!is_double_click
															) {
																action_type = 'Update';
																table_id_data = await fetchUpdate_table_by_Id(row.id);
																const url = new URL(window.location);
																url.searchParams.set('page', current_page);
																url.searchParams.set('row', highlight_row);
																goto(url.href);
																showFormModalUpdate[i] = true;
															}
														}
													}}
													ondblclick={async () => {
														if (row_clicked != null && (await row_clicked_show(row))) {
															row_clicked(row);
														} else {
															if (
																update_entry_url !== undefined &&
																hasPrivilege(userRolesPrivilege, 'U') &&
																is_double_click
															) {
																action_type = 'Update';
																table_id_data = await fetchUpdate_table_by_Id(row.id);
																showFormModalUpdate[i] = true;
															}
														}
													}}
												>
													{#if row[col]}
														<div class="has-tooltip">
															<div class="tooltip_pop bg-transparent">
																<div class="bg-white">
																	<img
																		src={row[col]}
																		alt="table entry preview"
																		class="w-[40vw] h-auto rounded shadow-md"
																	/>
																</div>
															</div>
															<img
																src={row[col]}
																alt="table entry preview"
																class="w-24 h-auto rounded shadow-md object-contain"
															/>
														</div>
													{:else}
														<span class="text-gray-500 dark:text-gray-400">No Image</span>
													{/if}
												</td>
											{:else if isHierarchical}
												{#if col !== 'hidden'}
													<td
														ondblclick={async () => {
															if (row_clicked != null && (await row_clicked_show(row))) {
																row_clicked(row);
															} else {
																if (
																	update_entry_url !== undefined &&
																	hasPrivilege(userRolesPrivilege, 'U')
																) {
																	action_type = 'Update';
																	table_id_data = await fetchUpdate_table_by_Id(row.id);
																	showFormModalUpdate[i] = true;
																}
															}
														}}
														class={row['hidden'] && row['hidden'].length > 0
															? 'px-2 lg:px-4 py-4 max-w-[16rem] bg-gray-50 dark:bg-[#22273c] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'
															: 'px-2 lg:px-4 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'}
													>
														<div class="flex gap-2 justify-start">
															{#if j == 0}
																<div
																	style={`height:auto; width:${(expanded_row_level[i] - 1) * 40}px; clear:both;`}
																></div>
															{/if}
															{#if j == 0 && row['hidden'] && row['hidden'].length > 0}
																{#if expanded_row_id.includes(row['id'])}
																	<button
																		class="color-green-500"
																		onclick={() => {
																			collapseTableItem(row);
																		}}
																	>
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			width="16"
																			height="16"
																			viewBox="0 0 24 24"
																			><path
																				fill="currentColor"
																				d="m12 6.586-8.707 8.707 1.414 1.414L12 9.414l7.293 7.293 1.414-1.414L12 6.586z"
																			/></svg
																		>
																	</button>
																{:else}
																	<button
																		class="color-green-500"
																		onclick={() => {
																			expandTableItem(row);
																		}}
																	>
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			width="16"
																			height="16"
																			viewBox="0 0 24 24"
																			><path
																				fill="currentColor"
																				d="M12 17.414 3.293 8.707l1.414-1.414L12 14.586l7.293-7.293 1.414 1.414L12 17.414z"
																			/></svg
																		>
																	</button>
																{/if}
															{/if}
															<div class="w-full">
																{row[col]}
															</div>
														</div>
													</td>
												{/if}
											{:else}
												<td
													class={row.id == highlight_row
														? 'px-2 lg:px-4 py-4 max-w-[12rem] border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400 bg-gray-200 dark:bg-gray-700'
														: 'px-2 lg:px-4 py-4 max-w-[12rem] border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'}
													onclick={async () => {
														if (row && row.id) {
															highlight_row = row.id;
														}
														if (row_clicked != null && (await row_clicked_show(row))) {
															row_clicked(row);
															const url = new URL(window.location);
															url.searchParams.set('page', current_page);
															url.searchParams.set('row', highlight_row);
															goto(url.href);
														} else {
															if (
																update_entry_url !== undefined &&
																hasPrivilege(userRolesPrivilege, 'U') &&
																!is_double_click
															) {
																action_type = 'Update';
																table_id_data = await fetchUpdate_table_by_Id(row.id);
																const url = new URL(window.location);
																url.searchParams.set('page', current_page);
																url.searchParams.set('row', highlight_row);
																goto(url.href);
																showFormModalUpdate[i] = true;
															}
														}
													}}
													ondblclick={async () => {
														if (row_clicked != null && (await row_clicked_show(row))) {
															row_clicked(row);
														} else {
															if (
																update_entry_url !== undefined &&
																hasPrivilege(userRolesPrivilege, 'U') &&
																is_double_click
															) {
																action_type = 'Update';
																table_id_data = await fetchUpdate_table_by_Id(row.id);
																showFormModalUpdate[i] = true;
															}
														}
													}}
												>
													{#if copyable_fields.includes(col)}
														<div class="flex gap-1">
															{#if row[col].length > 20}
																{@html `${row[col].slice(0, 20)}...`}
															{:else}
																{@html row[col]}
															{/if}
															<svg
																onclick={() => {
																	navigator.clipboard.writeText(
																		row[col].match(/^\d/)
																			? row[col]
																					.replace('ETB', '')
																					.replace(',', '')
																					.replace(' ', '')
																			: row[col]
																	);
																}}
																class="self-center"
																width="12px"
																height="12px"
																viewBox="0 0 24 24"
																fill="none"
																xmlns="http://www.w3.org/2000/svg"
																><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
																	id="SVGRepo_tracerCarrier"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																></g><g id="SVGRepo_iconCarrier">
																	<path
																		d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z"
																		stroke="#1C274C"
																		stroke-width="1.5"
																	></path>
																	<path
																		d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5"
																		stroke="#1C274C"
																		stroke-width="1.5"
																	></path>
																</g></svg
															>
														</div>
													{:else}
														{@html row[col]}
													{/if}
												</td>
											{/if}
										{/each}

										<!-- Request status section -->

										<td
											class={row['hidden'] && row['hidden'].length > 0
												? 'px-2 lg:px-4 py-4 max-w-[16rem] bg-gray-50 dark:bg-[#22273c] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'
												: 'px-2 lg:px-4 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400'}
										>
											<div
												class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-2 flex-shrink-0"
											>
												<!-- {#if tooltip_enabled && !hide_tooltip_parent && tooltip_data}
												<div 
													class="cursor-help p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
													onmouseenter={(e) => handleMouseEnter(e, row, i)}
													onmousemove={handleMouseMove}
													onmouseleave={handleMouseLeave}
												>
													<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z" stroke="#42A5F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
													</svg>
												</div>
											{/if} -->

												{#each buttons_names as button_name, i}
													{#if button_name != '' && buttons_show(row, button_name) && !hide_buttons_parent}
														<button
															onclick={async () => {
																selectedRow = row;
																let r_data = await buttons_callbacks[i](row, loadTable);

																if (r_data.succeed) {
																	successMessage = r_data.error;
																	errorMessage = '';
																	refreshMessage = !refreshMessage;
																} else {
																	errorMessage = r_data.error;
																	successMessage = '';
																	refreshMessage = !refreshMessage;
																}
																loadTable();
															}}
															class={`font-semibold py-1 px-2 lg:px-4 border rounded hover:text-black ${getStatusButtonClass(row.approval_status)} 
																${
																	button_styles[i] &&
																	button_styles[i].length > 0 &&
																	button_name.includes('svg')
																		? button_styles[i]
																		: button_name.includes('svg')
																			? 'bg-white/10 dark:text-gray-300 border-none rounded-full !p-2'
																			: ''
																}`}
														>
															{@html button_name}
														</button>
													{/if}
												{/each}

												<!-- Action section -->
												{#if (hasPrivilege(userRolesPrivilege, 'U') || hasPrivilege(userRolesPrivilege, 'D')) && (update_entry_url !== null || delete_entry_url !== null) && kebab_enabled}
													<div
														class="dropdown dropdown-left dropdown-end relative text-center"
														tabindex="0"
														role="button"
													>
														<!-- Kebab Menu Button -->
														<button
															type="button"
															class="inline-flex justify-center w-full rounded-md px-2 lg:px-4 py-1 text-xs lg:text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
															onclick={async () => {
																toggleDropdown(row.id);
															}}
															aria-labelledby="kebab button"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="26"
																height="26"
																viewBox="0 0 24 24"
															>
																<path
																	fill="currentColor"
																	d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"
																>
																</path>
															</svg>
														</button>

														<!-- Dropdown -->
														<div
															class="z-[3000] dropdown-content menu mr-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
														>
															<div
																class="py-1 px-1 text-xs lg:text-sm text-gray-700 dark:text-white"
																style="z-index: 1000;"
															>
																{#each buttons_names as button_name, i}
																	{#if hasPrivilege(userRoles['Tenant Management'], 'R') && row.Status}
																		<button
																			class="w-full py-2 px-3 gap-1 flex items-center text-xs lg:text-sm font-semibold dark:text-white
                                text-gray-700 rounded-lg hover:text-white
                                hover:bg-[#3393ce] dark:hover:text-white dark:hover:bg-[#3393ce]
                                focus:ring-4 focus:outline-none
                                focus:ring-primary-200 dark:focus:ring-primary-800
                                transition duration-200 ease-in-out transform hover:scale-105"
																			onclick={() => {
																				buttons_callbacks[i](row);
																				closeDropdown();
																			}}
																		>
																			<img
																				src="/svgs/active.svg"
																				alt="Icon"
																				width="20"
																				height="24"
																			/>
																			{row.Status === 'active' ? 'Deactivate' : 'Activate'}
																		</button>
																	{/if}
																{/each}

																{#if hasPrivilege(userRolesPrivilege, 'U') && update_entry_url !== undefined}
																	<!-- EDIT / VIEW -->
																	<button
																		type="button"
																		class="w-full py-2 px-3 flex items-center text-xs lg:text-sm font-semibold dark:text-white
                                text-gray-700 rounded-lg hover:text-white
                                hover:bg-[#3393ce] dark:hover:text-white dark:hover:bg-[#3393ce]
                                focus:ring-primary-200 dark:focus:ring-primary-800
                                transition duration-200 ease-in-out transform hover:scale-105"
																		onclick={async () => {
																			action_type = 'Update';
																			table_id_data = await fetchUpdate_table_by_Id(row.id);
																			showFormModalUpdate[i] = true;
																			closeDropdown();
																		}}
																	>
																		<svg
																			class="w-4 h-4 mr-2"
																			fill="currentColor"
																			viewBox="0 0 20 20"
																		>
																			<path
																				d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
																			/>
																			<path
																				fill-rule="evenodd"
																				clip-rule="evenodd"
																				d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
																			/>
																		</svg>
																		Edit
																	</button>
																{/if}

																{#if hasPrivilege(userRolesPrivilege, 'U') && update_entry_url !== undefined && row.deletion_requested == true}
																	<!-- Reverse (UI updated to match Delete colors) -->
																	<button
																		type="button"
																		class="w-full py-2 px-3 flex items-center text-xs lg:text-sm font-semibold
                                text-red-600 dark:text-red-400 rounded-lg
                                hover:bg-red-100 dark:hover:bg-red-700
                                focus:ring-primary-200 dark:focus:ring-primary-800
                                transition duration-200 ease-in-out transform hover:scale-105"
																		onclick={async () => {
																			action_type = 'Update';
																			openReverseModal(row);
																			closeDropdown();
																		}}
																	>
																		<svg
																			class="w-4 h-4 mr-2"
																			viewBox="0 0 24 24"
																			fill="none"
																			xmlns="http://www.w3.org/2000/svg"
																			><g id="SVGRepo_iconCarrier">
																				<path
																					d="M4 7H14C17.3137 7 20 9.68629 20 13C20 16.3137 17.3137 19 14 19H4M4 7L8 3M4 7L8 11"
																					stroke="currentColor"
																					stroke-width="2"
																					stroke-linecap="round"
																					stroke-linejoin="round"
																				></path>
																			</g></svg
																		>
																		Reverse Deletion
																	</button>
																{/if}

																{#if hasPrivilege([userRolesPrivilege[0]], 'D') && delete_entry_url !== undefined && !row.deletion_requested}
																	<!-- DELETE -->
																	<button
																		type="button"
																		class="w-full py-2 px-3 flex items-center text-xs lg:text-sm font-semibold
                                text-red-600 rounded-lg
                                dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700
                                focus:ring-4 focus:outline-none
                                focus:ring-primary-200 dark:focus:ring-primary-800
                                transition duration-200 ease-in-out transform hover:scale-105"
																		onclick={() => {
																			openDeleteModal(row);
																			closeDropdown();
																		}}
																	>
																		<svg
																			class="w-4 h-4 mr-2"
																			fill="currentColor"
																			viewBox="0 0 20 20"
																			xmlns="http://www.w3.org/2000/svg"
																		>
																			<path
																				fill-rule="evenodd"
																				d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
																				clip-rule="evenodd"
																			/>
																		</svg>
																		Delete
																	</button>
																{/if}
															</div>
														</div>
													</div>
												{:else if kebab_enabled === false}
													{#if enable_print}
														<button
															type="button"
															class="py-2 px-3 flex items-center text-xs lg:text-sm font-semibold dark:text-gray-200
																						text-gray-400 rounded-lg
																						hover:bg-gray-100 dark:hover:bg-gray-700
																						focus:ring-4 focus:outline-none
																						focus:ring-primary-200 dark:focus:ring-primary-800
																						transition duration-200 ease-in-out transform hover:scale-105"
															onclick={async () => {
																await print_callback(row);
															}}
														>
															<svg
																viewBox="0 0 600 600"
																version="1.1"
																id="svg9724"
																sodipodi:docname="print.svg"
																inkscape:version="1.2.2 (1:1.2.2+202212051550+b0a8486541)"
																width="14px"
																height="14px"
																xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
																xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
																xmlns="http://www.w3.org/2000/svg"
																xmlns:svg="http://www.w3.org/2000/svg"
																fill="#9ea6b0"
																stroke="#9ea6b0"
																><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
																	id="SVGRepo_tracerCarrier"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																></g><g id="SVGRepo_iconCarrier">
																	<defs id="defs9728"></defs>
																	<sodipodi:namedview
																		id="namedview9726"
																		pagecolor="#9ea6b09ea6b0ffffff"
																		bordercolor="#9ea6b09ea6b0666666"
																		borderopacity="1.0"
																		inkscape:showpageshadow="2"
																		inkscape:pageopacity="0.0"
																		inkscape:pagecheckerboard="0"
																		inkscape:deskcolor="#9ea6b09ea6b0d1d1d1"
																		showgrid="true"
																		inkscape:zoom="0.84118632"
																		inkscape:cx="232.40987"
																		inkscape:cy="383.38712"
																		inkscape:window-width="1920"
																		inkscape:window-height="1009"
																		inkscape:window-x="0"
																		inkscape:window-y="1080"
																		inkscape:window-maximized="1"
																		inkscape:current-layer="svg9724"
																		showguides="true"
																	>
																		<inkscape:grid
																			type="xygrid"
																			id="grid9972"
																			originx="0"
																			originy="0"
																		></inkscape:grid>
																		<sodipodi:guide
																			position="-260,300"
																			orientation="0,-1"
																			id="guide383"
																			inkscape:locked="false"
																		></sodipodi:guide>
																		<sodipodi:guide
																			position="300,520"
																			orientation="1,0"
																			id="guide385"
																			inkscape:locked="false"
																		></sodipodi:guide>
																		<sodipodi:guide
																			position="240,520"
																			orientation="0,-1"
																			id="guide939"
																			inkscape:locked="false"
																		></sodipodi:guide>
																		<sodipodi:guide
																			position="220,80"
																			orientation="0,-1"
																			id="guide941"
																			inkscape:locked="false"
																		></sodipodi:guide>
																	</sodipodi:namedview>
																	<path
																		id="rect348"
																		style="color:#9ea6b09ea6b0;fill:#9ea6b09ea6b020202;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none;paint-order:stroke fill markers"
																		d="M 170 0 A 40.00405 40.00405 0 0 0 130 40 L 130 150 L 40 150 C 17.909591 150.002 0.0022087134 167.90958 0 190 L 0 410 C 0.0022087134 432.09042 17.909591 449.99779 40 450 L 130 450 L 130 320 C 130.00224 297.90958 147.90958 280.002 170 280 L 430 280 C 452.09042 280.00224 469.998 297.90958 470 320 L 470 450 L 560 450 C 582.09042 449.998 599.99779 432.09042 600 410 L 600 190 C 599.998 167.90958 582.09042 150.00221 560 150 L 470 150 L 470 40 A 40.00405 40.00405 0 0 0 430 0 L 170 0 z M 210 80 L 390 80 L 390 150 L 210 150 L 210 80 z M 430 200 L 530 200 A 20 20 0 0 1 550 220 A 20 20 0 0 1 530 240 L 430 240 A 20 20 0 0 1 410 220 A 20 20 0 0 1 430 200 z "
																	></path>
																	<rect
																		style="fill:none;stroke:#9ea6b09ea6b020202;stroke-width:79.9999;stroke-linecap:round;stroke-linejoin:round;paint-order:stroke fill markers"
																		id="rect348-3-6"
																		width="260"
																		height="260"
																		x="310"
																		y="-430"
																		transform="rotate(90)"
																	></rect>
																	<path
																		style="color:#9ea6b09ea6b0;fill:#9ea6b09ea6b0;stroke-linecap:round;-inkscape-stroke:none"
																		d="m 250,380 a 20,20 0 0 0 -20,20 20,20 0 0 0 20,20 h 100 a 20,20 0 0 0 20,-20 20,20 0 0 0 -20,-20 z"
																		id="path641"
																	></path>
																	<path
																		style="color:#9ea6b09ea6b0;fill:#9ea6b09ea6b0;stroke-linecap:round;-inkscape-stroke:none"
																		d="m 250,460 a 20,20 0 0 0 -20,20 20,20 0 0 0 20,20 h 100 a 20,20 0 0 0 20,-20 20,20 0 0 0 -20,-20 z"
																		id="path641-5"
																	></path>
																</g></svg
															>
														</button>
													{/if}
													{#if hasPrivilege([userRolesPrivilege[0]], 'D') && delete_entry_url !== undefined}
														<button
															type="button"
															class="py-2 px-3 flex items-center text-xs lg:text-sm font-semibold dark:text-gray-200
																						text-gray-400 rounded-lg
																						hover:bg-red-100 dark:hover:bg-red-700
																						focus:ring-4 focus:outline-none
																						focus:ring-primary-200 dark:focus:ring-primary-800
																						transition duration-200 ease-in-out transform hover:scale-105"
															onclick={() => {
																openDeleteModal(row);
																closeDropdown();
															}}
														>
															<svg
																class="w-4 h-4"
																fill="currentColor"
																viewBox="0 0 20 20"
																xmlns="http://www.w3.org/2000/svg"
															>
																<path
																	fill-rule="evenodd"
																	d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
																	clip-rule="evenodd"
																/>
															</svg>
														</button>
													{/if}
											{/if}

												<!-- Existing Modals -->
												{#if showDeleteModal}
													<DeleteModal
														{selectedRow}
														delete_url={delete_entry_url}
														onCloseModal={closeDeleteModal}
														onDeleteItem={handleDelete}
														deletePopupMessage={deletePopupMessage}
														{token}
													/>
												{/if}
												{#if showReverseModal}
													<ReverseModal
														{selectedRow}
														onCloseModal={closeReverseModal}
														onReverseItem={handleReversal}
													/>
												{/if}
											</div></td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

			<div class="flex items-center mt-2 z-0">
				<select
					bind:value={pageSize}
					onchange={() => {
						loadTable();
					}}
					class="select w-fit shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-white dark:bg-[#22273c] text-xs lg:text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white dark:placeholder:text-white"
				>
					<option value={5} selected>5</option>
					<option value={10} selected>10</option>
					<option value={20} selected>20</option>
					<option value={30} selected>30</option>
					<option value={40} selected>40</option>
					<option value={50} selected>50</option>
				</select>
				<div
					class={`rounded-md bg-white dark:bg-[#22273c] px-4 py-2 text-sm text-gray-600 ring-1 ring-gray-200 dark:border-gray-800 dark:text-white ml-2`}
				>
					<span class="flex items-center justify-center whitespace-nowrap"
						>Total - {total_items}</span
					>
				</div>

				<div class="flex join w-full justify-center">
					{#if current_page > 1}
						<button
							class={`join-item btn bg-white dark:bg-[#22273c] text-gray-600 border-gray-100 dark:border-gray-800 dark:text-white shadow-md ${current_page > 1 ? '' : 'opacity-30'}`}
							onclick={() => {
								if (current_page > 1) {
									current_page -= 1;
									const url = new URL(window.location);
									url.searchParams.set('page', current_page);
									url.searchParams.set('row', highlight_row);
									goto(url.href);
									loadTable();
								}
							}}>Prev</button
						>
					{/if}

					<button
						class="join-item btn bg-white dark:bg-[#22273c] text-gray-900 border-gray-100 dark:border-gray-800 dark:text-white shadow-md"
						>{current_page} / {maxPages}</button
					>

					{#if current_page < maxPages}
						<button
							class={`join-item btn bg-white dark:bg-[#22273c] text-gray-600 border-gray-100 dark:border-gray-800 dark:text-white shadow-md ${current_page < maxPages ? '' : 'opacity-30'}`}
							onclick={() => {
								if (current_page < maxPages) {
									current_page += 1;
									const url = new URL(window.location);
									url.searchParams.set('page', current_page);
									url.searchParams.set('row', highlight_row);
									goto(url.href);
									loadTable();
								}
							}}>Next</button
						>
					{/if}
				</div>
			</div>
		</section>
		{#key refreshMessage}
			{#if errorMessage && errorMessage !== ''}
				<ErrorMessage message={errorMessage} />
			{/if}
			{#if successMessage && successMessage !== ''}
				<SuccessMessage message={successMessage} />
			{/if}
		{/key}

		<dialog
			class="p-2 border-none bg-white dark:bg-[#22273c] rounded-xl text-gray-900 dark:text-gray-100 backdrop:bg-black/50 italic"
			bind:this={importDialog}
			onclose={async () => {}}
			onclick={(e) => {
				importDialog.close();
			}}
		>
			<ul id="import_history" class="min-w-md min-h-md max-h-md p-10 gap-2">
				<li id="log_title" class="text-lg font-bold normal">Import Log</li>
			</ul>
		</dialog>

		<!-- {#if hoveredRowIndex !== null}
        <div 
            class="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg p-4 w-64 pointer-events-none"
            style="top: {mouseY}px; left: {mouseX}px;"
        >
            {#if tooltipLoading}
                <div class="flex items-center justify-center space-x-2 animate-pulse text-gray-500">
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Loading details...</span>
                </div>
            {:else if tooltipData}
                <div class="space-y-2 text-sm text-gray-800 dark:text-gray-200">
                    {#if tooltipData.error}
                        <span class="text-red-500">{tooltipData.error}</span>
                    {:else}
                        {#each Object.entries(tooltipData) as [key, value]}
                            <div class="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-1">
                                <span class="font-bold text-gray-500 dark:text-gray-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span class="text-right">{value}</span>
                            </div>
                        {/each}
                    {/if}
                </div>
            {/if}
        </div>
    {/if} -->
	</main>
</div>

<style>
	/* From Uiverse.io by adamgiebl */
	.cyberpunk-checkbox {
		appearance: none;
		width: 12px;
		height: 12px;
		border: 2px solid #4d4d4d;
		border-radius: 2px;
		background-color: transparent;
		display: inline-block;
		position: relative;
		margin-right: 10px;
		cursor: pointer;
	}

	.cyberpunk-checkbox:before {
		content: '';
		background-color: #4d4d4d;
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(0);
		width: 6px;
		height: 6px;
		border-radius: 1px;
		transition: all 0.3s ease-in-out;
	}

	.cyberpunk-checkbox:checked:before {
		transform: translate(-50%, -50%) scale(1);
	}

	.cyberpunk-checkbox-label {
		font-size: 18px;
		color: #fff;
		cursor: pointer;
		user-select: none;
		display: flex;
		align-items: center;
	}

	/* From Uiverse.io by andrew-demchenk0 */
	.button {
		position: relative;
		width: 150px;
		height: 40px;
		cursor: pointer;
		display: flex;
		align-items: center;
		border: 1px solid #2371ac;
		background-color: #2371ac;
	}

	.button,
	.button__icon,
	.button__text {
		transition: all 0.3s;
	}

	.button .button__text {
		color: #fff;
		font-weight: 600;
		text-align: center;
		width: 111px;
	}

	.button .button__icon {
		position: absolute;
		transform: translateX(109px);
		height: 100%;
		width: 39px;
		background-color: #1d6092;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.button .svg {
		width: 30px;
		stroke: #fff;
	}

	.button:hover {
		background: #e8e8e8;
	}

	.button:hover .button__text {
		color: transparent;
	}

	.button:hover .button__icon {
		width: 148px;
		transform: translateX(0);
	}

	.button:active .button__icon {
		background-color: #e8e8e8;
	}

	.button:active {
		border: 1px solid #e8e8e8;
	}

	.tooltip_pop {
		visibility: hidden;
		position: absolute;
	}

	.has-tooltip:hover .tooltip_pop {
		visibility: visible;
		z-index: 100;
	}
</style>
