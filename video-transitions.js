/* ============================================================
   FWCWL VIDEO MOTION ENGINE
============================================================ */

export const ANIMATIONS = [
  "none",
  "fade",
  "fadeUp",
  "fadeDown",
  "slideLeft",
  "slideRight",
  "impactZoom",
  "sportsSlam",
  "trackingIn",
  "blurIn",
  "blurOut",
  "slowZoom",
  "pushIn",
  "pullOut",
  "heroRise",
  "pulse"
];

export const TRANSITIONS = [
  "none",
  "fade",
  "goldFlash",
  "whiteFlash",
  "whipLeft",
  "whipRight",
  "pushLeft",
  "pushRight",
  "zoomImpact",
  "blurZoom",
  "diagonalWipe",
  "sportsSlash",
  "stadiumFlash",
  "blackFade"
];

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInCubic(t) {
  return t * t * t;
}

export function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function clipLifeProgress(clip, time) {
  if (!clip || clip.duration <= 0) return 0;

  return clamp(
    (time - clip.start) /
      clip.duration
  );
}

export function animationState(
  animation,
  progress,
  phase = "in"
) {
  const p = clamp(progress);

  const state = {
    alpha: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    blur: 0,
    tracking: 0
  };

  const inPhase =
    phase === "in";

  const q =
    inPhase
      ? p
      : 1 - p;

  switch (animation) {
    case "fade":
      state.alpha =
        easeOutCubic(q);
      break;

    case "fadeUp":
      state.alpha =
        easeOutCubic(q);

      state.y =
        (1 - easeOutCubic(q)) *
        90;
      break;

    case "fadeDown":
      state.alpha =
        easeOutCubic(q);

      state.y =
        -(1 - easeOutCubic(q)) *
        90;
      break;

    case "slideLeft":
      state.alpha =
        easeOutCubic(q);

      state.x =
        (1 - easeOutCubic(q)) *
        220;
      break;

    case "slideRight":
      state.alpha =
        easeOutCubic(q);

      state.x =
        -(1 - easeOutCubic(q)) *
        220;
      break;

    case "impactZoom":
      state.alpha =
        clamp(q * 2);

      state.scale =
        0.62 +
        easeOutBack(q) *
        0.38;
      break;

    case "sportsSlam":
      state.alpha =
        clamp(q * 2.5);

      state.scale =
        1.38 -
        easeOutBack(q) *
        0.38;

      state.x =
        -170 *
        (1 - easeOutCubic(q));
      break;

    case "trackingIn":
      state.alpha =
        easeOutCubic(q);

      state.tracking =
        90 *
        (1 - easeOutCubic(q));
      break;

    case "blurIn":
      state.alpha =
        easeOutCubic(q);

      state.blur =
        22 *
        (1 - easeOutCubic(q));

      state.scale =
        1.12 -
        0.12 *
        easeOutCubic(q);
      break;

    case "blurOut":
      if (inPhase) {
        return state;
      }

      state.alpha = q;
      state.blur =
        18 *
        (1 - q);
      state.scale =
        1 +
        0.08 *
        (1 - q);
      break;

    case "slowZoom":
      state.scale =
        1 +
        0.06 *
        p;
      break;

    case "pushIn":
      state.scale =
        1.08 -
        0.08 *
        easeOutCubic(p);
      break;

    case "pullOut":
      state.scale =
        1 +
        0.08 *
        easeOutCubic(p);
      break;

    case "heroRise":
      state.y =
        45 *
        (1 - easeOutCubic(p));

      state.scale =
        1.06 -
        0.06 *
        easeOutCubic(p);
      break;

    case "pulse":
      state.scale =
        1 +
        Math.sin(p * Math.PI * 2) *
        0.025;
      break;
  }

  return state;
}

export function getClipMotion(
  clip,
  time
) {
  const life =
    clipLifeProgress(
      clip,
      time
    );

  const inDuration =
    Math.min(
      0.55,
      clip.duration * 0.22
    );

  const outDuration =
    Math.min(
      0.45,
      clip.duration * 0.18
    );

  const localTime =
    time - clip.start;

  const remaining =
    clip.start +
    clip.duration -
    time;

  let result = {
    alpha: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    blur: 0,
    tracking: 0
  };

  if (
    clip.animationIn &&
    clip.animationIn !== "none" &&
    localTime < inDuration
  ) {
    result =
      animationState(
        clip.animationIn,
        clamp(
          localTime /
            inDuration
        ),
        "in"
      );
  } else if (
    clip.animationIn === "slowZoom" ||
    clip.animationIn === "pushIn" ||
    clip.animationIn === "pullOut" ||
    clip.animationIn === "heroRise" ||
    clip.animationIn === "pulse"
  ) {
    result =
      animationState(
        clip.animationIn,
        life,
        "in"
      );
  }

  if (
    clip.animationOut &&
    clip.animationOut !== "none" &&
    remaining < outDuration
  ) {
    const out =
      animationState(
        clip.animationOut,
        clamp(
          1 -
          remaining /
            outDuration
        ),
        "out"
      );

    result.alpha *=
      out.alpha;

    result.x +=
      out.x;

    result.y +=
      out.y;

    result.scale *=
      out.scale;

    result.rotation +=
      out.rotation;

    result.blur =
      Math.max(
        result.blur,
        out.blur
      );
  }

  return result;
}

export function transitionOverlay(
  ctx,
  type,
  progress,
  width,
  height,
  accent = "#f1c34d"
) {
  const p =
    clamp(progress);

  if (
    !type ||
    type === "none"
  ) {
    return;
  }

  ctx.save();

  switch (type) {
    case "goldFlash":
      ctx.fillStyle =
        hexToRgba(
          accent,
          Math.sin(
            p * Math.PI
          ) * 0.72
        );

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
      break;

    case "whiteFlash":
    case "stadiumFlash":
      ctx.fillStyle =
        `rgba(255,255,255,${
          Math.sin(
            p * Math.PI
          ) * 0.78
        })`;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
      break;

    case "blackFade":
      ctx.fillStyle =
        `rgba(0,0,0,${
          Math.sin(
            p * Math.PI
          ) * 0.9
        })`;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
      break;

    case "sportsSlash": {
      const x =
        -width +
        width *
        3 *
        p;

      ctx.translate(
        x,
        0
      );

      ctx.rotate(
        -0.16
      );

      ctx.fillStyle =
        accent;

      ctx.fillRect(
        -width * 0.25,
        -height * 0.3,
        width * 0.22,
        height * 1.6
      );

      ctx.fillStyle =
        "#ffffff";

      ctx.fillRect(
        width * 0.02,
        -height * 0.3,
        width * 0.05,
        height * 1.6
      );
      break;
    }

    case "diagonalWipe": {
      const x =
        width *
        1.7 *
        p -
        width *
        0.7;

      ctx.translate(
        x,
        0
      );

      ctx.rotate(
        -0.24
      );

      ctx.fillStyle =
        accent;

      ctx.fillRect(
        -width,
        -height,
        width * 0.35,
        height * 3
      );
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

function hexToRgba(
  hex,
  alpha
) {
  const value =
    String(hex)
      .replace("#", "");

  const normalized =
    value.length === 3
      ? value
          .split("")
          .map(item => item + item)
          .join("")
      : value;

  const number =
    parseInt(
      normalized,
      16
    );

  const r =
    (number >> 16) & 255;

  const g =
    (number >> 8) & 255;

  const b =
    number & 255;

  return `rgba(${r},${g},${b},${alpha})`;
}
