
<script>

    import { host, token } from "../../apis/config";

    	
    let {
      isOpen,
    	  template_callback,
    	  browse_callback,
    	  handleClose,
    } = $props();
    
    $effect(() => {if(isOpen)dialog.showModal();});
    
    let dialog;
    

</script>
<dialog
	class="p-2 border-none bg-transparent backdrop:bg-black/50"
	bind:this={dialog}
	onclose={() => {
		isOpen = false;
		handleClose();
	}}
	onclick={(e) => {
	  isOpen = false;
	  handleClose();
		dialog.close();
	}}
>
  <div class="flex items-center justify-center bg-transparent backdrop:bg-black/50 bg-opacity-50 overflow-scroll rounded-xl">
    <div class="relative p-6 w-96 bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg">
      <div class="text-center">
        <h3 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Import CSV</h3>
        <div class="grid grid-cols-2 gap-4">
            <button class="join-item btn bg-[#2371ac] text-gray-900 border-[#2371ac] text-md shadow-md text-white" onclick={template_callback}>
              <img src="/svgs/copy.svg" class="w-4 h-4 text-white mr-2" />
               <span class="button__text">Template</span>
             </button>
          <button class="join-item btn bg-[#2371ac] text-gray-900 border-[#2371ac] text-md shadow-md text-white" onclick={() => {document.getElementById('csvfile').click()}}>
              <img src="/svgs/upload.svg" class="w-4 h-4 text-white mr-2" />
              <input type="file" name="file" style="display:none" id="csvfile" accept=".csv" onchange={(event) => {const csvFile = event.target.files[0]; browse_callback(csvFile)}}/>
              <span class="button__text">Browse</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  </dialog>













