'use client'
import React from 'react'
import './page.css'
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import particlesOptions from "./particles.json";
import { ISourceOptions } from "tsparticles-engine";
import { useCallback } from 'react';


function Connect() {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);
    const handleLogin = () => {
        window.location.href = process.env.NEXT_PUBLIC_API_URI!;
      };
    return (
        <>
        <div className="btn" onClick={handleLogin}>
            <a className='btn-1' href="#">Login</a>
            
        </div>
        <Particles options={particlesOptions as ISourceOptions} init={particlesInit}/>
        </>
    )
}

export default Connect