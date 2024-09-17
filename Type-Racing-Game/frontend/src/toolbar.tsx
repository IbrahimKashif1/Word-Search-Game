import { FunctionalComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useModelContext } from "./model";

const Toolbar: FunctionalComponent = () => {
  const model = useModelContext();
  const [addDisabled, setAddDisabled] = useState(
    model.activeGames.length === model.MAXGAMES
  );
  const [deleteDisabled, setDeleteDisabled] = useState(
    !(model.activeGames.length > 0)
  );
  const [clearDisabled, setClearDisabled] = useState(
    !(model.activeGames.length > 0)
  );
  const [undoDisabled, setUndoDisabled] = useState(!model.canUndo);
  const [redoDisabled, setRedoDisabled] = useState(!model.canRedo);
  const [wordLang, setWordLang] = useState(model.wordLang);

  useEffect(() => {
    const update = () => {
      setAddDisabled(model.activeGames.length === model.MAXGAMES);
      setDeleteDisabled(!(model.activeGames.length > 0));
      setClearDisabled(!(model.activeGames.length > 0));
      setUndoDisabled(!model.canUndo);
      setRedoDisabled(!model.canRedo);
    };

    model.addObserver({ update });

    return () => {
      model.removeObserver({ update });
    };
  }, [model]);

  const handleLangChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value;
    model.wordLang = value;
    setWordLang(value);
  };

  return (
    <div id="toolbar">
      <div id="buttons">
        <button disabled={addDisabled} onClick={() => model.addGame()}>
          Add Game
        </button>
        <button
          disabled={deleteDisabled}
          onClick={() => model.deleteSelectedGame()}
        >
          Delete Game
        </button>
        <button disabled={clearDisabled} onClick={() => model.deleteAllGames()}>
          Clear Games
        </button>
      </div>
      <div id="optionsCont">
        <button disabled={undoDisabled} onClick={() => model.undo()}>
          Undo
        </button>
        <button disabled={redoDisabled} onClick={() => model.redo()}>
          Redo
        </button>
        <select value={wordLang} onChange={handleLangChange}>
          <option value="en-CA">English</option>
          <option value="fr-CA">Français</option>
        </select>
      </div>
    </div>
  );
};

export default Toolbar;
