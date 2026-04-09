<script>
	import Fileupload from "$lib/modals/fileupload.svelte";

    let errorMessage = '';
    let isUploading = false;
    let fileInput;
    let selectedFile;
    let imageFile=$state();
    let to_upload_image = $state();
    let to_upload = $state('');
    let allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/webp'];

    $effect(() => {
  if (imageFile) {
    console.log(imageFile);
  }
});
  
    
  </script>
  
  <style>
    .error { color: red; }
  </style>
  
  <!-- <input type="file" bind:this={fileInput} onchange={(e)=> handleFileSelect(e, to_upload)} /> -->
  <Fileupload bind:imageFile={imageFile}/>
  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}
  {#if isUploading}
    <p>Uploading image...</p>
  {/if}
  {#if to_upload_image}
    <img src={to_upload_image} alt=""/>
  {/if}


  