import React, { Component } from 'react';

class Buttons extends Component {
  
  render() {
    if(!this.props.isUrlValid) return null;
    const { toggle, isQueued, isArchived } = this.props;
    
    return (
      <div>
        { (!isQueued && !isArchived) && (
          <button onClick={toggle} className="buttonSeeItLater">See it later</button>
        )}
        { (isQueued) && (
          <button onClick={toggle} className="buttonAlreadySaw">Already saw</button>
        )}
        { (isArchived) && (
          <button onClick={toggle} className="buttonUndo">Undo</button>
        )}
      </div>
    )
  }
}

export default Buttons;