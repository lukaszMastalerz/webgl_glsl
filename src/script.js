import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import VertexShader from "./vertex.glsl";
import FragmentShader from "./fragment.glsl";
import HumanVertexShader from "./humanVertex.glsl";
import HumanFragmentShader from "./humanFragment.glsl";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";

let logo;
let human;
const mouse = new THREE.Vector2();
const clock = new THREE.Clock();
let lastMouse = new THREE.Vector2();
const smoothingFactor = 0.05;
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const resolution = new THREE.Vector2();
resolution.x = window.innerWidth * 2;
resolution.y = window.innerHeight * 2;

//----------------------------------------------------------------------------------------------

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const canvas = document.querySelector("canvas.webglHH");

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0.05, 0.31, 0.53);
camera.scale.set(1, 1, 1);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

// Orbit Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enabled = true;

//----------------------------------------------------------------------------------------------

// Sound
const audioListener = new THREE.AudioListener();
const darkThame = new THREE.Audio(audioListener);
const loader = new THREE.AudioLoader();
camera.add(audioListener);
scene.add(darkThame);
loader.load("Thame.mp3", function (audioBuffer) {
  darkThame.setBuffer(audioBuffer);
  darkThame.setLoop(true);
  // darkThame.play();
});

// Sound Icon + synchro with sound
const toggleButton = document.querySelector(".toggle-button");
const bars = toggleButton.querySelectorAll("rect");
let iconStop;

toggleButton.addEventListener("click", () => {
  if (iconStop) {
    bars.forEach((bar) => {
      bar.style.animationPlayState = "running";
      bar.style.transition = "transform 0.5s ease";
      bar.style.transform = "none";
    });
    darkThame.play(); // Play the sound when animation starts
  } else {
    bars.forEach((bar) => {
      bar.style.animationPlayState = "paused";
      bar.style.transition = "transform 0.5s ease";
      bar.style.transform = "scaleY(0.1)";
    });
    darkThame.pause(); // Pause the sound when animation stops
  }
  iconStop = !iconStop;
});

//----------------------------------------------------------------------------------------------

//Post-Procesing
const effectComposer = new EffectComposer(renderer);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.enabled = true;
effectComposer.addPass(unrealBloomPass);

unrealBloomPass.strength = 0.8;
unrealBloomPass.radius = 1.0;
unrealBloomPass.threshold = 0;

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);

if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  const smaaPass = new SMAAPass();
  effectComposer.addPass(smaaPass);
}

//----------------------------------------------------------------------------------------------

// Shaders
const material = new THREE.ShaderMaterial({
  blending: THREE.AdditiveBlending,
  // wireframe: true,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 10.0 },
    uAmplitude: { value: 1.0 },
    uMouse: { value: new THREE.Vector2() },
    uDeformation: { value: new THREE.Vector2(0.0, 0.0) },
    resolution: { value: resolution },
    sampler: { value: new THREE.TextureLoader().load("7_resize.jpg") },
  },
  vertexShader: VertexShader,
  fragmentShader: FragmentShader,
});

//----------------------------------------------------------------------------------------------

// GLB  Logo HAHHAR
const gltfLoader = new GLTFLoader();
gltfLoader.load("Hahhar4.glb", (gltf) => {
  logo = gltf.scene;
  scene.add(logo);
  if (logo) {
    logo.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
      }
    });
  }
  updateHHScale();
});
let mixer;
const vertexData = [];
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(vertexData.length * 3);

for (let i = 0; i < vertexData; i++) {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;
  const z = Math.random() * 2 - 1;
  vertexData.push({ x, y, z });
}

geometry.setAttribute(
  "customPosition",
  new THREE.BufferAttribute(positions, 3)
);

//----------------------------------------------------------------------------------------------

// Manipulating single vertex

//----------------------------------------------------------------------------------------------

// Make GLB responsive (tricky part, don't make this when you have many objects, will make a mess X_x)
const updateHHScale = () => {
  if (!logo) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = width / height;
  let scaleLogo = ratio * 3;
  logo.scale.set(scaleLogo, scaleLogo, scaleLogo);
  const modelWidth = logo.scale.x;
  const modelHeight = logo.scale.y;
  const modelDepth = logo.scale.z;
  const positionX = -modelWidth / 200;
  const positionY = -modelHeight / 20;
  const positionZ = -modelDepth / 10;
  logo.rotation.set(0.96, 0.057, -0.11);
  logo.position.set(positionX, positionY, positionZ);
};

//----------------------------------------------------------------------------------------------

// Responsive canvas
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  updateHHScale();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//----------------------------------------------------------------------------------------------
// Texture maousemover and scale cursor
const cursor = document.querySelector(".custom-cursor");

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  cursor.style.top = `${event.clientY}px`;
  cursor.style.left = `${event.clientX}px`;
});

const handleCursorHover = () => {
  const toggleButton = document.querySelector(".toggle-button");

  toggleButton.addEventListener("mouseenter", () => {
    const cursorElement = document.querySelector(".custom-cursor");
    cursorElement.classList.add("scalable-cursor");
  });

  toggleButton.addEventListener("mouseleave", () => {
    const cursorElement = document.querySelector(".custom-cursor");
    cursorElement.classList.remove("scalable-cursor");
  });
};
handleCursorHover();

//----------------------------------------------------------------------------------------------

// Main animation function + parts of mousemove elements synchronized to in/out viewport texture reaction.
const moveHH = () => {
  const elapsedTime = clock.getElapsedTime();
  if (mixer) {
    mixer.update(0.01);
  }
  material.uniforms.uTime.value = elapsedTime;
  lastMouse.lerp(mouse, smoothingFactor);
  material.uniforms.uMouse.value = lastMouse;

  controls.update();
  effectComposer.render();
  window.requestAnimationFrame(moveHH);
};
moveHH();
