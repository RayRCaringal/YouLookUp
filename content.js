// Grabs information from the current page and stores it locally.
 
const url = window.location.href;
const playListId = url.substring(url.indexOf('=')+1)
const myStorage = window.localStorage;

//Add Check for Playlist Page vs Watching Playlist Later here
const videos = document.querySelectorAll("a.ytd-playlist-video-renderer");
//True if playlist is set to Watch, False if you're not watching the playlist
let watch = false

chrome.storage.sync.get(playListId, (playlist) =>{
    //Check if list is stored 
    if(Object.keys(playlist).length === 0 && playlist.constructor === Object){
         //Prompt user to watch playlist 
        if(confirm("This playlist is not being watched would you like to watch this playlist?")){
            chrome.storage.sync.set({[playListId] : createPlaylist()})
        }else{
            chrome.storage.sync.set({[playListId]: "Don't Watch"})
        }
    }else if(playlist !== "Don't Watch"){
    //Check for updates 
    //const prevList = playlist)
    watch=true
    checkForUpdates(playlist);
 }
})


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
        additions.forEach(newItems => prevList[newItems] = currentList[newItems])
        chrome.storage.sync.set({[playListId] : prevList})
    }
    //Item has been deleted (Keep Track of Deletions as a Future Option)
    else if(curr.length < prev.length){
        const deletions = prev.filter(video => !curr.includes(video))
        deletions.forEach(deletedItem => delete prevList[deletedItem])    
        chrome.storage.sync.set({[playListId] : prevList})
    }   
}

//Creates playlist object list with key-value pairs videoID : Title
//If it's not in a playlist use document.querySelectorAll("a.ytd-playlist-panel-video-renderer")
//Manifest.json is not currently setup for this to work 
function createPlaylist(){
    let playList = {}
    if (videos){
        videos.forEach((title)=>{
        const videoURL = title.href;
        const videoID =  videoURL.substring(videoURL.indexOf('=')+1,videoURL.indexOf('&'))
        playList[videoID] = title.querySelector("#video-title").innerHTML.trim()
     })
    }
    return playList;
}

//Cannot run any of these commands if there are no videos present in the playlist 

if(videos){
    chrome.runtime.onMessage.addListener((request)=> {
        if(request.from == 'popup' && request.target == 'content'){
            switch(request.type){
                case "find":
                    console.log("It has been requested that we find deleted videos")
                    if(watch){
                        chrome.storage.sync.get(playListId, (savedList)=>{
                            let curr = createPlaylist();
                            let keys = Object.keys(curr)
                            let deleted = keys.filter(key => curr[key] != savedList[playListId][key])
                            console.log(deleted)
    
    
                        })
                    }else{
                        console.log("Playlist is not being watched")
                    }
                    break
                case "watch": 
                    break
                case "stop":
                    break
                case "clear":
                    console.log("It has been requested that this entry is cleared")
                    break
            }
        }
       
    });
}else{
    console.log("No videos found in this playlist");
}



function findDeletedVideos() {
    if (videos) {
        //const popup = document.getElementById("videoes") 
        const deletedVideos = Array.from(videos).filter((e)=>{let title = e.innerText;});

        if(deletedVideos.length > 0){
            let videoIDs = getVideoIds(deletedVideos)
            //let savedList = JSON.parse(myStorage.getItem(playListId))
            //Here we added the videoID titles plus Remove button here, but instead we'll just replace the video IDs
        }   
    } else {
        console.log("No videos found in this playlist");
    }
}


//Filters non-deleted videos out of an array of video DOM elements
function hasDeletion(value, index, array) {
    let title = value.innerText;
    if (!title) {
        console.log("returning")
        return false;
    }
    // This will break if YouTube formatting changes 
    // In the future change this to a comparison with a videoId:Title Comparison
    return (title.toLowerCase() == "[deleted video]");
}

/**
 Returns an array of video ids
 @param videoElements - an array of video DOM elements
*/
function getVideoIds(videoElements) {
    let videoIds = videoElements.map((video) => video.search);
    videoIds = videoIds.map((url) => url.substring(url.indexOf("=") + 1, url.indexOf("&")));
    return videoIds;
}
