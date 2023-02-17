
// Matrius uniformes (iguals per cada vertex)
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;

// Posició de cada vertex (atribut: diferent per cada vertex)
attribute vec3 position;
attribute vec2 uv;

// Atribut rebut de la geoemtria
attribute float aRandom;

// Varying per passar al frgament shader
//varying float vRandom;
varying vec2 vUv;
varying float vElevation;

// Uniformes (iguals per a tots els vertexs)
uniform vec2 uFrequency;
uniform float uTime;

void main() {

    // Càlcul de la posició (versió per parts)
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1 + sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
    modelPosition.z += elevation;
    //modelPosition.z += aRandom* 0.1;
    //modelPosition.y += uTime;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Càlcul de la posició del vèrtex (versió general)
    //gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    // Càlucl de la posició del veértex (versió Model + View Matrix)
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // (1) Moure vertexos
    //gl_Position.x += 0.5;
    //gl_Position.y += 0.5;

    // Passam el valor entre shaders
    //vRandom = aRandom;
    vUv = uv;
    vElevation = elevation;
}
