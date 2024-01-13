
// ============================================================================//
// ############################################################################//
//                     Game storage                                            //
// ============================================================================//
// ############################################################################//
let inRestartMenu = false
let freeze = false;
let WAVE_COUNT = 1;
let ENEMY_COUNT = 0;
let CURRENT_PLAYER_LEVEL = 1;
let PLAYER_EXPERIENCE = 0;

let godMode = false 

const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;

let LEVEL_ONGOING = false;
const ENEMY_COOLDOWN = 5.0;

    let ENEMY_COOLDOWNS = {
        BE2: 5.0,
        GE2: 3.0,
        GE4: 1.0,
        RE1: 1.0,
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

let LASER_SPEEDS = {
    BE2_LASER: 100,
}

let PLAYER_MAX_SPEED = 600;

const LASER_MAX_SPEED = 300
let LASER_COOLDOWN = 0.00;

const GAME_STATE = {
    lastTime: Date.now(),
    enemies: [],

    lasers: [],
    EnemyLasers: [],

    leftPressed: false,
    rightPressed: false,
    spacePressed: false,

    playerX: 0,
    playerY: 0,

    playerCooldown: 0,

};
// ============================================================================//
// ############################################################################//
//                       Collision                                             //
// ============================================================================//
// ############################################################################//

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

function updateHighscore(){
    if (PLAYER_SCORE > highScore){
        highScore = PLAYER_SCORE;
        achievedNewHighscore = true;
        const highscoreText = document.getElementById("highscore");
        highscoreText.style.display = "block";
    }

    localStorage.setItem('highScore', highScore);
}

let restartedGame = localStorage.getItem('restartedGame');
function restartGame(){
    console.log("restarting game....")
    restartedGame = true;
    localStorage.setItem('restartedGame', restartedGame);
    window.location.reload();
}

// ============================================================================//
// ############################################################################//
//                       Set Rotation & Position                               //
// ============================================================================//
// ############################################################################//

function Calculate_X_Difference(playerX, laserX) {
    let difference = 0;
    if (laserX > playerX){
        difference = laserX - playerX;
    }
    if (laserX < playerX){
        difference = playerX - laserX;
    }
    return difference;
}
function Calculate_Y_Difference(playerY, laserY) {
    let difference = 0;
    if (playerY < laserY){
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
    let timecal = hypotenuseLength / LASER_SPEEDS.BE2_LASER;
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

// ============================================================================//
// ############################################################################//
//                     Player creation & Player updatng                        //
// ============================================================================//
// ############################################################################//


function createPlayer(container) {
    GAME_STATE.playerX = GAME_WIDTH / 2;
    GAME_STATE.playerY = GAME_HEIGHT - 50;
    const player = document.createElement("img");
    player.src = "../../scr/img/playerShip1_blue.png";
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
    if (PLAYER_EXPERIENCE >= 100) {
        levelUP();
        PLAYER_EXPERIENCE = 0;
    }


    if (GAME_STATE.leftPressed) {
        GAME_STATE.playerX -= TimeBetween * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.rightPressed) {
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
    if (godMode == false){
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
function activeGodmode(container){
    if (godMode == true){
        upgraded = true;
        const audio = new Audio("../../scr/assets/Bonus/sfx_twoTone.ogg");
        audio.play();
        RemovePlayer();
        createGod(container);
        LASER_COOLDOWN = "0.0";
        PLAYER_MAX_SPEED = "1250"
        upgradedBack = true;
    } 
    if (upgraded && !godMode){
        if (upgradedBack == true) {
            levelUP()
        }
        upgradedBack = false;
        upgraded = false
    }
}


// ============================================================================//
// ############################################################################//
//                       Game over                                             //
// ============================================================================//
// ############################################################################//

const GAMEOVER_SCREEN = document.getElementById("game_over_total");
const ScoreText = document.getElementById("Score_Text");

function GAME_OVER() {
    ScoreText.innerHTML = "Score: " + PLAYER_SCORE;
    GAMEOVER_SCREEN.style.display = "flex";
}

function DisplayChange() {
    const startscreen = document.getElementById("game_start_total")
    startscreen.style.display = "none";
}
// ============================================================================//
// ############################################################################//
//                       Player Laser                                          //
// ============================================================================//
// ############################################################################//

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
// ============================================================================//
// ############################################################################//
//                       Enemy                                                 //
// ============================================================================//
// ############################################################################//


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
        }
    }
    GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);
}
// ============================================================================//
// ############################################################################//
//                       Update Enemy laser                                    //
// ============================================================================//
// ############################################################################//
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
        }
    });

    GAME_STATE.EnemyLasers = GAME_STATE.EnemyLasers.filter(laser => !laser.isDead);
}
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
        if (godMode == false){
            updateHighscore()
            RemovePlayer();
            GAME_OVER();
            laser.isDead = true;
        }
     
    }
}


