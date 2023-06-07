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
		this.canvas = this.sys.game.canvas;
	}

	create() {
		this.muteButton = this.add.rectangle(1300, 50, 100, 100, 0xFFFFFF).setInteractive();
		this.muteButton.on('pointerdown', () => {
			this.setMuted(!this.file.muted);
			this.tweens.add({
				targets: this.muteButton,
				scaleX: 0.9,
				scaleY: 0.9,
				duration: 50,
				yoyo: true
			});
		});
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
	registerInputHandlers() {
		this.wKey = this.input.keyboard.addKey('W');
		this.aKey = this.input.keyboard.addKey('A');
		this.sKey = this.input.keyboard.addKey('S');
		this.dKey = this.input.keyboard.addKey('D');
		this.fKey = this.input.keyboard.addKey('F');
		this.enterKey = this.input.keyboard.addKey('ENTER');
	}
	create() {
		this.registerInputHandlers();
		this.video = this.add.video(this.canvas.width / 2 - 800, (this.canvas.height / 2) + 270, "sky").setScale(4.05);
		this.video.play(true);

		this.logo = this.add.rectangle(400, 300, 100, 100, 0xFFFFFF).setInteractive();
		this.logo.on('pointerdown', () => {
			this.boop.play();
			this.tweens.add(
				{
					targets: this.logo,
					scaleX: 0.9,
					scaleY: 0.9,
					duration: 50,
					yoyo: true
				}
			);
		});

		this.fullscreenbutton = this.add.rectangle(400, 500, 100, 100, 0x000000).setInteractive();
		this.fullscreenbutton.on('pointerdown', () => {
			this.boop.play();
			this.tweens.add(
				{
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
		this.bgm = this.sound.play("bgm", {
			loop: true,
			volume: 0.5
		});
		this.boop = this.sound.add("boop");
		super.create();
		if (this.file.fullscreen) {
			this.scale.startFullscreen();
		}
		// Loads the object config data from a JSON file.  Prefab1
		this.readTextFile("./data.json", (text) => {
			this.data = JSON.parse(text);
			this.renderButtons();
		});
		this.player = this.physics.add.sprite(400, 300, "npcGoon")
			.setCollideWorldBounds(true)
			.setMaxVelocity(200, 200);
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
		this.add.text(20, 20, "Intro Scene.  Click so I have permission to do stuff", {
			font: "25px Arial",
			fill: "yellow"
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
			debug: true,
			gravity: {
				x: 0,
				y: 0
			}
		}
	},
	scene: [Intro, Gameplay],
	title: "CMPM 120 Core Gameplay",
});
