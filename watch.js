(function() {
	class Watch {
		constructor(config) {
			this.canvas = config.canvas;
			this.context = this.canvas.getContext("2d");
		}

		render() {
			this._render();
			this._playSound();
		}

		_render() {
			this._renderDial();
			this._renderHourArrow();
			this._renderMinutesArrow();
			this._renderSecondsArrow();

			setTimeout(_ => {
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this._render();
			}, UPDATE_TIMEOUT);
		}

		_renderDial() {
			let ctx = this.context;

			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = DIAL_OUTLINE_COLOR;
			ctx.arc(CENTER_X, CENTER_Y, RADIUS, 0, 2 * Math.PI);
			ctx.fillStyle = DIAL_FILL_COLOR;
			ctx.fill();
			ctx.stroke();

			for (let angle = 0; angle < ANGLES_360; angle += MINUTES_STEP_ANGLE) {
					let x = CENTER_X + ((RADIUS - RADIUS_OFFSET) * Math.cos(this._toRadians(angle)));
					let y = CENTER_Y + ((RADIUS - RADIUS_OFFSET) * Math.sin(this._toRadians(angle)));

				let radius = angle % HOURS_STEP_ANGLE === 0 ? HOUR_RADIUS : MINUTE_RADIUS;

				ctx.beginPath();
				ctx.arc(x, y, radius, 0, 2 * Math.PI);
				ctx.fillStyle = BLACK;
				ctx.fill();
				ctx.stroke();
			}

			this._renderHours();
			this._renderMake();
			this._renderDate();

			this._renderTimezone(TIMEZONE1_CENTER_X, TIMEZEONE_CENTER_Y, TIMEZONE1_HOURS_OFFSET);
			this._renderTimezone(TIMEZONE2_CENTER_X, TIMEZEONE_CENTER_Y, TIMEZONE2_HOURS_OFFSET);
		}

		_renderHours() {
			let ctx = this.context,
				hour = 1;

			for (let angle = -ANGLES_60; angle <= ANGLES_270; angle += HOURS_STEP_ANGLE, hour++) {
					let x = CENTER_X + (HOUR_DIGITS_RADIOUS * Math.cos(this._toRadians(angle)));
					let y = CENTER_Y + (HOUR_DIGITS_RADIOUS * Math.sin(this._toRadians(angle)));

				ctx.font = HOURS_FONT_SIZE + "px Arial";

				let textSize = ctx.measureText(hour);
				let textOffset = HOURS_FONT_SIZE / 2;

				y = y > 0 ? y + textOffset : y - textOffset;

				ctx.fillText(hour, x - textSize.width / 2, y);
			}
		}

		_renderHourArrow() {
			let ctx = this.context,
				angle = this._getHoursAngle(new Date().getHours()),
				x = CENTER_X + ((RADIUS - HOUR_ARROW_LENGTH) * Math.cos(this._toRadians(angle))),
				y = CENTER_Y + ((RADIUS - HOUR_ARROW_LENGTH) * Math.sin(this._toRadians(angle)));

			ctx.beginPath();
			ctx.lineWidth = 4;
			ctx.moveTo(CENTER_X, CENTER_Y);
			ctx.lineTo(x, y);

			ctx.stroke();
		}

		_renderMinutesArrow() {
			let ctx = this.context,
				angle = this._getMinutesAngle(),
				x = CENTER_X + ((RADIUS - MINUTE_ARROW_LENGTH) * Math.cos(this._toRadians(angle))),
				y = CENTER_Y + ((RADIUS - MINUTE_ARROW_LENGTH) * Math.sin(this._toRadians(angle)));

			ctx.beginPath();

			ctx.moveTo(CENTER_X, CENTER_Y);
			ctx.lineTo(x, y);

			ctx.stroke();
		}

		_renderSecondsArrow() {
			let ctx = this.context,
				angle = this._getSecondsAgle(),
				x = CENTER_X + ((RADIUS - SECONDS_ARROW_LENGTH) * Math.cos(this._toRadians(angle))),
				y = CENTER_Y + ((RADIUS - SECONDS_ARROW_LENGTH) * Math.sin(this._toRadians(angle))),
				tailX = CENTER_Y + ((RADIUS - SECONDS_ARROW_TAIL_LENGTH) * Math.cos(this._toRadians(angle + ANGLES_180))),
				tailY = CENTER_Y + ((RADIUS - SECONDS_ARROW_TAIL_LENGTH) * Math.sin(this._toRadians(angle + ANGLES_180)));

			ctx.beginPath();

			ctx.lineWidth = 2;
			ctx.strokeStyle = RED;

			ctx.moveTo(CENTER_X, CENTER_Y);
			ctx.lineTo(x, y);

			ctx.moveTo(CENTER_X, CENTER_Y);
			ctx.lineTo(tailX, tailY);

			ctx.stroke();

			this._renderSecondsArrowWheel();
		}

		_renderSecondsArrowWheel() {
			let ctx = this.context;

			ctx.beginPath();
			ctx.arc(CENTER_X, CENTER_Y, SECONDS_ARROW_WHEEL_RADIUS, 0, 2 * Math.PI);
			ctx.fillStyle = RED;
			ctx.fill();
			ctx.stroke();
		}

		_renderDate() {
			let ctx = this.context;

			ctx.font = HOURS_FONT_SIZE + "px Arial";

			let textWidth = ctx.measureText("00").width + 3;

			ctx.fillStyle = WHITE;
			ctx.fillRect(CENTER_X + DATE_RADIUS - 1, CENTER_Y - HOURS_FONT_SIZE / 2 + 1, textWidth, HOURS_FONT_SIZE);

			ctx.fillStyle = BLACK;
			ctx.fillText(new Date ().getDate(), CENTER_X + DATE_RADIUS, CENTER_Y + HOURS_FONT_SIZE / 2);
			ctx.stroke();
		}

		_renderMake() {
			let ctx = this.context;

			ctx.font = HOURS_FONT_SIZE + "px Arial";

			let textWidth = ctx.measureText(CLOCK_MAKE).width;

			ctx.fillStyle = BLACK;
			ctx.fillText(CLOCK_MAKE, CENTER_X - textWidth / 2, CENTER_Y - 65);
			ctx.stroke();
		}

		_renderTimezone(x, y, hoursOffset) {
			let ctx = this.context;

			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = BLACK;
			ctx.arc(x, y, TIMEZONE_RADIUS, 0, 2 * Math.PI);
			ctx.fillStyle = LIGHTGRAY;
			ctx.fill();

			ctx.stroke();

			for (let angle = 0; angle < ANGLES_360; angle += HOURS_STEP_ANGLE) {
					let x1 = x + ((TIMEZONE_RADIUS - 3) * Math.cos(this._toRadians(angle)));
					let y1 = y + ((TIMEZONE_RADIUS - 3) * Math.sin(this._toRadians(angle)));

				ctx.beginPath();
				ctx.arc(x1, y1, 1, 0, 2 * Math.PI);
				ctx.fillStyle = BLACK;
				ctx.fill();
				ctx.stroke();
			}

			let angle = this._getHoursAngle(new Date().getHours() + hoursOffset, true),
				x2 = x + (TIMEZONE_HOUR_ARROW_RADIUS * Math.cos(this._toRadians(angle))),
				y2 = y + (TIMEZONE_HOUR_ARROW_RADIUS * Math.sin(this._toRadians(angle)));

			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.moveTo(x, y);
			ctx.lineTo(x2, y2);

			ctx.stroke();
		}

		_playSound(on = false) {
			if (on === false) return;

			let audio = new Audio(TICK_TACK_SOUND_FILE);
			audio.addEventListener('timeupdate', function(){
							let buffer = 1;
							if(this.currentTime > this.duration - buffer){
								this.currentTime = 0
								this.play()
							}}, false);
			audio.play();
		}

		_toRadians(degrees) {
			return degrees * Math.PI / ANGLES_180;
		}

		_getHoursAngle(hours, noMinutesPrecission) {
			let hour = hours <= 12 ? hours : hours - 12,
				minutes = new Date().getMinutes(),
				minutesDelta = noMinutesPrecission ? 0 : minutes / 2;

			return (hour * ANGLES_30 + minutesDelta) - ANGLES_90;
		}

		_getMinutesAngle() {
			let minutes = new Date().getMinutes(),
				seconds = new Date().getSeconds(),
				secondsDelta = seconds / 10;

			return (minutes * MINUTES_STEP_ANGLE + secondsDelta) - ANGLES_90;
		}

		_getSecondsAgle() {
			let seconds = new Date().getSeconds();

			return (seconds * MINUTES_STEP_ANGLE) - ANGLES_90;
		}
	}

    window.WatchNamespace = {};
    WatchNamespace.Watch = Watch;

    const CENTER_X = 150,
        CENTER_Y = 150,
        RADIUS = 140,
        HOUR_DIGITS_RADIOUS = RADIUS - 30,
        RADIUS_OFFSET = 10,
        HOUR_RADIUS = 5,
        MINUTE_RADIUS = 2,
        SECONDS_ARROW_WHEEL_RADIUS = 5,
        HOUR_ARROW_LENGTH = 65,
        MINUTE_ARROW_LENGTH = 30,
        SECONDS_ARROW_LENGTH = 20,
        SECONDS_ARROW_TAIL_LENGTH = 105,
        HOURS_FONT_SIZE = 16,
        DATE_RADIUS = 65,
        TIMEZONE_RADIUS = 30,
        DIAL_OUTLINE_COLOR = "#000",
        DIAL_FILL_COLOR = "lightgray",
        CLOCK_MAKE = "SLAVA",
        MINUTES_STEP_ANGLE = 6,
        HOURS_STEP_ANGLE = 30,
        ANGLES_30 = 30,
        ANGLES_60 = 60,
        ANGLES_90 = 90,
        ANGLES_180 = 180,
        ANGLES_270 = 270,
        ANGLES_360 = 360,
        BLACK = "#000",
        RED = "#FF0000",
        WHITE = "#FFF",
        LIGHTGRAY = "lightgray",
        TIMEZONE1_CENTER_X = CENTER_X - 45,
        TIMEZONE2_CENTER_X = CENTER_X + 45,
        TIMEZEONE_CENTER_Y = CENTER_Y + 50,
        TIMEZONE1_HOURS_OFFSET = -3,
        TIMEZONE2_HOURS_OFFSET = 2,
        TIMEZONE_HOUR_ARROW_RADIUS = TIMEZONE_RADIUS - 10,
        UPDATE_TIMEOUT = 1000,
        TICK_TACK_SOUND_FILE = "tick-tack.mp3";
})();