precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(noise(i), noise(i + vec2(1, 0)), u.x),
    mix(noise(i + vec2(0, 1)), noise(i + vec2(1, 1)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * smoothNoise(p);
    p = p * 2.1 + vec2(1.3, 1.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.12;

  // layered fog
  float f1 = fbm(uv * 2.5 + vec2(t * 0.6, t * 0.3));
  float f2 = fbm(uv * 3.5 - vec2(t * 0.4, t * 0.5) + f1);
  float f3 = fbm(uv * 1.8 + vec2(t * 0.2, t * 0.7) + f2 * 0.5);

  float fog = f1 * 0.5 + f2 * 0.3 + f3 * 0.2;

  // base: near white
  vec3 base = vec3(0.98, 0.97, 0.99);

  // accent purple: #aa3bff
  vec3 accent = vec3(0.667, 0.231, 1.0);

  // subtle secondary: slightly cooler purple
  vec3 cool = vec3(0.5, 0.2, 0.85);

  vec3 col = mix(base, accent, fog * 0.12);
  col = mix(col, cool, f3 * 0.08);

  // soft vignette to deepen edges
  float vignette = 1.0 - length((uv - 0.5) * 1.4);
  col = mix(col, accent * 0.4, (1.0 - vignette) * 0.06);

  gl_FragColor = vec4(col, 1.0);
}