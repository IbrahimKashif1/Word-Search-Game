# Type Racing Game with Preact

This project is a **Type Racing game** developed using **Preact**. The game allows players to test their typing speed by matching random words generated from an API. It supports various settings such as adjusting the font size and the number of words. The game also features undo and redo options to manage changes.

## Example of the Game

Here is an example of what the game looks like:

![Screenshot of Type Racing Game](https://github.com/user-attachments/assets/c9da8d64-1ffa-4870-b5f7-ced5e066c03c)

## How to Play the Type Racing Game

1. **Start a Game**:
   - Click the **"Add Game"** button on the toolbar to create a new game. The game will appear on the right side of the screen.
   - Up to 20 games can be added. Once 20 games are created, the "Add Game" button will be disabled.

2. **Select a Game**:
   - Click on any game from the right side to select it. The selected game will be highlighted with a red border, and the game area and console will become active.

3. **Adjust Game Settings**:
   - Use the **"Font Size"** slider to adjust the font size of the words in the game area.
   - Use the **"Num Words"** spinner to set how many words appear in the game.
   - Click the **"Reset"** button to apply the changes and refresh the game with new words.

4. **Type the Words**:
   - In the **"Text Input"** field, type the words that appear in the game area. The words are case-insensitive.
   - As you type, matched words will turn green, and the next word will be highlighted in yellow.

5. **Progress and Completion**:
   - The **"Game Progress"** section will display your progress as you type. It shows how many words you’ve matched out of the total number of words in the game.
   - When all words are matched, the game is complete, and a "Game Completed!" message will appear.

6. **Toolbar Options**:
   - **Undo/Redo**: You can undo or redo font size changes, word count changes, or word matching.
   - **Clear Games**: Remove all games from the right side.
   - **Delete Game**: Remove the selected game or the last game if none is selected.

Enjoy racing against time to match words in the shortest time possible!

## How to Run the Game

To run the game locally, follow these steps:

1. **Clone the repository**:
```
git clone git@github.com:IbrahimKashif1/Word-Search-Game.git
```

2. **Navigate to the project directory**:
```
cd Word-Search-Game/Type-Racing-Game/frontend
```

3. **Install dependencies**:
```
npm install
```

4. **Start the development server**:
```
npm run dev
```

Open the game: Once the development server is running, open your browser and navigate to the local server address (usually http://localhost:3000).

Enjoy the game!

