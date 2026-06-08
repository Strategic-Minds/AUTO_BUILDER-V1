import type { RepairTask } from "./repair-queue";

export type PersistentQueueSnapshot = {
  storageMode: "repo_scaffold" | "supabase" | "drive";
  queued: RepairTask[];
  note: string;
};

let memoryQueue: RepairTask[] = [];

export function loadPersistentQueue(): PersistentQueueSnapshot {
  return {
    storageMode: "repo_scaffold",
    queued: memoryQueue,
    note: "In-memory queue scaffold. Replace with Supabase/Drive persistence in deployed runtime."
  };
}

export function savePersistentQueue(tasks: RepairTask[]): PersistentQueueSnapshot {
  memoryQueue = tasks;
  return loadPersistentQueue();
}

export function appendPersistentQueue(tasks: RepairTask[]): PersistentQueueSnapshot {
  const existing = new Map(memoryQueue.map((task) => [task.id, task]));
  for (const task of tasks) existing.set(task.id, task);
  memoryQueue = Array.from(existing.values());
  return loadPersistentQueue();
}
