window.playlists = {}
chrome.runtime.onMessage.addListener(function ( request, sender) {
    if(request.from == 'content' && request.target == 'background'){
        window.playlists[request.url] = request.myStorage;
    }
   
});