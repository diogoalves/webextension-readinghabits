export const isSupportedProtocol = urlString => {
  var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
  var url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) != -1;
}

export const updateIcon = (foundBookmark, tab) => {
  browser.browserAction.setIcon({
    path: foundBookmark ? {
      19: "icons/star-filled-19.png",
      38: "icons/star-filled-38.png"
    } : {
      19: "icons/star-empty-19.png",
      38: "icons/star-empty-38.png"
    },
    tabId: tab.id
  });
  browser.browserAction.setTitle({
    title: foundBookmark ? 'Read it later!' : 'Already read!',
    tabId: tab.id
  }); 
}

export const getActiveTab = async () => {
  const [ activeTab ] = await browser.tabs.query({active: true, currentWindow: true});
  if(activeTab && isSupportedProtocol(activeTab.url)) {
    return activeTab;
  } else {
    return null;
  }
}

export const getFolderId = async folderName => {
  const [ found ] = await browser.bookmarks.search({title: folderName});
  if(found) {
    return found.id;
  } else {
    const newFolder = await browser.bookmarks.create({title: folderName});
    return newFolder.id;
  }
}

export const getItems = async folderId => {
  const  [ result ] = await browser.bookmarks.getSubTree(folderId);
  return result.children;
}

export const find = async (folderId, url) => {
  const items = await getItems(folderId);
  return items.find( e => e.url === url);
}