function updateEnemyLaserBE2(laser, TimeBetween, container) {

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();
    setRotation(laser)
    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false){
        updateHighscore()
        RemovePlayer();
        GAME_OVER();
        laser.isDead = true;
        }
    }
}

function updateEnemyLaserGE2(laser, TimeBetween, container) {

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();
    setRotation(laser)
    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false){
        updateHighscore()
        if (achievedNewHighscore == true){

        }
        RemovePlayer();
        GAME_OVER();
        laser.isDead = true;
    }
    }
}
function updateEnemyLaserGE4(laser, TimeBetween, container) {

    const player = document.querySelector(".player");
    const r1 = laser.element.getBoundingClientRect();
    const r2 = player.getBoundingClientRect();
    setRotation(laser)
    if (Collision(r1, r2)) {
        console.log("Player Hit!");
        if (godMode == false){
        updateHighscore()
        if (achievedNewHighscore == true){

        }
        RemovePlayer();
        GAME_OVER();
        laser.isDead = true;
    }
    }
}
function updateEnemyLaserRE1(laser, TimeBetween, container) {
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
        if (godMode == false){
            updateHighscore()
            RemovePlayer();
            GAME_OVER();
            laser.isDead = true;
        }
     
    }
}

// ============================================================================//
// ############################################################################//
//                       Create Enemy Laser                                    //
// ============================================================================//
// ############################################################################//

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



////////////////////////////////////////////////////////////////

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
  
    }, time );
}
////////////////////////////////////////////////////////////////

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
  
    }, time );
}
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
  
    }, time );
}

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

/// ============================================================================//
// ############################################################################//
//                       Global                                                //
// ============================================================================//
// ############################################################################//

function start() {
    const container = document.querySelector(".game");
    createPlayer(container);

}

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
let isStarted = false;
document.getElementById('startbuttonimg').addEventListener('click', function () {
    if (isStarted == false){
        generateWave1();
        DisplayChange()
        isStarted = true
    }

});

// ============================================================================//
// ############################################################################//
//                       KeyDetection                                          //
// ============================================================================//
// ############################################################################//


function onKeyDown(info) {
    if (info.keyCode === KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = true;
    } else if (info.keyCode === KEY_CODE_RIGHT) {
        GAME_STATE.rightPressed = true;
    } else if (info.keyCode === KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = true;
    }
 
    if (info.spacePressed == true && isStarted == false){
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
    }
}

function restartGameNow(){
    console.log("restartedGame value:", restartedGame);  
    if (restartedGame === "true") {
        console.log("restarted game is true")
        generateWave1();
        const startmenu = document.getElementById("game_start_total");
        isStarted = true;
        startmenu.style.display = "none";
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


// ============================================================================//
// ############################################################################//
//                        Wave Management                                      //
// ============================================================================//
// ############################################################################//

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
    }
}
function setPosition(element, x, y) {
    element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
}
// ============================================================================//
// ############################################################################//
//                              Padding                                        //
// ============================================================================//
// ############################################################################//

function padding(paddingwidth, paddingheight) {
    CURRENTX += paddingwidth
    if (paddingheight > TOP_HEIGHT) {
        TOP_HEIGHT = paddingheight;
    };
}

// ============================================================================//
// ############################################################################//
//                              Enemy BE1                                      //
// ============================================================================//
// ############################################################################//
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

// ============================================================================//
// ############################################################################//
//                              Enemy BE2                                      //
// ============================================================================//
// ############################################################################//
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

// ============================================================================//
// ############################################################################//
//                              Enemy GE2                                      //
// ============================================================================//
// ############################################################################//


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

// ============================================================================//
// ############################################################################//
//                              Enemy GE3                                      //
// ============================================================================//
// ############################################################################//


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
    };
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
    ENEMY_COUNT++;
}


