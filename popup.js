
// Creates new tabs and shows the missing videos.
document.addEventListener('DOMContentLoaded', () => {
    const missing = document.getElementById('missing');
    const reset = document.getElementById('reset')
   
    missing.addEventListener('click', send("find"));
    reset.addEventListener('click', send("clear"));
}, false)


//Sends a request to content.js 
function send(requestType){
    chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
        chrome.tabs.sendMessage(tabs[0].id, {
            from: "popup",
            target: "content",
            type: requestType
        });
 });
}


