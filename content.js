// Grabs information from the current page and stores it locally.
 
const url = window.location.href;
const playListId = url.substring(url.indexOf('=')+1)
const myStorage = window.localStorage;

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
    const videos = document.querySelectorAll("a.ytd-playlist-video-renderer");
    videos.forEach((title)=>{
        const videoURL = title.href;
        const videoID =  videoURL.substring(videoURL.indexOf('=')+1,videoURL.indexOf('&'))
        playList[videoID] = title.querySelector("#video-title").innerHTML.trim()
    })
    return playList;
}


chrome.runtime.onMessage.addListener((request)=> {
    if(request.from == 'popup' && request.target == 'content'){
        switch(request.type){
            case "find":
                console.log("It has been requested that we find deleted ")
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


function findDeletedVideos() {
    try {
        //Select all Videos in the playlist
        //There is an issue with this because it's for popup    
        let videos = document.querySelectorAll("a.ytd-playlist-video-renderer");
        console.log(videos)

        if (videos) {
            const popup = document.getElementById("videoes")
            //Idk why this is here 
            const deletedVideos = Array.from(videos).filter((e)=>{     
                try{
                    let title = e.innerText;
                }catch (error){
                    console.log("Error title not found", error)
                }
            });
            console.log("Deleted.length = " + deletedVideos.length)
            if(deletedVideos.length > 0){
                console.log("Deleted")
                const videoIDs = getVideoIds(deletedVideos)
                const savedList = JSON.parse(myStorage.getItem(playListId))
                videoIDs.forEach((ID) =>{
                    popup.innerHTML += "<li>" + savedList[ID] + "<div class=\"remove\"> Remove </div></li>"
                })
            }else{
                if(missing){
                    popup.innerHTML += "There are no missing videoes"
                    missing = false;
                }else{
                    console.log("Already clicked")
                }
            }   
        } else {
            //This Shouldn't Happen As There is Usually "Don't Watch within the playlist"
            console.log("No videos found in this playlist");
        }
    } catch (error) {
        console.error("Error retrieving deleted videos from playlist", error);
    }
}


//Filters non-deleted videos out of an array of video DOM elements
function hasDeletion(value, index, array) {
    let title = value.innerText;
    if (!title) {
        console.log("returning")
        return false;
    }
    console.log(title)
    // this will break if youtube changes conventions
    return (title.toLowerCase() == "[deleted video]");
}

/**
 Returns an array of video ids
 @param videoElements - an array of video DOM elements
*/
function getVideoIds(videoElements) {
    var videoIds = videoElements.map((video) => video.search);
    videoIds = videoIds.map((url) => url.substring(url.indexOf("=") + 1, url.indexOf("&")));
    return videoIds;
}
