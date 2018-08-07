import { getItems, convertDate } from './util';

export const getStatistics = async (queueFolderId, archiveFolderId) => {
  const queued = await getItems(queueFolderId);
  const archived = await getItems(archiveFolderId);
  const today = new Date().toLocaleDateString();

  const totalQueued = queued.length + archived.length;
  const totalArchived = archived.length;
  const queuedToday = queued.concat(archived).filter( e => new Date(e.dateAdded).toLocaleDateString() ===  today ).length;
  const archivedToday = archived.filter( e => new Date(e.dateAdded).toLocaleDateString() ===  today ).length;
  const data = perDay(queued, archived);

  return ({
    queuedToday,
    archivedToday,
    totalQueued,
    totalArchived,
    data
  });
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
  console.log(step2)
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


