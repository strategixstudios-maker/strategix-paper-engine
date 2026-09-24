// props/logos.js — demo λογότυπα πελατών (Latin: η Poppins δεν έχει ελληνικά)
const L = require('../lib.js');
const { cut, circlePts, rng } = L;
const { HOOD } = require('./core.js');

function cafeLogo(ctx, x, y, sc, state = 'good', seed = 1, col = '#fff') { // demo client logo "ANNA CAFÉ" — states: good | cracked | none | film
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.globalAlpha = state === 'none' ? 0.13 : state === 'cracked' ? 0.82 : 1; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-44, -92); ctx.lineTo(44, -92); ctx.lineTo(36, -30); ctx.quadraticCurveTo(0, -18, -36, -30); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(50, -66, 18, -1.3, 1.3); ctx.stroke();
  ctx.lineWidth = 7; for (const sx of [-18, 0, 18]) { ctx.beginPath(); ctx.moveTo(sx, -104); ctx.quadraticCurveTo(sx + 10, -118, sx, -130); ctx.quadraticCurveTo(sx - 10, -142, sx, -152); ctx.stroke(); }
  ctx.font = '46px Brand'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ANNA CAFÉ', 0, 14); ctx.fillRect(-70, 46, 140, 6); ctx.globalAlpha = 1;
  if (state === 'cracked') {
    const r = rng(seed); ctx.strokeStyle = HOOD; ctx.lineWidth = 6;
    for (let i = 0; i < 9; i++) { let px = -130 + r() * 260, py = -150 + r() * 210; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (r() - .5) * 60; py += 12 + r() * 22; ctx.lineTo(px, py); } ctx.stroke(); }
    ctx.fillStyle = HOOD; for (let i = 0; i < 7; i++) { L.path(ctx, circlePts(-120 + r() * 240, -120 + r() * 180, 10 + r() * 16, 8 + r() * 12, 7)); ctx.fill(); }
    ctx.save(); ctx.translate(96, 20); ctx.rotate(-0.6); cut(ctx, [[0, 0], [46, -8], [30, 30]], '#EDEDED', { seed: seed + 3, amp: 1, edgeW: 3 }); ctx.restore();
  }
  if (state === 'film') {
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(-160, -175, 320, 250);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(-160, -60); ctx.lineTo(-90, -175); ctx.lineTo(-50, -175); ctx.lineTo(-120, -60); ctx.closePath(); ctx.fill();
    ctx.setLineDash([12, 8]); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.strokeRect(-160, -175, 320, 250); ctx.setLineDash([]);
  }
  ctx.restore();
}

// demo λογότυπο «KOSTAS COFFEE». size = διάμετρος. o.mono: ένα χρώμα, χωρίς γεμάτο δίσκο (χάραξη / σφραγίδα). Default = έγχρωμο (ep01).
function kostasLogo(ctx, x, y, size, o = {}) {
  const s = size / 400, m = o.mono, fg = m || '#F5E6C8'; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!m) { ctx.fillStyle = '#7A3E1D'; ctx.beginPath(); ctx.arc(0, 0, 190, 0, 7); ctx.fill(); }
  ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.lineWidth = m ? 14 : 10; ctx.beginPath(); ctx.arc(0, 0, m ? 180 : 165, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-62, -82); ctx.lineTo(62, -82); ctx.lineTo(50, 0); ctx.quadraticCurveTo(0, 16, -50, 0); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(70, -48, 24, -1.3, 1.3); ctx.stroke();
  ctx.lineWidth = 9; ctx.lineCap = 'round'; for (const sx of [-24, 0, 24]) { ctx.beginPath(); ctx.moveTo(sx, -98); ctx.quadraticCurveTo(sx + 12, -114, sx, -130); ctx.stroke(); }
  ctx.font = '62px Brand'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('KOSTAS', 0, 70);
  ctx.font = '30px Brand'; ctx.fillText('COFFEE', 0, 118);
  ctx.restore();
}

module.exports = { cafeLogo, kostasLogo };
