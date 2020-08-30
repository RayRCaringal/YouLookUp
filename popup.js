
// Creates new tabs and shows the missing videos.
document.addEventListener('DOMContentLoaded', function() {
    const missing = document.getElementById('missing');
    const reset = document.getElementById('reset')
    const debug = document.getElementById('debug')
    const watch = document.getElementById('watch')
    const stop = document.getElementById('dont')

    if(missing){
        console.log("missing")
        missing.addEventListener("click", ()=>{
            console.log("Clicked missing")
            send("find")
        });
    }
   
    if(reset){
        console.log("reset")
        reset.addEventListener("click", ()=>{
            console.log("Clicked reset")
            send("clear")
        });
    }

    if(debug){
        console.log("debug")
        debug.addEventListener("click", ()=>{
            console.log("Clicked debug")
            send("debug")
        });
    }

    if(watch){
        console.log("watch")
        watch.addEventListener("click", ()=>{
            console.log("Clicked watch")
            send("watch")
        });
    }

    if(stop){
        console.log("stop")
        stop.addEventListener("click", ()=>{
            console.log("Clicked stop")
            send("stop")
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


