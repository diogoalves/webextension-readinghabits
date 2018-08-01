import React from 'react';
import ReactDOM from 'react-dom';

import { getStatistics } from './statistics';
import { getActiveTab, getFolderId, find } from './util';
import { QUEUE_FOLDER_NAME, ARCHIVE_FOLDER_NAME } from './constants';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [ { date: '2018-07-01', queued: 5, accumulated: 3, archived: 2 },
{ date: '2018-07-02', queued: 5, accumulated: 4, archived: 1 },
{ date: '2018-07-03', queued: 8, accumulated: 4, archived: 4 },
{ date: '2018-07-04', queued: 13, accumulated: 3, archived: 10 },
{ date: '2018-07-05', queued: 6, accumulated: 4, archived: 2 },
{ date: '2018-07-06', queued: 6, accumulated: 0, archived: 6 },
{ date: '2018-07-07', queued: 4, accumulated: 4, archived: 0 },
{ date: '2018-07-08', queued: 6, accumulated: 2, archived: 4 },
{ date: '2018-07-09', queued: 6, accumulated: 4, archived: 2 },
{ date: '2018-07-10', queued: 2, accumulated: 1, archived: 1 },
{ date: '2018-07-11', queued: 11, accumulated: 4, archived: 7 },
{ date: '2018-07-12', queued: 6, accumulated: 5, archived: 1 },
{ date: '2018-07-13', queued: 6, accumulated: 4, archived: 2 },
{ date: '2018-07-14', queued: 7, accumulated: 4, archived: 3 },
{ date: '2018-07-15', queued: 5, accumulated: 2, archived: 3 },
{ date: '2018-07-16', queued: 4, accumulated: 3, archived: 1 },
{ date: '2018-07-17', queued: 7, accumulated: 2, archived: 5 },
{ date: '2018-07-18', queued: 6, accumulated: 4, archived: 2 },
{ date: '2018-07-19', queued: 9, accumulated: 3, archived: 6 },
{ date: '2018-07-20', queued: 6, accumulated: 5, archived: 1 },
{ date: '2018-07-21', queued: 2, accumulated: 2, archived: 0 },
{ date: '2018-07-22', queued: 8, accumulated: 5, archived: 3 },
{ date: '2018-07-23', queued: 5, accumulated: 2, archived: 3 },
{ date: '2018-07-24', queued: 9, accumulated: 2, archived: 7 },
{ date: '2018-07-25', queued: 4, accumulated: 3, archived: 1 },
{ date: '2018-07-26', queued: 8, accumulated: 4, archived: 4 },
{ date: '2018-07-27', queued: 5, accumulated: 2, archived: 3 },
{ date: '2018-07-28', queued: 6, accumulated: 4, archived: 2 },
{ date: '2018-07-29', queued: 8, accumulated: 3, archived: 5 },
{ date: '2018-07-30', queued: 8, accumulated: 4, archived: 4 },
{ date: '2018-07-31', queued: 3, accumulated: 1, archived: 2 },
{ date: '2018-08-01', queued: 6, accumulated: 3, archived: 3 } ]

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
    queuedPerDay: {},
    archivedPerDay: {},
    accumulatedPerDay: {}
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
    const { activeTab, foundBookmark, queuedToday, archivedToday, totalQueued, totalArchived } = this.state;
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
