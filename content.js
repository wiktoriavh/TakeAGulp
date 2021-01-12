/**
 * @audio_copyright     https://freesound.org/people/Q.K./sounds/56271/
 */

let congrats = false;

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    if (msg.reset === true) {
      congrats = false;
    } else {
      const url = chrome.runtime.getURL("assets/sounds/water-gulp.wav");
      const gulpAudio = new Audio(url);
      gulpAudio.play();
      console.log(msg);
      let gulp = Number(msg.gulp);
      let drank = Number(msg.drank);
      drank += gulp;

      chrome.storage.sync.set({ drank: drank, gulp: gulp });

      chrome.storage.sync.get(["drank", "goal"], (obj) => {
        const goal = obj.goal;
        const drank = obj.drank;

        if (drank >= goal && congrats === false) {
          congrats = true;
          alert("Congratulations! You reached your goal!");
        }
      });
    }
  });
});
