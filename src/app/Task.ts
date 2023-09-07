import { v4 as uuid, validate } from "uuid";

export const statusMap = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
  done: "DONE",
} as const;
export type Status = typeof statusMap[keyof typeof statusMap];

export type TaskObject = {
  id: string;
  title: string;
  status: Status;
  check: boolean;
};

export class Task {
  readonly id;
  title;
  status;
  check;
  dateAndTime;

  constructor(properties: {
    id?: string;
    title: string;
    status?: Status;
    check?: boolean;
    dateAndTime?: string;
  }) {
    this.id = properties.id || uuid();
    this.title = properties.title;
    this.status = properties.status;
    this.check = properties.check;
    this.dateAndTime = properties.dateAndTime;
  }

  update(properties: {
    title?: string;
    status?: Status;
    check?: boolean;
    dateAndTime?: string;
  }) {
    this.title = properties.title || this.title;
    this.status = properties.status || this.status;
    this.check =
      (properties.check as boolean | null) === null
        ? this.check
        : properties.check;
    this.dateAndTime = properties.dateAndTime || this.dateAndTime;
  }

  static validate(value: any) {
    if (!value) return false;
    if (!validate(value.id)) return false;
    if (!value.title) return false;
    if (!Object.values(statusMap).includes(value.status)) return false;
    if (typeof value.check !== "boolean") return false;
    if (!value.dateAndTime) return false;
    return true;
  }
}
