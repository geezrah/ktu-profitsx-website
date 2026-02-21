/* ════════════════════════════════════════════════════════════════ */
/* KTU HIGH PROFITSX - CANVAS ANIMATION ENGINE */
/* ════════════════════════════════════════════════════════════════ */

(function() {
  const canvas = document.getElementById('bgCanvas');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initCandles(); });

  const ctx = canvas.getContext('2d');

  const BULL = { body:'#00e676', shadow:'rgba(0,230,118,', wick:'#00ff88' };
  const BEAR = { body:'#ff3355', shadow:'rgba(255,51,85,',  wick:'#ff5577' };
  const PAIRS = ['EURUSD','GBPUSD','USDJPY','XAUUSD','USDCHF','AUDUSD','GBPJPY','EURJPY','NASDAQ','BTCUSD'];

  // ── Candle chart strips ──
  let candles = [];
  const COL_COUNT = 42;

  function getZones() {
    return [
      { yBase: H * 0.82, yRange: H * 0.26 },
      { yBase: H * 0.56, yRange: H * 0.20 },
      { yBase: H * 0.33, yRange: H * 0.16 },
    ];
  }

  function initCandles() {
    candles = [];
    const zones = getZones();
    const colW = W / COL_COUNT;
    zones.forEach((zone, zi) => {
      let lastClose = zone.yBase - zone.yRange * 0.5;
      for (let i = 0; i < COL_COUNT + 8; i++) {
        const bodyH  = 8 + Math.random() * 52;
        const drift  = (Math.random() - 0.47) * bodyH;
        const open   = lastClose;
        let close    = open + drift;
        close = Math.max(zone.yBase - zone.yRange + 8, Math.min(zone.yBase - 8, close));
        const isBull = close < open;
        candles.push({
          zone: zi, col: i,
          x: i * colW - colW * 6,
          open, close, isBull,
          high: Math.min(open, close) - 3 - Math.random() * 12,
          low:  Math.max(open, close) + 3 + Math.random() * 12,
          alpha: 0.22 + Math.random() * 0.2,
          speed: 0.3 + Math.random() * 0.22,
          w: colW * 0.58,
        });
        lastClose = close;
      }
    });
  }
  initCandles();

  // ── Exec particles ──
  let execs = [];
  function spawnExec() {
    const isBuy = Math.random() > 0.45;
    const pair  = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    const lot   = (0.01 + Math.random() * 0.49).toFixed(2);
    const price = (1.05 + Math.random() * 148).toFixed(isBuy ? 5 : 3);
    const pnlAmt = (8 + Math.random() * 520).toFixed(2);
    execs.push({
      x: W * 0.05 + Math.random() * W * 0.9,
      y: H * 0.06 + Math.random() * H * 0.88,
      label: `${isBuy ? '▲ BUY' : '▼ SELL'} ${pair}  ${lot} lots`,
      price: `@ ${price}`,
      pnl: (isBuy ? '+' : '-') + '$' + pnlAmt,
      isBuy, life: 0, maxLife: 130 + Math.random() * 90,
    });
  }

  // ── Pulse rings ──
  let pulses = [];
  function spawnPulse(x, y, isBuy) {
    pulses.push({ x, y, r:0, maxR: 55 + Math.random()*70, isBuy });
  }

  // ── Floating data rows ──
  let dataRows = [];
  function makeRow() {
    const s = PAIRS[Math.floor(Math.random()*PAIRS.length)];
    const p = (1.0 + Math.random()*148).toFixed(Math.random()>0.5?5:2);
    const d = (Math.random()>0.5?'+':'-') + (Math.random()*0.008).toFixed(4);
    return `${s}  ${p}  ${d}`;
  }
  for (let i = 0; i < 22; i++) {
    dataRows.push({ x: Math.random()*W, y: Math.random()*H, text: makeRow(), alpha: 0.04+Math.random()*0.07, speed: 0.28+Math.random()*0.45, green: Math.random()>0.5 });
  }

  // ── Ticker ──
  const TICK = ['EURUSD 1.08432 +0.0012','GBPUSD 1.27841 +0.0034','USDJPY 149.82 -0.14','XAUUSD 2341.50 +8.20','USDCHF 0.9021 -0.0008','AUDUSD 0.6512 +0.0019','GBPJPY 190.24 +0.55','EURJPY 162.18 +0.32','NASDAQ 18420 +124','SP500 5280 +38','BTC 67420 +1240','● KTU HIGH PROFITSX EXECUTING ●'];
  let tickX = 0;

  // ── Draw candle 3D ──
  function drawCandle(c) {
    const col  = c.isBull ? BULL : BEAR;
    const top  = Math.min(c.open, c.close);
    const bot  = Math.max(c.open, c.close);
    const bH   = Math.max(2, bot - top);
    const d    = c.w * 0.28; // depth

    ctx.globalAlpha = c.alpha;
    ctx.shadowBlur  = 12;
    ctx.shadowColor = col.wick;

    // Wick
    ctx.strokeStyle = col.wick;
    ctx.lineWidth   = 1.1;
    ctx.beginPath();
    ctx.moveTo(c.x + c.w/2, c.high); ctx.lineTo(c.x + c.w/2, top);
    ctx.moveTo(c.x + c.w/2, bot);   ctx.lineTo(c.x + c.w/2, c.low);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Front
    const g = ctx.createLinearGradient(c.x, top, c.x + c.w, bot);
    g.addColorStop(0,   col.shadow + '0.95)');
    g.addColorStop(0.45, col.body);
    g.addColorStop(1,   col.shadow + '0.65)');
    ctx.fillStyle = g;
    ctx.fillRect(c.x, top, c.w, bH);

    // Top face
    ctx.fillStyle = col.shadow + '0.45)';
    ctx.beginPath();
    ctx.moveTo(c.x, top); ctx.lineTo(c.x+d, top-d*0.5);
    ctx.lineTo(c.x+c.w+d, top-d*0.5); ctx.lineTo(c.x+c.w, top);
    ctx.closePath(); ctx.fill();

    // Right face
    ctx.fillStyle = col.shadow + '0.22)';
    ctx.beginPath();
    ctx.moveTo(c.x+c.w, top); ctx.lineTo(c.x+c.w+d, top-d*0.5);
    ctx.lineTo(c.x+c.w+d, bot-d*0.5); ctx.lineTo(c.x+c.w, bot);
    ctx.closePath(); ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(c.x+2, top+2, 3, bH-4);

    ctx.globalAlpha = 1;
  }

  function drawExec(p) {
    const t    = p.life / p.maxLife;
    const fade = t < 0.15 ? t/0.15 : t > 0.75 ? (1-t)/0.25 : 1;
    ctx.globalAlpha = fade * 0.95;
    const col  = p.isBuy ? '#00ff88' : '#ff4466';
    const bgC  = p.isBuy ? 'rgba(0,255,136,0.09)' : 'rgba(255,68,102,0.09)';
    const brdC = p.isBuy ? 'rgba(0,255,136,0.5)'  : 'rgba(255,68,102,0.5)';

    ctx.font = 'bold 12px "Share Tech Mono"';
    const lw = ctx.measureText(p.label).width;
    const bw = Math.max(lw + 28, 200);
    const bh = 42;
    const bx = p.x - bw/2;
    const by = p.y - bh/2;

    ctx.shadowBlur  = 18;
    ctx.shadowColor = col;
    ctx.fillStyle   = bgC;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = brdC;
    ctx.lineWidth   = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.shadowBlur  = 0;

    ctx.fillStyle = col;
    ctx.fillText(p.label, bx+12, by+14);
    ctx.font = '10px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(p.price, bx+12, by+26);
    ctx.font = 'bold 13px "Russo One"';
    ctx.fillStyle = p.pnl.startsWith('+') ? '#00ff88' : '#ff4466';
    ctx.fillText(p.pnl, bx + bw - ctx.measureText(p.pnl).width - 12, by+28);

    ctx.globalAlpha = 1;
  }

  function drawPulse(p) {
    const alpha = (1 - p.r/p.maxR) * 0.5;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.strokeStyle = p.isBuy ? 'rgba(0,255,136,0.9)' : 'rgba(255,68,102,0.9)';
    ctx.lineWidth   = 1.5;
    ctx.shadowBlur  = 12;
    ctx.shadowColor = p.isBuy ? '#00ff88' : '#ff4466';
    ctx.stroke();
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
  }

  let frame = 0, lastSpawn = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Subtle deep radial
    const bg = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, W*0.72);
    bg.addColorStop(0,   'rgba(0,45,130,0.16)');
    bg.addColorStop(0.6, 'rgba(0,15,55,0.06)');
    bg.addColorStop(1,   'transparent');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    // Matrix data rain
    ctx.font = '11px "Share Tech Mono"';
    dataRows.forEach(r => {
      ctx.globalAlpha = r.alpha;
      ctx.fillStyle = r.green ? '#00aaff' : '#00ff55';
      ctx.fillText(r.text, r.x, r.y);
      r.y += r.speed;
      if (r.y > H+14) { r.y=-10; r.x=Math.random()*W; r.text=makeRow(); }
    });
    ctx.globalAlpha = 1;

    // Candles
    const zones  = getZones();
    const colW   = W / COL_COUNT;
    candles.forEach(c => {
      c.x += c.speed;
      if (c.x > W + colW*2) {
        c.x = -colW * 2;
        const zone = zones[c.zone];
        const bH   = 8 + Math.random()*52;
        const drift= (Math.random()-0.47)*bH;
        const open = c.close;
        let close  = open + drift;
        close = Math.max(zone.yBase-zone.yRange+8, Math.min(zone.yBase-8, close));
        c.open = open; c.close = close; c.isBull = close<open;
        c.high = Math.min(open,close)-3-Math.random()*12;
        c.low  = Math.max(open,close)+3+Math.random()*12;
        c.w    = colW * 0.58;
      }
      drawCandle(c);
    });

    // Price curves
    zones.forEach((zone, zi) => {
      const zc = candles.filter(c=>c.zone===zi).sort((a,b)=>a.x-b.x);
      if (zc.length < 2) return;
      ctx.beginPath();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = zi===0 ? '#00aaff' : zi===1 ? '#ffd700' : '#cc44ff';
      ctx.lineWidth   = 1.8;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.moveTo(zc[0].x+zc[0].w/2, zc[0].close);
      zc.forEach((c,i)=>{
        if(!i) return;
        const prev = zc[i-1];
        const mx = (prev.x+c.x)/2+prev.w/2;
        ctx.quadraticCurveTo(prev.x+prev.w/2, prev.close, mx, (prev.close+c.close)/2);
      });
      ctx.stroke();
      ctx.shadowBlur  = 0;
      ctx.globalAlpha = 1;
    });

    // Pulses
    pulses = pulses.filter(p=>{ p.r+=1.6; drawPulse(p); return p.r<p.maxR; });

    // Exec particles
    execs = execs.filter(p=>{ p.life++; drawExec(p); return p.life<p.maxLife; });

    // Scrolling ticker
    const TICKER_Y = H - 36;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'rgba(0,6,24,0.85)';
    ctx.fillRect(0, TICKER_Y-16, W, 26);
    ctx.strokeStyle = 'rgba(0,120,255,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,TICKER_Y-16); ctx.lineTo(W,TICKER_Y-16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,TICKER_Y+10); ctx.lineTo(W,TICKER_Y+10); ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = '11px "Share Tech Mono"';
    const fullTick = TICK.join('   ◆   ');
    const tw = ctx.measureText(fullTick).width;
    tickX -= 0.9;
    if (tickX < -tw) tickX = W + 60;
    let tx = tickX;
    TICK.forEach(item => {
      const isKTU = item.includes('KTU');
      const isUp  = item.includes('+');
      const isDn  = item.includes('-') && !isKTU;
      ctx.fillStyle  = isKTU ? '#ffd700' : isUp ? '#00ff88' : isDn ? '#ff4466' : '#4da6ff';
      ctx.globalAlpha= isKTU ? 1 : 0.8;
      ctx.shadowBlur = isKTU ? 14 : 0;
      ctx.shadowColor= '#ffd700';
      ctx.font = isKTU ? 'bold 12px "Share Tech Mono"' : '11px "Share Tech Mono"';
      ctx.fillText(item, tx, TICKER_Y);
      tx += ctx.measureText(item).width + ctx.measureText('   ◆   ').width;
    });
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;

    // Spawn events
    frame++;
    if (frame - lastSpawn > 55 + Math.random()*70) {
      spawnExec();
      const last = execs[execs.length-1];
      if (last) spawnPulse(last.x, last.y, last.isBuy);
      lastSpawn = frame;
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

// Device mode auto-detection: adds `mobile` or `desktop` class on <html>
(function(){
  function applyMode(){
    const ua = navigator.userAgent || '';
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone|Opera Mini|IEMobile/i.test(ua) || window.innerWidth <= 900;
    document.documentElement.classList.toggle('mobile', isMobile);
    document.documentElement.classList.toggle('desktop', !isMobile);
    // trigger a resize so canvas and layout reflow correctly after class change
    setTimeout(()=>window.dispatchEvent(new Event('resize')), 60);
  }
  applyMode();
  window.addEventListener('orientationchange', applyMode);
  window.addEventListener('resize', applyMode);
})();
