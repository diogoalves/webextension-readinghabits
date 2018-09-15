import React, { Component } from 'react';
import { getArchivedTimestamp } from './util';
import {
  ComposedChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

class ChartByHour extends Component {
  process = items => {
    const { queued, archived } = items;
    const getKey = timestamp => {
      const hours = new Date(timestamp).getHours();
      if (hours >= 0 && hours <= 6) return 0;
      if (hours >= 7 && hours <= 12) return 1;
      if (hours >= 13 && hours <= 18) return 2;
      if (hours >= 19 && hours <= 23) return 3;
      return 4;
    };

    const step0 = [
      { label: '[0,6]', queued: 0, archived: 0 },
      { label: '[7,12]', queued: 0, archived: 0 },
      { label: '[13,18]', queued: 0, archived: 0 },
      { label: '[19,23]', queued: 0, archived: 0 },
    ];
    const step1 = [...queued, ...archived].reduce((acc, cur) => {
      const key = getKey(cur.dateAdded);
      acc[key] = {
        ...acc[key],
        queued: acc[key].queued + 1,
      };
      return acc;
    }, step0);
    const step2 = archived.reduce((acc, cur) => {
      const archivedTimestamp = getArchivedTimestamp(cur.title);
      const key = getKey(archivedTimestamp);
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

export default ChartByHour;
