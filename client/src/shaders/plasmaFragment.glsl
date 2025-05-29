uniform float time;
uniform vec3 color1;
uniform vec3 color2;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vec2 uv = vUv;
    
    // Create plasma effect
    float plasma = sin(uv.x * 10.0 + time) * 
                   sin(uv.y * 8.0 + time * 1.2) * 
                   sin((uv.x + uv.y) * 6.0 + time * 0.8);
    
    plasma = (plasma + 1.0) / 2.0; // Normalize to 0-1
    
    // Mix colors based on plasma
    vec3 finalColor = mix(color1, color2, plasma);
    
    // Add some brightness variation
    finalColor *= 0.8 + plasma * 0.4;
    
    gl_FragColor = vec4(finalColor, 0.8);
}
