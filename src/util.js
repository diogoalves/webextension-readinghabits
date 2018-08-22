import browser from 'webextension-polyfill';
import { QUEUE_FOLDER_NAME, ARCHIVE_FOLDER_NAME } from './constants';

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

export const getValidTabs = async () => {
  const tabs = await browser.tabs.query({});
  return tabs.filter( e => isSupportedProtocol(e.url));
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

export const getFoldersIds = async () => {
  const queueFolderId = await getFolderId(QUEUE_FOLDER_NAME);
  const archiveFolderId = await getFolderId(ARCHIVE_FOLDER_NAME);
  return { queueFolderId, archiveFolderId };
};

export const getItems = async folderId => {
  const  [ result ] = await browser.bookmarks.getSubTree(folderId);
  return result.children;
}

export const find = async (folderId, url) => {
  const items = await getItems(folderId);
  return items.find( e => e.url === url);
}

export const getUrlStatus = async () => {
  const activeTab = await getActiveTab();
  const { queueFolderId, archiveFolderId } = await getFoldersIds();
  if(activeTab) {
    const isQueued = await find(queueFolderId, activeTab.url);
    const isArchived = await find(archiveFolderId, activeTab.url);
    const queue = await getItems(queueFolderId);
    const nextInQueue = queue.find( e => e.url !== activeTab.url );
    return ({
      valid: activeTab !== null,
      activeTab,
      isQueued,
      isArchived,
      nextUrl: nextInQueue ? nextInQueue.url : null
    });
  } else {
    const queue = await getItems(queueFolderId);
    return ({
      valid: false,
      activeTab: null,
      isQueued: false,
      isArchived: false,
      nextUrl: queue[0] ? queue[0].url : null
    });
  }
}

export const convertDate = date => {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd  = date.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}

export const getIcon = (foundBookmark, foundArchived, tabId) => {
  let prefix = 'empty';
  if(foundBookmark) prefix = 'queued';
  if(foundArchived) prefix = 'archived';
  const icon = {
    path: {
      19: `icons/${prefix}-19.png`,
      38: `icons/${prefix}-38.png`
    },
    tabId
  };
  return icon;
  
}

export const fixArchivedWithoutTime = async (archivedId) => {
  const archived = await getItems(archivedId);
  archived.map( cur => {
    if(!cur.title.endsWith("]")) {
      const archivedDate = Date.now();
      browser.bookmarks.update(cur.id, {title: `${cur.title}[${archivedDate}]`});  
    }
  })
}