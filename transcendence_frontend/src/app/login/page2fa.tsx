import React, { useEffect, useState } from 'react';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import axios, { all } from 'axios';
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import particlesOptions from "../particles.json";
import { ISourceOptions } from "tsparticles-engine";
import { useCallback } from 'react';
import styles from './page2fa.module.css';

interface User {
    username: string;
    imageUrl: string;
    id: number;
    twoFactorEnabled: boolean;
}


function TwoFactorAuth() {
    const [qrCodeDataURL, setQrCodeDataURL] = useState('');
    const [userSecret, setUserSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationResult, setVerificationResult] = useState('');
    const [user, setUser] = useState<User | null>(null);
	const [showVerificationSection, setShowVerificationSection] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            try {
                const response = await axios.get<User>(`${apiUrl}/user`, { withCredentials: true });
                setUser(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur :", error);
            }
        };
        fetchUser();
    }, []);

    const generateQRCode = async () => {
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user?.username || 'unknown', 'ServiceName', secret);
        const qrCodeData = await qrcode.toDataURL(otpauth);

        setQrCodeDataURL(qrCodeData);
        setUserSecret(secret);
    };

    const verifyCode = () => {
        const isValid = authenticator.verify({ token: verificationCode, secret: userSecret });
        setVerificationResult(isValid ? ' ' : 'Le code 2FA est invalide');
		console.log('isValid => ' + isValid);
		if (isValid === true) {
			window.location.href = "/intro";
		}
    };

	const particlesInit = useCallback(async (engine: Engine) => {
		await loadFull(engine);
	  }, []);


    return (
			<div className={styles.all}>
			<div style={{width: '400px', height: '600 px', display: 'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
				<h2 className={styles.all_title}>Vérification de la 2FA</h2>

				<h2 className={styles.all_2fa}>Page de 2FA</h2>
				{qrCodeDataURL && <img className={styles.all_2fa_qrcode} src={qrCodeDataURL} alt="QR Code" />}
				{showVerificationSection && (
				<div style={{width: '300px', height: '300px'}}>
						<input className={styles.all_2fa_input}
							type="text"
							placeholder="Code de vérification"
							value={verificationCode}
							onChange={(e) => setVerificationCode(e.target.value)}
						/>
						<button className={styles.all_2fa_valide} style={{ cursor: 'pointer' }} onClick={verifyCode}>Cliquez pour verifier</button>
						<p className={styles.all_msg}>{verificationResult}</p>
						</div>
				)}

				<button
					className={styles.all_2fa_button}
					onClick={() => {
						setShowVerificationSection(true);
						generateQRCode();
					}}
					style={{ cursor: 'pointer' }}
				>
					<span className={styles.all_2fa_btn}>2FA</span>
				</button>

				<Particles options={particlesOptions as ISourceOptions} init={particlesInit} />
				</div>
			</div>
		);
}

export default TwoFactorAuth;
