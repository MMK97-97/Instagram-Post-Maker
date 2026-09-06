import { PosterEditor } from "./poster-editor.js";
import { VideoEditor } from "./video-editor.js";

await document.fonts.ready;


const posterEditor =
  new PosterEditor();

const videoEditor =
  new VideoEditor();


let activeStudio = "poster";


const posterModeBtn =
  document.getElementById("posterModeBtn");

const videoModeBtn =
  document.getElementById("videoModeBtn");


const projectNameInput =
  document.getElementById("projectName");


/* =========================================================
   PROJECT NAME
========================================================= */

const savedProjectName =
  localStorage.getItem(
    "fwcwl-project-name"
  );

if (savedProjectName) {
  projectNameInput.value =
    savedProjectName;
}


projectNameInput.addEventListener(
  "input",
  () => {

    localStorage.setItem(
      "fwcwl-project-name",
      projectNameInput.value
    );
  }
);


/* =========================================================
   STUDIO SWITCH
========================================================= */

posterModeBtn.addEventListener(
  "click",
  () => switchStudio("poster")
);


videoModeBtn.addEventListener(
  "click",
  () => switchStudio("video")
);


function switchStudio(mode) {

  activeStudio = mode;

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
    .querySelectorAll(
      ".poster-only-control"
    )
    .forEach(element => {

      element.classList.toggle(
        "hidden",
        !poster
      );
    });


  document
    .querySelectorAll(
      ".video-only-control"
    )
    .forEach(element => {

      element.classList.toggle(
        "hidden",
        poster
      );
    });


  if (poster) {

    videoEditor.pause();

    posterEditor.render();

  } else {

    posterEditor.state.safeZone =
      false;

    videoEditor.renderFrame();
  }
}


/* =========================================================
   GLOBAL UNDO / REDO
========================================================= */

document
  .getElementById("undoGlobalBtn")
  .addEventListener("click", () => {

    if (
      activeStudio === "video"
    ) {
      videoEditor.undo();
    }
  });


document
  .getElementById("redoGlobalBtn")
  .addEventListener("click", () => {

    if (
      activeStudio === "video"
    ) {
      videoEditor.redo();
    }
  });


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

window.addEventListener(
  "keydown",
  event => {

    const target =
      event.target;

    const editingText =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement;


    const command =
      event.ctrlKey ||
      event.metaKey;


    if (
      activeStudio === "video" &&
      !editingText
    ) {

      if (
        event.code === "Space"
      ) {

        event.preventDefault();

        videoEditor.togglePlayback();
      }


      if (
        event.key === "ArrowLeft"
      ) {

        event.preventDefault();

        videoEditor.seekRelative(
          event.shiftKey
            ? -1
            : -0.1
        );
      }


      if (
        event.key === "ArrowRight"
      ) {

        event.preventDefault();

        videoEditor.seekRelative(
          event.shiftKey
            ? 1
            : 0.1
        );
      }


      if (
        event.key.toLowerCase() === "s"
      ) {

        event.preventDefault();

        videoEditor.splitSelectedClip();
      }


      if (
        event.key === "Delete" ||
        event.key === "Backspace"
      ) {

        event.preventDefault();

        videoEditor.deleteSelectedClip();
      }
    }


    if (
      command &&
      event.key.toLowerCase() === "z"
    ) {

      event.preventDefault();

      if (
        activeStudio === "video"
      ) {

        if (event.shiftKey) {
          videoEditor.redo();
        } else {
          videoEditor.undo();
        }
      }
    }


    if (
      command &&
      event.key.toLowerCase() === "y"
    ) {

      event.preventDefault();

      if (
        activeStudio === "video"
      ) {
        videoEditor.redo();
      }
    }


    if (
      command &&
      event.key.toLowerCase() === "d" &&
      activeStudio === "video"
    ) {

      event.preventDefault();

      videoEditor.duplicateSelectedClip();
    }
  }
);
