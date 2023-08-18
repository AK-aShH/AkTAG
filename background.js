// Background scripts runs in the context of the extension or the browser, not the webpage i.e its not specific to any tab or webpage
// It is used to listen to events that happen in the browser, and perform actions depending on the event
// It has access to all the chrome APIs, but not to the DOM of any webpage [For DOM manipulation of a certain webpage, we use content scripts of that webpage]

// We use the chrome.tabs API to interact with the browser's tab system i.e to create, modify, and rearrange tabs or to detect the tab's status

// chrome.tabs.onUpdated.addListener((tabId, tab) => {
//     if (tab.url && tab.url.includes("youtube.com/watch")) {
//       const queryParameters = tab.url.split("?")[1];
//       const urlParameters = new URLSearchParams(queryParameters);
  
//       chrome.tabs.sendMessage(tabId, { // pass a message to the selected webpage/tab's content script [The tabId is used to specify the tab to which the message is to be sent]
//         type: "NEW",
//         videoId: urlParameters.get("v"),
//       });
//     }
//   });

// Above code was sending the msg to the content script only when the tab was updated but not when the tab was reloaded [As the tab was not updated, so the onUpdated event was not fired]
// As a result the videoId was not being sent to the content script when the tab was reloaded, hence it was not showing any bookmarks

const sendMessageToContentScript = (tabId, url) => {
  if (url && url.includes("youtube.com/watch")) {
    const queryParameters = url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.log(`Error: ${chrome.runtime.lastError.message}`);
      } else {
        console.log(`Received response: ${response}`);
      }
    });
  }
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    sendMessageToContentScript(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    sendMessageToContentScript(activeInfo.tabId, tab.url);
  });
});
  