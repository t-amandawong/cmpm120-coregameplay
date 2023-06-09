// Satisfies requirement of Data-driven experience progression prefab3

// dont forget to squash commit dave

// Get an image for the button and player
// implement some kind of bullshit progression system with physics

// Scene Subclasses prefab2
class SceneCache extends Phaser.Scene {
	constructor(sceneName) {
		super(sceneName);
	}

	setMuted(muted) {
		this.file.muted = muted;
		localStorage.setItem('muted', this.file.muted);
		this.saveFile();
		this.sound.setMute(muted);
	}

	updateFullscreen(fullscreen) {
		this.file.fullscreen = fullscreen;
		localStorage.setItem('fullscreen', this.file.fullscreen);
		this.saveFile();
	}

	saveFile() {
		if (this.file == undefined) {
			this.file = this.loadFile();
			return;
		}
		localStorage.setItem('saveFile', JSON.stringify(this.file));
	}

	loadFile() {
		let loadedFile = localStorage.getItem('saveFile');
		// stupid edge cases
		if (loadedFile == undefined || loadedFile == "undefined") {
			this.file = {
				muted: false
			};
			return;
		}
		this.file = JSON.parse(loadedFile);
		this.setMuted(this.file.muted);
	}

	preload() {
		this.loadFile();
		this.load.video("sky", "skyBackground.mp4");
		this.load.video("night", "night.mp4");
		this.canvas = this.sys.game.canvas;
	}
}

class SceneLoader extends SceneCache {
	constructor(sceneName) {
		super(sceneName);
	}
	readTextFile(file, callback) {
		let rawFile = new XMLHttpRequest();
		rawFile.overrideMimeType("application/json");
		rawFile.open("GET", file, true);
		rawFile.onreadystatechange = function () {
			if (rawFile.readyState === 4 && rawFile.status == "200") {
				callback(rawFile.responseText);
			}
		}
		rawFile.send(null);
	}

	renderButtons() {
		console.log(this.data);
		// iterate through the this.data map
		let buttonCenter = {
			x: this.data["buttonCenter"].x,
			y: this.data["buttonCenter"].y,
			delta: this.data["buttonCenter"].delta
		}
		this.button = new Map();
		for (let key in this.data) {
			// create a button for each key
			this.button.set(key,
				this.add.image(buttonCenter.x + (this.data[key].x * buttonCenter.delta), buttonCenter.y + (this.data[key].y * buttonCenter.delta), "button", 0x000000)
					.setInteractive().setScale(1.5));
			// rotate the button to the correct angle
			this.button.get(key).setAngle(this.data[key].rotation);
			this.button.get(key).on('pointerdown', () => {
				this.boop.play();
				this.tweens.add({
					targets: this.button.get(key),
					scaleX: 1.2,
					scaleY: 1.2,
					duration: 50,
					yoyo: false
				});
				this.player.setVelocity(this.data[key].x * this.data.playerSpeed, this.data[key].y * this.data.playerSpeed);
			});
			this.button.get(key).on('pointerup', () => {
				this.player.setVelocity(0, 0);
				this.tweens.add({
					targets: this.button.get(key),
					scaleX: 1.5,
					scaleY: 1.5,
					duration: 50,
					yoyo: false
				});
			});

			this.button.get(key).on('pointerout', () => {
				this.player.setVelocity(0, 0);
				this.tweens.add({
					targets: this.button.get(key),
					scaleX: 1.5,
					scaleY: 1.5,
					duration: 50,
					yoyo: false
				});
			});
		}
	}

	preload() {
		this.load.audio("boop", "boop.mp3");
		this.load.audio("bgm", "bgm_repeated.mp3");
		this.load.image("button", "button.png");
		this.load.image("npcGoon", "FrontIdle.png");
		super.preload();
	}

	create() {
		this.fullscreenbutton = this.add.rectangle(50, this.canvas.height - 50, 100, 100, 0x000000).setInteractive();
		this.fullscreenbutton.on('pointerdown', () => {
			this.boop.play();
			this.tweens.add({
				targets: this.fullscreenbutton,
				scaleX: 0.9,
				scaleY: 0.9,
				duration: 50,
				yoyo: true
			});
			this.updateFullscreen(!this.file.fullscreen);
			if (this.file.fullscreen) {
				this.scale.startFullscreen();
			} else {
				this.scale.stopFullscreen();
			}
		});
		this.fullscreenText = this.add.text(50, this.canvas.height - 50, "Fullscreen", {
			fontFamily: "Arial",
			fontSize: 20,
			color: "#FFFFFF"
		}).setOrigin(0.5, 0.5);

		this.bgm = this.sound.play("bgm", {
			loop: true,
			volume: 0.5
		});
		this.boop = this.sound.add("boop");
		this.muteText = this.add.text(this.canvas.width - 55, 50, "Mute", {
			fontFamily: "Arial",
			fontSize: 50,
			color: "#FFFFFF"
		}).setOrigin(0.5, 0.5);

		this.muteText.setInteractive();
		this.muteText.on('pointerdown', () => {
			this.setMuted(!this.file.muted);
			this.tweens.add({
				targets: this.muteText,
				scaleX: 0.9,
				scaleY: 0.9,
				duration: 50,
				yoyo: true
			});
		});

		if (this.file.fullscreen) {
			this.scale.startFullscreen();
		}
		// Loads the object config data from a JSON file.  Prefab1
		this.readTextFile("./data.json", (text) => {
			this.data = JSON.parse(text);
			this.renderButtons();
		});
		this.player = this.physics.add.sprite(100, 400, "npcGoon")
			.setCollideWorldBounds(true)
			.setMaxVelocity(200, 200);
		this.bottomFloor = this.add.rectangle(310, (this.canvas.height / 2) + 150, this.canvas.width + 200, 10, 0xFFFFFF);
		this.physics.add.existing(this.bottomFloor, false).body.setImmovable(true);
		this.physics.add.collider(this.player, this.bottomFloor);

		this.ceiling = this.add.rectangle(310, (this.canvas.height / 2) - 150, this.canvas.width + 200, 10, 0xFFFFFF);
		this.physics.add.existing(this.ceiling, false).body.setImmovable(true);
		this.physics.add.collider(this.player, this.ceiling);
		this.sceneContainer = this.add.container(0, 0);
		this.victoryButton = this.add.rectangle(1082, 365, 50, 100, 0xFF0000).setInteractive();
		this.physics.add.existing(this.victoryButton, false).body.setImmovable(true);
		this.physics.add.collider(this.player, this.victoryButton, () => {
			this.scene.start("Gameplay");
			this.sound.stopAll();
		});
		this.DoLightMode();
	}

