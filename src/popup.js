import React from 'react';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';

import { getStatistics } from './statistics';
import { getActiveTab, getValidTabs, getFolderId, find, next } from './util';
import { QUEUE_FOLDER_NAME, ARCHIVE_FOLDER_NAME } from './constants';
import Buttons from './Buttons';
import Chart from './Chart';
import ValidTabs from './ValidTabs';

class Popup extends React.Component {

  state = {
    activeTab: null,
    validTabs: null,
    queueFolderId: null,
    archiveFolderId: null,
    foundBookmark: null,
    foundArchive: null,
    nextInQueue: null,
    queuedToday: 1,
    archivedToday: 2,
    totalQueued: 3,
    totalArchived: 4,
    data: null
  }

  async componentDidMount() {
    const activeTab = await getActiveTab();
    const validTabs = await getValidTabs();
    const { url = '' } = activeTab || {};
    const queueFolderId = await getFolderId(QUEUE_FOLDER_NAME);
    const archiveFolderId = await getFolderId(ARCHIVE_FOLDER_NAME);
    const foundBookmark = await find(queueFolderId, url);
    const foundArchive = await find(archiveFolderId, url);
    const nextInQueue = await next(queueFolderId, url);
    this.setState({ 
      activeTab,
      queueFolderId,
      archiveFolderId,
      foundBookmark,
      foundArchive,
      nextInQueue,
      validTabs,
      ...await getStatistics(queueFolderId, archiveFolderId)
    });
  }

  // find = async url => {
  //   const { queueFolderId, archiveFolderId } = this.state;
  //   const foundBookmark = await find(queueFolderId, activeTab.url);
  //   const foundArchive = await find(archiveFolderId, activeTab.url);
  //   return { foundBookmark, foundArchive };
  // }


  handleClick = async () => {
    const { activeTab, queueFolderId, archiveFolderId } = this.state;
    if(activeTab) {
      let foundBookmark = await find(queueFolderId, activeTab.url);
      let foundArchive = await find(archiveFolderId, activeTab.url);
  
      if(foundBookmark && !foundArchive) { 
        const archivedDate = Date.now();
        await browser.bookmarks.update(foundBookmark.id, {title: `${foundBookmark.title}[${archivedDate}]`});  
        await browser.bookmarks.move(foundBookmark.id, {parentId: archiveFolderId});   
      }
      else if(foundBookmark && foundArchive) await browser.bookmarks.remove(foundBookmark.id);
      else if(!foundBookmark && foundArchive) {
        const cleanedTitle = foundArchive.title.substring(0, foundArchive.title.length - 15);
        await browser.bookmarks.update(foundArchive.id, {title: cleanedTitle});  
        await browser.bookmarks.move(foundArchive.id, {parentId: queueFolderId}); 
      }
      else if(!foundBookmark && !foundArchive) await browser.bookmarks.create({parentId: queueFolderId, title: activeTab.title, url: activeTab.url});
      
      foundBookmark = await find(queueFolderId, activeTab.url);
      foundArchive = await find(archiveFolderId, activeTab.url);
      const nextInQueue = await next(queueFolderId, activeTab.url);

      const stat = await getStatistics(queueFolderId, archiveFolderId);
      this.setState((state) => ({ 
        ...state,
        foundBookmark,
        foundArchive,
        nextInQueue,
        ...stat
      }));
    }
  }

  handleNext = async () => {
    const { nextInQueue } = this.state;
    if(nextInQueue) {
      browser.tabs.update(
        null,
        {
          url: nextInQueue.url
        }
      )
      window.close()
    }
  }
  
  render() {
    const { activeTab, foundBookmark, foundArchive, queuedToday, archivedToday, totalQueued, totalArchived, nextInQueue, data, validTabs } = this.state;
    const isUrlValid = (activeTab !== null);

    return (
      <div align="center">
        <Buttons  toggle={this.handleClick} isUrlValid={isUrlValid} isQueued={foundBookmark} isArchived={foundArchive}/>
        <Chart data={data} />
        <small>
          Today you have added {queuedToday} and archived {archivedToday} items. Total added: {totalQueued}. Total archived: {totalArchived}.
        </small>        
        { nextInQueue && (
          <button onClick={this.handleNext} className="buttonNext">Open next</button>
        )}      
        {/* <ValidTabs validTabs={validTabs} /> */}
      </div>
    );
  }
} 

ReactDOM.render(<Popup/>, document.getElementById('app'));
