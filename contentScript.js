(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        }
        else if(type === "PLAY") {
            youtubePlayer.currentTime = value;
        }
        else if(type === "DELETE") {
            currentVideoBookmarks = currentVideoBookmarks.filter(bookmark => bookmark.time != value);
            chrome.storage.sync.set({
                [currentVideo]: JSON.stringify(currentVideoBookmarks)
            });
            response(currentVideoBookmarks);
        }
    });

    const fetchBookmarks = () => {
        return new Promise((resolve)=> {
            chrome.storage.sync.get([currentVideo], (result) => {
                resolve(result[currentVideo] ? JSON.parse(result[currentVideo]) : []);
            });
        });
    }


    // Adds a bookmark button to the youtube player controls if it doesn't exist
    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        console.log(bookmarkBtnExists);

        currentVideoBookmarks = await fetchBookmarks();

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            // All the assets of the extension must be declared as web_accessible_resources in the manifest.json file [So that they can be accessed by the specific content script of a webpage]

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png"); // to access an asset in the extension folder, we use the chrome.runtime.getURL() method
            // chrome.runtime.getURL() returns a string containing the URL of the asset
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
            
            youtubeLeftControls.append(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime; // gives the current time of the video in seconds
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };
        console.log(newBookmark);
        
        currentVideoBookmarks = await fetchBookmarks();
        console.log(currentVideoBookmarks);
        console.log(currentVideo);
        // chrome.storage api is used to store data in the browser's local storage [It is similar to the localStorage API, but it is asynchronous]
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    }

    newVideoLoaded(); // as we are only adding the bookmark button when the tab url is updated, so if we reload the tab, the url is still the same and background.js wont notify the content scripts of yt webpages to add the bookmark button, so we need to call newVideoLoaded() here to add the bookmark button 
})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substr(11, 8);
}
