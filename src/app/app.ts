import { EventListener } from "./EventListener";
import { Status, Task, statusMap } from "./Task";
import { TaskCollection } from "./TaskCollection";
import { TaskRenderer } from "./TaskRenderer";

const allDeleteConfirmMessage = "DONEのリスト内を空にします";

function executeAtMidnight() {
  // 画面を開いたとき、および0:00に実行する処理

  const yesterdayEle = document.querySelectorAll(
    'div.lane-item:has(div[data-today="true"])'
  ) as NodeListOf<HTMLDivElement> | null;
  if (yesterdayEle) {
    yesterdayEle.forEach((ele) => {
      ele.style.backgroundColor = "unset";
      ele.dataset.today = "false";
    });
  }

  //今日の曜日に背景色をつける
  const listEl: HTMLDivElement | undefined = executeTodayList();
  if (listEl) {
    const todayColoring: string | null = localStorage.getItem("todayColoring");
    if (todayColoring) {
      listEl.style.backgroundColor = todayColoring;
      listEl.dataset.today = "true";
      //optionのvalueに一致するものを選択状態にする
      const selectEl = document.getElementById("todayColoring") as HTMLSelectElement;
      for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].value === todayColoring) {
          selectEl.options[i].selected = true;
          break;
        }
      }
    }
  }
}

function sundayListBeforeBegin() {
  const sundayList = document.querySelector("div.lane-item:has(div#sundayList)") as HTMLDivElement;
  if (sundayList.dataset.begin === "true") return;
  const mondayList = document.querySelector("div.lane-item:has(div#mondayList)") as HTMLDivElement;
  //mondayListの前にsundayListを挿入
  mondayList?.insertAdjacentElement("beforebegin", sundayList);
  sundayList.dataset.begin = "true";
}

function scheduleMidnightExecution() {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // 翌日の0:00
    0, // 時
    0, // 分
    0 // 秒
  );

  const timeUntilMidnight: number = midnight.getTime() - now.getTime();

  setTimeout(executeAtMidnight, timeUntilMidnight);
}

function checkAndExecute() {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    // 0:00に実行する処理をここに記述
    executeAtMidnight();
  }
}

function handleVisibilityChange() {
  if (!document.hidden) {
    // ページがアクティブになった時の処理
    checkAndExecute();
  }
}

class Application {
  private readonly eventListener = new EventListener();
  private readonly taskCollection = new TaskCollection();
  private readonly taskRenderer = new TaskRenderer(
    document.getElementById("mondayList") as HTMLElement,
    document.getElementById("tuesdayList") as HTMLElement,
    document.getElementById("wednesdayList") as HTMLElement,
    document.getElementById("thursdayList") as HTMLElement,
    document.getElementById("fridayList") as HTMLElement,
    document.getElementById("saturdayList") as HTMLElement,
    document.getElementById("sundayList") as HTMLElement,
    document.getElementById("doneList") as HTMLElement
  );

  start() {
    const taskItems = this.taskRenderer.renderAll(this.taskCollection);


    taskItems.forEach(({ task, deleteButtonEl, checkEl }) => {
      this.eventListener.add(
        "click",
        deleteButtonEl,
        () => this.handleClickDeleteTask(task),
        task.id
      );
      this.eventListener.add(
        "change",
        checkEl,
        () => this.handleClickCheckboxTask(task),
        task.id
      );
    });

    const createForm = document.getElementById("createForm") as HTMLElement;
    this.eventListener.add("submit", createForm, this.handleSubmit);

    const deleteAllDoneTaskButton = document.getElementById(
      "deleteAllDoneTask"
    ) as HTMLElement;
    this.eventListener.add(
      "click",
      deleteAllDoneTaskButton,
      this.handleClickDeleteAllDoneTasks
    );


    //日曜日始まりのチェックボックス
    const checkBoxStartDayOfWeek = document.getElementById("startDayOfWeek") as HTMLInputElement;
    this.eventListener.add("change", checkBoxStartDayOfWeek, () => {
      if (checkBoxStartDayOfWeek.checked) {
        //localStorageに保存
        localStorage.setItem("startDayOfWeek", "true");
        //ページに反映
        sundayListBeforeBegin();
      } else {
        //localStorageに保存
        localStorage.setItem("startDayOfWeek", "false");
        //ページに反映
        const sundayList = document.querySelector("div.lane-item:has(div#sundayList)") as HTMLDivElement;
        if (sundayList.dataset.begin === "true") {
          const saturdayList = document.querySelector("div.lane-item:has(div#saturdayList)") as HTMLDivElement;
          //saturdayの後ろにsundayListを挿入
          saturdayList?.insertAdjacentElement("afterend", sundayList);
          sundayList.dataset.begin = "false";
        }
      }
    });

    //今日の曜日に背景色をつけるselectメニュー
    const selectTodayColoring = document.getElementById("todayColoring") as HTMLSelectElement;
    this.eventListener.add("change", selectTodayColoring, () => {

      const listEl: HTMLDivElement | undefined = executeTodayList();
      if (listEl) {
        listEl.style.backgroundColor = selectTodayColoring.value;
      }
      //localStorageに保存
      localStorage.setItem("todayColoring", selectTodayColoring.value);
    });


    // ドラッグ&ドロップの処理
    this.taskRenderer.subscribeDragAndDrop(this.handleDropAndDrop);

    // ページがアクティブになった時の処理
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // 最初の実行をスケジュールする
    scheduleMidnightExecution();
    executeAtMidnight();

    //日曜日始まりの場合
    //localStorageから取得
    if (localStorage.getItem("startDayOfWeek") === "true") {
      checkBoxStartDayOfWeek.checked = true;
      sundayListBeforeBegin();
    }
  }

