<script>
	import TenantResultModal from "$lib/modals/tenantResultModal.svelte";
	import Header from "../../header/header.svelte";
	import { host_super as host, token } from "../../../../../apis/config";
	import Table from "../../tables/table.svelte";
	import ErrorMessage from "$lib/message/errorMessage.svelte";
	import SuccessMessage from "$lib/message/successMessage.svelte";
	import Modal from "$lib/modals/activateModal.svelte";

	const tableEndpoint = `${host}provider/get-tenants`;
	const table_id_data = `${host}provider/get-tenant/`;
	const searchEndpoint = `${host}provider/search`;
	const formEndpoint = `${host}provider/tenant-form/`;
	const submitUrl = `${host}provider/create-tenant`;
	const updateUrl = `${host}provider/update-tenant`;
	const deleteUrl = `${host}provider/delete-tenant`;
	const reverseUrl = `${host}provider/reverse-tenant-deletion`;

	const activateUrl = `${host}provider/activate-tenant`;
	const table_name = "Tenant";

	let response_success = $state(false);
	let errorMessage = $state("");
	let showConfirmationModal = $state(false);
	let tenantData = $state({});

	let { onToggleSidebar } = $props();

	let tenantShowModal = $state(false);
	let tenantResult = $state({});
	let tableComponent = $state(false);

	function handleAfterSubmit(result) {
		if (result.succeed) {
			errorMessage = result.error;
			response_success = true;
		} else {
			errorMessage = result.error;
			response_success = false;
		}
	}

	async function handleActivateDeactivate(row) {
		showConfirmationModal = true;
		tenantData = row;
	}

	async function closeModal() {
		showConfirmationModal = false;
	}
	async function changeActivationState(row) {
		closeModal();
		try {
			const url = `${activateUrl}/${row.id}`;
			const response = await fetch(url, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});
			const result = await response.json();
			// Refresh the table to show updated status
			tableComponent = !tableComponent;
		} catch (error) {
			console.error("Error changing tenant status:", error);
		}
	}

	// Set up the button names and callbacks
	let button_names = [""];
	let button_callbacks = [handleActivateDeactivate];

	let sidebarToggle = true;

	// Function to toggle sidebar visibility
	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />

	{#key tableComponent}
		<Table
			get_table_endpoint={tableEndpoint}
			search_endpoint={searchEndpoint}
			get_table_endpoint_by_id={table_id_data}
			get_form_endpoint={formEndpoint}
			create_entry_url={submitUrl}
			update_entry_url={updateUrl}
			delete_entry_url={deleteUrl}
			reverse_status_endpoint_by_id={reverseUrl}
			{token}
			{table_name}
			module={["Service Provider", "Tenant Management"]}
			get_id_bool={true}
			buttons_names={button_names}
			buttons_callbacks={button_callbacks}
			after_submit_callback={handleAfterSubmit}
			kebab_enabled={true}
			is_double_click={true}
			copyable_fields={["domain"]}
		/>
	{/key}
	{#if errorMessage && errorMessage !== "" && !response_success}
		<ErrorMessage message={errorMessage} />
	{/if}
	{#if errorMessage && errorMessage !== "" && response_success}
		<SuccessMessage message={errorMessage} />
	{/if}

	{#if showConfirmationModal}
		<Modal
			data={tenantData}
			handleSubmit={changeActivationState}
			handleClose={closeModal}
		/>
	{/if}
</div>
