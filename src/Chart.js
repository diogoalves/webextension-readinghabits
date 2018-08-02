import React, { Component } from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class Chart extends Component {

  render() {
    const { data } = this.props;

    return (
      <ComposedChart width={350} height={200} data={data} margin={{top: 20, right: 5, bottom: 20, left: 5}}>
        <CartesianGrid stroke='#f5f5f5'/>
        <Tooltip />
        <Area type='monotone' dataKey='accumulated' fill='#8884d8' stroke='#8884d8'/>
        <Bar dataKey='queued' barSize={4} fill='#497ff3' />
        <Bar dataKey='archived' barSize={4} fill='#4CAF50' />
      </ComposedChart>
    );
  }
}

export default Chart;