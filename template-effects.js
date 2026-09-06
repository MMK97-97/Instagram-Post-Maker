/* =========================================================
   FWCWL PROCEDURAL TEMPLATE EFFECTS
   No external texture files required.
========================================================= */

import {
  Rect,
  Circle,
  Line,
  FabricImage,
  Shadow
} from "https://cdn.jsdelivr.net/npm/fabric@6.6.5/+esm";


/* =========================================================
   MAIN
========================================================= */

export async function applyTemplateEffects(
  editor,
  template
) {

  if (
    !template.templateStyle
  ) {
    return;
  }


  const canvas =
    editor.canvas;


  const width =
    canvas.width;


  const height =
    canvas.height;


  /* texture first */

  if (
    template.texture
  ) {

    const texture =
      await createTextureLayer(
        editor,
        template
      );


    if (texture) {

      canvas.add(
        texture
      );


      editor.moveObjectToIndex(
        texture,
        1
      );
    }
  }


  /* decorative geometry */

  addDecorativeLayers(
    editor,
    template
  );


  /* border / frame */

  addFrame(
    editor,
    template
  );


  canvas.requestRenderAll();
}



/* =========================================================
   TEXTURE GENERATOR
========================================================= */

async function createTextureLayer(
  editor,
  template
) {

  const width =
    editor.canvas.width;


  const height =
    editor.canvas.height;


  const source =
    document.createElement(
      "canvas"
    );


  /*
   * We deliberately create the texture at a reduced
   * resolution. It keeps performance high while still
   * looking organic once stretched over a 1080px poster.
   */

  const textureWidth =
    540;


  const textureHeight =
    Math.max(
      540,
      Math.round(
        textureWidth *
        height /
        width
      )
    );


  source.width =
    textureWidth;


  source.height =
    textureHeight;


  const ctx =
    source.getContext(
      "2d"
    );


  const random =
    seededRandom(
      template.seed ||
      100
    );


  switch (
    template.texture
  ) {

    case "grunge":

      drawNoise(
        ctx,
        textureWidth,
        textureHeight,
        random,
        0.65
      );

      drawScratches(
        ctx,
        textureWidth,
        textureHeight,
        random,
        130
      );

      drawDust(
        ctx,
        textureWidth,
        textureHeight,
        random,
        210
      );

      break;


    case "concrete":

      drawConcrete(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "aged-paper":

      drawAgedPaper(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "paper-fibers":

      drawPaperFibers(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "newspaper":

      drawPaperFibers(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      drawPrintNoise(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "halftone":

      drawHalftone(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "chalk":

      drawChalk(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "blueprint":

      drawBlueprint(
        ctx,
        textureWidth,
        textureHeight
      );

      break;


    case "paint":

      drawPaint(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "scratched-metal":

      drawMetal(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "ripped-poster":

      drawPaperFibers(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      drawRips(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "dust":

      drawNoise(
        ctx,
        textureWidth,
        textureHeight,
        random,
        0.5
      );

      drawDust(
        ctx,
        textureWidth,
        textureHeight,
        random,
        420
      );

      break;


    case "film-grain":

      drawFilmGrain(
        ctx,
        textureWidth,
        textureHeight,
        random
      );

      break;


    case "black-paper":

      drawPaperFibers(
        ctx,
        textureWidth,
        textureHeight,
        random,
        true
      );

      break;


    case "grain":

    case "noise":

    case "paper":

    default:

      drawNoise(
        ctx,
        textureWidth,
        textureHeight,
        random,
        0.5
      );

      break;
  }


  const dataUrl =
    source.toDataURL(
      "image/png"
    );


  const image =
    await FabricImage.fromURL(
      dataUrl
    );


  image.set({

    left:
      0,

    top:
      0,

    originX:
      "left",

    originY:
      "top",

    scaleX:
      width /
      image.width,

    scaleY:
      height /
      image.height,

    selectable:
      false,

    evented:
      false,

    opacity:
      template.textureStrength ??
      0.45,

    globalCompositeOperation:
      getTextureBlendMode(
        template.texture
      )

  });


  image.id =
    crypto.randomUUID();


  image.name =
    `${template.name} Texture`;


  image.typeLabel =
    "texture";


  image.isTemplateDecoration =
    true;


  return image;
}



/* =========================================================
   TEXTURE TYPES
========================================================= */

function drawNoise(
  ctx,
  width,
  height,
  random,
  intensity = 0.5
) {

  const image =
    ctx.createImageData(
      width,
      height
    );


  for (
    let i = 0;
    i < image.data.length;
    i += 4
  ) {

    const value =
      Math.floor(
        random() *
        255
      );


    const alpha =
      Math.floor(
        random() *
        35 *
        intensity
      );


    image.data[i] =
      value;

    image.data[i + 1] =
      value;

    image.data[i + 2] =
      value;

    image.data[i + 3] =
      alpha;
  }


  ctx.putImageData(
    image,
    0,
    0
  );
}



function drawScratches(
  ctx,
  width,
  height,
  random,
  count
) {

  ctx.save();


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const x =
      random() *
      width;


    const y =
      random() *
      height;


    const length =
      15 +
      random() *
      160;


    ctx.strokeStyle =
      `rgba(
        255,
        255,
        255,
        ${
          0.015 +
          random() *
          0.10
        }
      )`;


    ctx.lineWidth =
      0.4 +
      random() *
      1.5;


    ctx.beginPath();


    ctx.moveTo(
      x,
      y
    );


    ctx.lineTo(
      x +
      length,
      y +
      (
        random() -
        0.5
      ) *
      12
    );


    ctx.stroke();
  }


  ctx.restore();
}



function drawDust(
  ctx,
  width,
  height,
  random,
  count
) {

  ctx.save();


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const radius =
      0.5 +
      random() *
      4;


    ctx.beginPath();


    ctx.arc(
      random() *
      width,

      random() *
      height,

      radius,

      0,

      Math.PI *
      2
    );


    const white =
      random() >
      0.45;


    ctx.fillStyle =
      white
        ? `rgba(
            255,
            248,
            228,
            ${
              0.02 +
              random() *
              0.13
            }
          )`
        : `rgba(
            0,
            0,
            0,
            ${
              0.02 +
              random() *
              0.10
            }
          )`;


    ctx.fill();
  }


  ctx.restore();
}



function drawConcrete(
  ctx,
  width,
  height,
  random
) {

  drawNoise(
    ctx,
    width,
    height,
    random,
    0.75
  );


  ctx.save();


  for (
    let i = 0;
    i < 80;
    i++
  ) {

    const gradient =
      ctx.createRadialGradient(

        random() *
        width,

        random() *
        height,

        0,

        random() *
        width,

        random() *
        height,

        15 +
        random() *
        120
      );


    gradient.addColorStop(
      0,
      `rgba(
        255,
        255,
        255,
        ${
          random() *
          0.035
        }
      )`
    );


    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }


  drawScratches(
    ctx,
    width,
    height,
    random,
    60
  );


  ctx.restore();
}



function drawAgedPaper(
  ctx,
  width,
  height,
  random
) {

  ctx.fillStyle =
    "rgba(117,77,35,.13)";


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  drawPaperFibers(
    ctx,
    width,
    height,
    random
  );


  for (
    let i = 0;
    i < 90;
    i++
  ) {

    const x =
      random() *
      width;


    const y =
      random() *
      height;


    const radius =
      10 +
      random() *
      60;


    const gradient =
      ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      );


    gradient.addColorStop(
      0,
      `rgba(
        84,
        49,
        20,
        ${
          random() *
          0.10
        }
      )`
    );


    gradient.addColorStop(
      1,
      "rgba(84,49,20,0)"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );
  }
}



function drawPaperFibers(
  ctx,
  width,
  height,
  random,
  dark = false
) {

  for (
    let i = 0;
    i < 2000;
    i++
  ) {

    const alpha =
      random() *
      0.045;


    ctx.strokeStyle =
      dark
        ? `rgba(
            255,
            255,
            255,
            ${alpha}
          )`
        : `rgba(
            72,
            51,
            32,
            ${alpha}
          )`;


    const x =
      random() *
      width;


    const y =
      random() *
      height;


    ctx.beginPath();


    ctx.moveTo(
      x,
      y
    );


    ctx.lineTo(
      x +
      2 +
      random() *
      14,

      y +
      (
        random() -
        0.5
      ) *
      3
    );


    ctx.stroke();
  }
}



function drawPrintNoise(
  ctx,
  width,
  height,
  random
) {

  ctx.save();


  ctx.fillStyle =
    "rgba(0,0,0,.05)";


  for (
    let y = 10;
    y < height;
    y += 18
  ) {

    for (
      let x = 8;
      x < width;
      x += 15
    ) {

      if (
        random() >
        0.18
      ) {

        ctx.fillRect(
          x,
          y,
          1.2,
          1.2
        );
      }
    }
  }


  ctx.restore();
}



function drawHalftone(
  ctx,
  width,
  height,
  random
) {

  ctx.save();


  const spacing =
    12;


  for (
    let y = 0;
    y < height;
    y += spacing
  ) {

    for (
      let x = 0;
      x < width;
      x += spacing
    ) {

      const distance =
        Math.hypot(
          x - width *
          0.75,
          y - height *
          0.34
        );


      const radius =
        Math.max(
          0.5,
          3.5 -
          distance /
          180
        );


      ctx.beginPath();


      ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI *
        2
      );


      ctx.fillStyle =
        `rgba(
          255,
          255,
          255,
          ${
            0.08 +
            random() *
            0.13
          }
        )`;


      ctx.fill();
    }
  }


  ctx.restore();
}



function drawChalk(
  ctx,
  width,
  height,
  random
) {

  drawNoise(
    ctx,
    width,
    height,
    random,
    0.35
  );


  ctx.save();


  for (
    let i = 0;
    i < 180;
    i++
  ) {

    ctx.strokeStyle =
      `rgba(
        255,
        255,
        244,
        ${
          0.015 +
          random() *
          0.06
        }
      )`;


    ctx.lineWidth =
      0.8 +
      random() *
      2;


    const x =
      random() *
      width;


    const y =
      random() *
      height;


    ctx.beginPath();


    ctx.moveTo(
      x,
      y
    );


    ctx.lineTo(
      x +
      (
        random() -
        0.5
      ) *
      120,

      y +
      (
        random() -
        0.5
      ) *
      120
    );


    ctx.stroke();
  }


  ctx.restore();
}



function drawBlueprint(
  ctx,
  width,
  height
) {

  ctx.save();


  ctx.strokeStyle =
    "rgba(133,201,230,.12)";


  ctx.lineWidth =
    1;


  const step =
    22;


  for (
    let x = 0;
    x < width;
    x += step
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x,
      0
    );

    ctx.lineTo(
      x,
      height
    );

    ctx.stroke();
  }


  for (
    let y = 0;
    y < height;
    y += step
  ) {

    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    ctx.lineTo(
      width,
      y
    );

    ctx.stroke();
  }


  ctx.strokeStyle =
    "rgba(133,201,230,.22)";


  for (
    let x = 0;
    x < width;
    x += step * 5
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x,
      0
    );

    ctx.lineTo(
      x,
      height
    );

    ctx.stroke();
  }


  ctx.restore();
}



function drawPaint(
  ctx,
  width,
  height,
  random
) {

  ctx.save();


  for (
    let i = 0;
    i < 22;
    i++
  ) {

    const y =
      random() *
      height;


    const start =
      -40 +
      random() *
      120;


    const brushWidth =
      5 +
      random() *
      24;


    ctx.lineWidth =
      brushWidth;


    ctx.lineCap =
      "round";


    ctx.strokeStyle =
      random() >
      0.5
        ? `rgba(
            255,
            255,
            255,
            ${
              0.02 +
              random() *
              0.10
            }
          )`
        : `rgba(
            0,
            0,
            0,
            ${
              0.03 +
              random() *
              0.12
            }
          )`;


    ctx.beginPath();


    ctx.moveTo(
      start,
      y
    );


    ctx.lineTo(
      width *
      (
        0.4 +
        random() *
        0.7
      ),
      y +
      (
        random() -
        0.5
      ) *
      40
    );


    ctx.stroke();
  }


  ctx.restore();
}



function drawMetal(
  ctx,
  width,
  height,
  random
) {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      0
    );


  gradient.addColorStop(
    0,
    "rgba(255,255,255,.03)"
  );


  gradient.addColorStop(
    0.5,
    "rgba(255,255,255,.13)"
  );


  gradient.addColorStop(
    1,
    "rgba(0,0,0,.10)"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  drawScratches(
    ctx,
    width,
    height,
    random,
    300
  );


  drawNoise(
    ctx,
    width,
    height,
    random,
    0.25
  );
}



function drawRips(
  ctx,
  width,
  height,
  random
) {

  ctx.save();


  ctx.strokeStyle =
    "rgba(255,255,255,.18)";


  for (
    let i = 0;
    i < 15;
    i++
  ) {

    const y =
      random() *
      height;


    ctx.lineWidth =
      1 +
      random() *
      5;


    ctx.beginPath();


    ctx.moveTo(
      0,
      y
    );


    for (
      let x = 0;
      x <= width;
      x += 20
    ) {

      ctx.lineTo(
        x,
        y +
        (
          random() -
          0.5
        ) *
        13
      );
    }


    ctx.stroke();
  }


  ctx.restore();
}



function drawFilmGrain(
  ctx,
  width,
  height,
  random
) {

  drawNoise(
    ctx,
    width,
    height,
    random,
    0.9
  );


  ctx.save();


  for (
    let i = 0;
    i < 15;
    i++
  ) {

    const x =
      random() *
      width;


    ctx.fillStyle =
      `rgba(
        255,
        255,
        255,
        ${
          0.01 +
          random() *
          0.04
        }
      )`;


    ctx.fillRect(
      x,
      0,
      1 +
      random() *
      2,
      height
    );
  }


  ctx.restore();
}



/* =========================================================
   DECORATIVE LAYERS
========================================================= */

function addDecorativeLayers(
  editor,
  template
) {

  const style =
    template.decorativeStyle;


  switch (
    style
  ) {

    case "slashes":

      addSlashes(
        editor,
        template
      );

      break;


    case "paper-strips":

      addPaperStrips(
        editor,
        template
      );

      break;


    case "industrial-bars":

      addIndustrialBars(
        editor,
        template
      );

      break;


    case "stamp":

      addStampDecoration(
        editor,
        template
      );

      break;


    case "columns":

      addEditorialColumns(
        editor,
        template
      );

      break;


    case "circles":

      addHalftoneCircles(
        editor,
        template
      );

      break;


    case "chalk-lines":

      addChalkLines(
        editor,
        template
      );

      break;


    case "grid":

      addGridDetails(
        editor,
        template
      );

      break;


    case "paint-strokes":

      addPaintLayers(
        editor,
        template
      );

      break;


    case "rivets":

      addRivets(
        editor,
        template
      );

      break;


    case "ripped-blocks":

      addRippedBlocks(
        editor,
        template
      );

      break;


    case "confetti":

      addConfetti(
        editor,
        template
      );

      break;


    case "perforation":

      addTicketDetails(
        editor,
        template
      );

      break;


    case "journal":

      addJournalLines(
        editor,
        template
      );

      break;


    case "brutalist":

      addBrutalistLayers(
        editor,
        template
      );

      break;


    case "film":

      addFilmDetails(
        editor,
        template
      );

      break;


    case "ink":

      addInkStamp(
        editor,
        template
      );

      break;


    case "lights":

      addStadiumLights(
        editor,
        template
      );

      break;


    case "earth":

      addEarthLayers(
        editor,
        template
      );

      break;


    case "gold-slashes":

      addGoldSlashes(
        editor,
        template
      );

      break;


    case "collage":

      addCollageLayers(
        editor,
        template
      );

      break;


    case "sunset":

      addRetroSun(
        editor,
        template
      );

      break;


    case "tactics":

      addTacticalLines(
        editor,
        template
      );

      break;


    case "archive":

      addArchiveLayers(
        editor,
        template
      );

      break;
  }
}



/* =========================================================
   COMMON LAYER CREATION
========================================================= */

function addDecoration(
  editor,
  object,
  name
) {

  object.id =
    crypto.randomUUID();


  object.name =
    name;


  object.typeLabel =
    "decoration";


  object.isTemplateDecoration =
    true;


  /*
   * Locked by default but still visible inside Layers.
   * This avoids accidental movement while designing.
   */

  object.selectable =
    false;


  object.evented =
    false;


  editor.canvas.add(
    object
  );


  /*
   * Keep below content but above base texture/background.
   */

  const index =
    Math.min(
      3,
      editor.canvas
        .getObjects()
        .length -
      1
    );


  editor.moveObjectToIndex(
    object,
    index
  );
}



/* =========================================================
   DECORATION SETS
========================================================= */

function addSlashes(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  const h =
    editor.canvas.height;


  for (
    let i = 0;
    i < 5;
    i++
  ) {

    const rect =
      new Rect({

        left:
          w *
          0.70 +
          i *
          45,

        top:
          -80,

        width:
          35,

        height:
          h *
          0.56,

        angle:
          18,

        fill:
          i % 2
            ? template.accent2
            : template.accent,

        opacity:
          i === 0
            ? 0.34
            : 0.12

      });


    addDecoration(
      editor,
      rect,
      `Grunge Slash ${i + 1}`
    );
  }
}



function addPaperStrips(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  const blocks = [

    {
      left: -40,
      top: 240,
      width: w * .55,
      height: 130,
      angle: -4
    },

    {
      left: w * .54,
      top: 590,
      width: w * .54,
      height: 160,
      angle: 5
    }

  ];


  blocks.forEach(
    (
      item,
      index
    ) => {

      const rect =
        new Rect({

          ...item,

          fill:
            index === 0
              ? template.accent2
              : "#E5DDCE",

          opacity:
            index === 0
              ? .22
              : .12

        });


      addDecoration(
        editor,
        rect,
        `Paper Layer ${index + 1}`
      );
    }
  );
}



function addIndustrialBars(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  const h =
    editor.canvas.height;


  const topBar =
    new Rect({

      left: 0,
      top: h * .22,
      width: w,
      height: 24,
      fill: template.accent,
      opacity: .65

    });


  addDecoration(
    editor,
    topBar,
    "Industrial Gold Bar"
  );


  const side =
    new Rect({

      left: w - 130,
      top: 0,
      width: 130,
      height: h,
      fill: template.accent2,
      opacity: .10

    });


  addDecoration(
    editor,
    side,
    "Industrial Side Panel"
  );
}



function addStampDecoration(
  editor,
  template
) {

  const circle =
    new Circle({

      left:
        editor.canvas.width *
        .68,

      top:
        editor.canvas.height *
        .17,

      radius:
        155,

      fill:
        "rgba(0,0,0,0)",

      stroke:
        template.accent,

      strokeWidth:
        8,

      opacity:
        .24

    });


  addDecoration(
    editor,
    circle,
    "Vintage Stamp"
  );
}



function addEditorialColumns(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  const h =
    editor.canvas.height;


  for (
    let i = 1;
    i <= 3;
    i++
  ) {

    const x =
      w *
      (
        .23 *
        i
      );


    const line =
      new Line(

        [
          x,
          h * .12,
          x,
          h * .90
        ],

        {
          stroke:
            "#201D17",

          strokeWidth:
            2,

          opacity:
            .13
        }

      );


    addDecoration(
      editor,
      line,
      `Editorial Column ${i}`
    );
  }
}



function addHalftoneCircles(
  editor,
  template
) {

  for (
    let i = 0;
    i < 5;
    i++
  ) {

    const circle =
      new Circle({

        left:
          editor.canvas.width *
          (
            .58 +
            i *
            .045
          ),

        top:
          editor.canvas.height *
          (
            .16 +
            i *
            .045
          ),

        radius:
          120 +
          i *
          35,

        fill:
          "rgba(0,0,0,0)",

        stroke:
          template.accent,

        strokeWidth:
          4,

        opacity:
          .08

      });


    addDecoration(
      editor,
      circle,
      `Halftone Ring ${i + 1}`
    );
  }
}



function addChalkLines(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  const h =
    editor.canvas.height;


  const lines = [

    [
      w * .66,
      h * .15,
      w * .92,
      h * .31
    ],

    [
      w * .61,
      h * .20,
      w * .90,
      h * .44
    ],

    [
      w * .68,
      h * .54,
      w * .91,
      h * .74
    ]

  ];


  lines.forEach(
    (
      points,
      index
    ) => {

      const line =
        new Line(

          points,

          {
            stroke:
              "#F3EFE4",

            strokeWidth:
              3,

            opacity:
              .12,

            strokeDashArray:
              [
                14,
                12
              ]
          }

        );


      addDecoration(
        editor,
        line,
        `Chalk Diagram ${index + 1}`
      );
    }
  );
}



function addGridDetails(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  const h =
    editor.canvas.height;


  const cross1 =
    new Line(

      [
        w * .70,
        h * .16,
        w * .92,
        h * .38
      ],

      {
        stroke:
          template.accent2,

        strokeWidth:
          2,

        opacity:
          .32
      }

    );


  addDecoration(
    editor,
    cross1,
    "Blueprint Diagonal"
  );


  const cross2 =
    new Line(

      [
        w * .92,
        h * .16,
        w * .70,
        h * .38
      ],

      {
        stroke:
          template.accent2,

        strokeWidth:
          2,

        opacity:
          .32
      }

    );


  addDecoration(
    editor,
    cross2,
    "Blueprint Cross"
  );
}



function addPaintLayers(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  const h =
    editor.canvas.height;


  const colors = [

    template.accent2,

    template.accent,

    "#FFFFFF"

  ];


  colors.forEach(
    (
      color,
      index
    ) => {

      const rect =
        new Rect({

          left:
            w *
            .49,

          top:
            h *
            (
              .20 +
              index *
              .085
            ),

          width:
            w *
            .58,

          height:
            100 +
            index *
            30,

          angle:
            -9 +
            index *
            5,

          fill:
            color,

          opacity:
            index === 0
              ? .23
              : .10,

          rx:
            8,

          ry:
            8

        });


      addDecoration(
        editor,
        rect,
        `Paint Stroke ${index + 1}`
      );
    }
  );
}



function addRivets(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  const h =
    editor.canvas.height;


  const positions = [

    [
      45,
      45
    ],

    [
      w - 65,
      45
    ],

    [
      45,
      h - 65
    ],

    [
      w - 65,
      h - 65
    ]

  ];


  positions.forEach(
    (
      point,
      index
    ) => {

      const circle =
        new Circle({

          left:
            point[0],

          top:
            point[1],

          radius:
            11,

          fill:
            "#8F9296",

          stroke:
            "#161718",

          strokeWidth:
            3,

          opacity:
            .45,

          shadow:
            new Shadow({

              color:
                "rgba(0,0,0,.5)",

              blur:
                8,

              offsetY:
                4

            })

        });


      addDecoration(
        editor,
        circle,
        `Metal Rivet ${index + 1}`
      );
    }
  );
}



function addRippedBlocks(
  editor,
  template
) {

  const rect =
    new Rect({

      left:
        editor.canvas.width *
        .55,

      top:
        editor.canvas.height *
        .13,

      width:
        editor.canvas.width *
        .52,

      height:
        editor.canvas.height *
        .25,

      angle:
        6,

      fill:
        template.accent2,

      opacity:
        .22

    });


  addDecoration(
    editor,
    rect,
    "Ripped Poster Layer"
  );
}



function addConfetti(
  editor,
  template
) {

  const random =
    seededRandom(
      template.seed +
      300
    );


  for (
    let i = 0;
    i < 26;
    i++
  ) {

    const rect =
      new Rect({

        left:
          random() *
          editor.canvas.width,

        top:
          random() *
          editor.canvas.height *
          .45,

        width:
          6 +
          random() *
          14,

        height:
          28 +
          random() *
          45,

        angle:
          random() *
          180,

        fill:
          random() >
          .45
            ? template.accent
            : template.accent2,

        opacity:
          .16 +
          random() *
          .28

      });


    addDecoration(
      editor,
      rect,
      `Championship Confetti ${i + 1}`
    );
  }
}



function addTicketDetails(
  editor,
  template
) {

  const x =
    editor.canvas.width *
    .70;


  const line =
    new Line(

      [
        x,
        90,
        x,
        editor.canvas.height -
        90
      ],

      {
        stroke:
          "#5E4832",

        strokeWidth:
          3,

        strokeDashArray:
          [
            12,
            12
          ],

        opacity:
          .30
      }

    );


  addDecoration(
    editor,
    line,
    "Ticket Perforation"
  );
}



function addJournalLines(
  editor,
  template
) {

  for (
    let i = 0;
    i < 4;
    i++
  ) {

    const line =
      new Line(

        [
          78,
          editor.canvas.height *
          (
            .15 +
            i *
            .045
          ),

          editor.canvas.width -
          78,

          editor.canvas.height *
          (
            .15 +
            i *
            .045
          )
        ],

        {
          stroke:
            "#403A31",

          strokeWidth:
            2,

          opacity:
            .12
        }

      );


    addDecoration(
      editor,
      line,
      `Journal Rule ${i + 1}`
    );
  }
}



function addBrutalistLayers(
  editor,
  template
) {

  const blocks = [

    {
      left: 0,
      top: 260,
      width: 220,
      height: 64,
      fill: template.accent
    },

    {
      left: 690,
      top: 190,
      width: 390,
      height: 150,
      fill: template.accent2
    },

    {
      left: 760,
      top: 760,
      width: 320,
      height: 25,
      fill: "#FFFFFF"
    }

  ];


  blocks.forEach(
    (
      item,
      index
    ) => {

      const rect =
        new Rect({

          ...item,

          opacity:
            index === 0
              ? .86
              : .20

        });


      addDecoration(
        editor,
        rect,
        `Brutalist Block ${index + 1}`
      );
    }
  );
}



function addFilmDetails(
  editor
) {

  const w =
    editor.canvas.width;


  const h =
    editor.canvas.height;


  const left =
    new Rect({

      left: 22,
      top: 0,
      width: 24,
      height: h,
      fill: "#000000",
      opacity: .38

    });


  addDecoration(
    editor,
    left,
    "Film Edge Left"
  );


  const right =
    new Rect({

      left: w - 46,
      top: 0,
      width: 24,
      height: h,
      fill: "#000000",
      opacity: .38

    });


  addDecoration(
    editor,
    right,
    "Film Edge Right"
  );
}



function addInkStamp(
  editor,
  template
) {

  const circle =
    new Circle({

      left:
        editor.canvas.width *
        .66,

      top:
        editor.canvas.height *
        .16,

      radius:
        175,

      fill:
        "rgba(0,0,0,0)",

      stroke:
        template.accent,

      strokeWidth:
        14,

      opacity:
        .22

    });


  addDecoration(
    editor,
    circle,
    "Ink Stamp Ring"
  );
}



function addStadiumLights(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  for (
    let i = 0;
    i < 6;
    i++
  ) {

    const circle =
      new Circle({

        left:
          w *
          .57 +
          i *
          60,

        top:
          110,

        radius:
          12,

        fill:
          "#FFFFFF",

        opacity:
          .68,

        shadow:
          new Shadow({

            color:
              "#FFFFFF",

            blur:
              40

          })

      });


    addDecoration(
      editor,
      circle,
      `Stadium Light ${i + 1}`
    );
  }
}



function addEarthLayers(
  editor,
  template
) {

  const rect =
    new Rect({

      left:
        editor.canvas.width *
        .60,

      top:
        -120,

      width:
        320,

      height:
        editor.canvas.height *
        .7,

      angle:
        22,

      fill:
        template.accent,

      opacity:
        .10

    });


  addDecoration(
    editor,
    rect,
    "Clay Accent"
  );
}



function addGoldSlashes(
  editor,
  template
) {

  for (
    let i = 0;
    i < 4;
    i++
  ) {

    const rect =
      new Rect({

        left:
          editor.canvas.width *
          .65 +
          i *
          38,

        top:
          90,

        width:
          22,

        height:
          editor.canvas.height *
          .44,

        angle:
          24,

        fill:
          template.accent,

        opacity:
          .12 +
          i *
          .025

      });


    addDecoration(
      editor,
      rect,
      `Gold Slash ${i + 1}`
    );
  }
}



function addCollageLayers(
  editor,
  template
) {

  const pieces = [

    {
      left: 590,
      top: 190,
      width: 380,
      height: 250,
      angle: -5,
      fill: template.accent2
    },

    {
      left: 660,
      top: 420,
      width: 310,
      height: 180,
      angle: 7,
      fill: "#E6DFD4"
    },

    {
      left: 730,
      top: 650,
      width: 250,
      height: 150,
      angle: -3,
      fill: template.accent
    }

  ];


  pieces.forEach(
    (
      piece,
      index
    ) => {

      const rect =
        new Rect({

          ...piece,

          opacity:
            index === 0
              ? .18
              : .10

        });


      addDecoration(
        editor,
        rect,
        `Collage Paper ${index + 1}`
      );
    }
  );
}



function addRetroSun(
  editor,
  template
) {

  const circle =
    new Circle({

      left:
        editor.canvas.width *
        .66,

      top:
        editor.canvas.height *
        .15,

      radius:
        205,

      fill:
        template.accent2,

      opacity:
        .28

    });


  addDecoration(
    editor,
    circle,
    "Retro Sunset"
  );


  for (
    let i = 0;
    i < 6;
    i++
  ) {

    const line =
      new Rect({

        left:
          editor.canvas.width *
          .61,

        top:
          editor.canvas.height *
          (
            .26 +
            i *
            .025
          ),

        width:
          430,

        height:
          8,

        fill:
          editor.state
            .backgroundColor,

        opacity:
          .55

      });


    addDecoration(
      editor,
      line,
      `Retro Sun Line ${i + 1}`
    );
  }
}



function addTacticalLines(
  editor,
  template
) {

  const w =
    editor.canvas.width;


  const h =
    editor.canvas.height;


  const circle =
    new Circle({

      left:
        w *
        .65,

      top:
        h *
        .18,

      radius:
        140,

      fill:
        "rgba(0,0,0,0)",

      stroke:
        template.accent2,

      strokeWidth:
        3,

      opacity:
        .18

    });


  addDecoration(
    editor,
    circle,
    "Tactical Circle"
  );


  const route =
    new Line(

      [
        w * .58,
        h * .56,
        w * .91,
        h * .31
      ],

      {
        stroke:
          "#FFFFFF",

        strokeWidth:
          3,

        strokeDashArray:
          [
            12,
            9
          ],

        opacity:
          .17
      }

    );


  addDecoration(
    editor,
    route,
    "Tactical Route"
  );
}



function addArchiveLayers(
  editor,
  template
) {

  const outer =
    new Rect({

      left: 46,
      top: 46,

      width:
        editor.canvas.width -
        92,

      height:
        editor.canvas.height -
        92,

      fill:
        "rgba(0,0,0,0)",

      stroke:
        template.accent2,

      strokeWidth:
        3,

      opacity:
        .34

    });


  addDecoration(
    editor,
    outer,
    "Archive Border"
  );


  const inner =
    new Rect({

      left: 60,
      top: 60,

      width:
        editor.canvas.width -
        120,

      height:
        editor.canvas.height -
        120,

      fill:
        "rgba(0,0,0,0)",

      stroke:
        "#413729",

      strokeWidth:
        1,

      opacity:
        .24

    });


  addDecoration(
    editor,
    inner,
    "Archive Inner Border"
  );
}



/* =========================================================
   FRAME SYSTEM
========================================================= */

function addFrame(
  editor,
  template
) {

  if (
    !template.frameStyle ||
    template.frameStyle ===
    "none"
  ) {
    return;
  }


  const width =
    editor.canvas.width;


  const height =
    editor.canvas.height;


  let stroke =
    template.accent;


  let strokeWidth =
    3;


  let opacity =
    .25;


  if (
    template.frameStyle ===
    "gold"
  ) {

    strokeWidth =
      5;

    opacity =
      .38;
  }


  if (
    template.frameStyle ===
    "vintage"
  ) {

    stroke =
      "#4B3D2C";

    strokeWidth =
      3;

    opacity =
      .35;
  }


  if (
    template.frameStyle ===
    "paper"
  ) {

    stroke =
      "#D7D0C3";

    strokeWidth =
      6;

    opacity =
      .18;
  }


  if (
    template.frameStyle ===
    "metal"
  ) {

    stroke =
      "#96999D";

    strokeWidth =
      5;

    opacity =
      .28;
  }


  const frame =
    new Rect({

      left:
        34,

      top:
        34,

      width:
        width -
        68,

      height:
        height -
        68,

      fill:
        "rgba(0,0,0,0)",

      stroke,

      strokeWidth,

      opacity,

      rx:
        2,

      ry:
        2

    });


  addDecoration(
    editor,
    frame,
    `${template.name} Frame`
  );
}



/* =========================================================
   UTILITIES
========================================================= */

function seededRandom(
  seed
) {

  let value =
    seed % 2147483647;


  if (
    value <=
    0
  ) {

    value +=
      2147483646;
  }


  return function () {

    value =
      value *
      16807 %
      2147483647;


    return (
      value -
      1
    ) /
    2147483646;
  };
}



function getTextureBlendMode(
  type
) {

  switch (
    type
  ) {

    case "aged-paper":

    case "paper-fibers":

    case "newspaper":

      return "multiply";


    case "black-paper":

    case "grunge":

    case "concrete":

    case "scratched-metal":

      return "overlay";


    case "halftone":

    case "chalk":

      return "screen";


    default:

      return "soft-light";
  }
}
