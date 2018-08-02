import React from 'react';
import ReactDOM from 'react-dom';

import { getStatistics } from './statistics';
import { getActiveTab, getFolderId, find } from './util';
import { QUEUE_FOLDER_NAME, ARCHIVE_FOLDER_NAME } from './constants';
import Button from './Button';
import Chart from './Chart';

//TODO try to run in chrome
class Popup extends React.Component {

  state = {
    activeTab: null,
    queueFolderId: null,
    archiveFolderId: null,
    foundBookmark: null,
    foundArchive: null,
    queuedToday: 1,
    archivedToday: 2,
    totalQueued: 3,
    totalArchived: 4,
    data: null
  }

  async componentDidMount() {
    const activeTab = await getActiveTab();
    const queueFolderId = await getFolderId(QUEUE_FOLDER_NAME);
    const archiveFolderId = await getFolderId(ARCHIVE_FOLDER_NAME);
    const foundBookmark = await find(queueFolderId, activeTab.url);
    const foundArchive = await find(archiveFolderId, activeTab.url);
    this.setState({ 
      activeTab,
      queueFolderId,
      archiveFolderId,
      foundBookmark,
      foundArchive,
      ...await getStatistics(queueFolderId, archiveFolderId)
    });
  }

  handleClick = async () => {
    const { activeTab, queueFolderId, archiveFolderId } = this.state;
    if(activeTab) {
      let foundBookmark = await find(queueFolderId, activeTab.url);
      let foundArchive = await find(archiveFolderId, activeTab.url);
  
      if(foundBookmark && !foundArchive) await browser.bookmarks.move(foundBookmark.id, {parentId: archiveFolderId});
      else if(foundBookmark && foundArchive) await browser.bookmarks.remove(foundBookmark.id);
      else if(!foundBookmark && foundArchive) await browser.bookmarks.move(foundArchive.id, {parentId: queueFolderId});
      else if(!foundBookmark && !foundArchive) await browser.bookmarks.create({parentId: queueFolderId, title: activeTab.title, url: activeTab.url});

      foundBookmark = await find(queueFolderId, activeTab.url);
      foundArchive = await find(archiveFolderId, activeTab.url);

      const stat = await getStatistics(queueFolderId, archiveFolderId);
      this.setState((state) => ({ 
        ...state,
        foundBookmark,
        foundArchive,
        ...stat
      }));
    }
  }
  
  render() {
    const { activeTab, foundBookmark, queuedToday, archivedToday, totalQueued, totalArchived, data } = this.state;
    const showAddButton = activeTab !== null;

    return (
      <div align="center">
        <Button show={showAddButton} onClick={this.handleClick} alreadyQueued={foundBookmark} />
        <Chart data={data} />
        <small>
          Added {queuedToday} and archived {archivedToday} items today. Total added: {totalQueued}. Total archived: {totalArchived}.
        </small>
      </div>
    );
  }
} 

ReactDOM.render(<Popup/>, document.getElementById('app'));
