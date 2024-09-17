import { useState, useEffect } from "preact/hooks";
import { GameWordsProps } from "./model";

export interface Memento {
  fontSize: number;
  numWords: number;
  currentWords: GameWordsProps[];
  currentWordIdx: number;
  userFocusedWord: number;
  invalidConsoleState: boolean;
}

export class UndoManager {
  private undoStack: Memento[] = [];
  private redoStack: Memento[] = [];

  constructor(private base: Memento) {}

  execute(memento: Memento) {
    this.undoStack.push(memento);
    this.redoStack = [];
    console.log(this.toString());
  }

  undo(): Memento {
    console.log("undo", this.toString());
    const memento = this.undoStack.pop();
    if (!memento) throw new Error("No more undo states");
    this.redoStack.push(memento);
    const prevMemento = this.undoStack.slice(-1)[0] || this.base;
    return prevMemento;
  }

  redo(): Memento {
    console.log("redo", this.toString());
    const memento = this.redoStack.pop();
    if (!memento) throw new Error("No more redo states");
    this.undoStack.push(memento);
    return memento;
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  toString() {
    return `undoStack: ${this.undoStack.length}, redoStack: ${this.redoStack.length}`;
  }
}

export const useUndoManager = (initialState: Memento) => {
  const [undoManager] = useState(new UndoManager(initialState));
  const [canUndo, setCanUndo] = useState(undoManager.canUndo);
  const [canRedo, setCanRedo] = useState(undoManager.canRedo);

  useEffect(() => {
    const updateState = () => {
      setCanUndo(undoManager.canUndo);
      setCanRedo(undoManager.canRedo);
    };

    const originalExecute = undoManager.execute.bind(undoManager);
    const originalUndo = undoManager.undo.bind(undoManager);
    const originalRedo = undoManager.redo.bind(undoManager);

    undoManager.execute = (memento: Memento) => {
      originalExecute(memento);
      updateState();
    };

    undoManager.undo = () => {
      const memento = originalUndo();
      updateState();
      return memento;
    };

    undoManager.redo = () => {
      const memento = originalRedo();
      updateState();
      return memento;
    };

    updateState();
  }, [undoManager]);

  const execute = (memento: Memento) => {
    undoManager.execute(memento);
  };

  const undo = () => {
    if (undoManager.canUndo) {
      return undoManager.undo();
    }
    return null;
  };

  const redo = () => {
    if (undoManager.canRedo) {
      return undoManager.redo();
    }
    return null;
  };

  return { undoManager, execute, undo, redo, canUndo, canRedo };
};
