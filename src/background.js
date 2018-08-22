import browser from 'webextension-polyfill';
import { QUEUE_FOLDER_NAME, ARCHIVE_FOLDER_NAME } from './constants';
import { isSupportedProtocol, getItems, find, getIcon, fixArchivedWithoutTime } from './util';

const update = async () => {
  const [ activeTab ] = await browser.tabs.query({active: true, currentWindow: true});
  const [ { id: queueFolderId } ]= await browser.bookmarks.search({title: QUEUE_FOLDER_NAME});
  const [ { id : archiveFolderId } ] = await browser.bookmarks.search({title: ARCHIVE_FOLDER_NAME});
  const { length : queuedItemsQuantity } = await getItems(queueFolderId);
  if(queuedItemsQuantity > 0) {
    browser.browserAction.setBadgeText({text: `${queuedItemsQuantity}` })
  } else {
    browser.browserAction.setBadgeText({text: '' })
  }
  fixArchivedWithoutTime(archiveFolderId);

  if (activeTab && isSupportedProtocol(activeTab.url)) {
    if(queueFolderId && archiveFolderId) {
      const foundBookmark = await find(queueFolderId, activeTab.url);
      const foundArchived = await find(archiveFolderId, activeTab.url);
      const icon = getIcon(foundBookmark, foundArchived, activeTab.id);
      browser.browserAction.setIcon(icon);
    } 
  } 
}

export const toggle = async (tab) => {
  const [ { id: queueFolderId } ]= await browser.bookmarks.search({title: QUEUE_FOLDER_NAME});
  const [ { id : archiveFolderId } ] = await browser.bookmarks.search({title: ARCHIVE_FOLDER_NAME});
  if(queueFolderId && archiveFolderId) {
    const foundBookmark = await find(queueFolderId, tab.url);
    const foundArchive = await find(archiveFolderId, tab.url);

    if(foundBookmark && !foundArchive) { 
      await browser.bookmarks.move(foundBookmark.id, {parentId: archiveFolderId});   
    }
    else if(foundBookmark && foundArchive) await browser.bookmarks.remove(foundBookmark.id);
    else if(!foundBookmark && foundArchive) {
      const cleanedTitle = foundArchive.title.substring(0, foundArchive.title.length - 15);
      await browser.bookmarks.update(foundArchive.id, {title: cleanedTitle});  
      await browser.bookmarks.move(foundArchive.id, {parentId: queueFolderId}); 
    }
    else if(!foundBookmark && !foundArchive) await browser.bookmarks.create({parentId: queueFolderId, title: tab.title, url: tab.url});
    
  }
}

browser.bookmarks.onCreated.addListener(update);
browser.bookmarks.onMoved.addListener(update);
browser.bookmarks.onRemoved.addListener(update);
browser.tabs.onUpdated.addListener(update);
browser.tabs.onActivated.addListener(update);
browser.windows.onFocusChanged.addListener(update);

update();
