uniform float time;
uniform vec3 color;
uniform float metallic;
uniform float roughness;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(-vPosition);
    
    // Fresnel effect
    float fresnel = pow(1.0 - dot(normal, viewDir), 2.0);
    
    // Metallic reflection
    vec3 reflection = reflect(-viewDir, normal);
    
    // Animated iridescence
    float iridescence = sin(time * 2.0 + vUv.x * 10.0) * 0.5 + 0.5;
    vec3 iridColor = mix(vec3(1.0, 0.4, 0.2), vec3(0.0, 1.0, 0.5), iridescence);
    
    // Combine effects
    vec3 finalColor = mix(color, iridColor, fresnel * metallic);
    finalColor += reflection * metallic * 0.3;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