// ============================================================================//
// ############################################################################//
//                              Enemy GE4                                      //
// ============================================================================//
// ############################################################################//

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

// ============================================================================//
// ############################################################################//
//                              Enemy RE1                                      //
// ============================================================================//
// ############################################################################//

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
    };
    enemy.x = CURRENTX + (size / 2);
    enemy.y = CURRENTY;
    setPosition(element, CURRENTX, CURRENTY);
    CURRENTX += size
    if (size > TOP_HEIGHT) {
        TOP_HEIGHT = size;
    };
    GAME_STATE.enemies.push(enemy);
}

// ============================================================================//
// ############################################################################//
//                              Enemy RE3                                      //
// ============================================================================//
// ############################################################################//

function RE3(size) {
    const container = document.querySelector(".game");
    const element = document.createElement("img");
    element.src = "../../scr/assets/PNG/Enemies/enemyRed3.png";
    element.className = "enemy";
    element.width = size;
    container.appendChild(element);
    let enemy = {
        enemyType: "RE3",
        lives: 10,
        element,
        x: 0,
        y: 0,
        cooldown: random(0.5, ENEMY_COOLDOWN),
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


// ============================================================================//
// ############################################################################//
//                              Wave Informatie                                //
// ============================================================================//
// ############################################################################//

// In dit script kan je makkelijk en snel waves maken.
// Hierin heb je meerdere Enemy opties. Je kan ze ook zelf maken.
// Hieruit kan je uit de volgende enemies kiezen:

// Padding (De grote in ruimte tussen enemies)

// BE1
// BE2
// GE2
// GE3
// GE4
// RE1
// RE3

// je kan ook nog zelf toevoegen in het script EnemyTypes. Ook kan je custom maken 
// met de asset pack en een teken programma.

// ============================================================================//
// ############################################################################//
//              Hierin staat de Customization van Wave                        //
// ============================================================================//
// ############################################################################//



function generateWave1() {
    TOP_HEIGHT = 0;
    // ============================================================================//
    //  ROW 1 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//

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

    // ============================================================================//
    //  ROW 2 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================// 

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

    // ============================================================================//
    //  ROW 3 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//

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

// ============================================================================//
// ############################################################################//
//              Hierin staat de Customization van Wave 2                       //
// ============================================================================//
// ############################################################################//




function generateWave2() {
    TOP_HEIGHT = 0;
    // ============================================================================//
    //  ROW 1 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//
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

    // ============================================================================//
    //  ROW 2 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//
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
// ============================================================================//
// ############################################################################//
//              Hierin staat de Customization van Wave 3                       //
// ============================================================================//
// ############################################################################//

function generateWave3() {
    TOP_HEIGHT = 0;
    // ============================================================================//
    //  ROW 1 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//  
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

    // ============================================================================//
    //  ROW 2 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//
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

// ============================================================================//
// ############################################################################//
//              Hierin staat de Customization van Wave 4                       //
// ============================================================================//
// ############################################################################//

function generateWave4() {
    TOP_HEIGHT = 0;
    // ============================================================================//
    //  ROW 1 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//   
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

    // ============================================================================//
    //  ROW 2 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//
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

// ============================================================================//
// ############################################################################//
//              Hierin staat de Customization van Wave 5                       //
// ============================================================================//
// ############################################################################//

function generateWave5() {
    TOP_HEIGHT = 0;
    // ============================================================================//
    //  ROW 1 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================// 
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

    // ============================================================================//
    //  ROW 2 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//   

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

    // ============================================================================//
    //  ROW 3 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//


    CURRENTX = 0
    CURRENTY = 10
}



// ============================================================================//
// ############################################################################//
//              Hierin staat de Customization van Wave 6                       //
// ============================================================================//
// ############################################################################//



function generateWave6() {
    TOP_HEIGHT = 0;
    // ============================================================================//
    //  ROW 1 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//  


    CURRENTX = 0
    CURRENTY = 25 + TOP_HEIGHT

    // ============================================================================//
    //  ROW 2 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//

    CURRENTX = 0
    CURRENTY = 40 + TOP_HEIGHT * 2

    // ============================================================================//
    //  ROW 3 ( MOET MAX GAMEWIDTH ZIJN)      //
    // ============================================================================//  

    CURRENTX = 0
    CURRENTY = 10
}
