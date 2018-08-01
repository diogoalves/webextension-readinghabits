import React from 'react';
import ReactDOM from 'react-dom';

import Nested from './nested-component';
import { getStatistics } from './statistics';
import { getActiveTab, getFolderId, updateIcon, find } from './util';
import { QUEUE_FOLDER_NAME, ARCHIVE_FOLDER_NAME } from './constants';
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [{name: 'Page A', uv: 590, pv: 800, amt: 1400},
              {name: 'Page B', uv: 868, pv: 967, amt: 1506},
              {name: 'Page C', uv: 1397, pv: 1098, amt: 989},
              {name: 'Page D', uv: 1480, pv: 1200, amt: 1228},
              {name: 'Page E', uv: 1520, pv: 1108, amt: 1100},
              {name: 'Page F', uv: 1400, pv: 680, amt: 1700}];

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
    console.log("aqui " + foundBookmark !== null)
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
  
  update = async () => {
    const { activeTab, foundBookmark } = this.state;
    console.log("entrou antes; + " + foundBookmark)

    browser.browserAction.setIcon({
      path: foundBookmark ? {
        19: "icons/star-filled-19.png",
        38: "icons/star-filled-38.png"
      } : {
        19: "icons/star-empty-19.png",
        38: "icons/star-empty-38.png"
      },
      tabId: activeTab.id
    });    
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
        {/* <Nested /> */}
        <ComposedChart width={300} height={200} data={data}
            margin={{top: 20, right: 20, bottom: 20, left: 20}}>
          <CartesianGrid stroke='#f5f5f5'/>
          <XAxis dataKey="name"/>
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type='monotone' dataKey='amt' fill='#8884d8' stroke='#8884d8'/>
          <Bar dataKey='pv' barSize={20} fill='#413ea0' />
          <Bar dataKey='pv' barSize={20} fill='#410000' />
          <Line type='monotone' dataKey='uv' stroke='#ff7300' />
        </ComposedChart>
      </div>
    );
  }
} 

ReactDOM.render(<Popup/>, document.getElementById('app'));
