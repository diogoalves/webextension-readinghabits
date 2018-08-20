import React, { Component } from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import TimelineIcon from '@material-ui/icons/Timeline';
import TodayIcon from '@material-ui/icons/Today';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import Chart from './Chart';
import ChartByDay from './ChartByDay';
import ChartByHour from './ChartByHour';
import { getStatistics } from './statistics';

class Stats extends Component {

  state = {
    value: 0,
    queuedToday: 0,
    archivedToday: 0,
    totalQueued: 0,
    totalArchived: 0,
    avgTimeToArchive: 0/0,
    data: null,
    dataByDay: null,
    dataByHour: null
  }

  componentDidMount = async () => {
    this.setState({ 
      ...await getStatistics(),
    });
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };


  render() {
    const { value, queuedToday, archivedToday, totalQueued, totalArchived, avgTimeToArchive, data, dataByDay, dataByHour } = this.state;

    return (
      <div align="center">
        {value === 0 && <Chart data={data} />}
        {value === 1 && <ChartByDay data={dataByDay} />}
        {value === 2 && <ChartByHour data={dataByHour} />}
        <small> 
          Today you have added {queuedToday} and archived {archivedToday} items. Total added: {totalQueued}. Total archived: {totalArchived}.
          
        </small> 
        { !isNaN(avgTimeToArchive) && (
          <small>
            {' '}Average time to archive: {avgTimeToArchive} hours.
          </small>
        )}

        <BottomNavigation
          value={value}
          onChange={this.handleChange}
          showLabels
        >
          <BottomNavigationAction label="trends" icon={<TimelineIcon />} />
          <BottomNavigationAction label="by day" icon={<TodayIcon />} />
          <BottomNavigationAction label="by time" icon={<AccessTimeIcon />} />
        </BottomNavigation>
      </div>
    );
  }
}

export default Stats;