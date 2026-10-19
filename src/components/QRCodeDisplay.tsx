import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 180 }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 1.5,
      width: size * 2, // High resolution for sharp scanning on phone
      color: {
        dark: '#2c2420',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generando QR para Authenticator:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-white rounded-2xl border border-[#e0d6cb] shadow-inner"
      >
        <span className="text-xs text-[#8a7a70] animate-pulse">Generando QR...</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block p-2.5 bg-white rounded-2xl shadow-sm border border-[#dfd5c9]">
      <img
        src={dataUrl}
        alt="Código QR para Microsoft Authenticator"
        width={size}
        height={size}
        className="rounded-xl block"
      />
    </div>
  );
};
