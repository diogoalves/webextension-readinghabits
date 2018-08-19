import React, { Component } from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

class ChartByHour extends Component {

  render() {
    const { data } = this.props;

    return (
      <ComposedChart width={350} height={200} data={data} margin={{top: 20, right: 5, bottom: 20, left: 5}}>
        <CartesianGrid stroke='#f5f5f5'/>
        <Tooltip />
        <Bar dataKey='queued' barSize={4} fill='rgb(73, 127, 243)' />
        <Bar dataKey='archived' barSize={4} fill='rgb(243, 79, 73)' />
        <XAxis dataKey='label' />
      </ComposedChart>
    );
  }
}

export default ChartByHour;