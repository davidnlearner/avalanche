import Phaser from "phaser";

export const initGame = ({ gameWindow, height, width }) => {
    const config = {
        type: Phaser.CANVAS,
        canvas: gameWindow.current,
        width,
        height,
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 300 },
                debug: false,
            },
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

var player;
var stars;
var platforms;
let crates;
var cursors;
var gameStart = false;
var gameOver = false;
var scoreText;
let score = 0;
let spawnTimer = 0;
let screenY = 0;

function preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("crate", "assets/crate.png");
    this.load.spritesheet("dude", "assets/dude.png", {
        frameWidth: 32,
        frameHeight: 48,
    });
}

function create() {
    this.physics.world.setBounds(0, -1000, 800, 1600);

    this.cameras.main
        .setViewport(0, 0, 800, 600)
        .setBounds(0, 0, 800, 6400)
        .setName("main");

    //  A simple background for our game
    this.add.image(400, 300, "sky");

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 550, "ground").setScale(2).refreshBody();

    //  Now let's create some ledges
    //platforms.create(600, 400, "ground");
    //platforms.create(50, 250, "ground");

    crates = this.physics.add.group();

    // The player and its settings
    player = this.physics.add.sprite(100, 450, "dude");

    player.setCollideWorldBounds(true); //player cannot walk outside window

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
    stars = this.physics.add.group({
        key: "star",
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate(function (child) {
        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    //  The score
    scoreText = this.add.text(16, 16, "score: 0", {
        fontSize: "32px",
        fill: "#000",
    });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(crates, platforms);

    this.physics.add.collider(player, crates);
    this.physics.add.collider(crates, crates);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.cameras.main.startFollow(player);
    console.log(this.physics.world);
}

function update() {
    if (player.body.bottom >= this.cameras.main.height - this.cameras.main.y) {
        playerGameOver();
        return;
    } else {
        screenY += 0.1;
        //this.cameras.main.y = screenY;
        //this.physics.world.setBounds(0, -screenY, 800, 800);

        if (spawnTimer === 200) {
            spawnTimer = 0;
            spawnCrate(-screenY);
        } else {
            spawnTimer += 1;
        }
    }

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

function collectStar(player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText("Score: " + score);

    if (stars.countActive(true) === 0) {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x =
            player.x < 400
                ? Phaser.Math.Between(400, 800)
                : Phaser.Math.Between(0, 400);
    }
}

function spawnCrate(screenY) {
    // will need to give gravity and random scaling
    // need to reduce max x value by box size (post scaling)
    //base width is 512
    const scale = Phaser.Math.FloatBetween(0.1, 0.4);
    const crateWidth = 512 * scale;

    crates
        .create(
            Phaser.Math.Between(crateWidth / 2, 800 - crateWidth / 2),
            screenY,
            "crate"
        )
        .setScale(scale)
        .setPushable(false);
}

function playerGameOver() {
    console.log("game over");
    gameOver = true;
    alert("You lost, game over!");
}
