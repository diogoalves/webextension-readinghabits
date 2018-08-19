import { getItems, convertDate, getFoldersIds } from './util';

export const getStatistics = async () => {
  const { queueFolderId, archiveFolderId } = await getFoldersIds();
  const queued = await getItems(queueFolderId);
  const archived = await getItems(archiveFolderId);
  const today = new Date().toLocaleDateString();

  const totalQueued = queued.length + archived.length;
  const totalArchived = archived.length;
  const queuedToday = queued.concat(archived).filter( e => new Date(e.dateAdded).toLocaleDateString() ===  today ).length;
  const archivedToday = archived.filter( e => new Date(e.dateAdded).toLocaleDateString() ===  today ).length;
  const data = perDay(queued, archived);
  const avgTimeToArchive = getAvgTimeToArchive(archived);
  const dataByDay = byDay(queued, archived);

  return ({
    queuedToday,
    archivedToday,
    totalQueued,
    totalArchived,
    avgTimeToArchive,
    data,
    dataByDay
  });
}

const byDay = (queued, archived) => {
  const step0 = [ 
    {label: 'sun', queued: 0, archived: 0},
    {label: 'mon', queued: 0, archived: 0},
    {label: 'tue', queued: 0, archived: 0},
    {label: 'wed', queued: 0, archived: 0},
    {label: 'thu', queued: 0, archived: 0},
    {label: 'fri', queued: 0, archived: 0},
    {label: 'sat', queued: 0, archived: 0},
  ]
  const step1 = [...queued, ...archived].reduce( (acc, cur) => {
    const key = (new Date(cur.dateAdded)).getDay();
    acc[key] = { 
      ...acc[key],
      queued: acc[key].queued + 1
    }
    return acc;
  }, step0 );
  const step2 = archived.reduce( (acc, cur) => {
    const archivedTimeStamp = cur.title.substr(cur.title.length - 15).replace('[', '').replace(']', '');
    const key = (new Date(parseInt(archivedTimeStamp, 10))).getDay();
    acc[key] = { 
      ...acc[key],
      archived: acc[key].archived + 1
    }
    return acc;
  }, step1 );
  return step2;
}


const perDay = (queuedPerDay, archivedPerDay) => {
  const step1 = queuedPerDay.reduce( (acc, cur) => {
    const key = convertDate(new Date(cur.dateAdded));
    acc[key] = {
      date: key,
      queued: (acc[key] && acc[key].queued) ? acc[key].queued + 1 : 1,
      accumulated: (acc[key] && acc[key].accumulated) ? acc[key].accumulated + 1 : 1,
      archived: 0
    }
    return acc;
  }, {} );
  const step2 = archivedPerDay.reduce( (acc, cur) => {
    const key = convertDate(new Date(cur.dateAdded));
    const archivedTimeStamp = cur.title.substr(cur.title.length - 15).replace('[', '').replace(']', '');
    const keyArchived = convertDate(new Date(parseInt(archivedTimeStamp, 10)));
    acc[key] = {
      date: key,
      queued: (acc[key] && acc[key].queued) ? acc[key].queued + 1 : 1,
      accumulated: (acc[key] && acc[key].accumulated) ? acc[key].accumulated : 0,
      archived: (acc[key] && acc[key].archived) ? acc[key].archived : 0,
    }
    acc[keyArchived] = {
      date: keyArchived,
      queued: (acc[keyArchived] && acc[keyArchived].queued) ? acc[keyArchived].queued : 0,
      accumulated: (acc[keyArchived] && acc[keyArchived].accumulated) ? acc[keyArchived].accumulated : 0,
      archived: (acc[keyArchived] && acc[keyArchived].archived) ? acc[keyArchived].archived + 1 : 1,
    }
    return acc;
  }, step1 );
  const step3 = Object.values(step2);
  const step4 = step3.sort( (a,b) => {
    if(a.date > b.date) return 1;
    if(a.date < b.date) return -1;
    return 0;
  })
  const step5 = step4.reduce( (acc, cur, index) => {
    if(acc[index-1]) {
      return acc.concat({
        ...cur,
        accumulated: cur.accumulated + acc[index-1].accumulated
      })
    } else {
      return acc.concat(cur);
    }
  }, [])
  return step5;
}

const getAvgTimeToArchive = (archived) => {
  const qty = archived.length;
  const avg = archived.reduce( (acc, cur) => {
    const createdAt = parseInt(cur.dateAdded, 10);
    const archivedAt = parseInt(cur.title.substr(cur.title.length - 15).replace('[', '').replace(']', ''), 10);
    return acc + (archivedAt - createdAt);
  }, 0);
  return Math.floor((avg/qty)/1000/60/60);
}
