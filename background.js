const QUEUE_FOLDER_NAME = 'READ IT LATER';
const ARCHIVE_FOLDER_NAME = 'ARCHIVED';
let QUEUE_FOLDER_ID = null;
let ARCHIVE_FOLDER_ID = null;

const click = async () => {
  const activeTab = await getActiveTab();
  if(activeTab) {
    foundBookmark = findInQueue(activeTab.url);
    if (foundBookmark) {
      browser.bookmarks.move(foundBookmark.id, {parentId: ARCHIVE_FOLDER_ID});
    } else {
      browser.bookmarks.create({parentId: QUEUE_FOLDER_ID, title: activeTab.title, url: activeTab.url});
    }
  }
}

const update = async () => {
  const activeTab = await getActiveTab();
  if(activeTab) {
    foundBookmark = findInQueue(activeTab.url);
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

  initQueueFolder();
  initArchieveFolder(); 
  update();
}


init();

