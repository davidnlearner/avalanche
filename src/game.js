import Phaser from "phaser";

let player;
//var stars;
var platforms;
let background;
let backgroundSpawnHeight = 300;
let lava;
let crates;
var cursors;
var gameOver = false;
var scoreText;
let score = 0;
let spawnTimer = 0;
let lavaSpeed = 0.1;
let zoneHeight = 600;
let gameOverText = "     Game Over: \nThe lava caught up.";

let screenYOffset = 0;
const topOffset = 100;

export const initGame = ({ gameWindow, height, width }) => {
    const config = {
        type: Phaser.CANVAS,
        canvas: gameWindow.current,
        width,
        height,
        transparent: true,
        roundPixels: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 300 },
                debug: false,
                fps: 100,
            },
        },
        scale: {
            mode: Phaser.Scale.FIT,
            //autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: {
            preload: preload,
            create: create,
            update: update,
        },
    };

    const game = new Phaser.Game(config);
    return game;
};

function preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/ground.png");
    this.load.image("star", "assets/star.png");
    this.load.image("crate", "assets/crate.png");
    this.load.spritesheet("dude", "assets/dude.png", {
        frameWidth: 32,
        frameHeight: 48,
    });

    this.load.spritesheet("button", "assets/button_sprite_sheet.png", {
        frameWidth: 193,
        frameHeight: 71,
    });
}

function create() {
    this.physics.world.setBounds(0, 0, 800, 600);

    this.cameras.main
        .setViewport(0, 0, 800, 600)
        .setBounds(0, 0, 800, 600)
        .setName("main");

    background = this.physics.add.staticGroup();
    background.depth = 0;

    //  A simple background for our game
    background.create(400, 300, "sky");
    const secondImage = background.create(400, -300, "sky");
    secondImage.flipY = true;

    //  The platforms group contains the ground
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    platforms.create(400, 550, "ground").refreshBody();

    // group for falling crates
    crates = this.physics.add.group();

    // The player and its settings
    player = this.physics.add.sprite(350, 350, "dude");
    player.depth = 90;

    //player.setCollideWorldBounds(true); //player cannot walk outside window

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: "turn",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20,
    });

    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    // stars = this.physics.add.group({
    //     key: "star",
    //     repeat: 11,
    //     setXY: { x: 12, y: 0, stepX: 70 },
    // });

    //  The score
    scoreText = this.add.text(16, 16, "Score: 0", {
        fontSize: "32px",
        fill: "#000",
    });
    scoreText.depth = 100;

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(crates, platforms);

    this.physics.add.collider(player, crates, checkGameOver, null, this);
    this.physics.add.collider(crates, crates, stopGravity, null, this);

    lava = this.add.rectangle(400, 650, 800, 50, 0xff0000, 0.25);
    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    //this.physics.add.collider(stars, platforms);
    //this.physics.add.overlap(player, stars, collectStar, null, this);

    this.cameras.main.startFollow(player);
    this.cameras.main.followOffset.set(0, 100);
}

function update() {
    if (player.x > this.cameras.main.width) {
        player.x = 0;
    } else if (player.x < 0) {
        player.x = this.cameras.main.width;
    }

    if (player.body.bottom >= lava.y - player.height) {
        gameOver = true;
    }

    if (gameOver) {
        this.cameras.main.stopFollow();

        const text = this.add.text(200, 300 - screenYOffset, gameOverText, {
            fontSize: "32px",
            fill: "#000",
        });
        text.depth = 100;

        const restartText = this.add
            .text(300, 400 - screenYOffset, "Restart?", {
                fontSize: "32px",
                fill: "#000",
                backgroundColor: "#fff",
            })
            .setPadding(5)
            .setInteractive({ useHandCursor: true });

        restartText.depth = 100;

        this.input.on(
            "pointerdown",
            function (pointer) {
                const checkX = pointer.x > 300 && pointer.x < 450;
                const checkY =
                    pointer.y > 400 - screenYOffset &&
                    pointer.y > 350 - screenYOffset;
                if (pointer.leftButtonDown() && checkX && checkY) {
                    restartGame(this);
                }
            },
            this
        );

        player.setVelocityX(0);
        player.anims.stop();

        return;
    } else {
        screenYOffset = 500 - player.y;

        lava.height += lavaSpeed;
        lava.y -= lavaSpeed;

        //first zone is the ground at 600,
        if (lava.y < zoneHeight) {
            lavaSpeed += 0.1;
            zoneHeight -= 2000;
        }

        this.physics.world.setBounds(
            0,
            -screenYOffset - topOffset,
            800,
            600 + screenYOffset + topOffset
        );

        this.cameras.main.setBounds(
            0,
            -screenYOffset,
            800,
            600 + screenYOffset
        );

        scoreText.y = this.cameras.main._bounds.top + 120;
        score += 0.1;
        spawnTimer += 1;

        if (spawnTimer % 200 === 0) {
            spawnCrate(-screenYOffset);
        }

        if (screenYOffset >= backgroundSpawnHeight) {
            addSkyTile(this, backgroundSpawnHeight);
            backgroundSpawnHeight += 600;
        }

        scoreText.setText("Score: " + Math.round(score));

        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play("left", true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play("right", true);
        } else {
            player.setVelocityX(0);
            player.anims.play("turn");
        }
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }
}

function spawnCrate(screenY) {
    // will need to give gravity and random scaling
    // need to reduce max x value by box size (post scaling)
    //base width is 512
    const scale = Phaser.Math.FloatBetween(0.1, 0.35);
    const crateWidth = 512 * scale;

    const crate = crates
        .create(
            Phaser.Math.Between(crateWidth / 2, 800 - crateWidth / 2),
            screenY - crateWidth / 2,
            "crate"
        )
        .setScale(scale)
        .setPushable(false);
    crate.depth = 50;
}

function stopGravity(crate1, crate2) {
    var b1 = crate1.body;
    var b2 = crate2.body;
    if (b1.y > b2.y) {
        b2.y += b1.top - b2.bottom;
        b2.stop();
    } else {
        b1.y += b2.top - b1.bottom;
        b1.stop();
    }
}

function checkGameOver(player, crate) {
    if (crate.body.bottom === player.body.top && crate.body.speed > 10) {
        gameOver = true;
        gameOverText = "     Game Over: \nYou've been crushed";
    }
}

// function collectStar(player, star) {
//     star.disableBody(true, true);

//     //  Add and update the score
//     score += 10;
//     scoreText.setText("Score: " + score);

//     if (stars.countActive(true) === 0) {
//         //  A new batch of stars to collect
//         stars.children.iterate(function (child) {
//             child.enableBody(true, child.x, 0, true, true);
//         });

//         var x =
//             player.x < 400
//                 ? Phaser.Math.Between(400, 800)
//                 : Phaser.Math.Between(0, 400);
//     }
// }

function addSkyTile(scene, offset) {
    const image = background.create(400, -(600 + offset), "sky");
    if ((offset - 300) % 1200 !== 0) {
        image.flipY = true;
    }
}

export function restartGame(scene) {
    console.log(scene);
    gameOver = false;
    score = 0;
    spawnTimer = 0;
    gameOverText = "     Game Over: \nThe lava caught up.";
    backgroundSpawnHeight = 300;
    screenYOffset = 0;
    lavaSpeed = 0.1;

    scene.scene.restart();
}
