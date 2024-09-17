import { useEffect } from "preact/hooks";

export interface Observer {
  update: () => void;
}

export function isObserver(obj: Observer): obj is Observer {
  return typeof obj.update === "function";
}

export class Subject {
  private observers: Set<Observer> = new Set();

  addObserver(observer: Observer) {
    this.observers.add(observer);
    observer.update();
  }

  removeObserver(observer: Observer) {
    this.observers.delete(observer);
  }

  protected notifyObservers() {
    for (const observer of this.observers) {
      observer.update();
    }
  }
}

export const useObserver = (subject: Subject, update: () => void) => {
  useEffect(() => {
    const observer = { update };

    subject.addObserver(observer);

    return () => {
      subject.removeObserver(observer);
    };
  }, [subject, update]);
};
