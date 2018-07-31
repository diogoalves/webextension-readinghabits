import React from 'react';
import ReactDOM from 'react-dom';

import Nested from './nested-component';
import { getStatistics } from './statistics';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {activeTab: null};
  }

  componentDidMount() {
    // Get the active tab and store it in component state.
    browser.tabs.query({active: true}).then(tabs => {
      this.setState({activeTab: tabs[0]});
    });
  }

  handleClick = async event => {
    console.log("1313123122")
    const stat = await getStatistics();
    console.log(stat)
  }

  render() {
    const {activeTab} = this.state;
    return (
      <div>
        <h1>React Component23</h1>
        <p>
          This is an example of a popup UI in React.
        </p>
        <p>
          Active tab: {activeTab ? activeTab.url : '[waiting for result]'}
        </p>
        <Nested />
        <button onClick={this.handleClick} >
          Lasers3
        </button>
      </div>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('app'));
