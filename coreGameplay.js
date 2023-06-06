// Satisfies requirement of Data-driven experience progression prefab3

// Scene Subclasses prefab2
class SceneCache extends Phaser.Scene {
	setScore() {
		this.file.score = parseInt(localStorage.getItem('score')) || 0;
		this.scoreText.setText("Score: " + this.file.score);
		this.saveFile();
	}

	setMuted(muted) {
		this.file.muted = muted;
		this.sound.mute = this.file.muted;
		localStorage.setItem('muted', this.file.muted);
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
				score: 0,
				muted: false
			};
			return;
		}
		this.file = JSON.parse(loadedFile);
	}

	updateScore(increment) {
		// Updates the score and stores the new value in the localStorage
		this.file.score += increment;
		this.scoreText.setText("Score: " + this.file.score);
		localStorage.setItem('score', this.file.score);
		this.saveFile();
	}

	create() {
	}

	constructor() {
		super("Cache");
	}

	preload() {
		this.loadFile();
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
	preloadImage(image) {
		this.load.image(image, "assets/" + image + ".png");
	}

	preloadAnimation(image) {
		this.load.image(image, "assets/animations/" + image + ".png");
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

	preload() {
		// Loads the object config data from a JSON file.  Prefab1
		this.readTextFile("./data.json", (text) => {
			this.data = JSON.parse(text);
		});
		super.preload();
	}

	create() {
		this.scoreText = this.add.text(50, 850, "Score: 0", {
			font: "50px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5,
			align: "center"
		}).setWordWrapWidth(1300);

		this.setScore();

		this.logo = this.add.rectangle(400, 300, 100, 100, 0xFFFFFF).setInteractive();
		this.logo.on('pointerdown', () => {
			this.updateScore(10);
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
		super.create();
	}
}

class Intro extends SceneLoader {
	constructor() {
		super("Intro");
	}

	preload() {
		super.preload();
	}

	create() {
		super.create();
	}
}

const game = new Phaser.Game({
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1400,
		height: 1080
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
	scene: [Intro],
	title: "CMPM 120 Core Gameplay",
});
