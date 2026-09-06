/* ============================================================
   FWCWL VIDEO EFFECTS
============================================================ */

export const EFFECT_PRESETS = {
  clean: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    vibrance: 0,
    blur: 0,
    vignette: 8,
    grain: 0
  },

  stadium: {
    brightness: 4,
    contrast: 20,
    saturation: 12,
    vibrance: 18,
    blur: 0,
    vignette: 28,
    grain: 4
  },

  dramatic: {
    brightness: -3,
    contrast: 34,
    saturation: 5,
    vibrance: 22,
    blur: 0,
    vignette: 42,
    grain: 9
  },

  night: {
    brightness: -8,
    contrast: 28,
    saturation: -8,
    vibrance: 8,
    blur: 0,
    vignette: 48,
    grain: 6
  },

  vintage: {
    brightness: 4,
    contrast: -5,
    saturation: -28,
    vibrance: -14,
    blur: 0,
    vignette: 30,
    grain: 24
  },

  mono: {
    brightness: 2,
    contrast: 28,
    saturation: -100,
    vibrance: 0,
    blur: 0,
    vignette: 36,
    grain: 12
  }
};

export function createFilterString(
  effects = {},
  blur = 0
) {
  const brightness =
    100 +
    Number(
      effects.brightness ||
      0
    );

  const contrast =
    100 +
    Number(
      effects.contrast ||
      0
    );

  const saturation =
    100 +
    Number(
      effects.saturation ||
      0
    ) +
    Number(
      effects.vibrance ||
      0
    ) *
    0.45;

  const blurAmount =
    Math.max(
      Number(
        effects.blur ||
        0
      ),
      blur || 0
    );

  return [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${Math.max(0, saturation)}%)`,
    `blur(${blurAmount}px)`
  ].join(" ");
}

export function drawVignette(
  ctx,
  width,
  height,
  amount = 0
) {
  if (amount <= 0) return;

  const strength =
    Math.min(
      0.85,
      amount /
      100
    );

  const gradient =
    ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(
        width,
        height
      ) * 0.15,
      width / 2,
      height / 2,
      Math.max(
        width,
        height
      ) * 0.68
    );

  gradient.addColorStop(
    0,
    "rgba(0,0,0,0)"
  );

  gradient.addColorStop(
    0.62,
    "rgba(0,0,0,0.04)"
  );

  gradient.addColorStop(
    1,
    `rgba(0,0,0,${strength})`
  );

  ctx.save();

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  ctx.restore();
}

export function drawGrain(
  ctx,
  width,
  height,
  amount = 0,
  time = 0
) {
  if (amount <= 0) return;

  const count =
    Math.round(
      amount *
      18
    );

  const alpha =
    Math.min(
      0.13,
      amount /
      650
    );

  ctx.save();

  ctx.globalAlpha =
    alpha;

  for (
    let index = 0;
    index < count;
    index++
  ) {
    const seed =
      Math.sin(
        index *
        91.91 +
        time *
        43.17
      ) *
      10000;

    const x =
      Math.abs(seed % 1) *
      width;

    const y =
      Math.abs(
        Math.sin(
          seed *
          0.73
        )
      ) *
      height;

    const size =
      1 +
      Math.abs(
        Math.sin(
          seed
        )
      ) *
      3;

    ctx.fillStyle =
      index % 3 === 0
        ? "#ffffff"
        : "#000000";

    ctx.fillRect(
      x,
      y,
      size,
      size
    );
  }

  ctx.restore();
}

export function drawLightSweep(
  ctx,
  width,
  height,
  time,
  accent = "#f1c34d"
) {
  const cycle =
    (
      time %
      3.4
    ) /
    3.4;

  const x =
    -width * 0.5 +
    cycle *
    width *
    2;

  const gradient =
    ctx.createLinearGradient(
      x,
      0,
      x +
      width * 0.38,
      0
    );

  gradient.addColorStop(
    0,
    "rgba(255,255,255,0)"
  );

  gradient.addColorStop(
    0.48,
    hexToRgba(
      accent,
      0.16
    )
  );

  gradient.addColorStop(
    0.52,
    "rgba(255,255,255,.20)"
  );

  gradient.addColorStop(
    1,
    "rgba(255,255,255,0)"
  );

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";

  ctx.translate(
    width / 2,
    height / 2
  );

  ctx.rotate(
    -0.22
  );

  ctx.translate(
    -width / 2,
    -height / 2
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    -width,
    -height,
    width * 3,
    height * 3
  );

  ctx.restore();
}

export function hexToRgba(
  hex,
  alpha
) {
  let value =
    String(hex || "#ffffff")
      .replace("#", "");

  if (value.length === 3) {
    value =
      value
        .split("")
        .map(char => char + char)
        .join("");
  }

  const parsed =
    Number.parseInt(
      value,
      16
    );

  if (
    Number.isNaN(parsed)
  ) {
    return `rgba(255,255,255,${alpha})`;
  }

  return `rgba(${
    (parsed >> 16) & 255
  },${
    (parsed >> 8) & 255
  },${
    parsed & 255
  },${alpha})`;
}
