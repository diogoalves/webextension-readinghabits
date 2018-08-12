import React from 'react';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';

import { getStatistics } from './statistics';
import Chart from './Chart';
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
    data: null,
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
    const { valid, isQueued, isArchived, queuedToday, nextUrl, archivedToday, totalQueued, totalArchived, data } = this.state;
    return (
      <div>
        <Buttons toggle={this.handleToggle} valid={valid} isQueued={isQueued} isArchived={isArchived}/>
        <Chart data={data} />
        <small> 
          Today you have added {queuedToday} and archived {archivedToday} items. Total added: {totalQueued}. Total archived: {totalArchived}.
        </small>        
        { nextUrl && (
          <button onClick={this.handleNext} className="buttonNext">Open next</button>
        )}
      </div>
    );

  }
} 

ReactDOM.render(<App/>, document.getElementById('app'));
