/**
 * @audio_copyright     https://freesound.org/people/Q.K./sounds/56271/
 */

const url = chrome.runtime.getURL("assets/sounds/water-gulp.wav");
const gulpAudio = new Audio(url);
let congrats = false;

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
  const message = msg.message;

  if (message === "gulp") {
    chrome.storage.sync.get(["drank", "gulp", "goal"], (obj) => {
      const newDrank = obj.drank + obj.gulp;

      chrome.storage.sync.set({ drank: newDrank });

      if (newDrank >= obj.goal && congrats === false) {
        alert(
          `Congratulations! You reached your goal of drinking ${obj.goal} ml!`
        );
        congrats = true;
      } else if (newDrank < obj.goal) {
        playSound();
      }
    });
  }
});

async function playSound() {
  try {
    await gulpAudio.play();
  } catch (err) {
    console.error(err);
    console.log("not playing any sound...");
  }
}
