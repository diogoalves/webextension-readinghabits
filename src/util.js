import browser from 'webextension-polyfill';

export const isSupportedProtocol = urlString => {
  var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
  var url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) != -1;
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

export const next = async (folderId, currentUrl) => {
  const items = await getItems(folderId);
  return items.find( e => e.url !== currentUrl);
}


