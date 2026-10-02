import qrcode from './vendor/qrcode.js';

// Render the exact Pix copy-and-paste payload returned by the gateway, locally.
export function drawPixQr(canvas, pixCode) {
  if (!pixCode || typeof pixCode !== 'string') throw new Error('PIX_CODE_MISSING');
  const code = qrcode(0, 'M');
  code.addData(pixCode);
  code.make();

  const modules = code.getModuleCount();
  const quietZone = 4;
  const pixelsPerModule = 6;
  const size = (modules + quietZone * 2) * pixelsPerModule;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('PIX_QR_CANVAS_UNAVAILABLE');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#172224';
  for (let row = 0; row < modules; row++) {
    for (let column = 0; column < modules; column++) {
      if (code.isDark(row, column)) {
        context.fillRect((column + quietZone) * pixelsPerModule, (row + quietZone) * pixelsPerModule, pixelsPerModule, pixelsPerModule);
      }
    }
  }
}
