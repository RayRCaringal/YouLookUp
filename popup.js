
// Creates new tabs and shows the missing videos.
document.addEventListener('DOMContentLoaded', function() {
    const missing = document.getElementById('missing');
    const reset = document.getElementById('reset')

    if(missing){
        console.log("missing")
        missing.addEventListener("click", ()=>{
            console.log("Clicked missing")
            send("find")
        });
    }
   
    if(reset){
        reset.addEventListener("click", ()=>{
            console.log("Clicked reset")
            send("clear")
        });
    }
    
});


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


