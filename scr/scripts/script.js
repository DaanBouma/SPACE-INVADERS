////////////////////////////////////////////////////////////////////////////////////////////////////
///////                        Game Storage                                                  ///////
////////////////////////////////////////////////////////////////////////////////////////////////////


let inRestartMenu = false
let freeze = false;
let WAVE_COUNT = 1;
let ENEMY_COUNT = 0;
let CURRENT_PLAYER_LEVEL = 1;
let PLAYER_EXPERIENCE = 0;

let shieldgain = false;
let shieldgainAmount = 0;

let godMode = false

const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;
const KEY_CODE_A = 65;
const KEY_CODE_D = 68;

let LEVEL_ONGOING = false;
const ENEMY_COOLDOWN = 5.0;

let ENEMY_COOLDOWNS = {
    BE2: 5.0,
    GE2: 3.0,
    GE4: 1.0,
    RE1: 3.0,
    BLE3: 0.5,
    BLE5: 0.5,
}
let LASER_SPEEDS = {
    BE2_LASER: 100,
    RE1_LASER: 600,
    BLE3_LASER: 600
}
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 20;

let achievedNewHighscore = false;
let PLAYER_SCORE = 0;
let highScore = localStorage.getItem('highScore') || 0;

let TOP_HEIGHT = 0;

let CURRENTX = 0;
let CURRENTY = 15;

let PLAYER_MAX_SPEED = 600;

const LASER_MAX_SPEED = 300
let LASER_COOLDOWN = 0.30;

const GAME_STATE = {
    lastTime: Date.now(),
    enemies: [],

    lasers: [],
    EnemyLasers: [],

    leftPressed: false,
    rightPressed: false,
    spacePressed: false,
    aPressed: false,
    dPressed: false,

    playerX: 0,
    playerY: 0,

    playerCooldown: 0,

};

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                        Collision                                                     ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function random(min, max) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
    return min + Math.random() * (max - min);
}

function setPosition(pos, x, y) {
    pos.style.transform = 'translate(' + x + 'px , ' + y + 'px)';
    pos.style.transition = "0.5s"
}

