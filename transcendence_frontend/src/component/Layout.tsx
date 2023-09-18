// components/Layout.tsx
import React, { ReactNode } from 'react';
import Sidebar from './sidebar/sidebar';
import styles from './Layout.module.css'
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import particlesOptions from "../app/particles.json";
import { ISourceOptions } from "tsparticles-engine";
import { useCallback } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main>{children}</main>
            <Particles options={particlesOptions as ISourceOptions} init={particlesInit}/>
        </div>
    )
}

export default Layout;
