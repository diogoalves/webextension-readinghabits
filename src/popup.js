import React from 'react';
import ReactDOM from 'react-dom';

import Nested from './nested-component';
import { getStatistics } from './statistics';
import { getActiveTab, getFolderId, updateIcon, find } from './util';
import { QUEUE_FOLDER_NAME, ARCHIVE_FOLDER_NAME } from './constants';

class Popup extends React.Component {

  state = {
    activeTab: null,
    queueFolderId: null,
    archiveFolderId: null,
    queuedToday: 1,
    archivedToday: 2,
    totalQueued: 3,
    totalArchived: 4,
    queuedPerDay: {},
    archivedPerDay: {},
    accumulatedPerDay: {}
  }

  async componentDidMount() {
    const activeTab = await getActiveTab();
    const queueFolderId = await getFolderId(QUEUE_FOLDER_NAME);
    const archiveFolderId = await getFolderId(ARCHIVE_FOLDER_NAME);
    this.setState({ 
      activeTab,
      queueFolderId,
      archiveFolderId,
      ...await getStatistics(queueFolderId, archiveFolderId)
    });
  }

  handleClick = async () => {
    const { activeTab, queueFolderId, archiveFolderId } = this.state;
    if(activeTab) {
      const foundBookmark = await find(queueFolderId, activeTab.url);
      const foundArchive = await find(archiveFolderId, activeTab.url);
  
      if(foundBookmark && !foundArchive) await browser.bookmarks.move(foundBookmark.id, {parentId: archiveFolderId});
      else if(foundBookmark && foundArchive) await browser.bookmarks.remove(foundBookmark.id);
      else if(!foundBookmark && foundArchive) await browser.bookmarks.move(foundArchive.id, {parentId: queueFolderId});
      else if(!foundBookmark && !foundArchive) await browser.bookmarks.create({parentId: queueFolderId, title: activeTab.title, url: activeTab.url});

      this.setState({ 
        ...await getStatistics(queueFolderId, archiveFolderId)
      });
    }
  }
  

  render() {
    const { activeTab, queuedToday, archivedToday, totalQueued, totalArchived } = this.state;
    return (
      <div>
        <h2>Reading habits</h2>
        <p>
          You have added {queuedToday} items today, from those {archivedToday} were archived.
        </p>
        <p>
          Total added: {totalQueued}. Total archived: {totalArchived}.
        </p>        
        <p>
          Active tab: {activeTab ? activeTab.url : '[waiting for result]'}
        </p>
        <button onClick={this.handleClick} >
          Read it later!
        </button>
        {/* <Nested /> */}

      </div>
    );
  }
}


const update = async () => {
  const activeTab = await getActiveTab();
  if(activeTab) {
    const folderId = await getFolderId(QUEUE_FOLDER_NAME);
    const foundBookmark = await find(folderId, activeTab.url);
    updateIcon(foundBookmark, activeTab);
  }
}

// listen for tab and bookmarks changes
browser.bookmarks.onCreated.addListener(update);
browser.bookmarks.onRemoved.addListener(update);
browser.bookmarks.onMoved.addListener(update);
browser.tabs.onUpdated.addListener(update);
browser.tabs.onActivated.addListener(update);
browser.windows.onFocusChanged.addListener(update);
update();

ReactDOM.render(<Popup/>, document.getElementById('app'));
