let QUEUED_TODAY = 0;
let TOTAL_QUEUED = 0;
let QUEUED_PER_DAY = {};
let ARCHIEVED_PER_DAY = {};
let ACCUMULATED_PER_DAY = {};

const updateQueuedToday = async () => {
  const list = await getQueueList();
  if(list) {
    QUEUED_TODAY = list.filter( e =>
      new Date(e.dateAdded).toLocaleDateString() === new Date(Date.now()).toLocaleDateString()
    ).length;
  } else {
    QUEUED_TODAY = 0;
  }
  console.log("QUEUED_TODAY: " + QUEUED_TODAY);
}

const updateStatistics = () => {
  updateQueuedToday();
}