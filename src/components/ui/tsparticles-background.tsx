"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { ISourceOptions } from "@tsparticles/engine";

const TsParticlesBackground = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setReady(true);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: {
        enable: true,
        zIndex: -10,
      },
      background: {
        color: {
          value: "#060B28",
        },
      },
      fpsLimit: 120,
      particles: {
        number: {
          value: 60,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: "#d5ff5c",
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: 0.42,
        },
        size: {
          value: {
            min: 1,
            max: 3,
          },
        },
        links: {
          enable: true,
          distance: 150,
          color: "#a7e632",
          opacity: 0.38,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.3,
          direction: "none",
          random: false,
          straight: false,
          outModes: {
            default: "out",
          },
        },
      },
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
          onClick: {
            enable: true,
            mode: "push",
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            quantity: 2,
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!ready) {
    return null;
  }

  return (
    <Particles
      id="ieee-particles"
      className="pointer-events-none"
      options={options}
    />
  );
};

export default TsParticlesBackground;
