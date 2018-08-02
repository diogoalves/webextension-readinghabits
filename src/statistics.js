import { getItems} from './util';



export const getStatistics = async (queueFolderId, archiveFolderId) => {
  const queued = await getItems(queueFolderId);
  const archived = await getItems(archiveFolderId);
  const today = new Date().toLocaleDateString();

  const totalQueued = queued.length + archived.length;
  const totalArchived = archived.length;
  const queuedToday = queued.filter( e => new Date(e.dateAdded).toLocaleDateString() ===  today ).length;
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
      queued: acc[key] ? acc[key].queued + 1 : 1,
      accumulated: acc[key] ? acc[key].accumulated + 1 : 1,
      archived: 0
    }
    return acc;
  }, {} );
  const step2 = archivedPerDay.reduce( (acc, cur) => {
    const key = convertDate(new Date(cur.dateAdded));
    acc[key] = {
      date: key,
      queued: acc[key] ? acc[key].queued + 1 : 1,
      accumulated: acc[key] ? acc[key].accumulated : 0,
      archived: acc[key] ? acc[key].archived + 1 : 1,
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


const convertDate = date => {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd  = date.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}