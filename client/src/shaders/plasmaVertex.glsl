uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    
    // Add some vertex displacement for liquid effect
    vec3 newPosition = position;
    newPosition += normal * sin(time * 3.0 + position.x * 5.0) * 0.02;
    
    vPosition = newPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
