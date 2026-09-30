import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { stage } from '../animations/director';

/**
 * Technical ground plane: 1 m / 5 m / 25 m grid that fades with distance and
 * brightens in blueprint mode. Anti-aliased with fwidth; one draw call.
 */
export function Ground() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uAlpha: { value: 1 },
          uBlue: { value: 0 },
          uBase: { value: new THREE.Color('#0d1318') },
          uLine: { value: new THREE.Color('#26323d') },
          uBlueLine: { value: new THREE.Color('#5f93b5') },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          varying float vDepth;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            vec4 mv = viewMatrix * w;
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uAlpha;
          uniform float uBlue;
          uniform vec3 uBase;
          uniform vec3 uLine;
          uniform vec3 uBlueLine;
          varying vec3 vWorld;
          varying float vDepth;
          float grid(vec2 p, float size, float width) {
            vec2 q = p / size;
            vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
            return 1.0 - min(min(g.x, g.y) / width, 1.0);
          }
          void main() {
            float minor = grid(vWorld.xz, 1.0, 1.0);
            float major = grid(vWorld.xz, 5.0, 1.2);
            float far = grid(vWorld.xz, 25.0, 1.4);
            float r = length(vWorld.xz);
            float fade = 1.0 - smoothstep(18.0, 220.0, r);
            float minorFade = 1.0 - smoothstep(14.0, 40.0, vDepth);
            float l = max(max(minor * 0.35 * minorFade, major * 0.7), far * 0.9) * fade;
            vec3 lineCol = mix(uLine, uBlueLine, uBlue);
            vec3 col = mix(uBase, lineCol, l);
            float a = uAlpha * (1.0 - smoothstep(160.0, 420.0, r));
            float lineOnly = l * (0.25 + 0.55 * uBlue);
            gl_FragColor = vec4(col, max(a, lineOnly));
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  );

  useFrame(() => {
    material.uniforms.uAlpha.value = stage.groundAlpha;
    material.uniforms.uBlue.value = stage.blueprint;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.31} material={material} renderOrder={0}>
      <planeGeometry args={[900, 900]} />
    </mesh>
  );
}
