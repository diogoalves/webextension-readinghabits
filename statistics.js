let QUEUED_TODAY = 0;
let ARCHIVED_TODAY = 0;
let TOTAL_QUEUED = 0;
let TOTAL_ARCHIVED = 0;
let QUEUED_PER_DAY = {};
let ARCHIEVED_PER_DAY = {};
let ACCUMULATED_PER_DAY = {};

const statistics = {
  queuedToday: 0,
  archivedToday: 0,

}

const updateStatistics = async () => {
  const queued = await getQueueList();
  const archived = await getArchiveList();
  const today = new Date().toLocaleDateString();

  TOTAL_QUEUED = queued.length + archived.length;
  TOTAL_ARCHIVED = archived.length;
  QUEUED_TODAY = queued.filter( e => new Date(e.dateAdded).toLocaleDateString() ===  today ).length;
  ARCHIVED_TODAY = archived.filter( e => new Date(e.dateAdded).toLocaleDateString() ===  today ).length;

  QUEUED_PER_DAY = perDay(queued.concat(archived));
  ARCHIVED_TODAY = perDay(archived);
  ACCUMULATED_PER_DAY = perDay(queued);

  console.log(`QUEUED: ${TOTAL_QUEUED}, ARCHIVED: ${TOTAL_ARCHIVED}, QUEUED_TODAY: ${QUEUED_TODAY}, ARCHIVED_TODAY: ${ARCHIVED_TODAY}`);
  console.log("QUEUED_PER_DAY")
  console.log(QUEUED_PER_DAY)
  console.log("ARCHIVED_TODAY")
  console.log(ARCHIVED_TODAY)
  console.log("ACCUMULATED_PER_DAY")
  console.log(ACCUMULATED_PER_DAY)  
}

const perDay = data => {
  return data.reduce( (acc, cur) => {
    const key = new Date(cur.dateAdded).toLocaleDateString();
    acc[key] = acc[key] ? acc[key] + 1 : 1;
    return acc;
  }, {} );
}