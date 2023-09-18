import React, { useState, useEffect } from 'react';

interface ResponseData {
  qrCode: string;
  otp: string;
  loading: boolean;
  otpSetup: boolean;
}

const TwoFactor: React.FC = () => {
  const [data, setData] = useState<ResponseData>({
    qrCode: '',
    otp: '',
    loading: false,
    otpSetup: false,
  });

  useEffect(() => {
    // Fetch initial data, similar to the Vue's mounted hook
    fetch('/auth/2fa/me')
      .then(response => response.json())
      .then(data => {
        setData(prevData => ({ ...prevData, otpSetup: data }));
        if (!data) {
          fetch('/auth/2fa/qrcode')
            .then(response => response.json())
            .then(data => {
              setData(prevData => ({ ...prevData, qrCode: data }));
            });
        }
      });
  }, []);

  const validate = () => {
    setData(prevData => ({ ...prevData, loading: true }));
    fetch('/auth/2fa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: data.otp })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Invalid OTP code');
      }
    })
    .then(data => {
      setData(prevData => ({ ...prevData, otpSetup: data, loading: false, otp: '' }));
    })
    .catch(error => {
      console.error(error);
      setData(prevData => ({ ...prevData, loading: false, otp: '' }));
    });
  };

  const disableOtp = () => {
    fetch('auth/2fa', { method: 'DELETE' })
      .then(response => response.json())
      .then(data => {
        setData(prevData => ({ ...prevData, otpSetup: data }));
        if (!data) {
          fetch('/auth/2fa/qrcode')
            .then(response => response.json())
            .then(data => {
              setData(prevData => ({ ...prevData, qrCode: data }));
            });
        }
      });
  };

  return (
    <div>
      <dialog open>
        <div>
          <button type="button" color="blue" style={{ maxWidth: "160px" }}>TWO-FACTOR-AUTH</button>
        </div>
        <div>
          <div>
            <h1>TWO FACTOR AUTH SETUP</h1>
          </div>
          <div>
            {!data.otpSetup ? (
              <div>
                <img src={data.qrCode} alt="qrCode" />
                <h3>Verification code :</h3>
                <input
                  type="text"
                  value={data.otp}
                  disabled={data.loading}
                  onChange={(e) => setData(prevData => ({ ...prevData, otp: e.target.value }))}
                />
                {data.loading && <div>Loading...</div>}
              </div>
            ) : (
              <div>
                <h2>Two-factor authentication is enabled</h2>
                <button color="red" onClick={disableOtp}>DISABLE</button>
              </div>
            )}
          </div>
        </div>
        <div>
          <button color="red" onClick={() => { setData(prevData => ({ ...prevData, otp: '' })); }}>CLOSE</button>
        </div>
      </dialog>
    </div>
  );
};

export default TwoFactor;
