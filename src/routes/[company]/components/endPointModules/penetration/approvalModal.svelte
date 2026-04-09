<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // from parent component
    export let form_info_data = {};
    export let form_values;
    // export let fields;

    let selectedTerritory = form_values?.territory || 'All';
    let selectedRoute = form_values?.route || 'All';

    console.log("Form info Territory - " + form_info_data.data.territory)
    console.log("Form info Route - " + form_info_data.data.route)
    console.log("==============================")
    console.log(form_info_data.data.territory)

    // let selectedTerritory = form_values[fields.indexOf('territory')];

    $: filteredRoutes = Object.entries(form_info_data.data.route || {})
        .filter(([optionKey, optionLabel]) => {
            return selectedTerritory === 'All' || optionLabel.territory.toString() === selectedTerritory;
        });

    function submit() {
        dispatch('submit', {
            territory: selectedTerritory,
            route: selectedRoute
        });
    }

    function cancel() {
        dispatch('cancel');
    }
</script>

<div class="bg-black/50 fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-50">
    <div class="z-60 fixed bg-gray-100 p-6 text-gray-800 rounded-xl w-1/3 min-w-1/3 max-w-9/10">
        <h3>Approve Request</h3>
        <p>Please select a territory and route:</p>

        <div class="my-4">
            <label for="territory" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Territory</label>
            <select
                bind:value={selectedTerritory}
                id="territory"
                name="territory"
                class="select w-full rounded-lg border border-gray-200 bg-white"
                on:change={() => {
                    selectedRoute = 'All';
                }}
            >
                <option value="">Select a Territory</option>
                {#each Object.entries(form_info_data.data.territory || {}) as [optionKey, optionLabel]}
                    <option value={optionKey}>{optionLabel}</option>
                {/each}
            </select>
        </div>

        <div class="my-4">
            <label for="route" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Route</label>
            <select
                bind:value={selectedRoute}
                id="route"
                name="route"
                class="select w-full rounded-lg border border-gray-200 bg-white"
            >
                <option value="All">All</option>
                {#each filteredRoutes as [optionKey, optionLabel]}
                    <option value={optionKey}>{optionLabel.name}</option>
                {/each}
            </select>
        </div>

        <div class="button-group flex justify-end gap-4 mt-4">
            <button class="submit-button px-4 py-2 bg-blue-500 text-white rounded" on:click={submit}>Submit</button>
            <button class="cancel-button px-4 py-2 bg-gray-300 rounded" on:click={cancel}>Cancel</button>
        </div>
    </div>
</div>

<style>
</style>