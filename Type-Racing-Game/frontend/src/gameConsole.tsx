import { FunctionalComponent, h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useModelContext } from "./model";

const GameConsole: FunctionalComponent = () => {
  const model = useModelContext();
  const [enabled, setEnabled] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [numWords, setNumWords] = useState("");
  const [gameProgress, setGameProgress] = useState(
    "Select / Add a game to Start!"
  );

  useEffect(() => {
    const update = () => {
      const m = model;
      if (m.currentGameIdx === -1) {
        setEnabled(false);
        setTextInput("");
        setFontSize(16);
        setNumWords("");
        setGameProgress("Select / Add a game to Start!");
        document.getElementById("numWordsInput")?.classList.remove("invalid");
      } else {
        setEnabled(true);
        setFontSize(m.fontSize);
        setNumWords(m.numWords.toString());
        setGameProgress(m.getCurrentGameProgress());

        if (m.invalidConsoleState) {
          document.getElementById("numWordsInput")?.classList.add("invalid");
        } else {
          document.getElementById("numWordsInput")?.classList.remove("invalid");
        }
      }
    };

    model.addObserver({ update });

    return () => {
      model.removeObserver({ update });
    };
  }, [model]);

  const handleTextInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setTextInput(target.value);
    const matched = model.textTracker(target.value.toLowerCase());
    if (matched) {
      setTextInput("");
      setEnabled(false);
      model.makeChunk();
    }
  };

  const handleFontSizeInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value) || 0;
    setFontSize(value);
    model.updateFontSize(value);
  };

  const handleFontSizeChange = (e: Event) => {
    model.makeChunk();
  };

  const handleNumWordsChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value) || 0;
    setNumWords(target.value);
    model.updateNumWords(value);
  };

  const handleResetClick = async () => {
    if (model.currentGameIdx !== -1) {
      await model.resetCurrentGame();
      model.makeChunk();
    }
  };

  return (
    <div id="gameConsole">
      <input
        id="textInput"
        type="text"
        placeholder="Type Here..."
        value={textInput}
        onInput={handleTextInputChange}
        disabled={
          !enabled ||
          model.getCurrentGameProgressRatio() === 1 ||
          model.invalidConsoleState
        }
      />
      <div id="groupingContainer">
        <div id="fontSizeContainer">
          <label htmlFor="fontSizeInput">Font Size:</label>
          <input
            id="fontSizeInput"
            type="range"
            min="0"
            max="100"
            value={fontSize}
            onInput={handleFontSizeInput}
            onChange={handleFontSizeChange}
            disabled={
              !enabled ||
              model.getCurrentGameProgressRatio() === 1 ||
              model.invalidConsoleState
            }
          />
        </div>
        <div id="numWordsContainer">
          <label htmlFor="numWordsInput">Num Words:</label>
          <input
            id="numWordsInput"
            type="number"
            value={numWords}
            onInput={handleNumWordsChange}
            required
            disabled={!enabled}
          />
        </div>
      </div>
      <button
        id="resetButton"
        onClick={handleResetClick}
        disabled={!enabled || model.invalidConsoleState}
      >
        Reset Game
      </button>
      <div id="gameProgress">{gameProgress}</div>
    </div>
  );
};

export default GameConsole;
