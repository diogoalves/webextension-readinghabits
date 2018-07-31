const QUEUE_FOLDER_NAME = 'READ IT LATER';
const ARCHIVE_FOLDER_NAME = 'ARCHIVED';
let QUEUE_FOLDER_ID = null;
let ARCHIVE_FOLDER_ID = null;

const click = async () => {
  const activeTab = await getActiveTab();
  if(activeTab) {
    const foundBookmark = await findInQueue(activeTab.url);
    const foundArchive = await findInArchive(activeTab.url);

    if(foundBookmark && !foundArchive) await browser.bookmarks.move(foundBookmark.id, {parentId: ARCHIVE_FOLDER_ID});
    else if(foundBookmark && foundArchive) await browser.bookmarks.remove(foundBookmark.id);
    else if(!foundBookmark && foundArchive) await browser.bookmarks.move(foundArchive.id, {parentId: QUEUE_FOLDER_ID});
    else if(!foundBookmark && !foundArchive) await browser.bookmarks.create({parentId: QUEUE_FOLDER_ID, title: activeTab.title, url: activeTab.url});

    updateStatistics();
  }
}

const update = async () => {
  const activeTab = await getActiveTab();
  if(activeTab) {
    foundBookmark = await findInQueue(activeTab.url);
    updateIcon(foundBookmark, activeTab);
  }
}

const init = () => {
  browser.browserAction.onClicked.addListener(click);

  // listen for tab and bookmarks changes
  browser.bookmarks.onCreated.addListener(update);
  browser.bookmarks.onRemoved.addListener(update);
  browser.bookmarks.onMoved.addListener(update);
  browser.tabs.onUpdated.addListener(update);
  browser.tabs.onActivated.addListener(update);
  browser.windows.onFocusChanged.addListener(update);
 
  update();
}


init();

