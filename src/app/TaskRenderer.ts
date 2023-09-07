import dragula from "dragula";

import { Status, Task, statusMap } from "./Task";
import { TaskCollection } from "./TaskCollection";
import { deleteButton, deleteButtonTitle } from "./../config";


const borderHighLight = (element: HTMLElement) => {
  const todayColoring = localStorage.getItem("todayColoring") || "#e6ffe6"
  element.style.outline = "2px solid " + todayColoring;
  element.style.outlineOffset = "1px";
  element.style.borderRadius = "5px";
  setTimeout(() => {
    element.style.outline = "unset";
    element.style.outlineOffset = "unset";
    element.style.borderRadius = "unset";
  }, 1100);
};

export class TaskRenderer {
  constructor(
    private readonly mondayList: HTMLElement,
    private readonly tuesdayList: HTMLElement,
    private readonly wednesdayList: HTMLElement,
    private readonly thursdayList: HTMLElement,
    private readonly fridayList: HTMLElement,
    private readonly saturdayList: HTMLElement,
    private readonly sundayList: HTMLElement,
    private readonly doneList: HTMLElement
  ) { }

  append(task: Task) {
    const { taskEl, deleteButtonEl, checkEl } = this.render(task);

    //その日の曜日に応じて、タスクを追加する
    const today = new Date().getDay(); //0~6の数値が返ってくる
    switch (today) {
      case 0:
        this.sundayList.append(taskEl);
        borderHighLight(this.sundayList);
        break;
      case 1:
        this.mondayList.append(taskEl);
        borderHighLight(this.mondayList);
        break;
      case 2:
        this.tuesdayList.append(taskEl);
        borderHighLight(this.tuesdayList);
        break;
      case 3:
        this.wednesdayList.append(taskEl);
        borderHighLight(this.wednesdayList);
        break;
      case 4:
        this.thursdayList.append(taskEl);
        borderHighLight(this.thursdayList);
        break;
      case 5:
        this.fridayList.append(taskEl);
        borderHighLight(this.fridayList);
        break;
      case 6:
        this.saturdayList.append(taskEl);
        borderHighLight(this.saturdayList);
        break;
    }
    return { deleteButtonEl, checkEl };
  }

  remove(task: Task) {
    const taskEl = document.getElementById(task.id);

    if (!taskEl) return;

    if (task.status === statusMap.monday) {
      this.mondayList.removeChild(taskEl);
    } else if (task.status === statusMap.tuesday) {
      this.tuesdayList.removeChild(taskEl);
    } else if (task.status === statusMap.wednesday) {
      this.wednesdayList.removeChild(taskEl);
    } else if (task.status === statusMap.thursday) {
      this.thursdayList.removeChild(taskEl);
    } else if (task.status === statusMap.friday) {
      this.fridayList.removeChild(taskEl);
    } else if (task.status === statusMap.saturday) {
      this.saturdayList.removeChild(taskEl);
    } else if (task.status === statusMap.sunday) {
      this.sundayList.removeChild(taskEl);
    } else if (task.status === statusMap.done) {
      this.doneList.removeChild(taskEl);
    }
  }

  subscribeDragAndDrop(
    onDrop: (el: Element, sibling: Element | null, newStatus: Status) => void
  ) {
    dragula([
      this.mondayList,
      this.tuesdayList,
      this.wednesdayList,
      this.thursdayList,
      this.fridayList,
      this.saturdayList,
      this.sundayList,
      this.doneList,
    ]).on("drop", (el, target, _source, sibling) => {
      const newStatus: Status =
        target.id === "doneList"
          ? statusMap.done
          : target.id === "mondayList"
            ? statusMap.monday
            : target.id === "tuesdayList"
              ? statusMap.tuesday
              : target.id === "wednesdayList"
                ? statusMap.wednesday
                : target.id === "thursdayList"
                  ? statusMap.thursday
                  : target.id === "fridayList"
                    ? statusMap.friday
                    : target.id === "saturdayList"
                      ? statusMap.saturday
                      : target.id === "sundayList"
                        ? statusMap.sunday
                        : statusMap.done;

      onDrop(el, sibling, newStatus);
    });
  }

  getId(el: Element) {
    return el.id;
  }

  renderAll(taskCollection: TaskCollection) {
    const mondayTasks = this.renderList(
      taskCollection.filter(statusMap.monday),
      this.mondayList
    );
    const tuesdayTasks = this.renderList(
      taskCollection.filter(statusMap.tuesday),
      this.tuesdayList
    );
    const wednesdayTasks = this.renderList(
      taskCollection.filter(statusMap.wednesday),
      this.wednesdayList
    );
    const thursdayTasks = this.renderList(
      taskCollection.filter(statusMap.thursday),
      this.thursdayList
    );
    const fridayTasks = this.renderList(
      taskCollection.filter(statusMap.friday),
      this.fridayList
    );
    const saturdayTasks = this.renderList(
      taskCollection.filter(statusMap.saturday),
      this.saturdayList
    );
    const sundayTasks = this.renderList(
      taskCollection.filter(statusMap.sunday),
      this.sundayList
    );
    const doneTasks = this.renderList(
      taskCollection.filter(statusMap.done),
      this.doneList
    );

    return [
      ...mondayTasks,
      ...tuesdayTasks,
      ...wednesdayTasks,
      ...thursdayTasks,
      ...fridayTasks,
      ...saturdayTasks,
      ...sundayTasks,
      ...doneTasks,
    ];
  }

  private renderList(tasks: Task[], listEl: HTMLElement) {
    if (tasks.length === 0) return [];

    const taskList: Array<{
      task: Task;
      deleteButtonEl: HTMLButtonElement;
      checkEl: HTMLInputElement;
    }> = [];

    tasks.forEach((task) => {
      const { taskEl, deleteButtonEl, checkEl } = this.render(task);

      listEl.append(taskEl);
      taskList.push({ task, deleteButtonEl, checkEl });
    });

    return taskList;
  }

  private render(task: Task) {
    // <div class="taskItem">
    //   <span>タイトル</span>
    //   <button>削除</button>
    // </div>
    const taskEl = document.createElement("div");
    const spanEl = document.createElement("span");
    const deleteButtonEl = document.createElement("button");
    const checkEl = document.createElement("input");
    checkEl.type = "checkbox";
    checkEl.checked = task.check as boolean;
    taskEl.id = task.id;
    taskEl.classList.add("task-item");

    spanEl.textContent = task.title;
    taskEl.title = task.title + "\n(createdAt: " + task.dateAndTime + ")";
    deleteButtonEl.textContent = deleteButton;
    deleteButtonEl.title = deleteButtonTitle;

    taskEl.append(checkEl, spanEl, deleteButtonEl);

    return { taskEl, deleteButtonEl, checkEl };
  }
}
