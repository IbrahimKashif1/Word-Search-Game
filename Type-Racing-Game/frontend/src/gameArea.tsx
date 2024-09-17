import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { GameWordsProps, useModelContext } from "./model";

const GameArea = () => {
  const model = useModelContext();
  const [words, setWords] = useState<GameWordsProps[]>([]);
  const [gameStatus, setGameStatus] = useState({
    isWon: model.getCurrentGameProgressRatio() === 1,
    isInvalid: model.invalidConsoleState,
    hasActiveGame: model.currentGameIdx !== -1,
  });

  useEffect(() => {
    const update = () => {
      setWords(model.getWords());
      setGameStatus({
        isWon: model.getCurrentGameProgressRatio() === 1,
        isInvalid: model.invalidConsoleState,
        hasActiveGame: model.currentGameIdx !== -1,
      });
    };

    model.addObserver({ update });

    return () => {
      model.removeObserver({ update });
    };
  }, [model]);

  const handleWordClick = (gwords: GameWordsProps) => {
    if (!gameStatus.isWon && gameStatus.hasActiveGame) {
      model.selectWord(gwords);
      model.makeChunk();
    }
  };

  const gameClass = gameStatus.isWon
    ? "won"
    : gameStatus.isInvalid
    ? "invalidGame"
    : gameStatus.hasActiveGame
    ? ""
    : "no-active-game";

  const wordElements = words.map((gwords) => (
    <div
      id="wordContainer"
      className={gwords.state}
      style={{
        backgroundColor:
          gwords.uid === model.userFocusedWord ? "rgb(255, 255, 0)" : "",
        border: gwords.uid === model.userFocusedWord ? "2px solid red" : "",
        padding: gwords.uid === model.userFocusedWord ? "8px" : "",
        fontSize: `${model.fontSize}px`,
      }}
      onClick={() => handleWordClick(gwords)}
    >
      {gwords.word[model.wordLang]}
    </div>
  ));

  return (
    <div
      id="gameArea"
      className={`${gameClass} ${gameStatus.isWon ? "no-hover" : ""}`}
      style={{
        backgroundColor: !gameStatus.hasActiveGame
          ? "white"
          : gameStatus.isInvalid
          ? "rgb(255, 220, 220)"
          : "",
      }}
      onClick={(e) => {
        if (gameStatus.isWon) {
          e.stopImmediatePropagation();
        }
      }}
    >
      {gameStatus.hasActiveGame && gameStatus.isInvalid ? (
        <div
          id="invalidContents"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            fontSize: "5vw",
          }}
        >
          INVALID GAME PARAMETERS!
        </div>
      ) : gameStatus.hasActiveGame ? (
        wordElements
      ) : null}
    </div>
  );
};

export default GameArea;
