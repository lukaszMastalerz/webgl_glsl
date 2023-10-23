uniform vec2 uMouse;
uniform float uIntensity;
uniform sampler2D sampler;
uniform vec2 resolution;
uniform float uTime;

// Perlin noise function (możesz użyć gdzieś)
float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

    
    
void main() {
    vec2 uv = (gl_FragCoord.xy / resolution) / 0.6;

    float mouseDist = length((uv / 0.6) - (uMouse.xy + 0.873));


    // Calculate Perlin noise values (musisz wpierw podłożyć pod zmienną później możesz używać "noise" gdzie chcesz - tu użwasz noise z uv razy dwa)
    float noise = random(uv * 2.0);
    
    float circleRadius = 0.01 + 0.005 * cos(uTime * 2.0);

    float increaseFactor = smoothstep(1.0, 10.1, mouseDist / circleRadius); //  5.0  intensity 

    float curlX = sin(uv.y * -10.0 + uTime / exp(1.5)) * 0.1 * sin(increaseFactor);
    float curlY = cos(uv.x * -10.0 + uTime / exp(1.5)) * 0.1 * sin(increaseFactor);
    

    uv.x += curlX * (cos(uv.x * uv.y) * 3.0);
    
    
    vec3 textureColor = texture(sampler, uv).rgb;

      if (mouseDist < circleRadius) {
        textureColor = 1.0 - textureColor;
    }

        gl_FragColor = vec4(textureColor, 1.0);
    
}
