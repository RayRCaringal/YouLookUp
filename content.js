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
    const prev = Object.keys(prevList[playListId]);


    //There's an issue with how this is implemented causing the object to start nesting itself  
    //Item has been added 
    if(curr.length > prev.length){ 
        console.log("Item has been added")
        const additions = curr.filter(video => !prev.includes(video))
        additions.forEach(newItems => prevList[playListId][newItems] = currentList[newItems])
        chrome.storage.sync.set(prevList)
    }
    //Item has been deleted (Keep Track of Deletions as a Future Option)
    else if(curr.length < prev.length){
        console.log("Item has been deleted")
        const deletions = prev.filter(video => !curr.includes(video))
        deletions.forEach(deletedItem => delete prevList[playListId][deletedItem])    
        chrome.storage.sync.set(prevList)
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

                            //Convert QuerySelector NodeList to Array to use Filter
                            let video = Array.from(videos)

                            //Check which NodeList Objects are inlucded within the List of deleted items based on Video Id
                            let gone = video.filter(obj => deleted.includes(obj.href.substring(obj.href.indexOf('=')+1,obj.href.indexOf('&'))))
                            //let gone = video.filter(obj => deleted.includes(obj.data.watchEndpoint.videoId))
                            
                            gone.forEach(vid => {
                                let url = vid.href
                                let id = url.substring(url.indexOf('=')+1,url.indexOf('&'))
                                vid.childNodes[3].childNodes[1].childNodes[3].innerText = savedList[playListId][id]
                            })
                            console.log(gone)
    
                        })
                    }else{
                        console.log("Playlist is not being watched")
                    }
                    break  
                case "watch": 
                    chrome.storage.sync.get(playListId, (savedList)=>{
                        if(Object.values(savedList[playListId]) != "Don't Watch"){
                            console.log("This is already being watched")
                        }else{
                            chrome.storage.sync.set({[playListId] : createPlaylist()})
                            watch = true
                        }
                    })
                    break
                //For some reason this doesnt work right now   
                case "stop":
                    break
                case "clear":
                    console.log("It has been requested that this entry is cleared")
                    chrome.storage.sync.remove(playListId,()=>{
                        let e = chrome.runtime.lastError
                        if(e){
                            console.error(e)
                        }
                    })
                    break
                case "debug":
                    chrome.storage.sync.get(playListId, (savedList)=>{
                        console.log(savedList)
                    })
                    break
            }
        }
       
    });
}else{
    console.log("No videos found in this playlist");
}
