// Grabs information from the current page and stores it locally.
 
const url = window.location.href;
const playListId = url.substring(url.indexOf('=')+1)
const myStorage = window.localStorage;
const playlist = myStorage.getItem(playListId)
console.log(playlist)

//Check if list is stored 
if(playlist == null){

    //Prompt user to watch playlist 
    if(confirm("This playlist is not being watched would you like to watch this playlist?")){
        myStorage.setItem(playListId, JSON.stringify(createPlaylist()))
    }else{
        myStorage.setItem(playListId, "Don't Watch");
    }

}else if(playlist !== "Don't Watch"){
    //Check for updates 
    const prevList = JSON.parse(playlist)
    checkForUpdates(prevList);
}

/**
 * Checks stored list and current list for updates, if there are changes it updates the list 
 * @param {Object} prevList  
 */
function checkForUpdates(prevList){
    const currentList = createPlaylist();
    const curr = Object.keys(currentList);
    const prev = Object.keys(prevList);

    //Item has been added 
    if(curr.length > prev.length){ 
        const additions = curr.filter(video => !prev.includes(video))
        additions.forEach(newItems =>   prevList[newItems] = currentList[newItems])
        myStorage.setItem(_URL,prevList)
    }
    //Item has been deleted (Keep Track of Deletions as a Future Option)
    else if(curr.length < prev.length){
        const deletions = prev.filter(video => !curr.includes(video))
        deletions.forEach(deletedItem => delete prevList[deletedItem])    
        myStorage.setItem(_URL,prevList)
    }   
}

//Creates playlist object list with key-value pairs videoID : Title
//If it's not in a playlist use document.querySelectorAll("a.ytd-playlist-panel-video-renderer")
//Manifest.json is not currently setup for this to work 
function createPlaylist(){
    let playList = {}
    const videos = document.querySelectorAll("a.ytd-playlist-video-renderer");
    videos.forEach((title)=>{
        const videoURL = title.href;
        const videoID =  videoURL.substring(videoURL.indexOf('=')+1,videoURL.indexOf('&'))
        playList[videoID] = title.querySelector("#video-title").innerHTML.trim()
    })
    return playList;
}

//CHROME SPECIFIC 

//Sends chrome the current stored list 
chrome.runtime.sendMessage({
    from: 'content',
    target: 'background',
    url: window.location.href,
    myStorage: JSON.parse(myStorage.getItem(playListId))
});

chrome.runtime.sendMessage({   
    from: 'content',
    target: 'popup',
    url: window.location.href,
    pId: playListId,
    list: playlist,
    myStorage: JSON.parse(myStorage.getItem(playListId))})

// Clears missing videos from local storage for current URL, Clears from HTML
chrome.runtime.onMessage.addListener(function(request){
   console.log("Clear Request")
});