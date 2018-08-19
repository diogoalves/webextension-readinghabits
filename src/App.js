import React from 'react';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';

import { getStatistics } from './statistics';
import Chart from './Chart';
import ChartByDay from './ChartByDay';
import Buttons from './Buttons';
import { getUrlStatus } from './util';
import { toggle } from './background';

class App extends React.Component {

  state = {
    activeTab: null,
    valid: null,
    isQueued: false, 
    isArchived: false,
    nextUrl: null,
    queuedToday: 0,
    archivedToday: 0,
    totalQueued: 0,
    totalArchived: 0,
    avgTimeToArchive: 0/0,
    data: null,
    dataByDay: null
  }

   componentDidMount = async () => {
    this.setState({ 
       ...await getUrlStatus(),
      ...await getStatistics(),
    });
  }

  handleToggle = async () => {
    if(this.state.valid) {
      await toggle(this.state.activeTab);
      this.setState({
        ...await getUrlStatus(),
        ...await getStatistics(),
      })
    }
  }

  handleNext = () => {
    const { nextUrl: url } = this.state;
    browser.tabs.update(null, {url})
    window.close()
  }

  
  render() {
    const { valid, isQueued, isArchived, queuedToday, nextUrl, archivedToday, totalQueued, totalArchived, avgTimeToArchive, data, dataByDay } = this.state;
    console.log("dataByDay")
    console.log(dataByDay)
    return (
      <div>
        <Buttons toggle={this.handleToggle} valid={valid} isQueued={isQueued} isArchived={isArchived}/>
        <Chart data={data} />
        <ChartByDay data={dataByDay} />
        <small> 
          Today you have added {queuedToday} and archived {archivedToday} items. Total added: {totalQueued}. Total archived: {totalArchived}.
          
        </small>  
        { !isNaN(avgTimeToArchive) && (
          <small>
            {' '}Average time to archive: {avgTimeToArchive} hours.
          </small>
        )}
        { nextUrl && (
          <button onClick={this.handleNext} className="buttonNext">Open next</button>
        )}
        
      </div>
    );

  }
} 

ReactDOM.render(<App/>, document.getElementById('app'));
