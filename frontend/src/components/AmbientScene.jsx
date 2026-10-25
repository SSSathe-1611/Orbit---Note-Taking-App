import { useEffect, useRef } from "react";
import * as THREE from "three";

function AmbientScene() {
    const hostRef = useRef(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        let renderer;
        let frameId;
        let observer;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
        camera.position.set(0, 0, 8);

        const orbit = new THREE.Group();
        scene.add(orbit);

        const coreGeometry = new THREE.IcosahedronGeometry(1.45, 4);
        const coreMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8c79ff,
            metalness: 0.48,
            roughness: 0.23,
            clearcoat: 1,
            clearcoatRoughness: 0.15,
            emissive: 0x3124a3,
            emissiveIntensity: 0.34,
            flatShading: true,
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        orbit.add(core);

        const wireframeSource = new THREE.IcosahedronGeometry(1.49, 2);
        const wireframe = new THREE.LineSegments(
            new THREE.EdgesGeometry(wireframeSource),
            new THREE.LineBasicMaterial({ color: 0xc1b7ff, transparent: true, opacity: 0.42 })
        );
        orbit.add(wireframe);

        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xb8aaff,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
        });
        const rings = [
            { radius: 2, rotation: [0.95, 0.2, -0.28] },
            { radius: 2.35, rotation: [1.25, -0.5, 0.48] },
        ];
        rings.forEach(({ radius, rotation }) => {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(radius, 0.008, 8, 180),
                ringMaterial
            );
            ring.rotation.set(...rotation);
            orbit.add(ring);
        });

        const starPositions = new Float32Array(240 * 3);
        for (let index = 0; index < 240; index += 1) {
            starPositions[index * 3] = (Math.random() - 0.5) * 12;
            starPositions[index * 3 + 1] = (Math.random() - 0.5) * 8;
            starPositions[index * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        const stars = new THREE.Points(
            starGeometry,
            new THREE.PointsMaterial({ color: 0xe3e0ff, size: 0.018, transparent: true, opacity: 0.7 })
        );
        scene.add(stars);
        scene.add(new THREE.AmbientLight(0xb8b2ff, 2.1));

        const keyLight = new THREE.PointLight(0xffd5a6, 30, 12);
        keyLight.position.set(3, 2, 4);
        scene.add(keyLight);
        const rimLight = new THREE.PointLight(0x6257ff, 24, 12);
        rimLight.position.set(-3, -2, -2);
        scene.add(rimLight);

        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0x000000, 0);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            host.appendChild(renderer.domElement);

            const resize = () => {
                const { width, height } = host.getBoundingClientRect();
                if (!width || !height) return;
                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            };

            observer = new ResizeObserver(resize);
            observer.observe(host);
            resize();

            const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
            const render = () => {
                if (!motionQuery.matches) {
                    orbit.rotation.y += 0.0025;
                    orbit.rotation.x = Math.sin(Date.now() * 0.00025) * 0.08;
                    stars.rotation.y -= 0.00015;
                }
                renderer.render(scene, camera);
                frameId = window.requestAnimationFrame(render);
            };
            render();
        } catch (error) {
            console.error("Unable to initialize the ambient Three.js scene.", error);
        }

        return () => {
            window.cancelAnimationFrame(frameId);
            observer?.disconnect();
            coreGeometry.dispose();
            coreMaterial.dispose();
            wireframeSource.dispose();
            wireframe.geometry.dispose();
            wireframe.material.dispose();
            ringMaterial.dispose();
            orbit.children.forEach((child) => {
                if (child.geometry && child !== core && child !== wireframe) child.geometry.dispose();
            });
            starGeometry.dispose();
            stars.material.dispose();
            if (renderer) {
                renderer.dispose();
                renderer.domElement.remove();
            }
        };
    }, []);

    return <div className="ambient-scene" ref={hostRef} aria-hidden="true" />;
}

export default AmbientScene;
