import browser from 'webextension-polyfill';
import { QUEUE_FOLDER_NAME, ARCHIVE_FOLDER_NAME } from './constants';
import { isSupportedProtocol, getItems, find} from './util';

const update = async () => {
  const [ activeTab ] = await browser.tabs.query({active: true, currentWindow: true});
  if (activeTab && isSupportedProtocol(activeTab.url)) {
    const [ { id: queueFolderId } ]= await browser.bookmarks.search({title: QUEUE_FOLDER_NAME});
    const [ { id : archiveFolderId } ] = await browser.bookmarks.search({title: ARCHIVE_FOLDER_NAME});
    if(queueFolderId && archiveFolderId) {
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

      const { length : queuedItemsQuantity } = await getItems(queueFolderId);
      if(queuedItemsQuantity > 0) {
        browser.browserAction.setBadgeText({text: `${queuedItemsQuantity}` })
      } else {
        browser.browserAction.setBadgeText({text: '' })

      }
    }

  }
}

browser.bookmarks.onCreated.addListener(update);
browser.bookmarks.onMoved.addListener(update);
browser.bookmarks.onRemoved.addListener(update);
browser.tabs.onUpdated.addListener(update);
browser.tabs.onActivated.addListener(update);
browser.windows.onFocusChanged.addListener(update);

update();
