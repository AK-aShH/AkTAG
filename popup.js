import { getCurrentTabURL } from "./utils.js";

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");

    bookmarkTitleElement.className = "bookmark-title";
    bookmarkTitleElement.innerHTML = bookmark.desc;
    controlsElement.className = "bookmark-controls";

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentVideoBookmarks=[]) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";
    if (currentVideoBookmarks.length > 0) {
        for (let i = 0; i < currentVideoBookmarks.length; i++) {
          const bookmark = currentVideoBookmarks[i];
          addNewBookmark(bookmarksElement, bookmark);
        }
      } else {
        bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
      }
      return;
};

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTabURL();
    console.log(bookmarkTime);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime,
    });
};

const onDelete = async e => {
    const activeTab = await getCurrentTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    console.log(bookmarkTime);
    const bookmarkElementToDelete = document.getElementById(
        "bookmark-" + bookmarkTime
    );
    console.log(bookmarkElementToDelete);
    console.log(bookmarkElementToDelete.parentNode);
    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.tabs.sendMessage(activeTab.id, { // passing the message to the content script to delete the bookmark from the storage
        type: "DELETE",
        value: bookmarkTime,
    }); 
    // chrome.storage.sync.get([activeTab.url], (result) => {
    //     const currentVideoBookmarks = result[activeTab.url] ? JSON.parse(result[activeTab.url]) : [];
    //     const newVideoBookmarks = currentVideoBookmarks.filter(bookmark => bookmark.time != bookmarkTime);
    //     chrome.storage.sync.set({
    //         [activeTab.url]: JSON.stringify(newVideoBookmarks)
    //     });
    //     viewBookmarks(newVideoBookmarks);
    // });
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");

    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getCurrentTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get("v");
    console.log(currentVideo);

    if(activeTab.url.includes("youtube.com/watch")&&currentVideo){
        chrome.storage.sync.get([currentVideo], (result) => {
            const currentVideoBookmarks = result[currentVideo] ? JSON.parse(result[currentVideo]) : [];
            console.log(currentVideoBookmarks);
            viewBookmarks(currentVideoBookmarks);
        });
    }
    else{
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a youtube video page.</div>'
    }

});
