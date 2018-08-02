import React, { Component } from 'react';

class Button extends Component {
  
  render() {
    if(!this.props.show) return null;
    const { onClick, alreadyQueued } = this.props;
    let label, className;
    
    if(alreadyQueued) {
      label = 'Already read it';
      className = 'buttonAlreadyReadIt';
    } else {
      label = 'Read it later';
      className = 'buttonReadItLater';
    }

    return (
      <button onClick={onClick} className={className} >
        {label}
      </button>
    )
  }
}

export default Button;