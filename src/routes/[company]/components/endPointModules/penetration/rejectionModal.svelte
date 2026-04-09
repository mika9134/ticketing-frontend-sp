<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let rejectionReason = '';

	function submit() {
		dispatch('submit', rejectionReason);
	}

	function cancel() {
		dispatch('cancel');
	}
</script>

<div class="bg-black/50 fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-50">
    <div class="z-60 fixed bg-gray-100 p-6 text-gray-800 rounded-xl w-1/3 min-w-1/3 max-w-9/10">
        <div class="modal-content">
            <h3 class="text-xl font-bold mb-2">Reject Request</h3>
            <p class="text-sm mb-8">Please provide a reason for the rejection:</p>
            <textarea
                bind:value={rejectionReason}
                placeholder="Enter reason here..."
                rows="4"
                class="w-full p-4 mb-4 border rounded-lg bg-gray-200 text-gray-900 focus:outline-black"
            ></textarea>
            <div class="flex items-end gap-2">
                <button
                    class="px-4 py-1 rounded-md border-none cursor-pointer font-bold bg-red-500 hover:bg-red-800 text-white"
                    on:click={submit}>Submit</button
                >
                <button
                    class="px-4 py-1 rounded-md border-none cursor-pointer font-bold bg-gray-300 hover:bg-gray-400 text-gray-800"
                    on:click={cancel}>Cancel</button
                >
            </div>
        </div>
    </div>
</div>

<style>
</style>
