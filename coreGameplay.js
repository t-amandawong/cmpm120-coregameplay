// Satisfies requirement of Data-driven experience progression
class Cache extends Phaser.Scene {
	setScore() {
		this.score = parseInt(localStorage.getItem('score')) || 0;
		this.scoreText.setText("Score: " + this.score);
	}

	save() {
		this.file = {
			score: this.score,
			visits: this.visits
		};
		localStorage.setItem('save1', JSON.stringify(this.file));
	}

	load() {
		this.file = JSON.parse(localStorage.getItem('save1'));
		this.score = this.file.score;
		this.visits = this.file.visits;
	}

	updateScore(increment) {
		// Updates the score and stores the new value in the localStorage
		this.score += increment;
		this.scoreText.setText("Score: " + this.score);
		localStorage.setItem('score', this.score);
	}

	init(data) {
		this.file = undefined;
	}

	create() {
	}

	constructor() {
		super("Cache");
	}

	preload() {

	}

	create() {

	}
}

class SceneLoader extends Cache {
	preloadImage(image) {
		this.load.image(image, "assets/" + image + ".png");
	}

	preloadAnimation(image) {
		this.load.image(image, "assets/animations/" + image + ".png");
	}

	readTextFile(file, callback) {
		var rawFile = new XMLHttpRequest();
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
		//usage:
		this.readTextFile("./data.json", (text) => {
			this.data = JSON.parse(text);
			console.log(this.data["leftButton"].asset);
			console.log(this.data["leftButton"].speed);
		});
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
