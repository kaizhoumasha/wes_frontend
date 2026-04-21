type AsyncTask = () => Promise<void>

export function createCoalescedAsyncTask(task: AsyncTask): AsyncTask {
  let running = false
  let queued = false
  let currentRun: Promise<void> | null = null

  return async function run(): Promise<void> {
    queued = true

    if (running) {
      await currentRun
      return
    }

    running = true
    currentRun = (async () => {
      try {
        while (queued) {
          queued = false
          await task()
        }
      } finally {
        running = false
        currentRun = null
      }
    })()

    await currentRun
  }
}
