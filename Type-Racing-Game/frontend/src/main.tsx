import { h, render } from "preact";
import { ModelProvider } from "./model";
import Toolbar from "./toolbar";
import GameConsole from "./gameConsole";
import GameArea from "./gameArea";
import ListGamesView from "./listGameViews";

const App = () => (
  <ModelProvider>
    <div id="app" class="flex flex-col h-screen">
      <Toolbar />
      <div id="body" class="flex flex-1 flex-row overflow-hidden">
        <div id="left" class="flex-2 flex-col bg-green-500">
          <GameArea />
          <GameConsole />
        </div>
        <ListGamesView />
      </div>
    </div>
  </ModelProvider>
);

render(<App />, document.querySelector("div#app") as Element);
