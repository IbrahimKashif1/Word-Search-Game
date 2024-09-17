import { h, FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { GameProperties, useModelContext } from "./model";

interface GameViewProps {
  gameInfo: GameProperties;
}

const GameView: FunctionalComponent<GameViewProps> = ({ gameInfo }) => {
  const model = useModelContext();
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const update = () => {
      const activeGame = model.getActiveGame();
      setIsActive(activeGame ? activeGame.gameId === gameInfo.gameId : false);

      const totalProgress = model.getSpecificGameProgress(gameInfo.gameId);
      setProgress(totalProgress);
    };

    model.addObserver({ update });

    return () => {
      model.removeObserver({ update });
    };
  }, [model, gameInfo.gameId]);

  const handleGameClick = () => {
    model.swapGame(gameInfo.gameId);
  };

  return (
    <div
      id="game"
      className={isActive ? "focusedGame" : "unfocusedGame"}
      onClick={handleGameClick}
    >
      <label id="gameNo">Game {gameInfo.gameId}</label>
      <div id="progressBar" style={{ width: `${progress * 100}%` }} />
      <div id="progressRem" style={{ width: `${(1 - progress) * 100}%` }} />
    </div>
  );
};

export default GameView;
