# cmpm120-coregameplay
https://t-amandawong.github.io/cmpm120-coregameplay/

## Audio
- Background music playing and looping
- Sound effect triggered when the player presses a movement key on the right side of the screen

## Visual
- Image based player made by David Markowitz
- Video of sky being used as the background which switches between day and night based on the puzzle time

## Motion
- Physics based movement with buttons that move the player and buttons that the player can interact with which change the scene feel

## Progression
- Game has a button which, when interacted with by the player, changes the scene from day to night and vice versa.
- Color scheme matches the time of day you are in.  When the player clears the first demo stage, the stage repeats as we have no more stages implemented.
- The players fullscreen and mute settings are also saved between sessions (fullscreen is applied after you click to start so we have permission to modify the screen status).

## Prefabs
- A couple Base classes (SceneLoader, SceneCache) one of which takes care of loading stuff and the other takes care of the cache. Both are used for scenes.
- JSON Design presets expressed in data files (data.json has the button configurations).
