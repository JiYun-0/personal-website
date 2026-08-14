// Strands Chain Effect - Using OGL WebGL Library
class StrandsEffect {
  constructor(container) {
    this.container = container;
    this.time = 0;
    this.animationId = null;

    // Default props matching the Vue component
    this.props = {
      colors: ['#d4a574', '#8b6914', '#a0724e', '#6b4423'],
      count: 5,
      speed: 0.4,
      amplitude: 1.2,
      waviness: 1.5,
      thickness: 0.8,
      glow: 3.0,
      taper: 3,
      spread: 1.2,
      hueShift: 0,
      intensity: 0.7,
      saturation: 1.5,
      opacity: 0.85,
      scale: 1.3,
    };
  }

  async init() {
    try {
      // Load OGL library
      await this.loadOGL();

      this.setupWebGL();
      this.createShaderProgram();
      this.createMesh();
      this.resize();
      this.animate();

      window.addEventListener('resize', () => this.resize());
    } catch (error) {
      console.error('Failed to initialize strands effect:', error);
    }
  }

  loadOGL() {
    return new Promise((resolve, reject) => {
      if (typeof OGL !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ogl@1.0.7/dist/ogl.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupWebGL() {
    const gl = this.gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) {
      console.warn('WebGL2 not supported, skipping strands effect');
      return;
    }

    this.renderer = new OGL.Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true
    });

    this.renderer.gl = gl;
    this.renderer.gl.clearColor(0, 0, 0, 0);
    this.renderer.gl.enable(this.renderer.gl.BLEND);
    this.renderer.gl.blendFunc(this.renderer.gl.ONE, this.renderer.gl.ONE_MINUS_SRC_ALPHA);

    this.container.appendChild(this.renderer.gl.canvas);
  }

  createShaderProgram() {
    const gl = this.renderer.gl;

    const vertSrc = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

    const fragSrc = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[8];
uniform int uColorCount;
uniform int uStrandCount;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaviness;
uniform float uThickness;
uniform float uGlow;
uniform float uTaper;
uniform float uSpread;
uniform float uHueShift;
uniform float uIntensity;
uniform float uOpacity;
uniform float uScale;
uniform float uSaturation;

out vec4 fragColor;

const float PI = 3.14159265;

vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(2.0 * PI * (t + vec3(0.00, 0.33, 0.67)));
}

vec3 samplePalette(float t) {
  t = fract(t);
  float scaled = t * float(uColorCount);
  int idx = int(floor(scaled));
  float blend = fract(scaled);
  int nextIdx = idx + 1;
  if (nextIdx >= uColorCount) nextIdx = 0;
  return mix(uColors[idx], uColors[nextIdx], blend);
}

vec3 strandColor(float t) {
  if (uColorCount > 0) return samplePalette(t);
  return spectrum(t);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv /= max(uScale, 0.0001);

  float e = 0.06 + uIntensity * 0.94;
  float env = pow(max(cos(uv.x * PI * 1.3), 0.0), uTaper);

  vec3 col = vec3(0.0);

  for (int i = 0; i < 12; i++) {
    if (i >= uStrandCount) break;

    float fi = float(i);
    float ph = fi * 1.7 * uSpread;
    float freq = (2.0 + fi * 0.35) * uWaviness;
    float spd = 1.4 + fi * 1.2;

    float tt = uTime * uSpeed;
    float w = sin(uv.x * freq + tt * spd + ph) * 0.60
            + sin(uv.x * freq * 1.1 - tt * spd * 0.7 + ph * 1.7) * 0.40;

    float amp = (0.1 + 0.02 * e) * env * uAmplitude;
    float y = w * amp;

    float d = abs(uv.y - y);
    float thick = (0.001 + 0.05 * e) * (0.35 + env) * uThickness;
    float g = thick / (d + thick * 0.45);
    g = g * g;

    float h = fi / float(uStrandCount) + uv.x * 0.30 + uTime * 0.04 + uHueShift;
    col += strandColor(h) * g * env;
  }

  col *= 0.45 + 0.7 * e;
  col = 1.0 - exp(-col * uGlow);

  float gray = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = max(mix(vec3(gray), col, uSaturation), 0.0);

  float lum = max(max(col.r, col.g), col.b);
  float alpha = clamp(lum, 0.0, 1.0) * uOpacity;

  fragColor = vec4(col * uOpacity, alpha);
}`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertSrc);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragSrc);
    gl.compileShader(fragmentShader);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
    gl.useProgram(this.program);

    // Set uniforms
    this.uniforms = {
      uTime: gl.getUniformLocation(this.program, 'uTime'),
      uResolution: gl.getUniformLocation(this.program, 'uResolution'),
      uColors: gl.getUniformLocation(this.program, 'uColors'),
      uColorCount: gl.getUniformLocation(this.program, 'uColorCount'),
      uStrandCount: gl.getUniformLocation(this.program, 'uStrandCount'),
      uSpeed: gl.getUniformLocation(this.program, 'uSpeed'),
      uAmplitude: gl.getUniformLocation(this.program, 'uAmplitude'),
      uWaviness: gl.getUniformLocation(this.program, 'uWaviness'),
      uThickness: gl.getUniformLocation(this.program, 'uThickness'),
      uGlow: gl.getUniformLocation(this.program, 'uGlow'),
      uTaper: gl.getUniformLocation(this.program, 'uTaper'),
      uSpread: gl.getUniformLocation(this.program, 'uSpread'),
      uHueShift: gl.getUniformLocation(this.program, 'uHueShift'),
      uIntensity: gl.getUniformLocation(this.program, 'uIntensity'),
      uOpacity: gl.getUniformLocation(this.program, 'uOpacity'),
      uScale: gl.getUniformLocation(this.program, 'uScale'),
      uSaturation: gl.getUniformLocation(this.program, 'uSaturation'),
    };
  }

  createMesh() {
    const gl = this.renderer.gl;

    // Full screen quad
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const indices = new Uint16Array([0, 1, 2, 1, 3, 2]);

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Enable attribute
    const posLoc = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.width = rect.width;
    this.height = rect.height;

    this.renderer.setSize(rect.width * dpr, rect.height * dpr);

    const gl = this.renderer.gl;
    gl.viewport(0, 0, rect.width * dpr, rect.height * dpr);

    // Update resolution uniform
    gl.uniform2f(this.uniforms.uResolution, rect.width * dpr, rect.height * dpr);
  }

  colorToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ] : [1, 1, 1];
  }

  animate() {
    this.time += 0.016; // ~60fps

    const gl = this.renderer.gl;

    // Update uniforms
    gl.uniform1f(this.uniforms.uTime, this.time);
    gl.uniform1i(this.uniforms.uColorCount, this.props.colors.length);
    gl.uniform1i(this.uniforms.uStrandCount, this.props.count);
    gl.uniform1f(this.uniforms.uSpeed, this.props.speed);
    gl.uniform1f(this.uniforms.uAmplitude, this.props.amplitude);
    gl.uniform1f(this.uniforms.uWaviness, this.props.waviness);
    gl.uniform1f(this.uniforms.uThickness, this.props.thickness);
    gl.uniform1f(this.uniforms.uGlow, this.props.glow);
    gl.uniform1f(this.uniforms.uTaper, this.props.taper);
    gl.uniform1f(this.uniforms.uSpread, this.props.spread);
    gl.uniform1f(this.uniforms.uHueShift, this.props.hueShift);
    gl.uniform1f(this.uniforms.uIntensity, this.props.intensity);
    gl.uniform1f(this.uniforms.uOpacity, this.props.opacity);
    gl.uniform1f(this.uniforms.uScale, this.props.scale);
    gl.uniform1f(this.uniforms.uSaturation, this.props.saturation);

    // Update colors
    const colors = this.props.colors.map(c => this.colorToRGB(c));
    for (let i = 0; i < 8; i++) {
      const color = colors[i] || colors[colors.length - 1];
      gl.uniform3f(this.uniforms.uColors, color[0], color[1], color[2]);
      // Need to use array uniform - simplified approach
    }

    // Render
    this.renderer.render({ scene: { draw: () => {
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    } } });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer?.gl?.canvas?.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const canvas = document.getElementById('strands-canvas');
    if (canvas && typeof OGL !== 'undefined') {
      const strands = new StrandsEffect(heroSection);
      strands.init();
    }
  }
});

// Load OGL first, then init
(function() {
  const checkOGL = setInterval(() => {
    if (typeof OGL !== 'undefined') {
      clearInterval(checkOGL);
      document.dispatchEvent(new Event('ogl-loaded'));
    }
  }, 50);

  // Try to load OGL
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/ogl@1.0.7/dist/ogl.min.js';
  script.onload = () => {
    document.dispatchEvent(new Event('ogl-loaded'));
  };
  document.head.appendChild(script);
})();
