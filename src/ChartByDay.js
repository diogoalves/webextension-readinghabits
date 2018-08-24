import React, { Component } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

class ChartByDay extends Component {
  process = items => {
    const { queued, archived } = items;
    const step0 = [
      { label: 'sun', queued: 0, archived: 0 },
      { label: 'mon', queued: 0, archived: 0 },
      { label: 'tue', queued: 0, archived: 0 },
      { label: 'wed', queued: 0, archived: 0 },
      { label: 'thu', queued: 0, archived: 0 },
      { label: 'fri', queued: 0, archived: 0 },
      { label: 'sat', queued: 0, archived: 0 },
    ];
    const step1 = [...queued, ...archived].reduce((acc, cur) => {
      const key = new Date(cur.dateAdded).getDay();
      acc[key] = {
        ...acc[key],
        queued: acc[key].queued + 1,
      };
      return acc;
    }, step0);
    const step2 = archived.reduce((acc, cur) => {
      const archivedTimeStamp = cur.title
        .substr(cur.title.length - 15)
        .replace('[', '')
        .replace(']', '');
      const key = new Date(parseInt(archivedTimeStamp, 10)).getDay();
      acc[key] = {
        ...acc[key],
        archived: acc[key].archived + 1,
      };
      return acc;
    }, step1);
    return step2;
  };
  render() {
    if (!this.props.items) return null;
    const data = this.process(this.props.items);

    return (
      <ComposedChart
        width={350}
        height={200}
        data={data}
        margin={{ top: 20, right: 5, bottom: 20, left: 5 }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <Tooltip />
        <Bar dataKey="queued" barSize={4} fill="rgb(73, 127, 243)" />
        <Bar dataKey="archived" barSize={4} fill="rgb(243, 79, 73)" />
        <XAxis dataKey="label" />
      </ComposedChart>
    );
  }
}

export default ChartByDay;