	DoLightMode() {
		// start the sky again
		this.sceneContainer.removeAll();
		this.video = this.add.video(this.canvas.width / 2 - 800, (this.canvas.height / 2) + 270, "sky").setScale(4.05);
		this.video.play(true);
		this.lightMode = true;
		this.nightButton = this.add.rectangle(300, 530, 100, 20, 0x000000).setInteractive();

		this.lightWall = this.add.rectangle(450, (this.canvas.height / 2) - 150, 10, this.canvas.width + 200, 0xFFFFFF);
		this.bottomFloor.setFillStyle(0xFFFFFF);
		this.ceiling.setFillStyle(0xFFFFFF);
		this.physics.add.existing(this.lightWall, false).body.setImmovable(true);
		this.physics.add.collider(this.player, this.lightWall);
		this.sceneContainer.add(this.video);
		this.sceneContainer.add(this.lightWall);
		this.sceneContainer.add(this.nightButton);
		this.sceneContainer.add(this.bottomFloor);
		this.sceneContainer.add(this.ceiling);
		this.sceneContainer.add(this.player);
		this.sceneContainer.add(this.fullscreenbutton);
		this.sceneContainer.add(this.fullscreenText);
		this.sceneContainer.add(this.muteText);
		// this.sceneContainer.add(this.muteButton);
		this.sceneContainer.add(this.victoryButton);
		this.sceneContainer.bringToTop(this.victoryButton);
		this.sceneContainer.bringToTop(this.player);
		this.sceneContainer.bringToTop(this.fullscreenbutton);
		this.sceneContainer.bringToTop(this.fullscreenText);
		this.sceneContainer.bringToTop(this.muteText);
		// this.sceneContainer.bringToTop(this.muteButton);
		this.sceneContainer.sendToBack(this.video);
	}

	DoDarkMode() {
		// TODO use a night sky here start the sky again
		this.sceneContainer.removeAll();
		this.video = this.add.video(this.canvas.width / 2 - 800, (this.canvas.height / 2) + 270, "night").setScale(4.05);
		this.video.play(true);
		this.lightMode = false;
		this.dayButton = this.add.rectangle(700, 255, 100, 20, 0xFFFFFF).setInteractive().setStrokeStyle(5, 0xFFFFFF);

		this.darkWall = this.add.rectangle(750, (this.canvas.height / 2) - 150, 10, this.canvas.width + 200, 0xFFFFFF);
		this.physics.add.existing(this.darkWall, false).body.setImmovable(true);
		this.physics.add.collider(this.player, this.darkWall);
		this.sceneContainer.add(this.video);
		this.sceneContainer.add(this.darkWall);
		this.sceneContainer.add(this.dayButton);
		this.sceneContainer.add(this.bottomFloor);
		this.sceneContainer.add(this.ceiling);
		this.sceneContainer.add(this.player);
		this.sceneContainer.add(this.fullscreenbutton);
		this.sceneContainer.add(this.fullscreenText);
		this.sceneContainer.add(this.muteText);
		this.sceneContainer.bringToTop(this.player);
		this.sceneContainer.bringToTop(this.fullscreenbutton);
		this.sceneContainer.bringToTop(this.fullscreenText);
		this.sceneContainer.bringToTop(this.muteText);
		this.sceneContainer.sendToBack(this.video);
		// this.sceneContainer.sendToBack(this.muteButton);
	}

	update() {
		// if the player is intersecting with the night button, change the background to night
		if (this.lightMode && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.nightButton.getBounds())) {
			this.video.destroy();
			this.nightButton.destroy();
			this.lightWall.destroy();
			this.DoDarkMode();
		} else if (!this.lightMode && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.dayButton.getBounds())) {
			this.video.destroy();
			this.dayButton.destroy();
			this.darkWall.destroy();
			this.DoLightMode();
		}
	}
}

class Gameplay extends SceneLoader {
	constructor() {
		super("Gameplay");
	}

	preload() {
		super.preload();
	}

	create() {
		super.create();
	}
}

class Intro extends Phaser.Scene {
	constructor() {
		super("Intro");
	}

	create() {
		this.add.text(this.sys.game.canvas.width / 2 - 300, this.sys.game.canvas.height / 2 - 50, "Click/Press to play", {
			font: "75px Arial",
			color: "#FFFFFF"
		});
		// on pointer down, go to the gameplay scene
		this.input.on('pointerdown', () => {
			this.scene.start("Gameplay");
		});
	}
}

const game = new Phaser.Game({
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1400,
		height: 780
	},
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: {
				x: 0,
				y: 0
			}
		}
	},
	scene: [Intro, Gameplay],
	title: "CMPM 120 Core Gameplay",
});
