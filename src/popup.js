import React from 'react';
import ReactDOM from 'react-dom';

import { getStatistics } from './statistics';
import { getActiveTab, getFolderId, find } from './util';
import { QUEUE_FOLDER_NAME, ARCHIVE_FOLDER_NAME } from './constants';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';



class Popup extends React.Component {

  state = {
    activeTab: null,
    queueFolderId: null,
    archiveFolderId: null,
    foundBookmark: null,
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
    this.setState({ 
      activeTab,
      queueFolderId,
      archiveFolderId,
      foundBookmark,
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

      const stat = await getStatistics(queueFolderId, archiveFolderId);
      this.setState(() => ({ 
        foundBookmark,
        ...stat
      }));
    }
  }
  
  render() {
    const { activeTab, foundBookmark, queuedToday, archivedToday, totalQueued, totalArchived, data } = this.state;
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
          { foundBookmark ? 'Already read' : 'Read it later' }
        </button>
        <ComposedChart width={350} height={200} data={data}
            margin={{top: 20, right: 5, bottom: 20, left: 5}}>
          <CartesianGrid stroke='#f5f5f5'/>
          <XAxis dataKey="date"/>
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type='monotone' dataKey='accumulated' fill='#8884d8' stroke='#8884d8'/>
          <Bar dataKey='queued' barSize={4} fill='#413ea0' />
          <Bar dataKey='archived' barSize={4} fill='#410000' />
        </ComposedChart>
      </div>
    );
  }
} 

ReactDOM.render(<Popup/>, document.getElementById('app'));
