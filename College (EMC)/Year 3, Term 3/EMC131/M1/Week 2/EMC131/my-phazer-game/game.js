// ============================================================
//  game.js  —  My First Phaser Platformer
//  Controls: Arrow keys to move, Up arrow to jump
// ============================================================
 
 
// ── STEP 1: Tell Phaser how big the game is and what physics to use ──────────
 
const config = {
  type: Phaser.AUTO,        // Let Phaser choose WebGL or Canvas automatically
  width: 800,               // Game width in pixels
  height: 600,              // Game height in pixels
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',      // Arcade physics = simple, great for platformers
    arcade: {
      gravity: { y: 400 },  // Pull everything downward (like real gravity)
      debug: false          // Change to true if you want to see hitboxes
    }
  },
  scene: {
    preload: preload,       // Runs once: load images/sounds
    create:  create,        // Runs once: build the level
    update:  update         // Runs 60 times per second: game logic
  }
};
 
// Start the game!
const game = new Phaser.Game(config);
 
 
// ── STEP 2: Declare variables we'll use across all functions ─────────────────
 
let player;       // The character the player controls
let platforms;    // The ground and floating platforms
let cursors;      // Keyboard arrow keys
let stars;        // Collectible stars
let scoreText;    // The text showing the score on screen
let score = 0;    // Starts at zero
 
 
// ── STEP 3: preload() — create simple colored shapes as placeholders ─────────
//    (In a real game you'd load PNG images here instead)
 
function preload() {
  // We use Phaser's texture generator to make colored rectangles/circles.
  // This means you don't need any image files to run the game!
 
  // GREEN rectangle = ground / platform
  const groundGraphic = this.make.graphics({ add: false });
  groundGraphic.fillStyle(0x2ecc71);   // green color
  groundGraphic.fillRect(0, 0, 200, 20);
  groundGraphic.generateTexture('ground', 200, 20);
  groundGraphic.destroy();
 
  // BLUE rectangle = player character
  const playerGraphic = this.make.graphics({ add: false });
  playerGraphic.fillStyle(0x3498db);   // blue color
  playerGraphic.fillRect(0, 0, 30, 40);
  playerGraphic.generateTexture('player', 30, 40);
  playerGraphic.destroy();
 
  // YELLOW circle = collectible star
  const starGraphic = this.make.graphics({ add: false });
  starGraphic.fillStyle(0xf1c40f);     // yellow color
  starGraphic.fillCircle(10, 10, 10);
  starGraphic.generateTexture('star', 20, 20);
  starGraphic.destroy();
}
 
 
// ── STEP 4: create() — place everything into the level ───────────────────────
 
function create() {
 
  // --- Platforms ---
  // staticGroup = platforms that do not move and do not fall
  platforms = this.physics.add.staticGroup();
 
  // Ground: placed near the bottom, scaled wider to cover the screen
  platforms.create(400, 580, 'ground').setScale(4, 1).refreshBody();
  //                 ^    ^              ^scale x4 wide, same height
  //                 |    y position (near bottom of 600px screen)
  //                 x position (center of 800px screen)
 
  // Floating platforms (x position, y position, texture)
  platforms.create(150, 450, 'ground');
  platforms.create(500, 350, 'ground');
  platforms.create(750, 250, 'ground');
  platforms.create(250, 250, 'ground');
 
 
  // --- Player ---
  // physics.add.sprite = a sprite that obeys physics (gravity, collisions)
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.05);             // tiny bounce when landing
  player.setCollideWorldBounds(true); // stops player walking off the edge
 
 
  // --- Collider: makes the player stand on platforms ---
  // Without this line the player falls straight through!
  this.physics.add.collider(player, platforms);
 
 
  // --- Stars ---
  // Creates 12 stars in a row, spaced 64px apart, starting at x=20
  stars = this.physics.add.group({
    key: 'star',           // texture to use
    repeat: 11,            // repeat 11 times = 12 stars total
    setXY: {
      x: 20,               // first star x position
      y: 0,                // start at top — gravity pulls them down
      stepX: 64            // each star is 64px to the right of the last
    }
  });
 
  // Give each star a random bounce so they don't all land at the same time
  stars.children.iterate(function (star) {
    star.setBounceY(Phaser.Math.FloatBetween(0.2, 0.6));
  });
 
  // Stars also land on platforms (not fall through)
  this.physics.add.collider(stars, platforms);
 
  // When the player OVERLAPS a star, call the collectStar function
  this.physics.add.overlap(player, stars, collectStar, null, this);
 
 
  // --- Score text ---
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });
 
 
  // --- Keyboard input ---
  // createCursorKeys() gives us: cursors.left, .right, .up, .down
  cursors = this.input.keyboard.createCursorKeys();
 
}
 
 
// ── STEP 5: collectStar() — what happens when the player touches a star ──────
//    NOTE: 'this' here refers to the Scene because we passed 'this'
//    as the last argument to physics.add.overlap() above.
 
function collectStar(player, star) {
 
  // Hide the star and remove it from physics
  star.disableBody(true, true);
 
  // Add 10 to the score and update the text on screen
  score = score + 10;
  scoreText.setText('Score: ' + score);
 
  // Check if ALL stars have been collected
  if (stars.countActive(true) === 0) {
 
    // Show a win message in the middle of the screen
    this.add.text(200, 250, 'You Win! 🎉', {
      fontSize: '56px',
      fill: '#f1c40f'
    });
 
    // Stop the player from moving
    player.setVelocity(0, 0);
    player.body.moves = false;
 
  }
 
}
 
 
// ── STEP 6: update() — runs every frame (60 times per second) ────────────────
 
function update() {
 
  // --- Left and right movement ---
 
  if (cursors.left.isDown) {
    player.setVelocityX(-180);    // move left
 
  } else if (cursors.right.isDown) {
    player.setVelocityX(180);     // move right
 
  } else {
    player.setVelocityX(0);       // stand still when no key is held
  }
 
 
  // --- Jumping ---
  // player.body.blocked.down = true when the player is standing on something
  // We only allow jumping when on the ground — no double jumping!
 
  const playerIsOnGround = player.body.blocked.down;
 
  if (cursors.up.isDown && playerIsOnGround) {
    player.setVelocityY(-500);    // negative Y = upward in Phaser
    //                   ^^^^
    //          try -400 for a low jump, -600 for a high jump
  }
 
}