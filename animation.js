const sketch = (p) => {

  /* ── constants ─────────────────────────────────────────── */

  const H         = 170;
  const GROUND    = H - 2;
  const BG        = '#1a1a1a';
  const STROKE    = '#666';
  const ORANGE    = '#eebd98';
  const LEAF      = '#7a9a6a';
  const UPPER_ARM = 16;
  const FOREARM   = 14;
  const HALF      = 150;
  const CYCLE     = HALF * 2;

  /* ── girl geometry ─────────────────────────────────────── */

  const G_HEAD_R     = 13;
  const G_HEAD_Y     = GROUND - 76;
  const G_SHOULDER_Y = G_HEAD_Y + G_HEAD_R + 7;
  const G_HEM_Y      = GROUND - 20;

  /* ── robot geometry ────────────────────────────────────── */

  const R_HEAD_R     = 14;
  const R_HEAD_Y     = GROUND - 84;
  const R_SHOULDER_Y = R_HEAD_Y + R_HEAD_R + 8;
  const R_HIP_Y      = GROUND - 22;

  /* ── responsive state ──────────────────────────────────── */

  let W, girlX, robotX, arcHeight, frame = 0;

  function layout() {
    let cw     = document.getElementById('animation-container').offsetWidth;
    W          = cw;
    let spread = Math.min(150, (W - 80) / 2);
    let center = Math.round(W / 2 + 2);
    girlX      = Math.round(center - spread);
    robotX     = Math.round(center + spread);
    arcHeight  = Math.max(50, spread * 0.53);
  }

  /* ── utilities ─────────────────────────────────────────── */

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
  }

  function swingArm(angle, dir) {
    let theta     = Math.PI / 2 - angle * dir;
    let ex        = Math.cos(theta) * UPPER_ARM;
    let ey        = Math.sin(theta) * UPPER_ARM;
    let extension = Math.min(1, Math.max(0, (Math.abs(angle) - 0.3) * 2.5));
    let foreTheta = Math.PI / 2 * (1 - extension) + (theta - 0.3 * dir) * extension;
    return {
      ex, ey,
      hx: ex + Math.cos(foreTheta) * FOREARM,
      hy: ey + Math.sin(foreTheta) * FOREARM
    };
  }

  /* ── drawing primitives ────────────────────────────────── */

  function arm(sx, sy, pose, joint) {
    p.line(sx, sy, sx + pose.ex, sy + pose.ey);
    p.line(sx + pose.ex, sy + pose.ey, sx + pose.hx, sy + pose.hy);
    if (joint) p.ellipse(sx + pose.ex, sy + pose.ey, 4, 4);
  }

  function mandarin(pos, rot, spinning) {
    p.push();
    p.translate(pos.x, pos.y);
    if (spinning) p.rotate(rot);

    p.fill(ORANGE);
    p.stroke(ORANGE);
    p.strokeWeight(1.2);
    p.ellipse(0, 0, 13, 11);

    p.stroke(LEAF);
    p.line(0, -5.5, 0, -9);
    p.fill(LEAF);
    p.noStroke();
    p.beginShape();
    p.vertex(0, -8);
    p.quadraticVertex(5, -12, 3, -8);
    p.endShape();

    p.pop();
  }

  /* ── girl body ─────────────────────────────────────────── */

  function girlBody(headOff, shoulderOff, hipOff) {
    let hx = girlX + headOff;
    let sx = girlX + shoulderOff;
    let bx = girlX + hipOff;

    p.stroke(STROKE);
    p.strokeWeight(1.5);
    p.noFill();

    p.line(bx - 4, G_HEM_Y, girlX - 6, GROUND);
    p.line(bx + 4, G_HEM_Y, girlX + 6, GROUND);
    p.line(girlX - 10, GROUND, girlX - 2, GROUND);
    p.line(girlX + 2, GROUND, girlX + 10, GROUND);

    p.fill(BG);
    p.stroke(STROKE);
    p.beginShape();
    p.vertex(sx - 10, G_SHOULDER_Y);
    p.vertex(sx + 10, G_SHOULDER_Y);
    p.vertex(bx + 16, G_HEM_Y);
    p.vertex(bx - 16, G_HEM_Y);
    p.endShape(p.CLOSE);

    let waistY = G_SHOULDER_Y + (G_HEM_Y - G_SHOULDER_Y) * 0.4;
    let waistX = (sx + bx) / 2;
    p.line(waistX - 12, waistY, waistX + 12, waistY);

    p.noFill();
    p.line(hx, G_HEAD_Y + G_HEAD_R, sx, G_SHOULDER_Y);

    p.fill(BG);
    p.stroke(STROKE);
    p.ellipse(hx, G_HEAD_Y, G_HEAD_R * 2, G_HEAD_R * 2);

    p.noFill();
    p.arc(hx, G_HEAD_Y - 2, G_HEAD_R * 2.2, G_HEAD_R * 2.1, p.PI + 0.3, p.TWO_PI - 0.3);
    p.line(hx - G_HEAD_R * 1.05, G_HEAD_Y - 1, hx - G_HEAD_R * 0.95, G_HEAD_Y + 12);
    p.line(hx + G_HEAD_R * 1.05, G_HEAD_Y - 1, hx + G_HEAD_R * 0.95, G_HEAD_Y + 12);

    p.fill(STROKE);
    p.noStroke();
    p.ellipse(hx - 4, G_HEAD_Y - 1, 2, 2);
    p.ellipse(hx + 4, G_HEAD_Y - 1, 2, 2);

    p.noFill();
    p.stroke(STROKE);
    p.arc(hx, G_HEAD_Y + 4, 5, 3, 0.1, p.PI - 0.1);
  }

  /* ── robot body ────────────────────────────────────────── */

  function robotBody(headOff, shoulderOff, hipOff) {
    let hx = robotX + headOff;
    let sx = robotX + shoulderOff;
    let bx = robotX + hipOff;
    let torsoX = (sx + bx) / 2;
    let torsoY = (R_SHOULDER_Y + R_HIP_Y) / 2;

    p.stroke(STROKE);
    p.strokeWeight(1.5);
    p.noFill();

    p.line(bx - 5, R_HIP_Y, robotX - 7, GROUND - 5);
    p.line(bx + 5, R_HIP_Y, robotX + 7, GROUND - 5);

    let kneeY = (R_HIP_Y + GROUND - 5) / 2;
    p.ellipse((bx - 5 + robotX - 7) / 2, kneeY, 4, 4);
    p.ellipse((bx + 5 + robotX + 7) / 2, kneeY, 4, 4);

    p.rectMode(p.CORNER);
    p.rect(robotX - 13, GROUND - 5, 10, 5, 2);
    p.rect(robotX + 3, GROUND - 5, 10, 5, 2);

    p.fill(BG);
    p.stroke(STROKE);
    p.rectMode(p.CENTER);
    p.rect(torsoX, torsoY, 26, R_HIP_Y - R_SHOULDER_Y, 3);
    p.rect(torsoX, torsoY, 14, 14, 2);
    p.noFill();
    p.ellipse(torsoX, torsoY, 7, 7);

    p.line(hx - 3, R_HEAD_Y + R_HEAD_R, sx - 3, R_SHOULDER_Y);
    p.line(hx + 3, R_HEAD_Y + R_HEAD_R, sx + 3, R_SHOULDER_Y);

    p.fill(BG);
    p.stroke(STROKE);
    p.rectMode(p.CENTER);
    p.rect(hx, R_HEAD_Y, R_HEAD_R * 2, R_HEAD_R * 2, 5);

    p.noFill();
    p.line(hx - 5, R_HEAD_Y - 7, hx - 5, R_HEAD_Y - R_HEAD_R);
    p.line(hx + 5, R_HEAD_Y - 7, hx + 5, R_HEAD_Y - R_HEAD_R);
    p.line(hx - R_HEAD_R, R_HEAD_Y - 2, hx - R_HEAD_R + 4, R_HEAD_Y - 2);
    p.line(hx + R_HEAD_R, R_HEAD_Y - 2, hx + R_HEAD_R - 4, R_HEAD_Y - 2);

    p.line(hx - 6, R_HEAD_Y - 2, hx - 2, R_HEAD_Y - 2);
    p.line(hx + 2, R_HEAD_Y - 2, hx + 6, R_HEAD_Y - 2);

    p.line(hx - 4, R_HEAD_Y + 5, hx + 4, R_HEAD_Y + 5);
    p.line(hx - 4, R_HEAD_Y + 8, hx + 4, R_HEAD_Y + 8);

    p.line(hx, R_HEAD_Y - R_HEAD_R, hx, R_HEAD_Y - R_HEAD_R - 9);
    p.ellipse(hx, R_HEAD_Y - R_HEAD_R - 11, 4, 4);
  }

  /* ── lifecycle ─────────────────────────────────────────── */

  p.setup = () => {
    layout();
    p.createCanvas(W, H).parent('animation-container');
    p.frameRate(60);
  };

  p.windowResized = () => {
    layout();
    p.resizeCanvas(W, H);
  };

  /* ── main loop ─────────────────────────────────────────── */

  p.draw = () => {
    let cw = document.getElementById('animation-container').offsetWidth;
    if (cw !== W) {
      layout();
      p.resizeCanvas(W, H);
    }

    p.background(BG);
    frame++;

    let cf          = frame % CYCLE;
    let girlThrows  = cf < HALF;
    let t           = (girlThrows ? cf : cf - HALF) / HALF;

    /* idle motion */

    let idleSwing   = 0.2 + Math.sin(frame * 0.030) * 0.08;
    let idleLean    = Math.sin(frame * 0.020) * 1.8;
    let passiveSwng = 0.2 + Math.sin(frame * 0.028 + 1) * 0.1;
    let robotPassve = 0.2 + Math.sin(frame * 0.028 + 1) * 0.06;

    /* action state */

    let gSwing = 0, rSwing = 0, gLean = 0, rLean = 0;
    let inFlight = false, orangePos, orangeRot = 0;

    if (girlThrows) {
      if (t < 0.15) {
        let e  = ease(t / 0.15);
        gSwing = -1.2 * e;
        gLean  = -4 * e;
      } else if (t < 0.22) {
        let e  = ease((t - 0.15) / 0.07);
        gSwing = -1.2 + 2.2 * e;
        gLean  = -4 + 8 * e;
      } else if (t < 0.78) {
        inFlight = true;
        let ft = (t - 0.22) / 0.56;
        let re = ease(Math.min(1, ft / 0.4));
        gSwing = 1.0 * (1 - re);
        gLean  = 4 * (1 - re);
        let ce = ease(Math.max(0, (ft - 0.55) / 0.45));
        rSwing = 0.8 * ce;
        rLean  = -2 * ce;
      } else {
        let e  = ease((t - 0.78) / 0.22);
        rSwing = 0.8 * (1 - e);
        rLean  = -2 * (1 - e);
      }
    } else {
      if (t < 0.15) {
        let e  = ease(t / 0.15);
        rSwing = -1.2 * e;
        rLean  = 4 * e;
      } else if (t < 0.22) {
        let e  = ease((t - 0.15) / 0.07);
        rSwing = -1.2 + 2.2 * e;
        rLean  = 4 - 8 * e;
      } else if (t < 0.78) {
        inFlight = true;
        let ft = (t - 0.22) / 0.56;
        let re = ease(Math.min(1, ft / 0.4));
        rSwing = 1.0 * (1 - re);
        rLean  = -4 * (1 - re);
        let ce = ease(Math.max(0, (ft - 0.55) / 0.45));
        gSwing = 0.8 * ce;
        gLean  = 2 * ce;
      } else {
        let e  = ease((t - 0.78) / 0.22);
        gSwing = 0.8 * (1 - e);
        gLean  = 2 * (1 - e);
      }
    }

    /* blend idle into action */

    let gBlend = Math.max(0, 1 - Math.abs(gSwing) * 2);
    let rBlend = Math.max(0, 1 - Math.abs(rSwing) * 2);

    gSwing += idleSwing * gBlend;
    rSwing += idleSwing * rBlend;
    gLean  += idleLean * gBlend;
    rLean  -= idleLean * rBlend;

    /* compute poses */

    let gActive  = swingArm(gSwing, 1);
    let rActive  = swingArm(rSwing, -1);
    let gPassive = swingArm(passiveSwng, -1);
    let rPassive = swingArm(robotPassve, 1);

    /* lean offsets */

    let gHeadOff = gLean * 1.2, gShOff = gLean, gHipOff = gLean * 0.3;
    let rHeadOff = rLean * 1.2, rShOff = rLean, rHipOff = rLean * 0.3;

    /* shoulder positions */

    let gShRX = girlX + 10 + gShOff;
    let rShLX = robotX - 13 + rShOff;
    let gsx   = girlX + gShOff;
    let rsx   = robotX + rShOff;

    /* orange position */

    if (inFlight) {
      let ft      = (t - 0.22) / 0.56;
      let release = swingArm(1.0, girlThrows ? 1 : -1);
      let catch_  = swingArm(0.8, girlThrows ? -1 : 1);
      let rSrcX   = girlThrows ? girlX + 14  : robotX - 17;
      let rSrcY   = girlThrows ? G_SHOULDER_Y : R_SHOULDER_Y;
      let cDstX   = girlThrows ? robotX - 15  : girlX + 12;
      let cDstY   = girlThrows ? R_SHOULDER_Y : G_SHOULDER_Y;
      let fx = rSrcX + release.hx, fy = rSrcY + release.hy;
      let tx = cDstX + catch_.hx,  ty = cDstY + catch_.hy;
      orangePos = {
        x: fx + (tx - fx) * ft,
        y: fy + (ty - fy) * ft - arcHeight * 4 * ft * (1 - ft)
      };
      orangeRot = (girlThrows ? 1 : -1) * ft * Math.PI * 2;
    } else {
      let girlHand  = { x: gShRX + gActive.hx, y: G_SHOULDER_Y + gActive.hy };
      let robotHand = { x: rShLX + rActive.hx, y: R_SHOULDER_Y + rActive.hy };
      if (girlThrows) orangePos = t < 0.22 ? girlHand : robotHand;
      else            orangePos = t < 0.22 ? robotHand : girlHand;
    }

    /* ── render layers ───────────────────────────────────── */

    p.stroke(STROKE);
    p.strokeWeight(1.5);
    p.noFill();

    arm(gsx + 10, G_SHOULDER_Y, gActive, false);
    arm(rsx - 13, R_SHOULDER_Y, rActive, true);

    if (!inFlight) mandarin(orangePos, orangeRot, false);

    girlBody(gHeadOff, gShOff, gHipOff);
    robotBody(rHeadOff, rShOff, rHipOff);

    p.stroke(STROKE);
    p.strokeWeight(1.5);
    p.noFill();

    arm(gsx - 10, G_SHOULDER_Y, gPassive, false);
    arm(rsx + 13, R_SHOULDER_Y, rPassive, true);

    if (inFlight) mandarin(orangePos, orangeRot, true);
  };
};

new p5(sketch);
