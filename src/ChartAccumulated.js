import React, { Component } from 'react';
import { ComposedChart, Area, Bar, CartesianGrid, Tooltip } from 'recharts';
import { convertDate } from './util';

class ChartAccumulated extends Component {
  process = items => {
    const { queued, archived } = items;
    const step1 = queued.reduce((acc, cur) => {
      const key = convertDate(new Date(cur.dateAdded));
      acc[key] = {
        date: key,
        queued: acc[key] && acc[key].queued ? acc[key].queued + 1 : 1,
        accumulated:
          acc[key] && acc[key].accumulated ? acc[key].accumulated + 1 : 1,
        archived: 0,
      };
      return acc;
    }, {});
    const step2 = archived.reduce((acc, cur) => {
      const key = convertDate(new Date(cur.dateAdded));
      const archivedTimeStamp = cur.title
        .substr(cur.title.length - 15)
        .replace('[', '')
        .replace(']', '');
      const keyArchived = convertDate(
        new Date(parseInt(archivedTimeStamp, 10))
      );
      acc[key] = {
        date: key,
        queued: acc[key] && acc[key].queued ? acc[key].queued + 1 : 1,
        accumulated:
          acc[key] && acc[key].accumulated ? acc[key].accumulated : 0,
        archived: acc[key] && acc[key].archived ? acc[key].archived : 0,
      };
      acc[keyArchived] = {
        date: keyArchived,
        queued:
          acc[keyArchived] && acc[keyArchived].queued
            ? acc[keyArchived].queued
            : 0,
        accumulated:
          acc[keyArchived] && acc[keyArchived].accumulated
            ? acc[keyArchived].accumulated
            : 0,
        archived:
          acc[keyArchived] && acc[keyArchived].archived
            ? acc[keyArchived].archived + 1
            : 1,
      };
      return acc;
    }, step1);
    const step3 = Object.values(step2);
    const step4 = step3.sort((a, b) => {
      if (a.date > b.date) return 1;
      if (a.date < b.date) return -1;
      return 0;
    });
    const step5 = step4.reduce((acc, cur, index) => {
      if (acc[index - 1]) {
        return acc.concat({
          ...cur,
          accumulated: cur.accumulated + acc[index - 1].accumulated,
        });
      } else {
        return acc.concat(cur);
      }
    }, []);
    return step5;
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
        <Area
          type="monotone"
          dataKey="accumulated"
          fill="#c7b9e2"
          stroke="#c7b9e2"
        />
        <Bar dataKey="queued" barSize={4} fill="rgb(73, 127, 243)" />
        <Bar dataKey="archived" barSize={4} fill="rgb(243, 79, 73)" />
      </ComposedChart>
    );
  }
}

export default ChartAccumulated;
