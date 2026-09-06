import { PosterEditor } from "./poster-editor.js";
import { VideoEditor } from "./video-editor.js";


await document.fonts.ready;


const posterEditor =
  new PosterEditor();


const videoEditor =
  new VideoEditor();


const posterModeBtn =
  document.getElementById("posterModeBtn");

const videoModeBtn =
  document.getElementById("videoModeBtn");


posterModeBtn.addEventListener(
  "click",
  () => switchStudio("poster")
);


videoModeBtn.addEventListener(
  "click",
  () => switchStudio("video")
);



function switchStudio(mode) {

  const poster =
    mode === "poster";


  posterModeBtn.classList.toggle(
    "active",
    poster
  );


  videoModeBtn.classList.toggle(
    "active",
    !poster
  );


  document
    .getElementById("posterLeftPanel")
    .classList.toggle(
      "hidden",
      !poster
    );


  document
    .getElementById("videoLeftPanel")
    .classList.toggle(
      "hidden",
      poster
    );


  document
    .getElementById("posterWorkspace")
    .classList.toggle(
      "hidden",
      !poster
    );


  document
    .getElementById("videoWorkspace")
    .classList.toggle(
      "hidden",
      poster
    );


  document
    .getElementById("posterRightPanel")
    .classList.toggle(
      "hidden",
      !poster
    );


  document
    .getElementById("videoRightPanel")
    .classList.toggle(
      "hidden",
      poster
    );


  document
    .querySelectorAll(".poster-only-control")
    .forEach(element => {

      element.classList.toggle(
        "hidden",
        !poster
      );
    });


  document
    .querySelectorAll(".video-only-control")
    .forEach(element => {

      element.classList.toggle(
        "hidden",
        poster
      );
    });


  if (!poster) {

    posterEditor.state.safeZone = false;

    videoEditor.renderFrame();

  } else {

    videoEditor.pause();

    posterEditor.render();
  }
}
