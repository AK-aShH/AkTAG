### chrome.storage API [Requires 'storage' permission to access]
- Can be accessed from any extension scripts including service-workers as well as the content scripts if the extension has the 'storage' permission.
- Asynchronous
- Storage is per extension, not per domain. 
- Data is persistant even if the user clears the cache and browsing history.
- Storage API is divided into 4 buckets or areas of storage:
    - **storage.local**: Storage that is local to the machine [Cleared when the extension is removed]. It is not synced across devices. [Consider using it to store large amounts of data]
    - **storage.sync**: Data is synced to any Chrome browser that the user is logged into . It is not local to the machine.
    - **storage.session**: Storage [Incrypted & secure storage] that is temporary and is cleared when the browser is closed.
    - **storage.managed**: Storage that is managed by the administrator. It is not local to the machine.
    
- For message passing from the content scripts to the extension scripts, use the **chrome.runtime.sendMessage()** and **chrome.runtime.onMessage.addListener()** methods. 
- But for message passing from the background scripts to the content scripts, use the **chrome.tabs.sendMessage()** [To know which tab's content script to send the message] and **chrome.runtime.onMessage.addListener()** methods.

