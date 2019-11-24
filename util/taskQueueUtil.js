/**
 * Create TaskQueue
 */
function create() {
  const taskQueue = [];
  let isBusy = false;

  /**
   * Add task to queue
   * @param func
   * @param {...*} args
   */
  function exec(func, ...args) {
    return new Promise((resolve, reject) => {
      if (typeof func !== 'function') throw new Error('Must pass function as first argument');

      taskQueue.push({
        resolve,
        reject,
        func,
        args,
      });
      if (!isBusy) _process();
    });
  }

  /**
   * Execute a task
   * @private
   */
  async function _process() {
    isBusy = true;

    const task = taskQueue[0];
    const result = await task.func(...task.args);
    task.resolve(result);
    taskQueue.splice(0, 1);

    // If there is item in queue
    if (taskQueue.length) process ? process.nextTick(_process) : setTimeout(_process);
    else isBusy = false;
  }

  return {
    exec,
  };
}

module.exports = {
  create,
};