function inPrison(Prisoner, min, max) {
    if (Prisoner < min) {
        return min;
    } else if (Prisoner > max) {
        return max;
    } else {
        return Prisoner;
    }
}
function Collision(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                        Scores                                                        ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function updateHighscore() {
    if (PLAYER_SCORE > highScore) {
        highScore = PLAYER_SCORE;
        achievedNewHighscore = true;
        const highscoreText = document.getElementById("highscore");
        highscoreText.style.display = "block";
    }
    localStorage.setItem('highScore', highScore);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Tracking Rotation                                              ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function Calculate_X_Difference(playerX, laserX) {
    let difference = 0;
    if (laserX > playerX) {
        difference = laserX - playerX;
    }
    if (laserX < playerX) {
        difference = playerX - laserX;
    }
    return difference;
}
function Calculate_Y_Difference(playerY, laserY) {
    let difference = 0;
    if (playerY < laserY) {
        difference = laserY - playerY;
    } else {
        difference = playerY - laserY;
    } return difference;
}
function Calculaterotation(laser) {
    let playerX = laser.playerX;
    let playerY = laser.playerY;
    let laserY = laser.laserY;
    let laserX = laser.laserX;
    let differenceX = Calculate_X_Difference(playerX, laserX);
    let differenceY = Calculate_Y_Difference(playerY, laserY);
    let angleRadians = Math.atan2(differenceY, differenceX);
    let angleDegrees = (angleRadians * 180) / Math.PI;
    let corner = 0;

    if (playerX < laserX) {
        corner = 90 - angleDegrees;
    } else if (playerX > laserX) {
        corner = 90 + angleDegrees;
    } else {
        corner = -90;
    }
    if (angleDegrees <= 120) {
        corner - 90;
    }

    return corner;
}
function CalculateTime(laser) {
    let playerY = laser.playerY;
    let playerX = laser.playerX;
    let laserY = laser.laserY;
    let laserX = laser.laserX;
    let differenceX = Calculate_X_Difference(playerX, laserX);
    let differenceY = Calculate_Y_Difference(playerY, laserY);
    let hypotenuseLength = Math.sqrt(differenceX ** 2 + differenceY ** 2);
    let timecal = 0;
    if (laser.enemyType == "BLE3") {
        timecal = hypotenuseLength / LASER_SPEEDS.BLE3_LASER;
    } else {
        timecal = hypotenuseLength / LASER_SPEEDS.BE2_LASER;
    }

    return timecal;
}

function setRotation(laser, x, y) {
    let rotation = Calculaterotation(laser);
    if (laser.isFirstUpdate == false) {
        laser.element.style.transform = "translate(" + x + "px," + y + "px) rotate(" + rotation + "deg)";
        laser.isFirstUpdate = true;
        return rotation;
    } else {
        laser.element.style.transform = "translate(" + laser.playerX + "px," + laser.playerY + "px) rotate(" + laser.rotation + "deg)";
        laser.element.style.transition = laser.vectorTM + "s";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Player Creating and player updating                            ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function createPlayer(container) {
    GAME_STATE.playerX = GAME_WIDTH / 2;
    GAME_STATE.playerY = GAME_HEIGHT - 50;
    const player = document.createElement("img");
    player.src = "../../scr/assets/PNG/playerShip1_blue.png";
    player.className = "player";
    player.style.width = "40px";
    container.appendChild(player);
    setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}
function createPlayerlvl2(container) {
    const player = document.createElement("img");
    player.src = "../../scr/assets/PNG/playerShip2_blue.png";
    player.className = "player";
    player.style.width = "45px";
    container.appendChild(player);
    setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}
function createPlayerlvl3(container) {
    const player = document.createElement("img");
    player.src = "../../scr/assets/PNG/playerShip3_blue.png";
    player.className = "player";
    player.style.width = "45px";
    container.appendChild(player);
    setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}
function createPlayerlvl4(container) {
    const player = document.createElement("img");
    player.src = "../../scr/assets/PNG/ufoBlue.png";
    player.className = "player";
    player.style.width = "45px";
    container.appendChild(player);
    setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}
function createGod(container) {
    const player = document.createElement("img");
    player.src = "../../scr/assets/PNG/ufoYellow.png";
    player.className = "player";
    player.style.width = "50px";
    container.appendChild(player);
    setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}

function updatePlayer(TimeBetween, container) {
    if (PLAYER_EXPERIENCE >= 300) {
        levelUP();
        PLAYER_EXPERIENCE = 0;
    }
    if (GAME_STATE.leftPressed || GAME_STATE.aPressed) {
        GAME_STATE.playerX -= TimeBetween * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.rightPressed || GAME_STATE.dPressed) {
        GAME_STATE.playerX += TimeBetween * PLAYER_MAX_SPEED;
    }
    GAME_STATE.playerX = inPrison(GAME_STATE.playerX, PLAYER_WIDTH, GAME_WIDTH - PLAYER_WIDTH);

    if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
        createLaser(container, GAME_STATE.playerX, GAME_STATE.playerY);
        GAME_STATE.playerCooldown = LASER_COOLDOWN
    }
    if (GAME_STATE.playerCooldown > 0) {
        GAME_STATE.playerCooldown -= TimeBetween;
    }

    const player = document.querySelector(".player");
    setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}

function RemovePlayer() {
    const container = document.querySelector(".game");
    const player = document.querySelector(".player");
    container.removeChild(player);
}

function levelUP() {
    const container = document.querySelector(".game");
    if (godMode == false) {
        CURRENT_PLAYER_LEVEL += 1;
        LEVEL_ONGOING = true;
        console.log("current lvl: " + CURRENT_PLAYER_LEVEL)
    }
    if (CURRENT_PLAYER_LEVEL == 2) {
        const audio = new Audio("../../scr/assets/Bonus/sfx_twoTone.ogg");
        audio.play();
        RemovePlayer();
        createPlayerlvl2(container);
        LASER_COOLDOWN = "0.25";
        PLAYER_MAX_SPEED = "800"
    }
    if (CURRENT_PLAYER_LEVEL == 3) {
        const audio = new Audio("../../scr/assets/Bonus/sfx_twoTone.ogg");
        audio.play();
        RemovePlayer();
        createPlayerlvl3(container);
        LASER_COOLDOWN = "0.20";
        PLAYER_MAX_SPEED = "800"
    } else if (CURRENT_PLAYER_LEVEL == 4) {
        const audio = new Audio("../../scr/assets/Bonus/sfx_twoTone.ogg");
        audio.play();
        RemovePlayer();
        createPlayerlvl4(container);
        LASER_COOLDOWN = "0.10";
        PLAYER_MAX_SPEED = "1000"
    } else {
        console.log("MAX LVL ACHIEVED!")
    }
}
let upgraded = false;
let upgradedBack = false;
function activeGodmode(container) {
    if (godMode == true) {
        upgraded = true;
        const audio = new Audio("../../scr/assets/Bonus/sfx_twoTone.ogg");
        audio.play();
        RemovePlayer();
        createGod(container);
        LASER_COOLDOWN = "0.0";
        PLAYER_MAX_SPEED = "1250"
        upgradedBack = true;
    }
    if (upgraded && !godMode) {
        if (upgradedBack == true) {
            levelUP()
        }
        upgradedBack = false;
        upgraded = false
    }
}
function updateShieldicon() {
    const shield1 = document.getElementById("shield1")
    const shield2 = document.getElementById("shield2")
    const shield3 = document.getElementById("shield3")
    if (shieldgainAmount == 1) {
        shield1.style.display = "block";
        shield2.style.display = "none";
        shield3.style.display = "none";
    } else if (shieldgainAmount == 2) {
        shield1.style.display = "block";
        shield2.style.display = "block";
        shield3.style.display = "none";
    } else if (shieldgainAmount == 3) {
        shield1.style.display = "block";
        shield2.style.display = "block";
        shield3.style.display = "block";
    } else if (shieldgainAmount <= 0) {
        shield1.style.display = "none";
        shield2.style.display = "none";
        shield3.style.display = "none";
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Game over                                                      ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

const GAMEOVER_SCREEN = document.getElementById("game_over_total");
const ScoreText = document.getElementById("Score_Text");

function GAME_OVER() {
    const icons = document.getElementById("icons");
    icons.style.display = "none";
    const screen = document.getElementById("game_over_total");
    ScoreText.innerHTML = "Score: " + PLAYER_SCORE;
    GAMEOVER_SCREEN.style.display = "flex";
    screen.style.transform = "translateY(0)";
    screen.style.transition = "10s";
}
let restartedGame = localStorage.getItem('restartedGame');
function restartGame() {
    console.log("restarting game....")
    restartedGame = true;
    localStorage.setItem('restartedGame', restartedGame);
    window.location.reload();
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Player Laser                                                   ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function createLaser(container, x, y) {
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Lasers/laserBlue01.png"
    element.className = "laser";
    container.appendChild(element);
    const laser = { x, y, element };
    GAME_STATE.lasers.push(laser);
    const audio = new Audio("../../scr/assets/Bonus/sfx_laser1.ogg")
    audio.play();
    setPosition(element, x, y);
}
let enemyKilled = 0;
function updateLaser(TimeBetween, container) {
    const lasers = GAME_STATE.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y -= TimeBetween * LASER_MAX_SPEED;
        if (laser.y < -50) {
            destroyLaser(container, laser);
        }
        setPosition(laser.element, laser.x, laser.y)
        const enemies = GAME_STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];

            const r1 = laser.element.getBoundingClientRect();
            const r2 = enemy.element.getBoundingClientRect();
            if (Collision(r1, r2)) {
                liferemover(enemy, j)
                container.removeChild(laser.element)
                lasers.splice(i, 1);
                if (ENEMY_COUNT <= 0) {
                    console.log("starting new wave...")
                    startNewWave();
                }
            }
        }
    }
    GAME_STATE.lasers = GAME_STATE.lasers.filter(e => !e.isDead);
}
function destroyLaser(container, laser) {
    container.removeChild(laser.element);
    laser.isDead = true;
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       enemy                                                          ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function liferemover(enemy, j) {
    const container = document.querySelector(".game");
    const enemies = GAME_STATE.enemies;
    console.log("Liferemover called!");
    console.log("Enemy:", enemy);
    console.log("Index:", j);

    if (enemy.lives > 1) {
        enemy.lives -= 1;
    } else {
        container.removeChild(enemy.element);
        enemies.splice(j, 1);
        if (shieldgain == true) {
            enemyKilled += 1
            if (enemyKilled >= 3) {
                enemyKilled = 0;
                if (shieldgainAmount < 3) {
                    console.log("shieldgainamount + 1 = " + shieldgainAmount);
                    shieldgainAmount += 1;
                    updateShieldicon();
                }
            }
        }
        ENEMY_COUNT--;
        PLAYER_EXPERIENCE += 10;
        PLAYER_SCORE += 10;
    }
}

function updateEnemies(TimeBetween, container) {
    const enemies = GAME_STATE.enemies;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        enemy.cooldown -= TimeBetween;
        if (enemy.cooldown <= 0) {
            if (enemy.enemyType === "BE1") {
                createEnemyLaserBE1(container, enemy.x, enemy.y);
                enemy.cooldown = ENEMY_COOLDOWN;
            }
            if (enemy.enemyType === "BE2") {
                createEnemyLaserBE2(container, enemy.x, enemy.y);
                enemy.cooldown = ENEMY_COOLDOWNS.BE2;
            }
            if (enemy.enemyType === "GE2") {
                createEnemyLaserGE2(container, enemy.x, enemy.y);
                enemy.cooldown = ENEMY_COOLDOWNS.GE2;
            }
            if (enemy.enemyType === "GE4") {
                createEnemyLaserGE4(container, enemy.x, enemy.y);
                enemy.cooldown = ENEMY_COOLDOWNS.GE4;
            }
            if (enemy.enemyType === "RE1") {
                createEnemyLaserRE1(container, enemy.x, enemy.y);
                enemy.cooldown = ENEMY_COOLDOWNS.RE1;
            }
            if (enemy.enemyType === "BLE3") {
                createEnemyLaserBLE3(container, enemy.x, enemy.y);
                enemy.cooldown = ENEMY_COOLDOWNS.BLE3;
            }
            if (enemy.enemyType === "BLE5") {
                createEnemyLaserBLE5(container, enemy.x, enemy.y);
                enemy.cooldown = ENEMY_COOLDOWNS.BLE5;
            }
        }
    }
    GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                      Update Enemy Laser                                              ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function updateEnemyLasers(TimeBetween, container) {
    GAME_STATE.EnemyLasers.forEach(laser => {
        if (laser.laserType === "BE1") {
            updateEnemyLaserBE1(laser, TimeBetween, container);
        } else if (laser.laserType === "BE2") {
            updateEnemyLaserBE2(laser, TimeBetween, container)
        } else if (laser.laserType === "GE2") {
            updateEnemyLaserGE2(laser, TimeBetween, container)
        } else if (laser.laserType === "GE4") {
            updateEnemyLaserGE4(laser, TimeBetween, container)
        } else if (laser.laserType === "RE1") {
            updateEnemyLaserRE1(laser, TimeBetween, container)
        } else if (laser.laserType === "BLE3") {
            updateEnemyLaserBLE3(laser, TimeBetween, container)
        } else if (laser.laserType === "BLE5") {
            updateEnemyLaserBLE5(laser, TimeBetween, container)
        }
    });

    GAME_STATE.EnemyLasers = GAME_STATE.EnemyLasers.filter(laser => !laser.isDead);
}
////////////////////////////////////////////////////////////////////////////////////////////////////

function updateEnemyLaserBE1(laser, TimeBetween, container) {
    laser.y += TimeBetween * LASER_MAX_SPEED;
    if (laser.y > GAME_HEIGHT) {
        destroyLaser(container, laser);
    }

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();

    setPosition(laser.element, laser.x, laser.y);

    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false) {
            if (shieldgainAmount <= 0) {
                console.log("shieldgainammount = 0 or lower!");
                updateHighscore()
                RemovePlayer();
                GAME_OVER();
                laser.isDead = true;
            }
            if (!laser.hit) {
                console.log("Laser hit | schieldgainammount -1 ");
                shieldgainAmount -= 1
                laser.hit = true;
                updateShieldicon();
            }
        }

    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function updateEnemyLaserBE2(laser, TimeBetween, container) {

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();
    setRotation(laser)
    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false) {
            if (shieldgainAmount <= 0) {
                console.log("shieldgainammount = 0 or lower!");
                updateHighscore()
                RemovePlayer();
                GAME_OVER();
                laser.isDead = true;
            }
            if (!laser.hit) {
                console.log("Laser hit | schieldgainammount -1 ");
                shieldgainAmount -= 1
                laser.hit = true;
                updateShieldicon();
            }
        }

    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function updateEnemyLaserGE2(laser, TimeBetween, container) {

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();
    setRotation(laser)
    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false) {
            if (shieldgainAmount <= 0) {
                console.log("shieldgainammount = 0 or lower!");
                updateHighscore()
                RemovePlayer();
                GAME_OVER();
                laser.isDead = true;
            }
            if (!laser.hit) {
                console.log("Laser hit | schieldgainammount -1 ");
                shieldgainAmount -= 1
                laser.hit = true;
                updateShieldicon();
            }
        }

    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function updateEnemyLaserGE4(laser, TimeBetween, container) {

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();
    setRotation(laser)
    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false) {
            if (shieldgainAmount <= 0) {
                console.log("shieldgainammount = 0 or lower!");
                updateHighscore()
                RemovePlayer();
                GAME_OVER();
                laser.isDead = true;
            }
            if (!laser.hit) {
                console.log("Laser hit | schieldgainammount -1 ");
                shieldgainAmount -= 1
                laser.hit = true;
                updateShieldicon();
            }
        }

    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function updateEnemyLaserRE1(laser, TimeBetween, container) {
    laser.y += TimeBetween * LASER_SPEEDS.RE1_LASER;
    if (laser.y > GAME_HEIGHT) {
        destroyLaser(container, laser);
    }

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();

    setPosition(laser.element, laser.x, laser.y);

    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false) {
            if (shieldgainAmount <= 0) {
                console.log("shieldgainammount = 0 or lower!");
                updateHighscore()
                RemovePlayer();
                GAME_OVER();
                laser.isDead = true;
            }
            if (!laser.hit) {
                console.log("Laser hit | schieldgainammount -1 ");
                shieldgainAmount -= 1
                laser.hit = true;
                updateShieldicon();
            }
        }

    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function updateEnemyLaserBLE3(laser, TimeBetween, container) {

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();
    setRotation(laser)
    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false) {
            if (shieldgainAmount <= 0) {
                console.log("shieldgainammount = 0 or lower!");
                updateHighscore()
                RemovePlayer();
                GAME_OVER();
                laser.isDead = true;
            }
            if (!laser.hit) {
                console.log("Laser hit | schieldgainammount -1 ");
                shieldgainAmount -= 1
                laser.hit = true;
                updateShieldicon();
            }
        }

    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function updateEnemyLaserBLE5(laser, TimeBetween, container) {

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();
    setRotation(laser)
    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false) {
            if (shieldgainAmount <= 0) {
                console.log("shieldgainammount = 0 or lower!");
                updateHighscore()
                RemovePlayer();
                GAME_OVER();
                laser.isDead = true;
            }
            if (!laser.hit) {
                console.log("Laser hit | schieldgainammount -1 ");
                shieldgainAmount -= 1
                laser.hit = true;
                updateShieldicon();
            }
        }

    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Create enemy laser                                             ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function createEnemyLaserBE1(container, x, y) {
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Lasers/laserRed01.png"
    element.className = "enemy_laser";
    container.appendChild(element);
    let laser = {
        laserType: "BE1",
        x,
        y,
        element,
    };
    laser.x = x;
    laser.y = y;

    GAME_STATE.EnemyLasers.push(laser);
    setPosition(laser.element, laser.x, laser.y);
}



////////////////////////////////////////////////////////////////////////////////////////////////////

function createEnemyLaserBE2(container, x, y) {
    console.log("Creating BE2 laser at:", x, y);
    let element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Lasers/laserRed01.png";
    element.className = "enemy_laser";
    container.appendChild(element);

    let laser = {
        laserType: "BE2",
        x,
        y,
        laserX: 0,
        laserY: 0,
        element,
        playerX: 0,
        playerY: 0,
        isFirstUpdate: false,
        rotation: 0,
        vectorTM: 0,
    };

    laser.playerX = GAME_STATE.playerX;
    laser.playerY = GAME_STATE.playerY;
    laser.laserX = x;
    laser.laserY = y;
    GAME_STATE.EnemyLasers.push(laser);
    let rotation = setRotation(laser, x, y);
    let vectorTME = CalculateTime(laser);
    laser.rotation = rotation;
    laser.vectorTM = vectorTME;
    let time = (vectorTME * 1000) / 1.25
    setTimeout(function () {
        destroyLaser(container, laser);

    }, time);
}
////////////////////////////////////////////////////////////////////////////////////////////////////

function createEnemyLaserGE2(container, x, y) {
    console.log("Creating GE2 laser at:", x, y);
    let element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Lasers/laserGreen10.png";
    element.className = "enemy_laser_GE2";
    container.appendChild(element);

    let laser = {
        laserType: "GE2",
        x,
        y,
        laserX: 0,
        laserY: 0,
        element,
        playerX: 0,
        playerY: 0,
        isFirstUpdate: false,
        rotation: 0,
        vectorTM: 0,
    };

    laser.playerX = GAME_STATE.playerX;
    laser.playerY = GAME_STATE.playerY;
    laser.laserX = x;
    laser.laserY = y;
    GAME_STATE.EnemyLasers.push(laser);
    let rotation = setRotation(laser, x, y);
    let vectorTME = CalculateTime(laser);
    laser.rotation = rotation;
    laser.vectorTM = vectorTME;
    let time = (vectorTME * 1000) / 1.25
    setTimeout(function () {
        destroyLaser(container, laser);

    }, time);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function createEnemyLaserGE4(container, x, y) {
    console.log("Creating GE4 laser at:", x, y);
    let element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Lasers/laserGreen10.png";
    element.className = "enemy_laser_GE4";
    container.appendChild(element);

    let laser = {
        laserType: "GE4",
        x,
        y,
        laserX: 0,
        laserY: 0,
        element,
        playerX: 0,
        playerY: 0,
        isFirstUpdate: false,
        rotation: 0,
        vectorTM: 0,
    };

    laser.playerX = GAME_STATE.playerX;
    laser.playerY = GAME_STATE.playerY;
    laser.laserX = x;
    laser.laserY = y;
    GAME_STATE.EnemyLasers.push(laser);
    let rotation = setRotation(laser, x, y);
    let vectorTME = CalculateTime(laser);
    laser.rotation = rotation;
    laser.vectorTM = vectorTME;
    let time = (vectorTME * 1000) / 1.25
    setTimeout(function () {
        destroyLaser(container, laser);

    }, time);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function createEnemyLaserRE1(container, x, y) {
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Lasers/laserRed01.png"
    element.className = "enemy_laser";
    container.appendChild(element);
    let laser = {
        laserType: "RE1",
        x,
        y,
        element,
    };
    laser.x = x;
    laser.y = y;

    GAME_STATE.EnemyLasers.push(laser);
    setPosition(laser.element, laser.x, laser.y);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function createEnemyLaserBLE3(container, x, y) {
    console.log("Creating BLE3 laser at:", x, y);
    let element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Lasers/laserRed01.png";
    element.className = "enemy_laser_BLE3";
    container.appendChild(element);

    let laser = {
        laserType: "BLE3",
        x,
        y,
        laserX: 0,
        laserY: 0,
        element,
        playerX: 0,
        playerY: 0,
        isFirstUpdate: false,
        rotation: 0,
        vectorTM: 0,
    };

    laser.playerX = GAME_STATE.playerX;
    laser.playerY = GAME_STATE.playerY;
    laser.laserX = x;
    laser.laserY = y;
    GAME_STATE.EnemyLasers.push(laser);
    let rotation = setRotation(laser, x, y);
    let vectorTME = CalculateTime(laser);
    laser.rotation = rotation;
    laser.vectorTM = vectorTME;
    let time = (vectorTME * 1000) / 1.25
    setTimeout(function () {
        destroyLaser(container, laser);

    }, time);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

function createEnemyLaserBLE5(container, x, y) {
    console.log("Creating BLE5 laser at:", x, y);
    let element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Lasers/laserBlack01.png";
    element.className = "BLE5_enemy_laser";
    container.appendChild(element);

    let laser = {
        laserType: "BLE5",
        x,
        y,
        laserX: 0,
        laserY: 0,
        element,
        playerX: 0,
        playerY: 0,
        isFirstUpdate: false,
        rotation: 0,
        vectorTM: 0,
    };

    laser.playerX = GAME_STATE.playerX;
    laser.playerY = GAME_STATE.playerY;
    laser.laserX = x;
    laser.laserY = y;
    GAME_STATE.EnemyLasers.push(laser);
    let rotation = setRotation(laser, x, y);
    let vectorTME = CalculateTime(laser);
    laser.rotation = rotation;
    laser.vectorTM = vectorTME;
    let time = (vectorTME * 1000) / 1.25
    setTimeout(function () {
        destroyLaser(container, laser);

    }, time);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Notifications                                                  ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function wave1Notification() {
    const wave1Dif = document.getElementById("wave1Dif")
    wave1Dif.style.transform = "translateY(0px)";
    wave1Dif.style.transition = "1.5s"
    setTimeout(function () {
        const wave1Dif = document.getElementById("wave1Dif")
        wave1Dif.style.transform = "translateY(-200px)";
        wave1Dif.style.transition = "1s"
        setTimeout(function () {
            wave1Dif.style.display = "none";
        }, 1000);
    }, 3000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function wave2Notification() {
    const wave1Dif = document.getElementById("wave2Dif")
    wave1Dif.style.display = "flex";
    wave1Dif.style.transform = "translateY(0px)";
    wave1Dif.style.transition = "1.5s"
    setTimeout(function () {
        const wave1Dif = document.getElementById("wave2Dif")
        wave1Dif.style.transform = "translateY(-200px)";
        wave1Dif.style.transition = "1s"
        setTimeout(function () {
            wave1Dif.style.display = "none";
        }, 1000);
    }, 3000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function wave3Notification() {
    const wave1Dif = document.getElementById("wave3Dif")
    wave1Dif.style.display = "flex";
    wave1Dif.style.transform = "translateY(0px)";
    wave1Dif.style.transition = "1.5s"
    setTimeout(function () {
        const wave1Dif = document.getElementById("wave3Dif")
        wave1Dif.style.transform = "translateY(-200px)";
        wave1Dif.style.transition = "1s"
        setTimeout(function () {
            wave1Dif.style.display = "none";
        }, 1000);
    }, 3000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function wave4Notification() {
    const wave1Dif = document.getElementById("wave4Dif")
    wave1Dif.style.display = "flex";
    wave1Dif.style.transform = "translateY(0px)";
    wave1Dif.style.transition = "1.5s"
    setTimeout(function () {
        const wave1Dif = document.getElementById("wave4Dif")
        wave1Dif.style.transform = "translateY(-200px)";
        wave1Dif.style.transition = "1s"
        setTimeout(function () {
            wave1Dif.style.display = "none";
        }, 1000);
    }, 3000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function wave5Notification() {
    const wave1Dif = document.getElementById("wave5Dif")
    wave1Dif.style.display = "flex";
    wave1Dif.style.transform = "translateY(0px)";
    wave1Dif.style.transition = "1.5s"
    setTimeout(function () {
        const wave1Dif = document.getElementById("wave5Dif")
        wave1Dif.style.transform = "translateY(-200px)";
        wave1Dif.style.transition = "1s"
        setTimeout(function () {
            wave1Dif.style.display = "none";
        }, 1000);
    }, 3000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function wave6Notification() {
    const wave1Dif = document.getElementById("wave6Dif")
    wave1Dif.style.display = "flex";
    wave1Dif.style.transform = "translateY(0px)";
    wave1Dif.style.transition = "1.5s"
    setTimeout(function () {
        const wave1Dif = document.getElementById("wave6Dif")
        wave1Dif.style.transform = "translateY(-200px)";
        wave1Dif.style.transition = "1s"
        setTimeout(function () {
            wave1Dif.style.display = "none";
        }, 1000);
    }, 3000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function wave7Notification() {
    const wave1Dif = document.getElementById("wave7Dif")
    wave1Dif.style.display = "flex";
    wave1Dif.style.transform = "translateY(0px)";
    wave1Dif.style.transition = "1.5s"
    setTimeout(function () {
        const wave1Dif = document.getElementById("wave7Dif")
        wave1Dif.style.transform = "translateY(-200px)";
        wave1Dif.style.transition = "1s"
        setTimeout(function () {
            wave1Dif.style.display = "none";
        }, 1000);
    }, 3000);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Global (main)                                                  ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function start() {
    const container = document.querySelector(".game");
    createPlayer(container);

}

function replacelocation() {
    const screen = document.getElementById("game_over_total");
    screen.style.transform = "translateY(-400px)";
    const wave1Dif = document.getElementById("wave1Dif")
    wave1Dif.style.transform = "translateY(-200px)";
    const wave2Dif = document.getElementById("wave2Dif")
    wave2Dif.style.transform = "translateY(-200px)";
    const wave3Dif = document.getElementById("wave3Dif")
    wave3Dif.style.transform = "translateY(-200px)";
    const wave4Dif = document.getElementById("wave4Dif")
    wave4Dif.style.transform = "translateY(-200px)";
    const wave5Dif = document.getElementById("wave5Dif")
    wave5Dif.style.transform = "translateY(-200px)";
    const wave6Dif = document.getElementById("wave6Dif")
    wave6Dif.style.transform = "translateY(-200px)";
    const wave7Dif = document.getElementById("wave7Dif")
    wave7Dif.style.transform = "translateY(-200px)";
    const Victory_total = document.getElementById("Victory_total");
    Victory_total.style.transform = "translateY(-2000px)"
    Victory_total.style.display = "none";
}

replacelocation()

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                      Game Loop                                                       ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function update(info) {
    if (!freeze) {
        const container = document.querySelector(".game");
        const currentTime = Date.now();
        const TimeBetween = (currentTime - GAME_STATE.lastTime) / 1000;

        updatePlayer(TimeBetween, container);
        updateLaser(TimeBetween, container);
        updateEnemies(TimeBetween, container);
        updateEnemyLasers(TimeBetween, container)
        activeGodmode(container)
        GAME_STATE.lastTime = currentTime;
    }
    window.requestAnimationFrame(update);
}
const startscreen = document.getElementById("game_start_total");

let isStarted = false;
document.getElementById('startbuttonimg').addEventListener('click', function () {
    const loadingscreen = document.getElementById("game_controlls_total")
    if (isStarted == false) {
        startscreen.style.transform = "translateX(-800px)"
        startscreen.style.transition = "0.5s";
        setTimeout(function () {
            loadingscreen.style.transform = "translateY(-800px)"
            loadingscreen.style.transition = "1s";
            generateWave1();
            setTimeout(function () {
                loadingscreen.style.display = "none";
                startscreen.style.display = "none";
                DisplayChange()
                isStarted = true
            }, 500);
        }, 3000);

    }

});

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Keyboard Detection                                             ///////
////////////////////////////////////////////////////////////////////////////////////////////////////


function onKeyDown(info) {
    if (info.keyCode === KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = true;
    } else if (info.keyCode === KEY_CODE_RIGHT) {
        GAME_STATE.rightPressed = true;
    } else if (info.keyCode === KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = true;
    } else if (info.keyCode === KEY_CODE_A) {
        GAME_STATE.aPressed = true;
    } else if (info.keyCode === KEY_CODE_D) {
        GAME_STATE.dPressed = true;
    }

    if (info.spacePressed == true && isStarted == false) {
        generateWave1();
        DisplayChange()
        isStarted = true
    }
}

function onKeyUp(info) {
    if (info.keyCode === KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = false;
    } else if (info.keyCode === KEY_CODE_RIGHT) {
        GAME_STATE.rightPressed = false;
    } else if (info.keyCode === KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = false;
    } else if (info.keyCode === KEY_CODE_A) {
        GAME_STATE.aPressed = false;
    } else if (info.keyCode === KEY_CODE_D) {
        GAME_STATE.dPressed = false;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Restart Game Inject                                            ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function restartGameNow() {
    console.log("restartedGame value:", restartedGame);
    if (restartedGame === "true") {
        console.log("restarted game is true")
        generateWave1();
        const startmenu = document.getElementById("game_start_total");
        const infoscreen = document.getElementById("game_controlls_total")
        isStarted = true;
        startmenu.style.display = "none";
        infoscreen.style.display = "none";
        start();
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.requestAnimationFrame(update);
        restartedGame = "false";
        localStorage.setItem('restartedGame', restartedGame);
    } else {
        console.log("restarted game is false")
        start();
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.requestAnimationFrame(update);
    }
}

restartGameNow();

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Wave Management (Outside)                                      ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function countdown() {
    const number0 = document.getElementById("number0");
    const number1 = document.getElementById("number1");
    const number2 = document.getElementById("number2");
    const number3 = document.getElementById("number3");

    number3.style.display = "block"
    setTimeout(function () {
        number3.style.display = "none"
        number2.style.display = "block"
    }, 1000);
    setTimeout(function () {
        number2.style.display = "none"
        number1.style.display = "block"
    }, 2000);
    setTimeout(function () {
        number1.style.display = "none"
    }, 3000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function schieldnotification() {
    const icons2 = document.getElementById("icons");
    const notification = document.getElementById("notification");
    notification.style.display = "flex";
    icons2.style.display = "flex";
    setTimeout(function () {
        notification.style.display = "none";
        shieldgain = true;
    }, 2000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function controlnotification() {
    const notification = document.getElementById("notification2");
    notification.style.display = "flex";
    setTimeout(function () {
        notification.style.display = "none";
    }, 2000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
function startNewWave() {
    WAVE_COUNT += 1;
    countdown();
    if (WAVE_COUNT == 2) {
        setTimeout(function () {
            generateWave2();
        }, 3000);
    } else if (WAVE_COUNT == 3) {
        setTimeout(function () {
            generateWave3();
        }, 3000);
    } else if (WAVE_COUNT == 4) {
        setTimeout(function () {
            generateWave4();
        }, 3000);
    } else if (WAVE_COUNT == 5) {
        setTimeout(function () {
            generateWave5();
        }, 3000);
    } else if (WAVE_COUNT == 6) {
        setTimeout(function () {
            schieldnotification();
            generateWave6();
        }, 3000);
    } else if (WAVE_COUNT == 7) {
        setTimeout(function () {
            generateWave7();
        }, 3000);
    } else if (WAVE_COUNT == 8) {
        setTimeout(function () {
            generateWave8();
        }, 3000);
    } else if (WAVE_COUNT == 9) {
        setTimeout(function () {
            generateWave9();
        }, 3000);
    } else if (WAVE_COUNT == 10) {
        setTimeout(function () {
            const icons = document.getElementById("icons");
            icons.style.display = "none";
            const Victory_total = document.getElementById("Victory_total");
            updateHighscore()
            const ScoreText = document.getElementById("Score_Text2");
            ScoreText.innerHTML = PLAYER_SCORE;
            Victory_total.style.display = "flex";
            Victory_total.style.transform = "translateY(0px)"
            Victory_total.style.transition = "0.5s"

        }, 3000);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////

function setPosition(element, x, y) {
    element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       padding (settings)                                             ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function padding(paddingwidth, paddingheight) {
    CURRENTX += paddingwidth
    if (paddingheight > TOP_HEIGHT) {
        TOP_HEIGHT = paddingheight;
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy BE1                                                      ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function BE1(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyBlue1.png";
    element.className = "enemy";
    element.width = size;

    container.appendChild(element);
    let enemy = {
        enemyType: "BE1",
        lives: 1,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWN),
        hit: false
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    console.log("enemy created (BE1)");
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy BE2                                                      ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function BE2(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyBlue2.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "BE2",
        lives: 2,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWNS.BE2),
        hit: false
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy GE2                                                      ///////
////////////////////////////////////////////////////////////////////////////////////////////////////


function GE2(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyGreen2.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "GE2",
        lives: 4,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWNS.GE2),
        hit: false
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy GE3                                                      ///////
////////////////////////////////////////////////////////////////////////////////////////////////////


function GE3(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyGreen3.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "GE3",
        lives: 10,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWN),
        hit: false
    };
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;
}


////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy GE4                                                      ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function GE4(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyGreen4.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "GE4",
        lives: 4,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWNS.GE4),
        hit: false
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy RE1                                                      ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function RE1(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyRed1.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "RE1",
        lives: 10,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWN),
        hit: false
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy RE3                                                      ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function RE3(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyRed3.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "RE3",
        lives: 5,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWN),
        hit: false
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;

}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy BLE1                                                     ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function BLE1(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyBlack3.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "BLE1",
        lives: 50,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWNS),
        hit: false
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;

}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy BLE3                                                     ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function BLE3(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyBlack3.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "BLE3",
        lives: 50,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWNS.BLE3),
        hit: false
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;

}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Enemy BLE5                                                     ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function BLE5(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyBlack5.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "BLE5",
        lives: 200,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWNS.BLE5),
        hit: false
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;

}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Wave Creation                                                  ///////
////////////////////////////////////////////////////////////////////////////////////////////////////
///////
///////   Na dit gedeelte komt de wave customazation. Hier kan je de waves maken 
///////   na je wil. Je kan elke van de volgende gebruiken.
///////
///////   = Padding(size) (dit zegt hoeveel white space het moet overslaan)
///////   = BE1(size)
///////   = BE2(size)
///////   = GE2(size)
///////   = GE2(size)
///////   = BLE1(size)
///////   = BLE2(size)
///////   = BLE5(size)
/////// 
///////   Zorg er altijd voor dat de totale lengte van 1 row altijd 800px is.
///////   Je kan ook meer rows toevoegen houd er wel rekening mee dat het dicht.
///////   Bij de player kan komen
///////
///////
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Customazation                                                  ///////
////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Generate Wave 1                                                ///////
////////////////////////////////////////////////////////////////////////////////////////////////////
function generateWave1() {
    wave1Notification()
    TOP_HEIGHT = 0;
////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(62.5);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(62.5);

    CURRENTX = 0
    CURRENTY = 25 + TOP_HEIGHT

////////////////////////////////////////////////////////////////////////////////////////////////////

    padding(62.5);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(62.5);

    CURRENTX = 0
    CURRENTY = 40 + TOP_HEIGHT * 2

////////////////////////////////////////////////////////////////////////////////////////////////////

    padding(62.5);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(25);
    BE1(45);
    padding(62.5);

    CURRENTX = 0
    CURRENTY = 10
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Generate Wave 2                                                ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function generateWave2() {
    wave2Notification()
    TOP_HEIGHT = 0;
////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(290);
    BE1(45);
    padding(20);
    BE1(45);
    padding(20);
    BE1(45);
    padding(20);
    BE1(45);
    padding(290);

    CURRENTX = 0
    CURRENTY = 25 + TOP_HEIGHT

////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(47.5);
    padding(47.5);
    BE2(50);
    padding(47.5);
    BE2(50);
    padding(47.5);

    BE1(45);
    padding(20);
    BE1(45);
    padding(20);
    BE1(45);
    padding(20);
    BE1(45);

    padding(47.5);
    BE2(50);
    padding(47.5);
    BE2(50);
    padding(47.5);
    padding(47.5);

    CURRENTX = 0
    CURRENTY = 10

}
////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Generate Wave 3                                                ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function generateWave3() {
    wave3Notification()
    TOP_HEIGHT = 0;
////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(295);
    BE1(45);
    padding(10);
    BE1(45);
    padding(10);
    BE1(45);
    padding(10);
    BE1(45);
    padding(295);

    CURRENTX = 0
    CURRENTY = 25 + TOP_HEIGHT

////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(48.75);
    padding(48.75);
    GE2(50);
    padding(48.75);
    GE2(50);
    padding(48.75);

    BE1(45);
    padding(10);
    GE2(45);
    padding(10);
    GE2(45);
    padding(10);
    BE1(45);

    padding(48.75);
    GE2(50);
    padding(48.75);
    GE2(50);
    padding(48.75);
    padding(48.75);

    CURRENTX = 0
    CURRENTY = 10

}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Generate Wave 4                                                ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function generateWave4() {
    wave4Notification()
    TOP_HEIGHT = 0;
//////////////////////////////////////////////////////////////////////////////////////////////////// 
    padding(195);
    BE1(40);
    padding(10);
    BE1(40);
    padding(10);
    BE1(40);
    padding(25);
    GE3(80);
    padding(25);
    BE1(40);
    padding(10);
    BE1(40);
    padding(10);
    BE1(40);
    padding(195);

    CURRENTX = 0
    CURRENTY = 25 + TOP_HEIGHT

////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(90);
    GE4(50);
    padding(25);

    BE1(40);
    padding(10);
    BE1(40);
    padding(10);
    BE1(40);

    padding(25);
    BE1(40);
    padding(10);
    BE1(40);
    padding(10);
    BE1(40);
    padding(25);

    BE1(40);
    padding(10);
    BE1(40);
    padding(10);
    BE1(40);

    padding(25);
    GE4(50);
    padding(90);

    CURRENTX = 0
    CURRENTY = 10

}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Generate Wave 5                                                ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function generateWave5() {
    wave5Notification()
    TOP_HEIGHT = 0;
////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(77.5);
    GE2(50);
    padding(10);
    GE2(50);
    padding(77.5);
    RE1(50);
    padding(5);
    RE1(50);
    padding(5);
    RE1(50);
    padding(5);
    RE1(50);
    padding(5);
    RE1(50);
    padding(77.5);
    GE2(50);
    padding(10);
    GE2(50);
    padding(77.5);
    CURRENTX = 0
    CURRENTY = 25 + TOP_HEIGHT

////////////////////////////////////////////////////////////////////////////////////////////////////

    padding(77.5);
    GE2(50);
    padding(10);
    GE2(50);
    padding(77.5);
    RE1(50);
    padding(5);
    RE1(50);
    padding(5);
    RE1(50);
    padding(5);
    RE1(50);
    padding(5);
    RE1(50);
    padding(77.5);
    GE2(50);
    padding(10);
    GE2(50);
    padding(77.5);
    CURRENTX = 0
    CURRENTY = 40 + TOP_HEIGHT * 2

////////////////////////////////////////////////////////////////////////////////////////////////////
    CURRENTX = 0
    CURRENTY = 10
}



////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Generate Wave 6                                                ///////
////////////////////////////////////////////////////////////////////////////////////////////////////



function generateWave6() {
    shieldgainAmount = 3;
    updateShieldicon();
    wave6Notification()
    TOP_HEIGHT = 0;
////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(16.25)
    RE1(50);
    RE1(50);
    RE1(50);
    padding(16.25)

    GE2(45);
    padding(20)
    GE2(45);
    padding(20)
    GE2(45);
    padding(20)
    GE2(45);
    padding(20)
    GE2(45);
    padding(20)
    GE2(45);
    padding(20)
    GE2(45);

    padding(16.25)
    RE1(50);
    RE1(50);
    RE1(50);
    padding(16.25)

    CURRENTX = 0
    CURRENTY = 25 + TOP_HEIGHT

////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(185)
    BLE1(60);
    padding(5)
    BLE1(60);
    padding(10)
    RE1(50);
    padding(5)
    RE1(50);
    padding(5)
    RE1(50);
    padding(10)
    BLE1(60);
    padding(5)
    BLE1(60);
    padding(185)
    CURRENTX = 0
    CURRENTY = 40 + TOP_HEIGHT * 2

//////////////////////////////////////////////////////////////////////////////////////////////////// 

    CURRENTX = 0
    CURRENTY = 10
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Generate Wave 7                                                ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function generateWave7() {
    wave7Notification()
    shieldgainAmount = 3;
    updateShieldicon();
    TOP_HEIGHT = 0;
////////////////////////////////////////////////////////////////////////////////////////////////////

    padding(125)

    BE1(50);
    padding(50);
    BE1(50);
    padding(50);

    GE2(50)
    padding(50);
    GE2(50)

    padding(50);
    BE1(50);
    padding(50);
    BE1(50);

    padding(125)

    CURRENTX = 0
    CURRENTY = 25 + TOP_HEIGHT

////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(95);
    RE1(60)
    padding(50);
    RE1(60)
    padding(50);
    RE1(60)
    padding(50);
    RE1(60)
    padding(50);
    RE1(60)
    padding(50);
    RE1(60)
    padding(95);

    CURRENTX = 0
    CURRENTY = 40 + TOP_HEIGHT * 2

////////////////////////////////////////////////////////////////////////////////////////////////////

    padding(65);
    BLE1(70)
    padding(50);
    BLE1(70)
    padding(50);
    BLE1(70)
    padding(50);
    BLE1(70)
    padding(50);
    BLE1(70)
    padding(50);
    BLE1(70)
    padding(65);


    CURRENTX = 0
    CURRENTY = 10
}


////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Generate Wave 8                                                ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function generateWave8() {
    TOP_HEIGHT = 0;
////////////////////////////////////////////////////////////////////////////////////////////////////

    padding(96)
    BLE3(55)
    padding(96)
    padding(55)
    padding(96)
    BLE3(55)
    padding(96)
    padding(55)
    padding(96)
    BLE3(55)
    padding(96)

    CURRENTX = 0
    CURRENTY = 25 + TOP_HEIGHT

////////////////////////////////////////////////////////////////////////////////////////////////////


    CURRENTX = 0
    CURRENTY = 40 + TOP_HEIGHT * 2

////////////////////////////////////////////////////////////////////////////////////////////////////
    CURRENTX = 0
    CURRENTY = 10
}

////////////////////////////////////////////////////////////////////////////////////////////////////
///////                       Generate Wave 9                                                ///////
////////////////////////////////////////////////////////////////////////////////////////////////////

function generateWave9() {
    TOP_HEIGHT = 0;
////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(10)
    BE1(50);
    padding(10)
    BE1(50);
    padding(120)
    BLE3(70)
    padding(40)
    BLE5(100)
    padding(40)
    BLE3(70)
    padding(120)
    BE1(50);
    padding(10)
    BE1(50);
    padding(10)
    CURRENTX = 0
    CURRENTY = 125

////////////////////////////////////////////////////////////////////////////////////////////////////

    padding(10)
    BE1(50);
    padding(10)
    BE1(50);
    padding(560);
    BE1(50);
    padding(10)
    BE1(50);
    padding(10)
    CURRENTX = 0
    CURRENTY = 175

////////////////////////////////////////////////////////////////////////////////////////////////////
    padding(10)
    BE1(50);
    padding(10)
    BE1(50);
    padding(560);
    BE1(50);
    padding(10)
    BE1(50);
    padding(10)

    CURRENTX = 0
    CURRENTY = 250
}
////////////////////////////////////////////////////////////////////////////////////////////////////
