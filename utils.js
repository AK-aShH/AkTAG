export async function getCurrentTabURL() {
    // let queryOptions = { active: true, lastFocusedWindow: true };
    // // `tab` will either be a `tabs.Tab` instance or `undefined`.
    // let [tab] = await chrome.tabs.query(queryOptions);
    // return tab;
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];

}