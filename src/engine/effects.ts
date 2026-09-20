import type { EffectsSpec } from "../config/types";

/**
 * The art renderer: a single WebGL pass that composites the map and the text
 * overlay, then applies print-like effects (wobble, misregistration, paper,
 * grain, pixelation, vignette). All effect sizes are in poster-width units, so the
 * preview and a 300 DPI export look identical.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform sampler2D uMap;
uniform sampler2D uOverlay;
uniform float uAspect;       // height / width
uniform float uGrain;
uniform float uPaper;
uniform vec3  uPaperColor;
uniform float uWobble;
uniform float uWobbleScale;
uniform float uMis;
uniform float uPix;
uniform float uVignette;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  // Poster-space coordinates: x in [0,1] across the width, y scaled to match.
  vec2 P = vec2(uv.x, uv.y * uAspect);

  if (uPix > 0.0) {
    vec2 cells = vec2(1.0 / uPix, uAspect / uPix);
    uv = (floor(uv * cells) + 0.5) / cells;
    P = vec2(uv.x, uv.y * uAspect);
  }

  vec2 d = vec2(fbm(P * uWobbleScale), fbm(P * uWobbleScale + 17.31)) - 0.5;
  vec2 wuv = uv + d * uWobble * vec2(1.0, 1.0 / uAspect);

  vec3 col = texture2D(uMap, wuv).rgb;
  if (uMis > 0.0) {
    // A second, offset ink pass: darker of the two, like two misaligned screens.
    vec3 ghost = texture2D(uMap, wuv + vec2(uMis, -uMis * 0.7 / uAspect)).rgb;
    col = min(col, mix(ghost, vec3(1.0), 0.35));
  }

  vec4 ov = texture2D(uOverlay, uv + d * uWobble * 0.5 * vec2(1.0, 1.0 / uAspect));
  col = mix(col, ov.rgb, ov.a);

  if (uPaper > 0.0) {
    float blotch = fbm(P * 5.0) * 0.65 + fbm(P * 38.0) * 0.35;
    float fibre = noise(vec2(P.x * 900.0, P.y * 60.0));
    float m = clamp(blotch * 1.3 - 0.25 + fibre * 0.15, 0.0, 1.0);
    col *= mix(vec3(1.0), uPaperColor, uPaper * m);
  }
  if (uGrain > 0.0) {
    float g = hash(floor(P * 1400.0)) + noise(P * 700.0) - 1.0;
    col += g * uGrain;
  }
  if (uVignette > 0.0) {
    vec2 q = (vUv - 0.5) * vec2(1.0, uAspect) / max(1.0, uAspect);
    col *= 1.0 - uVignette * smoothstep(0.25, 0.75, length(q) * 1.1);
  }
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function hasEffects(fx: EffectsSpec | undefined): fx is EffectsSpec {
  return !!fx && Object.values(fx).some((v) => typeof v === "number" && v > 0);
}

/** Scales every effect strength by `amount` (0–2); sizes like wobbleScale are kept. */
export function scaleEffects(fx: EffectsSpec, amount: number): EffectsSpec {
  const k = (v?: number) => (v ?? 0) * amount;
  return {
    ...fx,
    grain: k(fx.grain),
    paper: Math.min(1, k(fx.paper)),
    wobble: k(fx.wobble),
    misregister: k(fx.misregister),
    vignette: Math.min(1, k(fx.vignette)),
    // Pixelation is a structural choice, not an intensity; keep it on/off only.
    pixelate: amount > 0 ? fx.pixelate : 0,
  };
}

export class EffectsRenderer {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private prog: WebGLProgram;
  private texMap: WebGLTexture;
  private texOverlay: WebGLTexture;

  constructor(canvas: HTMLCanvasElement = document.createElement("canvas")) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) throw new Error("WebGL is not available for the art renderer");
    this.gl = gl;
    this.prog = this.link(VERT, FRAG);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.texMap = this.makeTexture();
    this.texOverlay = this.makeTexture();
  }

  /** Composites `map` + `overlay` (same size) through the effects into this.canvas. */
  render(map: TexImageSource, overlay: TexImageSource, width: number, height: number, fx: EffectsSpec) {
    const gl = this.gl;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.prog);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this.upload(this.texMap, 0, map);
    this.upload(this.texOverlay, 1, overlay);

    const u = (n: string) => gl.getUniformLocation(this.prog, n);
    gl.uniform1i(u("uMap"), 0);
    gl.uniform1i(u("uOverlay"), 1);
    gl.uniform1f(u("uAspect"), height / width);
    gl.uniform1f(u("uGrain"), fx.grain ?? 0);
    gl.uniform1f(u("uPaper"), fx.paper ?? 0);
    gl.uniform3fv(u("uPaperColor"), hexToRgb(fx.paperColor ?? "#c9bb9a"));
    gl.uniform1f(u("uWobble"), fx.wobble ?? 0);
    gl.uniform1f(u("uWobbleScale"), fx.wobbleScale ?? 40);
    gl.uniform1f(u("uMis"), fx.misregister ?? 0);
    gl.uniform1f(u("uPix"), fx.pixelate ?? 0);
    gl.uniform1f(u("uVignette"), fx.vignette ?? 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  private upload(tex: WebGLTexture, unit: number, src: TexImageSource) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  }

  private makeTexture() {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  private link(vs: string, fs: string) {
    const gl = this.gl;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "shader");
      return sh;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
    return p;
  }
}
