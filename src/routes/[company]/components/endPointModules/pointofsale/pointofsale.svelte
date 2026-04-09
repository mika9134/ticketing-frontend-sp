<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';

	const tableEndpoint = `${host}pointofsale/get-point-of-sale`;
	const searchEndpoint = `${host}pointofsale/search`;
	const exportEndpoint = `${host}pointofsale/export-point-of-sale`;

	const formEndpoint = `${host}pointofsale/point-of-sale-form`;
	const tableEndpointById = `${host}pointofsale/get-point-of-sale/`;
	const submitUrl = `${host}pointofsale/create-point-of-sale`;
	const updateUrl = `${host}pointofsale/update-point-of-sale`;
	const deleteUrl = `${host}pointofsale/delete-point-of-sale`;
	const filterEndpoint = `${host}pointofsale/all-filters`;

	const table_name = 'Point Of Sale';

	async function fetchLocation(result) {
		console.log('Row Latitude: ' + result?.latitude);
		console.log('Row Longitude: ' + result?.longitude);
		console.log("==")
		console.log(result)

		try {
			// Open Google Maps in new tab
			if (result?.latitude && result?.longitude) {
				const mapsUrl = `https://www.google.com/maps?q=${result.latitude},${result.longitude}`;
				window.open(mapsUrl, '_blank');
			}
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	let button_names = ["<div class='flex items-center justify-center gap-x-1'><svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='18' height='18' viewBox='0 0 100 100' xml:space='preserve'><g style='stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;' transform='translate(1.4065934065934016 1.4065934065934016) scale(1, 1)'><path d='M 45 0 C 25.463 0 9.625 15.838 9.625 35.375 c 0 8.722 3.171 16.693 8.404 22.861 L 45 90 l 26.97 -31.765 c 5.233 -6.167 8.404 -14.139 8.404 -22.861 C 80.375 15.838 64.537 0 45 0 z M 45 48.705 c -8.035 0 -14.548 -6.513 -14.548 -14.548 c 0 -8.035 6.513 -14.548 14.548 -14.548 s 14.548 6.513 14.548 14.548 C 59.548 42.192 53.035 48.705 45 48.705 z' style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(40,102,146); fill-rule: nonzero; opacity: 1;' transform=' matrix(1 0 0 1 0 0) ' stroke-linecap='round'/></g></svg></div>"];
	let button_callbacks = [fetchLocation];

	let { onToggleSidebar } = $props();

	let sidebarToggle = true;

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
	<Table
		get_table_endpoint={tableEndpoint}
		get_export_endpoint={exportEndpoint}
		search_endpoint={searchEndpoint}
		get_table_endpoint_by_id={tableEndpointById}
		filter_endpoint={filterEndpoint}
		get_form_endpoint={formEndpoint}
		create_entry_url={submitUrl}
		update_entry_url={updateUrl}
		delete_entry_url={deleteUrl}
		{token}
		{table_name}
		module="Point Of Sale"
		get_id_bool={true}
		importEnabled={true}
		buttons_names={button_names}
		buttons_callbacks={button_callbacks}
	/>
</div>
