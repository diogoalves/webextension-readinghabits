import React from 'react';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';

import { getStatistics } from './statistics';
import { next } from './util';
import Chart from './Chart';

class App extends React.Component {

  state = {
    nextInQueue: null,
    queuedToday: 0,
    archivedToday: 0,
    totalQueued: 0,
    totalArchived: 0,
    data: null,
  }

  async componentDidMount() {
    this.setState({ 
      nextInQueue: await next(),
      ...await getStatistics()
    });
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
    const { queuedToday, archivedToday, totalQueued, totalArchived, nextInQueue, data } = this.state;
    return (
      <div>
        <Chart data={data} />
        <small> 
          Today you have added {queuedToday} and archived {archivedToday} items. Total added: {totalQueued}. Total archived: {totalArchived}.
        </small>        
        { nextInQueue && (
          <button onClick={this.handleNext} className="buttonNext">Open next</button>
        )}      
      </div>
    );
  }
} 

ReactDOM.render(<App/>, document.getElementById('app'));
