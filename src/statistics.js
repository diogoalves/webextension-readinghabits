import { getQueueList, getArchiveList} from './util';

export const getStatistics = async () => {
  const queued = await getQueueList();
  const archived = await getArchiveList();
  const today = new Date().toLocaleDateString();

  const totalQueued = queued.length + archived.length;
  const totalArchived = archived.length;
  const queuedToday = queued.filter( e => new Date(e.dateAdded).toLocaleDateString() ===  today ).length;
  const archivedToday = archived.filter( e => new Date(e.dateAdded).toLocaleDateString() ===  today ).length;
  const queuedPerDay = perDay(queued.concat(archived));
  const archivedPerDay = perDay(archived);
  const accumulatedPerDay = perDay(queued);

  return ({
    queuedToday,
    archivedToday,
    totalQueued,
    totalArchived,
    queuedPerDay,
    archivedPerDay,
    accumulatedPerDay
  });
}

const perDay = data => {
  return data.reduce( (acc, cur) => {
    const key = new Date(cur.dateAdded).toLocaleDateString();
    acc[key] = acc[key] ? acc[key] + 1 : 1;
    return acc;
  }, {} );
}