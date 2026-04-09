<script>
import { host, token } from "../../../../apis/config";
import Header from '../../components/header/header.svelte';


let {
	  onToggleSidebar,
	} = $props();
	
	let sidebarToggle = true;

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
      sidebarToggle = !sidebarToggle;
      onToggleSidebar();
  };
  
let downloadName = $state("");
  
async function download()
{
    const searchParams = new URLSearchParams(window.location.search);
    downloadName = searchParams.get("filename");
     
   const response = await fetch(`${host}pointofsale/download?document_id=${searchParams.get("document_id")}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
          },
      });
  
  let blob = await response.blob();
  
	var url = window.URL || window.webkitURL;
	
	let link = url.createObjectURL(blob);

        // generate anchor tag, click it for download and then remove it again
	let a = document.createElement("a");
	
	a.setAttribute("download", searchParams.get('filename'));
	
	a.setAttribute("href", link);
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
download();

</script>


<div>
<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
<div class="flex mt-4 justify-center self-center h-full opacity-100">
    <div class="max-w-lg rounded-xl bg-gray-100 dark:bg-[#22273c] p-10 text-center">
      <h1 class="text-5xl font-bold text-gray-900 dark:text-gray-100">Downloading</h1>
      <p class="py-6 text-gray-900 dark:text-gray-200">
        Download has started for {downloadName}
      </p>
    </div>
</div>
</div>
