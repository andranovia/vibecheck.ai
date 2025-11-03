"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Canvas, useFrame } from "@react-three/fiber";

function useMicLevel(smoothing = 0.8) {
    const [level, setLevel] = useState(0);

    useEffect(() => {
        let raf = 0;


        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const src = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.7;
            src.connect(analyser);

            const data = new Uint8Array(analyser.frequencyBinCount);

            const loop = () => {
                analyser.getByteFrequencyData(data);
                // Weighted average favors lows a bit
                let sum = 0, wsum = 0;
                for (let i = 0; i < data.length; i++) {
                    const w = 1.0 - i / data.length; // more weight to bass
                    sum += data[i] * w;
                    wsum += w;
                }
                const avg = sum / (wsum || 1);     // 0..255
                setLevel(prev => prev * smoothing + (avg / 255) * (1 - smoothing));
                raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);

            return () => {
                cancelAnimationFrame(raf);
                stream.getTracks().forEach(t => t.stop());
                ctx.close();
            };
        }).catch(() => setLevel(0));

        return () => {
            cancelAnimationFrame(raf);
        };
    }, [smoothing]);

    return level; // 0..1
}

const vertexShader = `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vNormal;
  varying vec3 vPos;

  // Simple 3D noise (iq style)
  vec3 hash3(vec3 p){ p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6))); return -1.0+2.0*fract(sin(p)*43758.5453123); }
  float noise(vec3 p){
    vec3 i=floor(p), f=fract(p);
    float n=0.0;
    for(int x=0;x<2;x++) for(int y=0;y<2;y++) for(int z=0;z<2;z++){
      vec3 g=vec3(x,y,z);
      vec3 r=f-g;
      float w=dot(hash3(i+g), r);
      vec3 s=smoothstep(0.0,1.0,f);
      float k = mix(mix(mix(w, w, s.x), mix(w,w,s.x), s.y), mix(mix(w,w,s.x), mix(w,w,s.x), s.y), s.z); // cheap fake
      n += k;
    }
    return n;
  }

  void main(){
    vNormal = normal;
    vPos = position;

    float n = noise(normalize(position)*2.0 + vec3(uTime*0.15, 0.0, uTime*0.12));
    float disp = (n*0.5+0.5) * uAmp;
    vec3 newPos = position + normal * disp;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float uTime;
  uniform float uAmp;

  void main(){
    // Fresnel-ish
    float f = pow(1.0 - abs(normalize(vNormal).z), 2.0);
    // Soft two-tone that shifts with amplitude
    vec3 base = mix(vec3(0.1,0.2,0.9), vec3(0.7,0.9,1.0), f);
    float pulse = 0.2 + 0.8 * uAmp;
    vec3 col = mix(base, vec3(1.0), 0.15 + 0.25 * sin(uTime*1.5));
    gl_FragColor = vec4(col * (0.85 + 0.3*pulse), 1.0);
  }
`;

function Jelly({ amp }: { amp: number }) {
    const ref = useRef<THREE.Mesh>(null);
    const mat = useMemo(
        () =>
            new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uAmp: { value: 0 },
                },
                vertexShader,
                fragmentShader,
            }),
        []
    );

    useFrame((_s, dt) => {
        if (!ref.current) return;
        mat.uniforms.uTime.value += dt;
        // Map mic level into something juicy but not migraine-inducing
        mat.uniforms.uAmp.value = THREE.MathUtils.lerp(mat.uniforms.uAmp.value, 0.05 + amp * 0.35, 0.1);
    });

    return (
        <mesh ref={ref}>
            <icosahedronGeometry args={[1, 6]} />
            <primitive attach="material" object={mat} />
        </mesh>
    );
}

function Scene() {
    const level = useMicLevel(0.85);

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 3, 4]} intensity={1.2} />
            <group scale={0.6}>
                <Jelly amp={level} />
            </group>
            <EffectComposer>
                <Bloom intensity={0.1} luminanceThreshold={0.15} luminanceSmoothing={0.1} />
                <Vignette darkness={0.5} />
            </EffectComposer>
            <OrbitControls enableZoom={false} />
        </>
    );
}

export default function MetaCloud() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Double-check we're in browser and add a small delay
        if (typeof window !== 'undefined') {
            const timer = setTimeout(() => setMounted(true), 100);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!mounted || typeof window === 'undefined') {
        return (
            <div style={{ width: "500px", height: "300px", borderRadius: "12px" }} />
        );
    }

    return (
        <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 3], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            style={{ width: "500px", height: "300px", borderRadius: "12px" }}
            onCreated={(state) => {
                // Additional safety check
                if (state.gl) {
                    state.gl.setClearColor(0x000000, 0);
                }
            }}
        >
            <Suspense fallback={null}>
                <Scene />
            </Suspense>
        </Canvas>
    );
}
