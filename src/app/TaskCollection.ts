import { Status, Task, TaskObject } from "./Task";
import { STORAGE_KEY } from "./../config";


export class TaskCollection {
  private readonly storage;
  private tasks;

  //storageからtaskを取得
  constructor() {
    this.storage = localStorage;
    this.tasks = this.getStoredTasks();
  }

  //taskを追加
  add(task: Task) {
    this.tasks.push(task);
    this.updateStorage();
  }

  //idでtaskを削除
  delete(task: Task) {
    this.tasks = this.tasks.filter(({ id }) => id !== task.id);
    this.updateStorage();
  }

  //idでtaskを検索
  find(id: string) {
    return this.tasks.find((task) => task.id === id);
  }

  //taskの状態を更新
  update(task: Task) {
    this.tasks = this.tasks.map((item) => {
      if (item.id === task.id) return task;
      return item;
    });
  }

  //statusでフィルター
  filter(filterStatus: Status) {
    return this.tasks.filter(({ status }) => status === filterStatus);
  }

  //taskを一つ上に移動
  moveAboveTarget(task: Task, target: Task) {
    const taskIndex = this.tasks.indexOf(task);
    const targetIndex = this.tasks.indexOf(target);

    this.changeOrder(
      task,
      taskIndex,
      taskIndex < targetIndex ? targetIndex - 1 : targetIndex
    );
  }

  //taskを一番上に移動
  moveToLast(task: Task) {
    const taskIndex = this.tasks.indexOf(task);

    this.changeOrder(task, taskIndex, this.tasks.length);
  }

  //checkboxの状態を更新
  checkbox() {
    this.updateStorage();
  }

  //taskの順番を変更
  private changeOrder(task: Task, taskIndex: number, targetIndex: number) {
    this.tasks.splice(taskIndex, 1);
    this.tasks.splice(targetIndex, 0, task);
    this.updateStorage();
  }

  //storageに保存
  private updateStorage() {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
  }

  //storageから取得
  private getStoredTasks() {
    const jsonString = this.storage.getItem(STORAGE_KEY);

    if (!jsonString) return [];

    try {
      const storedTasks = JSON.parse(jsonString);

      assertIsTaskObjects(storedTasks);

      const tasks = storedTasks.map((task) => new Task(task));

      return tasks;
    } catch {
      this.storage.removeItem(STORAGE_KEY);
      return [];
    }
  }
}

function assertIsTaskObjects(value: any): asserts value is TaskObject[] {
  if (!Array.isArray(value) || !value.every((item) => Task.validate(item))) {
    throw new Error("引数「value」は TaskObject[] 型と一致しません。");
  }
}
