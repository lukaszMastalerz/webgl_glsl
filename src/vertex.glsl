uniform vec2 uMouse;
uniform float uIntensity;
uniform sampler2D noiseTexture;
uniform float uTime;
uniform vec3 vertexLikeData;
uniform vec2 resolution;
attribute vec3 customPosition;
uniform float uAmplitude;



void main() {
    vec3 pos = position;

    pos.x += uMouse.x * 0.01 * pos.z;
    pos.y += uMouse.y * 0.01 * pos.z;
    pos.z += (uMouse.x * 0.01 * pos.x) + (uMouse.y * 0.01 * pos.y);


    float index = float((gl_VertexID));

    // Manipulate each vertex independently
    pos.x *= (1.0 + (uMouse.x / 200.0) * sin(0.00000009) * index);
    pos.y *= (1.0 + (uMouse.y / 200.0) * sin(0.00000009) * index);
    pos.z *= (1.0 + ((uMouse.x + uMouse.y) * sin(0.00000009)) * index);

    // Calculate a random direction based on mouse input
    vec3 randomDirection = normalize(vec3(
        mix(-1.0, 1.0, fract(cos(dot(position.xy, vec2(12.9898, 78.233))) * 43758.5453)),
        clamp(-1.0, 1.0, atan(sin(dot(position.yx, vec2(12.9898, 78.233) * 2.0)) * 43758.5453)),
        mix(-1.0, 1.0, fract(sin(dot(position.xy, vec2(12.9898, 78.233) * 3.0)) * 43758.5453))
    ));
   

    // Interpolate between the three vectors using smoothstep

    
    vec3 finalDirection = abs( randomDirection) * sign(2000.0);


    // "0.03 - intensity edges
    pos += sin(randomDirection * 3.0 * uTime) * (finalDirection * 0.1) * (uMouse.y * 0.03);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}