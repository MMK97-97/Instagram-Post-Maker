import {
  PosterEditor
} from "./poster-editor.js";

import {
  VideoEditor
} from "./video-editor.js";


await document.fonts.ready;


const posterEditor =
  new PosterEditor();


const videoEditor =
  new VideoEditor();


let activeStudio =
  "poster";


const posterModeBtn =
  document.getElementById(
    "posterModeBtn"
  );


const videoModeBtn =
  document.getElementById(
    "videoModeBtn"
  );


const projectNameInput =
  document.getElementById(
    "projectName"
  );


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
  () =>
    switchStudio(
      "poster"
    )
);


videoModeBtn.addEventListener(
  "click",
  () =>
    switchStudio(
      "video"
    )
);


function switchStudio(
  mode
) {

  activeStudio =
    mode;


  const poster =
    mode ===
    "poster";


  posterModeBtn.classList.toggle(
    "active",
    poster
  );


  videoModeBtn.classList.toggle(
    "active",
    !poster
  );


  document
    .getElementById(
      "posterLeftPanel"
    )
    .classList.toggle(
      "hidden",
      !poster
    );


  document
    .getElementById(
      "videoLeftPanel"
    )
    .classList.toggle(
      "hidden",
      poster
    );


  document
    .getElementById(
      "posterWorkspace"
    )
    .classList.toggle(
      "hidden",
      !poster
    );


  document
    .getElementById(
      "videoWorkspace"
    )
    .classList.toggle(
      "hidden",
      poster
    );


  document
    .getElementById(
      "posterRightPanel"
    )
    .classList.toggle(
      "hidden",
      !poster
    );


  document
    .getElementById(
      "videoRightPanel"
    )
    .classList.toggle(
      "hidden",
      poster
    );


  document
    .querySelectorAll(
      ".poster-only-control"
    )
    .forEach(
      element => {

        element.classList.toggle(
          "hidden",
          !poster
        );
      }
    );


  document
    .querySelectorAll(
      ".video-only-control"
    )
    .forEach(
      element => {

        element.classList.toggle(
          "hidden",
          poster
        );
      }
    );


  if (poster) {

    videoEditor.pause();

    posterEditor.canvas
      .requestRenderAll();

  } else {

    posterEditor.setDrawingMode(
      false
    );

    videoEditor.renderFrame();
  }
}


/* =========================================================
   GLOBAL UNDO / REDO
========================================================= */

document
  .getElementById(
    "undoGlobalBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (
        activeStudio ===
        "poster"
      ) {

        await posterEditor.undo();

      } else {

        videoEditor.undo();
      }
    }
  );


document
  .getElementById(
    "redoGlobalBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (
        activeStudio ===
        "poster"
      ) {

        await posterEditor.redo();

      } else {

        videoEditor.redo();
      }
    }
  );


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

window.addEventListener(
  "keydown",
  async event => {

    const editing =
      event.target instanceof
        HTMLInputElement ||
      event.target instanceof
        HTMLTextAreaElement ||
      event.target instanceof
        HTMLSelectElement;


    const command =
      event.ctrlKey ||
      event.metaKey;


    if (
      command &&
      event.key
        .toLowerCase() ===
        "z"
    ) {

      if (editing) return;


      event.preventDefault();


      if (
        activeStudio ===
        "poster"
      ) {

        if (
          event.shiftKey
        ) {

          await posterEditor.redo();

        } else {

          await posterEditor.undo();
        }

      } else {

        if (
          event.shiftKey
        ) {

          videoEditor.redo();

        } else {

          videoEditor.undo();
        }
      }


      return;
    }


    if (
      command &&
      event.key
        .toLowerCase() ===
        "y"
    ) {

      if (editing) return;


      event.preventDefault();


      if (
        activeStudio ===
        "poster"
      ) {

        await posterEditor.redo();

      } else {

        videoEditor.redo();
      }


      return;
    }


    if (
      activeStudio ===
      "poster"
    ) {

      posterEditor.handleKeyboard(
        event
      );

      return;
    }


    if (editing) return;


    if (
      event.code ===
      "Space"
    ) {

      event.preventDefault();

      videoEditor.togglePlayback();
    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      event.preventDefault();

      videoEditor.seekRelative(
        event.shiftKey
          ? -1
          : -.1
      );
    }


    if (
      event.key ===
      "ArrowRight"
    ) {

      event.preventDefault();

      videoEditor.seekRelative(
        event.shiftKey
          ? 1
          : .1
      );
    }


    if (
      event.key
        .toLowerCase() ===
        "s"
    ) {

      event.preventDefault();

      videoEditor.splitSelectedClip();
    }


    if (
      event.key ===
        "Delete" ||
      event.key ===
        "Backspace"
    ) {

      event.preventDefault();

      videoEditor.deleteSelectedClip();
    }


    if (
      command &&
      event.key
        .toLowerCase() ===
        "d"
    ) {

      event.preventDefault();

      videoEditor.duplicateSelectedClip();
    }
  }
);
