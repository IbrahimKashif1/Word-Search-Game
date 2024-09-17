import { FunctionalComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useModelContext } from "./model";
import GameView from "./gameView";

const ListGamesView: FunctionalComponent = () => {
  const model = useModelContext();
  const [games, setGames] = useState(model.activeGames);

  useEffect(() => {
    const update = () => {
      setGames([...model.activeGames]);
    };

    model.addObserver({ update });

    return () => {
      model.removeObserver({ update });
    };
  }, [model]);

  return (
    <div id="listGamesView">
      {games.map((gameInfo) => (
        <GameView key={gameInfo.gameId} gameInfo={gameInfo} />
      ))}
    </div>
  );
};

export default ListGamesView;
