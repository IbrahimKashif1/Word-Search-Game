import { createContext, FunctionalComponent, h } from "preact";
import { useContext, useState } from "preact/hooks";
import { Subject } from "./useObserver";
import { Memento, UndoManager } from "./undo";

export interface I18nWord {
  "en-CA": string;
  "fr-CA": string;
  [key: string]: string;
}

export type GameProperties = {
  gameId: number;
  fontSize: number;
  numWords: number;
  currentWords: GameWordsProps[];
  currentWordIdx: number;
  userFocusedWord: number;
  invalidConsoleState: boolean;
  undoManager: UndoManager;
};

export type GameWordsProps = {
  state: "done" | "current" | "inc";
  word: I18nWord;
  uid: number;
};

class Model extends Subject {
  readonly MAXGAMES = 20;
  readonly MINNW = 0;
  readonly MAXNW = 9999;

  activeGames: GameProperties[] = [];
  currentGameIdx: number = -1;
  uniqueId = 0;
  private _wordLang = "en-CA";
  get wordLang() {
    return this._wordLang;
  }
  set wordLang(val: string) {
    this._wordLang = val;
    this.notifyObservers();
  }

  private undoManager: UndoManager;
  fontSize = 16;
  numWords = 20;
  currentWords: GameWordsProps[] = [];
  currentWordIdx = 0;
  userFocusedWord = -1;
  invalidConsoleState = false;

  constructor() {
    super();
    this.undoManager = new UndoManager(this.getScreenshot());
  }

  get font() {
    return `${this.fontSize}pt sans-serif`;
  }

  async fetchWords(n: number): Promise<I18nWord[]> {
    const response = await fetch(`/myWordsApi/i18nwords?numWords=${n}`);
    const words: I18nWord[] = await response.json();
    return words;
  }

  async createWords(n: number): Promise<GameWordsProps[]> {
    const words = await this.fetchWords(n);
    const gameWords = words.map((word, i) => ({
      state: "inc" as "done" | "current" | "inc",
      word,
      uid: i,
    }));

    if (gameWords.length > 0) {
      gameWords[0].state = "current";
    }

    return gameWords;
  }

  async resetCurrentGame() {
    if (!this.invalidConsoleState) {
      this.currentWords = await this.createWords(this.numWords);
      this.userFocusedWord = -1;
      this.currentWordIdx = this.currentWords.length > 0 ? 0 : -1;
      this.notifyObservers();
    }
  }

  async addGame() {
    if (this.activeGames.length >= this.MAXGAMES) return;

    const newGameWords = await this.createWords(20);
    const newGame: GameProperties = {
      gameId: this.uniqueId,
      fontSize: 16,
      numWords: 20,
      currentWords: newGameWords,
      currentWordIdx: 0,
      userFocusedWord: -1,
      invalidConsoleState: false,
      undoManager: new UndoManager({
        fontSize: 16,
        numWords: 20,
        currentWords: this.deepCopyWords(newGameWords),
        currentWordIdx: 0,
        userFocusedWord: -1,
        invalidConsoleState: false,
      } as Memento),
    };
    this.activeGames.push(newGame);
    this.uniqueId++;
    this.notifyObservers();
  }

  textTracker(t: string) {
    if (
      this.currentWordIdx >= this.currentWords.length ||
      this.currentWordIdx === -1
    )
      return true;

    const curWord = this.currentWords[this.currentWordIdx];
    if (t === curWord.word[this.wordLang]) {
      this.resetWordFocus("done");
      this.notifyObservers();
      return true;
    }
    this.notifyObservers();
    return false;
  }

  getWords() {
    return this.currentWords;
  }

  getCurrentGameProgress() {
    const totalWords = this.currentWords.length;
    const matchedWords = this.currentWords.reduce(
      (acc, x) => acc + (x.state === "done" ? 1 : 0),
      0
    );
    if (this.invalidConsoleState) {
      return `Invalid Num Words! Should be in ${this.MINNW} - ${this.MAXNW}`;
    } else if (matchedWords === totalWords) {
      return "Game Completed!";
    } else {
      return `${matchedWords} / ${totalWords} Words Matched`;
    }
  }

  getCurrentGameProgressRatio() {
    const totalWords = this.currentWords.length;
    const matchedWords = this.currentWords.reduce(
      (acc, x) => acc + (x.state === "done" ? 1 : 0),
      0
    );
    return totalWords !== 0 ? matchedWords / totalWords : 1;
  }

  getSpecificGameProgress(id: number) {
    const gameIdx = this.activeGames.findIndex((x) => x.gameId === id);
    if (gameIdx >= 0) {
      const curWords =
        gameIdx === this.currentGameIdx
          ? this.currentWords
          : this.activeGames[gameIdx].currentWords;
      const totalWords = curWords.length;
      const matchedWords = curWords.reduce(
        (acc, x) => acc + (x.state === "done" ? 1 : 0),
        0
      );
      return totalWords !== 0 ? matchedWords / totalWords : 1;
    }
    return -1;
  }

  getListOfGames() {
    return this.activeGames;
  }

  getActiveGame() {
    return this.currentGameIdx !== -1
      ? this.activeGames[this.currentGameIdx]
      : undefined;
  }

