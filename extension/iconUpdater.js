const QUEUE_FOLDER_NAME = 'READ IT LATER';
const ARCHIVE_FOLDER_NAME = 'ARCHIVED';

const isSupportedProtocol = urlString => {
  var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
  var url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) != -1;
}

const getActiveTab = async () => {
  const [ activeTab ] = await browser.tabs.query({active: true, currentWindow: true});
  if(activeTab && isSupportedProtocol(activeTab.url)) {
    return activeTab;
  } else {
    return null;
  }
}

const getFolderId = async folderName => {
  const [ found ] = await browser.bookmarks.search({title: folderName});
  if(found) {
    return found.id;
  } else {
    const newFolder = await browser.bookmarks.create({title: folderName});
    return newFolder.id;
  }
}

const getItems = async folderId => {
  const  [ result ] = await browser.bookmarks.getSubTree(folderId);
  return result.children;
}

const find = async (folderId, url) => {
  const items = await getItems(folderId);
  return items.find( e => e.url === url);
}


const update = async () => {
  const activeTab = await getActiveTab();
  if(activeTab) {
    const queueFolderId = await getFolderId(QUEUE_FOLDER_NAME);
    const archiveFolderId = await getFolderId(ARCHIVE_FOLDER_NAME);
    const foundBookmark = await find(queueFolderId, activeTab.url);
    const foundArchived = await find(archiveFolderId, activeTab.url);
    let prefix = 'empty';

    if(foundBookmark) prefix = 'queued';
    if(foundArchived) prefix = 'archived';

    const icon = {
      path: {
        19: `icons/${prefix}-19.png`,
        38: `icons/${prefix}-38.png`
      },
      tabId: activeTab.id
    }

    browser.browserAction.setIcon(icon);
  }
  
  browser.browserAction.setIcon(icon);
}

browser.bookmarks.onCreated.addListener(update);
browser.bookmarks.onMoved.addListener(update);
browser.bookmarks.onRemoved.addListener(update);
browser.tabs.onUpdated.addListener(update);
browser.tabs.onActivated.addListener(update);
browser.windows.onFocusChanged.addListener(update);

update();
