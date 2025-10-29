import React, { useRef } from 'react';

/**
 * Componente CanvasExporter
 * Props:
 * - children: JSX a renderizar en el canvas (usualmente el resultado)
 * - exportTrigger: boolean para activar la exportación
 * - onExported: callback con el dataURL generado
 * - width, height: dimensiones del canvas
 * - logoSrc: ruta del logotipo
 * - style: estilos opcionales
 */
export default function CanvasExporter({ children, exportTrigger, onExported, width = 900, height = 600, logoSrc = '/logo.png', style = {} }) {
  const canvasRef = useRef(null);

  React.useEffect(() => {
    if (exportTrigger) {
      exportToImage();
    }
    // eslint-disable-next-line
  }, [exportTrigger]);

  const exportToImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Fondo premium
    ctx.fillStyle = '#f7f3ed';
    ctx.fillRect(0, 0, width, height);
    // Logo
    const logo = new window.Image();
    logo.src = logoSrc;
    logo.onload = () => {
      ctx.drawImage(logo, 40, 40, 180, 80);
      // Título
      ctx.font = 'bold 36px Montserrat, Arial';
      ctx.fillStyle = '#2d1a47';
      ctx.fillText('ArcanaClub', 240, 90);
      // Renderizar children como texto (simple)
      let y = 160;
      React.Children.forEach(children, child => {
        if (typeof child === 'string') {
          ctx.font = '24px Montserrat, Arial';
          ctx.fillStyle = '#3d246c';
          child.split('\n').forEach(line => {
            ctx.fillText(line, 60, y);
            y += 36;
          });
        }
      });
      // Exportar
      const dataURL = canvas.toDataURL('image/png');
      if (onExported) onExported(dataURL);
    };
  };

  return (
    <canvas ref={canvasRef} width={width} height={height} style={{ display: 'none', ...style }} />
  );
}
