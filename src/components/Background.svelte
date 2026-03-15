<script lang="ts">
    import { onMount } from "svelte";

    let canvas: HTMLCanvasElement;

    const vert = `
    attribute vec2 pos;
    void main() { gl_Position = vec4(pos, 0.0, 1.0); }
  `;

    const frag = `
precision mediump float;
uniform float u_time;
uniform vec2 u_res;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float val = 0.0;
  float amp = 0.5;
  vec2 q = p;
  for (int i = 0; i < 5; i++) {
    val += amp * noise(q);
    q = q * 2.0 + vec2(1.7, 9.2);
    amp *= 0.45;
  }
  return val;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_time;

  // domain warp for smooth organic motion
  vec2 p = uv * 2.0;
  vec2 warp = vec2(
    fbm(p + vec2(t * 0.4, t * 0.2)),
    fbm(p + vec2(t * 0.3, t * 0.5) + vec2(5.2, 1.3))
  );
  float f1 = fbm(p + warp * 0.6 + vec2(t * 0.2, t * 0.1));
  float f2 = fbm(p + warp * 0.4 - vec2(t * 0.15, t * 0.25));
  float fog = smoothstep(0.2, 0.8, f1 * 0.6 + f2 * 0.4);

 vec3 bg        = vec3(0.055, 0.058, 0.075);
vec3 mid       = vec3(0.09, 0.07, 0.18); 
vec3 deep      = vec3(0.28, 0.12, 0.55); 
vec3 highlight = vec3(0.65, 0.35, 1.0);

vec3 col = mix(bg, mid, fog * 0.6);
col = mix(col, deep, f2 * 0.18);

float peaks = smoothstep(0.55, 0.85, f1);
col = mix(col, highlight, peaks * 0.2);

float vignette = smoothstep(0.85, 0.2, length(uv - 0.5));
col = mix(col, bg * 0.4, (1.0 - vignette) * 0.4);

  gl_FragColor = vec4(col, 1.0);
}
  `;

    onMount(() => {
        const gl = canvas.getContext("webgl");
        if (!gl) return;

        const compile = (type: number, src: string) => {
            const s = gl.createShader(type)!;
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                console.error(gl.getShaderInfoLog(s));
            return s;
        };

        const prog = gl.createProgram()!;
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
            console.error(gl.getProgramInfoLog(prog));
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW,
        );

        const loc = gl.getAttribLocation(prog, "pos");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(prog, "u_time");
        const uRes = gl.getUniformLocation(prog, "u_res");

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener("resize", resize);
        resize();

        let raf: number;
        const render = (t: number) => {
            gl.uniform1f(uTime, t * 0.001);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            raf = requestAnimationFrame(render);
        };

        requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    });
</script>

<canvas bind:this={canvas} class="fixed inset-0 -z-10 w-full h-full"></canvas>