  resetWordFocus(state: "done" | "current" | "inc") {
    this.userFocusedWord = -1;
    if (
      this.currentWordIdx !== -1 &&
      this.currentWordIdx < this.currentWords.length
    ) {
      this.currentWords[this.currentWordIdx].state = state;
    }

    this.currentWordIdx = this.currentWords.findIndex((x) => x.state === "inc");
    if (
      this.currentWordIdx !== -1 &&
      this.currentWordIdx < this.currentWords.length
    ) {
      this.currentWords[this.currentWordIdx].state = "current";
    }
  }

  selectWord(gword: GameWordsProps) {
    if (gword.uid === this.userFocusedWord) {
      this.resetWordFocus("inc");
    } else {
      this.userFocusedWord = gword.uid;
      if (
        this.currentWordIdx !== -1 &&
        this.currentWordIdx < this.currentWords.length
      ) {
        this.currentWords[this.currentWordIdx].state = "inc";
      }
      this.currentWordIdx = this.userFocusedWord;
      if (
        this.currentWordIdx !== -1 &&
        this.currentWordIdx < this.currentWords.length
      ) {
        this.currentWords[this.currentWordIdx].state = "current";
      }
    }
    this.notifyObservers();
  }

  swapGame(id: number) {
    const gameIdx = this.activeGames.findIndex((x) => x.gameId === id);
    if (gameIdx >= 0) {
      if (this.currentGameIdx !== -1) {
        const activeGame = this.activeGames[this.currentGameIdx];
        activeGame.fontSize = this.fontSize;
        activeGame.numWords = this.numWords;
        activeGame.currentWords = this.currentWords;
        activeGame.currentWordIdx = this.currentWordIdx;
        activeGame.userFocusedWord = this.userFocusedWord;
        activeGame.invalidConsoleState = this.invalidConsoleState;
        activeGame.undoManager = this.undoManager;
      }

      if (this.currentGameIdx === gameIdx) {
        this.currentGameIdx = -1;
        this.notifyObservers();
        return;
      }

      const gameRef = this.activeGames[gameIdx];
      this.fontSize = gameRef.fontSize;
      this.numWords = gameRef.numWords;
      this.currentWords = gameRef.currentWords;
      this.currentWordIdx = gameRef.currentWordIdx;
      this.userFocusedWord = gameRef.userFocusedWord;
      this.invalidConsoleState = gameRef.invalidConsoleState;
      this.undoManager = gameRef.undoManager;

      this.currentGameIdx = gameIdx;
    }
    this.notifyObservers();
  }

  updateFontSize(val: number) {
    this.fontSize = val;
    this.notifyObservers();
  }

  async updateNumWords(val: number) {
    if (this.numWords !== val) {
      this.invalidConsoleState = val < this.MINNW || val > this.MAXNW;
      this.numWords = val;
      await this.resetCurrentGame();
      this.makeChunk();
    }
  }

  deleteSelectedGame() {
    if (this.currentGameIdx !== -1) {
      this.activeGames.splice(this.currentGameIdx, 1);
      this.currentGameIdx = -1;
      this.notifyObservers();
    } else if (this.activeGames.length > 0) {
      this.activeGames.pop();
      this.currentGameIdx = -1;
      this.notifyObservers();
    }
  }

  deleteAllGames() {
    this.activeGames = [];
    this.currentGameIdx = -1;
    this.notifyObservers();
  }

  undo() {
    const screenshot = this.undoManager.undo();
    this.applyScreenshot(screenshot);
    console.log(`Undo - numWords: ${this.numWords}`);
    this.notifyObservers();
  }

  redo() {
    const screenshot = this.undoManager.redo();
    this.applyScreenshot(screenshot);
    console.log(`Redo - numWords: ${this.numWords}`);
    this.notifyObservers();
  }

  makeChunk() {
    this.undoManager.execute(this.getScreenshot());
    this.notifyObservers();
  }

  private applyScreenshot(screenshot: Memento) {
    this.fontSize = screenshot.fontSize;
    this.numWords = screenshot.numWords;
    this.currentWords = this.deepCopyWords(screenshot.currentWords);
    this.currentWordIdx = screenshot.currentWordIdx;
    this.userFocusedWord = screenshot.userFocusedWord;
    this.invalidConsoleState = screenshot.invalidConsoleState;
    this.notifyObservers();
  }

  private getScreenshot() {
    return {
      fontSize: this.fontSize,
      numWords: this.numWords,
      currentWords: this.deepCopyWords(this.currentWords),
      currentWordIdx: this.currentWordIdx,
      userFocusedWord: this.userFocusedWord,
      invalidConsoleState: this.invalidConsoleState,
    } as Memento;
  }

  private deepCopyWords(words: GameWordsProps[]): GameWordsProps[] {
    return words.map((word) => ({
      state: word.state,
      word: { ...word.word },
      uid: word.uid,
    }));
  }

  get canUndo() {
    return this.undoManager.canUndo && this.currentGameIdx !== -1;
  }

  get canRedo() {
    return this.undoManager.canRedo && this.currentGameIdx !== -1;
  }
}

const ModelContext = createContext<Model | undefined>(undefined);

const ModelProvider: FunctionalComponent = ({ children }) => {
  const [model] = useState(new Model());
  return (
    <ModelContext.Provider value={model}>{children}</ModelContext.Provider>
  );
};

const useModelContext = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModelContext must be used within a ModelProvider");
  }
  return context;
};

export { Model, ModelProvider, useModelContext };
