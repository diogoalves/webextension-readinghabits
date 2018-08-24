import React, { Component } from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import TimelineIcon from '@material-ui/icons/Timeline';
import TodayIcon from '@material-ui/icons/Today';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import ChartAccumulated from './ChartAccumulated';
import ChartByDay from './ChartByDay';
import ChartByHour from './ChartByHour';

class Stats extends Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    if (!this.props.items) return null;
    const { value } = this.state;
    const { items } = this.props;
    const today = new Date().toLocaleDateString();
    const totalQueued = items.queued.length + items.archived.length;
    const totalArchived = items.archived.length;
    const queuedToday = items.queued
      .concat(items.archived)
      .filter(e => new Date(e.dateAdded).toLocaleDateString() === today).length;
    const archivedToday = items.archived.filter(
      e => new Date(e.dateAdded).toLocaleDateString() === today
    ).length;
    const avgTimeToArchive = getAvgTimeToArchive(items.archived);

    return (
      <div align="center">
        {value === 0 && <ChartAccumulated items={items} />}
        {value === 1 && <ChartByDay items={items} />}
        {value === 2 && <ChartByHour items={items} />}
        <small>
          Today you have added {queuedToday} and archived {archivedToday} items.
          Total added: {totalQueued}. Total archived: {totalArchived}.
        </small>
        {!isNaN(avgTimeToArchive) && (
          <small> Average time to archive: {avgTimeToArchive} hours.</small>
        )}

        <BottomNavigation value={value} onChange={this.handleChange} showLabels>
          <BottomNavigationAction label="trends" icon={<TimelineIcon />} />
          <BottomNavigationAction label="by day" icon={<TodayIcon />} />
          <BottomNavigationAction label="by time" icon={<AccessTimeIcon />} />
        </BottomNavigation>
      </div>
    );
  }
}

const getAvgTimeToArchive = archived => {
  const qty = archived.length;
  const avg = archived.reduce((acc, cur) => {
    const createdAt = parseInt(cur.dateAdded, 10);
    const archivedAt = parseInt(
      cur.title
        .substr(cur.title.length - 15)
        .replace('[', '')
        .replace(']', ''),
      10
    );
    return acc + (archivedAt - createdAt);
  }, 0);
  return Math.floor(avg / qty / 1000 / 60 / 60);
};

export default Stats;
