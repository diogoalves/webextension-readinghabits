const isSupportedProtocol = urlString => {
  var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
  var url = document.createElement('a');
  url.href = urlString;
  return supportedProtocols.indexOf(url.protocol) != -1;
}

const updateIcon = (foundBookmark, tab) => {
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

const getQueueList = async () => {
  const [ found ] = await browser.bookmarks.search({title: QUEUE_FOLDER_NAME});
  if(found) {
    QUEUE_FOLDER_ID = found.id;
    const  [ result ] = await browser.bookmarks.getSubTree(QUEUE_FOLDER_ID);
    return result.children;
  } else {
    const { id } = await browser.bookmarks.create({title: QUEUE_FOLDER_NAME});
    QUEUE_FOLDER_ID = id;
    return [];
  }
}

const getArchiveList = async () => {
  const [ found ] = await browser.bookmarks.search({title: ARCHIVE_FOLDER_NAME});
  if(found) {
    ARCHIVE_FOLDER_ID = found.id;
    const  [ result ] = await browser.bookmarks.getSubTree(ARCHIVE_FOLDER_ID);
    return result.children;
  } else {
    const { id } = await browser.bookmarks.create({title: ARCHIVE_FOLDER_NAME});
    ARCHIVE_FOLDER_ID = id;
    return [];
  }
}


const getActiveTab = async () => {
  const [ activeTab ] = await browser.tabs.query({active: true, currentWindow: true});
  if(activeTab && isSupportedProtocol(activeTab.url)) {
    return activeTab;
  } else {
    return null;
  }
}

const findInQueue = async url => {
  const queue = await getQueueList();
  return queue.find( e => e.url === url);
}

const findInArchive = async url => {
  const queue = await getArchiveList();
  return queue.find( e => e.url === url);
}
