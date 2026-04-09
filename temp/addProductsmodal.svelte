<script>
	import AddProductForm from '../../forms/createForm.svelte';
	import DeleteModal from '../../../../lib/modals/deleteModal.svelte';
	import PreviewModal from '../../../../lib/modals/previewModal.svelte';
	import UpdateModal from '../../../../lib/modals/updateModal.svelte';

	let products = [
		{
			id: 1,
			name: 'Apple iMac 2',
			category: 'Computer',
			brand: 'Apple',
			description: 'What is a product description? A product description describes a product.',
			SKU: '1L',
			price: '$179'
		},
		{
			id: 2,
			name: 'Apple iMac 24',
			category: 'PC',
			brand: 'Hp',
			description: 'What is a product description? A product description describes a product?',
			SKU: '2Kg',
			price: '$1499'
		},
		{
			id: 3,
			name: 'Apple iMac',
			category: 'PC',
			brand: 'hp',
			description: 'What is a product description?',
			SKU: '200ml',
			price: '$199'
		},
		{
			id: 4,
			name: 'Apple 16',
			category: 'PC',
			brand: 'Apple',
			description: 'What is a product description',
			SKU: '5L',
			price: '$499'
		}
	];

	let isActionsDropdownOpen = false;
	let isFilterDropdownOpen = false;

	let product = null; // Declare the product variable
	let isDeleteModalOpen = false;
	let isPreviewModalOpen = false;
	let showModal = false;
	let newProduct = null; // Temporary object for the new product
	let selectedProduct = null;

	function toggleActionsDropdown() {
		isActionsDropdownOpen = !isActionsDropdownOpen;
	}

	function toggleFilterDropdown() {
		isFilterDropdownOpen = !isFilterDropdownOpen;
	}

	// Open modals and pass product data
	function openDeleteModal(productData) {
		product = productData; // Assign the selected product to the product variable
		isDeleteModalOpen = true;
	}

	function openPreviewModal(productData) {
		product = productData; // Assign the selected product to the product variable
		isPreviewModalOpen = true;
	}

	// Close modals
	function closeDeleteModal() {
		isDeleteModalOpen = false;
	}

	function closePreviewModal() {
		isPreviewModalOpen = false;
	}
	function openModal(product) {
		if (product) {
			console.log('Opening modal for product:', product); // Debugging log
			selectedProduct = { ...product }; // Make a copy of the product for editing
			showModal = true;
		} else {
			console.error('Product is null or undefined.');
		}
	}
	function closeModal() {
		showModal = false;
		newProduct = null; // Reset the temporary product object
	}

	function updateProduct() {
		let index = products.findIndex((product) => product.id === selectedProduct.id);
		if (index !== -1) {
			products[index] = { ...selectedProduct }; // Update the product
		}
		closeModal();
	}

	function deleteProduct(id) {
		products = products.filter((product) => product.id !== id);
		closeModal();
		selectedProduct = null;
	}

	// Add the New Product to the Products Array
	function addProduct(product) {
		products = [...products, product]; // Add the new product to the list
		closeModal(); // Close the modal
	}

	// Open the Add Product Modal
	function openAddProductModal() {
		const lastId = products.length > 0 ? products[products.length - 1].id : 0; // Get the last product's ID
		newProduct = {
			id: lastId + 1, // Assign the next ID
			name: '',
			brand: '',
			price: '',
			category: '',
			description: '',
			SKU: ''
		};
		showModal = true;
	}
	let currentPage = 1;
	let totalPages = 100;

	function goToPage(page) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}

	// Track the checked state of all checkboxes
	let checkedProducts = new Set();

	// Track the 'select all' checkbox state
	let selectAll = false;

	// Toggle individual product checkbox
	function toggleProduct(id) {
		if (checkedProducts.has(id)) {
			checkedProducts.delete(id); // Uncheck
		} else {
			checkedProducts.add(id); // Check
		}
		updateSelectAllState();
	}

	// Toggle the 'select all' checkbox
	function toggleSelectAll() {
		if (selectAll) {
			// Select all products
			products.forEach((product) => checkedProducts.add(product.id));
		} else {
			// Unselect all products
			checkedProducts.clear();
		}
	}

	// Update the 'select all' checkbox state based on individual selections
	function updateSelectAllState() {
		selectAll = products.every((product) => checkedProducts.has(product.id));
	}