  private handleSubmit = (e: Event) => {
    e.preventDefault();

    const titleInput = document.getElementById("title") as HTMLInputElement;

    if (!titleInput.value) return;


    const today = new Date().getDay();
    const status: Status = (today === 0) ? statusMap.sunday :
      (today === 1) ? statusMap.monday :
        (today === 2) ? statusMap.tuesday :
          (today === 3) ? statusMap.wednesday :
            (today === 4) ? statusMap.thursday :
              (today === 5) ? statusMap.friday :
                (today === 6) ? statusMap.saturday : statusMap.monday;


    //現在の日付や時刻を表示する
    const dateAndTime = new Intl.DateTimeFormat('default', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date());

    const task = new Task({ title: titleInput.value, check: false, status, dateAndTime });

    this.taskCollection.add(task);

    const { deleteButtonEl, checkEl } = this.taskRenderer.append(task);

    this.eventListener.add(
      "click",
      deleteButtonEl,
      () => this.handleClickDeleteTask(task),
      task.id
    );
    this.eventListener.add(
      "change",
      checkEl,
      () => this.handleClickCheckboxTask(task),
      task.id
    );
    titleInput.value = "";
  };

  private executeDeleteTask = (task: Task) => {
    this.eventListener.remove(task.id);
    this.taskCollection.delete(task);
    this.taskRenderer.remove(task);
  };

  private handleClickDeleteTask = (task: Task) => {
    //if (!window.confirm(`Delete 「${task.title}」`)) return
    this.executeDeleteTask(task);
  };
  private handleClickCheckboxTask = (task: Task) => {
    const check: boolean = (document.querySelector(`div[id="${task.id}"]>input[type="checkbox"]`) as HTMLInputElement).checked;
    task.update({ check });
    this.taskCollection.update(task);
    this.taskCollection.checkbox();
  };

  private handleClickDeleteAllDoneTasks = () => {
    if (!window.confirm(allDeleteConfirmMessage)) return;

    const doneTasks = this.taskCollection.filter(statusMap.done);

    doneTasks.forEach((task) => this.executeDeleteTask(task));
  };

  private handleDropAndDrop = (
    el: Element,
    sibling: Element | null,
    newStatus: Status
  ) => {
    const taskId = this.taskRenderer.getId(el);

    if (!taskId) return;

    const task = this.taskCollection.find(taskId);

    if (!task) return;

    task.update({ status: newStatus });
    this.taskCollection.update(task);

    if (sibling) {
      const nextTaskId = this.taskRenderer.getId(sibling);

      if (!nextTaskId) return;

      const nextTask = this.taskCollection.find(nextTaskId);

      if (!nextTask) return;

      this.taskCollection.moveAboveTarget(task, nextTask);
    } else {
      this.taskCollection.moveToLast(task);
    }
  };
}

window.addEventListener("load", () => {
  const app = new Application();
  app.start();
});



function executeTodayList(): HTMLDivElement | undefined {
  const today = new Date().getDay();
  switch (today) {
    case 0:
      return document.getElementById("sundayList") as HTMLDivElement;
    case 1:
      return document.getElementById("mondayList") as HTMLDivElement;
    case 2:
      return document.getElementById("tuesdayList") as HTMLDivElement;
    case 3:
      return document.getElementById("wednesdayList") as HTMLDivElement;
    case 4:
      return document.getElementById("thursdayList") as HTMLDivElement;
    case 5:
      return document.getElementById("fridayList") as HTMLDivElement;
    case 6:
      return document.getElementById("saturdayList") as HTMLDivElement;
  }
}

