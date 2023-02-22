
// Unforms:
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

// Varying:
varying float vElevation;

void main()
{

    // Mateix color per tots els fragments
    //gl_FragColor = vec4(0.5, 0.8, 1.0, 1.0);

    // Mescla per iguals entre colors
    //float mixStrength = 0.5;

    // Mescla segon elevació
    //float mixStrength = vElevation;

    // Mescla segons elevació i controls (desplaça i amplifica) de colors
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // Visualitza l'elevació
    //gl_FragColor = vec4(vElevation, vElevation, vElevation, 1.0);

    gl_FragColor = vec4(color, 1.0);

}