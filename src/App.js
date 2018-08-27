import React from 'react';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';
import Buttons from './Buttons';
import { getUrlStatus, getAll } from './util';
import { toggle } from './background';
import Stats from './Stats';

//TODO see it later, close tab after adding it
//TODO next should push the first item in queue to last position
class App extends React.Component {
  state = {
    activeTab: null,
    valid: null,
    isQueued: false,
    isArchived: false,
    nextUrl: null,
    items: null,
  };

  componentDidMount = async () => {
    this.setState({
      ...(await getUrlStatus()),
      items: await getAll(),
    });
  };

  handleToggle = async () => {
    if (this.state.valid) {
      await toggle(this.state.activeTab);
      this.setState({
        ...(await getUrlStatus()),
        items: await getAll(),
      });
    }
  };

  handleNext = () => {
    const { nextUrl: url } = this.state;
    browser.tabs.update(null, { url });
    window.close();
  };

  render() {
    const { valid, isQueued, isArchived, nextUrl, items } = this.state;
    return (
      <div>
        <Buttons
          toggle={this.handleToggle}
          valid={valid}
          isQueued={isQueued}
          isArchived={isArchived}
        />
        {nextUrl && (
          <button onClick={this.handleNext} className="buttonNext">
            Open next
          </button>
        )}
        <Stats items={items} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
