import React from 'react';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';
import Buttons from './Buttons';
import { getUrlStatus } from './util';
import { toggle } from './background';
import Stats from './Stats';

class App extends React.Component {

  state = {
    activeTab: null,
    valid: null,
    isQueued: false, 
    isArchived: false,
    nextUrl: null,
  }

   componentDidMount = async () => {
    this.setState({ 
       ...await getUrlStatus()
    });
  }

  handleToggle = async () => {
    if(this.state.valid) {
      await toggle(this.state.activeTab);
      this.setState({
        ...await getUrlStatus()
      })
    }
  }

  handleNext = () => {
    const { nextUrl: url } = this.state;
    browser.tabs.update(null, {url})
    window.close()
  }

  
  render() {
    const { valid, isQueued, isArchived, nextUrl } = this.state;

    return (
      <div>
        <Buttons toggle={this.handleToggle} valid={valid} isQueued={isQueued} isArchived={isArchived}/>
        { nextUrl && (
          <button onClick={this.handleNext} className="buttonNext">Open next</button>
        )}
        <Stats />
      </div>
    );

  }
} 

ReactDOM.render(<App/>, document.getElementById('app'));
