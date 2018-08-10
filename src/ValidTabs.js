import React, { Component} from 'react';

class ValidTabs extends Component {

  render = async () => {
    const { validTabs = [] } = this.props;
    // let decoratedTabs = validTabs;
    // if(validTabs) {
    //   decoratedTabs = validTabs.map( t => {
    //     console.log( find(t.url))
    //     return ({
    //       ...t,
    //       ...find(t.url)
    //     })
    //   })
    // }
   

    return (
      <div>
        { validTabs && validTabs.map( e =>
          <button className="buttonSeeItLater">See later: {e.url}</button>
        )}
      </div>
    )
  }
}

export default ValidTabs;