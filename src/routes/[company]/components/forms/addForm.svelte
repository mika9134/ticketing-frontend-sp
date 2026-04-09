<script>
	export let endpoint_name = '';
	export let submit_url = '';
	export let endpointData; // expected to be the JSON object you provided

	// clone the data into a form state
	let formData = { ...endpointData.data };

	function handleSubmit(event) {
		event.preventDefault();

		// prepare a copy of formData for submission
		let submissionData = { ...formData };

		// convert multiple select arrays to comma separated strings
		for (const key in formData) {
			if (
				endpointData.html_types[key].startsWith('select') &&
				endpointData.html_types[key].includes('multiple') &&
				Array.isArray(formData[key])
			) {
				submissionData[key] = formData[key].join(',');
			}
		}

		fetch(submit_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(submissionData)
		})
			.then((response) => response.json())
			.then((data) => {
				console.log('Response:', data);
			})
			.catch((error) => {
				console.error('Error submitting form:', error);
			});
	}
</script>

<form on:submit={handleSubmit}>
	<h2>{endpoint_name}</h2>
	{#each Object.keys(formData) as key}
		{#if endpointData.html_types[key] === 'hidden'}
			<input type="hidden" name={key} bind:value={formData[key]} />
		{:else if endpointData.html_types[key] === 'text'}
			<div>
				<label for={key}>{key}</label>
				<input type="text" id={key} name={key} bind:value={formData[key]} />
			</div>
		{:else if endpointData.html_types[key] === 'textarea'}
			<div>
				<label for={key}>{key}</label>
				<textarea id={key} name={key} bind:value={formData[key]}></textarea>
			</div>
		{:else if endpointData.html_types[key].startsWith('select')}
			<div>
				<label for={key}>{key}</label>
				<select
					id={key}
					name={key}
					value={formData[key]}
					multiple={endpointData.html_types[key].includes('multiple')}
					on:change={(e) => {
						formData[key] = endpointData.html_types[key].includes('multiple')
							? Array.from(e.target.selectedOptions).map((option) => option.value)
							: e.target.value;
					}}
				>
					{#each Object.entries(endpointData.data[key]) as [optionValue, optionLabel]}
						<option value={optionValue}>{optionLabel}</option>
					{/each}
				</select>
			</div>
		{/if}
	{/each}

	<button type="submit">Submit</button>
</form>