</script>

<main class="mx-auto sm:p-5 antialiased">
	<!-- Start block -->
	<section class="h-full w-full">
		<!-- Start coding here -->
		<div class="bg-white dark:bg-[#002a47] relative shadow-md sm:rounded-lg overflow-hidden">
			<div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
				<div class="w-full md:w-1/2">
					<form class="flex items-center">
						<label for="simple-search" class="sr-only">Search</label>
						<div class="relative w-full">
							<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<svg
									aria-hidden="true"
									class="w-5 h-5 text-gray-500 dark:text-gray-400"
									fill="currentColor"
									viewbox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										fill-rule="evenodd"
										d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<input
								type="text"
								id="simple-search"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								placeholder="Search"
								required=""
							/>
						</div>
					</form>
				</div>
				<div
					class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0"
				>
					<button
						type="button"
						id="createProductModalButton"
						data-modal-target="createProductModal"
						data-modal-toggle="createProductModal"
						class="btn btn-neutral bg-[#3393ce] text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50"
						on:click={openAddProductModal}
					>
						<svg
							class="h-3.5 w-3.5 mr-2"
							fill="currentColor"
							viewbox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								clip-rule="evenodd"
								fill-rule="evenodd"
								d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
							/>
						</svg>
						Add product
					</button>

					<div class="flex items-center space-x-3 w-full md:w-auto">
						<!-- Actions Dropdown -->
						<div class="dropdown dropdown-end">
							<button
								id="actionsDropdownButton"
								class="btn btn-outline flex items-center justify-center text-sm font-medium text-gray-900 bg-white dark:bg-gray-300 hover:bg-gray-100 dark:hover:bg-gray-400 hover:text-primary-700"
								on:click={toggleActionsDropdown}
							>
								<svg
									class="-ml-1 mr-1.5 w-5 h-5"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden="true"
								>
									<path
										clip-rule="evenodd"
										fill-rule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									/>
								</svg>
								Actions
							</button>
							{#if isActionsDropdownOpen}
								<ul
									class="dropdown-content menu p-2 shadow bg-white dark:bg-[#002a47] text-gray-900 dark:text-white rounded-box w-52"
								>
									<li><a href="/">Mass Edit</a></li>
									<li><a href="/">Delete all</a></li>
								</ul>
							{/if}
						</div>

						<!-- Filter Dropdown -->
						<div class="dropdown dropdown-end">
							<button
								id="filterDropdownButton"
								class="btn btn-outline flex items-center justify-center text-sm font-medium text-gray-900 bg-white dark:bg-gray-300 hover:bg-gray-100 dark:hover:bg-gray-400 hover:text-primary-700"
								on:click={toggleFilterDropdown}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden="true"
									class="h-4 w-4 mr-2 text-gray-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
										clip-rule="evenodd"
									/>
								</svg>
								Filter
								<svg
									class="-mr-1 ml-1.5 w-5 h-5"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden="true"
								>
									<path
										clip-rule="evenodd"
										fill-rule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									/>
								</svg>
							</button>
							{#if isFilterDropdownOpen}
								<ul
									class="dropdown-content menu p-2 shadow bg-white dark:bg-[#002a47] text-gray-900 dark:text-white rounded-box w-56"
								>
									<h6 class="mb-3 text-sm font-medium">Category</h6>
									<li>
										<div>
											<input
												id="product-1"
												type="checkbox"
												class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
											/>
											<label
												for="apple"
												class="ml-2 text-sm font-medium dark:text-white text-gray-900"
												>Apple (56)</label
											>
										</div>
									</li>
									<li>
										<div>
											<input
												id="product-2"
												type="checkbox"
												class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
											/>
											<label for="hp" class="ml-2 text-sm font-medium dark:text-white text-gray-900"
												>HP (156)</label
											>
										</div>
									</li>
									<li>
										<div>
											<input
												id="product-3"
												type="checkbox"
												class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
											/>
											<label
												for="dell"
												class="ml-2 text-sm font-medium dark:text-white text-gray-900"
												>Dell (5)</label
											>
										</div>
									</li>
									<!-- Add more checkboxes here -->
								</ul>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<div class="overflow-x-auto w-full h-[600px]">
				<table class="table w-full text-sm text-left text-gray-500 dark:text-gray-400">
					<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<!-- Check All Checkbox in the th -->
							<th class="px-4 py-4">
								<div class="flex items-center">
									<!-- Select All Checkbox -->
									<input
										id="checkAll"
										type="checkbox"
										class="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
										bind:checked={selectAll}
										on:change={toggleSelectAll}
									/>
									<label for="checkAll" class="sr-only">Select All</label>
								</div>
							</th>
							<th class="px-4 py-4">ID</th>
							<th class="px-4 py-4">Product name</th>
							<th class="px-4 py-3">Category</th>
							<th class="px-4 py-3">Brand</th>
							<th class="px-4 py-3">Description</th>
							<th class="px-4 py-3">SKU</th>
							<th class="px-4 py-3">Price</th>
							<th class="py-3">Actions</th>
						</tr>
					</thead>

					<tbody>
						{#each products as product (product.id)}
							<tr class="border-b dark:border-gray-700">
								<!-- Individual checkbox -->
								<td class="p-4 w-4">
									<div class="flex items-center">
										<input
											id="checkbox-{product.id}"
											type="checkbox"
											class="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
											checked={checkedProducts.has(product.id)}
											on:change={() => toggleProduct(product.id)}
										/>
										<label for="checkbox-{product.id}" class="sr-only">checkbox</label>
									</div>
								</td>
								<td class="px-4 py-3">{product.id}</td>
								<td class="px-4 py-3">{product.name}</td>
								<td class="px-4 py-3">{product.category}</td>
								<td class="px-4 py-3">{product.brand}</td>
								<td class="px-4 py-3 max-w-[12rem] truncate">{product.description}</td>
								<td class="px-4 py-3">{product.SKU}</td>
								<td class="px-4 py-3">{product.price}</td>
								<td class="px-4 py-3 flex items-center justify-end">
									<div class="dropdown dropdown-end">
										<button class="btn btn-sm btn-ghost" type="button" aria-label="Actions button">
											<svg
												class="w-5 h-5"
												aria-hidden="true"
												fill="currentColor"
												viewbox="0 0 20 20"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
												/>
											</svg>
										</button>
										<ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44">
											<!-- Edit Button -->
											<li>
												<button on:click={() => openModal(product)}>
													<svg
														class="w-4 h-4 mr-2"
														xmlns="http://www.w3.org/2000/svg"
														viewbox="0 0 20 20"
														fill="currentColor"
														aria-hidden="true"
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
											</li>
											<!-- Preview Button -->
											<li>
												<button on:click={() => openPreviewModal(product)}>
													<svg
														class="w-4 h-4 mr-2"
														xmlns="http://www.w3.org/2000/svg"
														viewbox="0 0 20 20"
														fill="currentColor"
														aria-hidden="true"
													>
														<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
														<path
															fill-rule="evenodd"
															clip-rule="evenodd"
															d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
														/>
													</svg>
													Preview
												</button>
											</li>
											<!-- Delete Button -->
											<li>
												<button class="text-red-500" on:click={() => openDeleteModal(product)}>
													<svg
														class="w-4 h-4 mr-2"
														viewbox="0 0 14 15"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
														aria-hidden="true"
													>
														<path
															fill-rule="evenodd"
															clip-rule="evenodd"
															fill="currentColor"
															d="M6.09922 0.300781C5.93212 0.30087 5.76835 0.347476 5.62625 0.435378C5.48414 0.523281 5.36931 0.649009 5.29462 0.798481L4.64302 2.10078H1.59922C1.36052 2.10078 1.13161 2.1956 0.962823 2.36439C0.79404 2.53317 0.699219 2.76209 0.699219 3.00078C0.699219 3.23948 0.79404 3.46839 0.962823 3.63718C1.13161 3.80596 1.36052 3.90078 1.59922 3.90078V12.9008C1.59922 13.3782 1.78886 13.836 2.12643 14.1736C2.46399 14.5111 2.92183 14.7008 3.39922 14.7008H10.5992C11.0766 14.7008 11.5344 14.5111 11.872 14.1736C12.2096 13.836 12.3992 13.3782 12.3992 12.9008V3.90078C12.6379 3.90078 12.8668 3.80596 13.0356 3.63718C13.2044 3.46839 13.2992 3.23948 13.2992 3.00078C13.2992 2.76209 13.2044 2.53317 13.0356 2.36439C12.8668 2.1956 12.6379 2.10078 12.3992 2.10078H9.35542L8.70382 0.798481C8.62913 0.649009 8.5143 0.523281 8.37219 0.435378C8.23009 0.347476 8.06631 0.30087 7.89922 0.300781H6.09922ZM4.29922 5.70078C4.29922 5.46209 4.39404 5.23317 4.56282 5.06439C4.73161 4.8956 4.96052 4.80078 5.19922 4.80078C5.43791 4.80078 5.66683 4.8956 5.83561 5.06439C6.0044 5.23317 6.09922 5.46209 6.09922 5.70078V11.1008C6.09922 11.3395 6.0044 11.5684 5.83561 11.7372C5.66683 11.906 5.43791 12.0008 5.19922 12.0008C4.96052 12.0008 4.73161 11.906 4.56282 11.7372C4.39404 11.5684 4.29922 11.3395 4.29922 11.1008V5.70078ZM8.79922 4.80078C8.56052 4.80078 8.33161 4.8956 8.16282 5.06439C7.99404 5.23317 7.89922 5.46209 7.89922 5.70078V11.1008C7.89922 11.3395 7.99404 11.5684 8.16282 11.7372C8.33161 11.906 8.56052 12.0008 8.79922 12.0008C9.03791 12.0008 9.26683 11.906 9.43561 11.7372C9.6044 11.5684 9.69922 11.3395 9.69922 11.1008V5.70078C9.69922 5.46209 9.6044 5.23317 9.43561 5.06439C9.26683 4.8956 9.03791 4.80078 8.79922 4.80078Z"
														/>
													</svg>
													Delete
												</button>
											</li>
										</ul>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if showModal}
				<AddProductForm product={newProduct} onAddProduct={addProduct} onCloseModal={closeModal} />
			{/if}

			{#if showModal && selectedProduct}
				<UpdateModal
					{selectedProduct}
					onCloseModal={closeModal}
					onUpdateProduct={updateProduct}
					onDeleteProduct={deleteProduct}
				/>
			{/if}

			{#if showModal}
				<AddProductForm onAddProduct={addProduct} onCloseModal={closeModal} />
			{/if}

			{#if isDeleteModalOpen}
				<DeleteModal {product} onCloseModal={closeDeleteModal} onDeleteProduct={deleteProduct} />
			{/if}

			{#if isPreviewModalOpen}
				<PreviewModal {product} onCloseModal={closePreviewModal} />
			{/if}

			<nav
				class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
				aria-label="Table navigation"
			>
				<span class="text-sm font-normal text-gray-500 dark:text-gray-400">
					Showing
					<span class="font-semibold text-gray-900 dark:text-white"
						>{(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, 1000)}</span
					>
					of
					<span class="font-semibold text-gray-900 dark:text-white">1000</span>
				</span>
				<ul class="inline-flex items-stretch -space-x-px">
					<li>
						<button
							class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
							on:click={() => goToPage(currentPage - 1)}
							disabled={currentPage === 1}
						>
							<span class="sr-only">Previous</span>
							<svg
								class="w-5 h-5"
								aria-hidden="true"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</li>
					{#each Array(totalPages).fill(0).slice(0, 5) as _, index}
						<li>
							<button
								class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
								on:click={() => goToPage(index + 1)}
							>
								{index + 1}
							</button>
						</li>
					{/each}
					<li>
						<button
							class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
							on:click={() => goToPage(currentPage + 1)}
							disabled={currentPage === totalPages}
						>
							<span class="sr-only">Next</span>
							<svg
								class="w-5 h-5"
								aria-hidden="true"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</li>
				</ul>
			</nav>
		</div>
	</section>

	<!-- End block -->
</main>
