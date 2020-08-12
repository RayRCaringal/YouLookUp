//const url = window.location.href;
//const playListId = url.substring(url.indexOf('=')+1)
//const myStorage = window.localStorage;
//let missing = true;

let playList

// Creates new tabs and shows the missing videos.
document.addEventListener('DOMContentLoaded', () => {
    //Query for the active tab...
    const request = build =>{
        url = build.url
        playlist = build.list
        playListId = build.pId
        storage = build.myStorage
    }
    chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        // ...and send a request for the DOM info...
        chrome.tabs.sendMessage(tabs[0].id,{
              from: 'popup',
              target: 'content'},
            request);
      });    

      console.log(playlist)
      console.log(storage)
      console.log(url)
      console.log(playListId)


    const missing = document.getElementById('missing');
    const reset = document.getElementById('reset')
   
    if (missing) {
        missing.addEventListener('click', findDeletedVideos);
    }
    
    if (reset) {
        reset.addEventListener('click', ()=>{myStorage.setItem(playListId, JSON.stringify(createPlaylist()))});
    }
}, false)


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


//Creates playlist object list with key-value pairs videoID : Title
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


/**
 Returns an array of video ids
 @param videoElements - an array of video DOM elements
*/
function getVideoIds(videoElements) {
    var videoIds = videoElements.map((video) => video.search);
    videoIds = videoIds.map((url) => url.substring(url.indexOf("=") + 1, url.indexOf("&")));
    return videoIds;
}

