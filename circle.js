let fft
let m
let modeN = 0
let modes = ['default', 'cos', 'sin']
let particles = []
let amp
let img
let fileInput
let song
let songs = []
let col = 0

function preload() {
    img = loadImage('city.jpg')
    fileInput = createFileInput(handleFileSelect, "true")
    fileInput.position(windowWidth / 2 - 55, windowHeight / 2)
    fileInput.attribute('type', 'file')
    function handleFileSelect(file) {
        var audioFile = file;
        songs.push(loadSound(new p5.SoundFile(audioFile), loadedSoundCallBack))
    }
}

function setup() {
    angleMode(DEGREES)
    imageMode(CENTER)
    rectMode(CENTER)
    fft = new p5.FFT(0.3)
    createCanvas(windowWidth, windowHeight)
}


function loadedSoundCallBack() {
    fileInput.remove()
}

function draw() {

    background(0)
    translate(width / 2, height / 2)

    push()

    fft.analyze()
    amp = fft.getEnergy(20, 200)

    push()
    if (amp > 230) {
        rotate(random(-0.5, 0.5))
    }

    image(img, 0, 0, width, height)
    pop()

    let alpha = map(amp, 0, 255, 180, 150)
    fill(col, alpha)
    noStroke()
    rect(0, 0, width, height)

    strokeWeight(4)
    stroke(255)
    noFill()

    let wave = fft.waveform()

    push()
    for (let t = -1; t <= 1; t += 2) {
        beginShape()
        for (let i = 0; i <= 180; i += 0.5) {
            let index = floor(map(i, 0, 180, 0, wave.length - 1))
            let r = map(wave[index], -1, 1, 150, 350)
            let x = r * sin(i) * t
            let y = r * cos(i)
            vertex(x, y)
        }
        endShape()
    }
    pop()

    let p = new Particle()
    particles.push(p)

    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].edges()) {
            particles[i].update(amp > 200)
            particles[i].show(amp > 200)
        } else {
            particles.splice(i, 1)
        }

    }
}

let current = 0
function currSong() {
    if (keyCode === LEFT_ARROW) {
        if (current < 0) {
            current = 0
        } else {
            current -= 1
        }
    } else if (keyCode === RIGHT_ARROW) {
        current += 1
    }
    return current % songs.length
}

function mouseClicked() {
    updateState()
}

function updateState() {
    for (let i = 0; i < songs.length; i++) {
        song = songs[i]
        if (current % songs.length != i) {
            song.pause()
        } else {
            if (song.isPlaying()) {
                song.pause()
                noLoop()
            } else {
                song.play()
                loop()
            }
        }
    }
}

function keyPressed() {
    currSong()
    updateState()
}

class Particle {
    constructor() {
        this.pos = p5.Vector.random2D().mult(250)
        this.vel = createVector(0, 0)
        this.acc = this.pos.copy().mult(random(0.0001, 0.00001))
        this.w = random(3, 8)
        this.wi = random(14, 24)
        this.c = color(random(255),random(255),random(255))
    }
    edges() {
        if (this.pos.x < -width / 2 || this.pos.x > width / 2 ||
            this.pos.y < -height / 2 || this.pos.y > height / 2) {
            return true
        } else {
            return false
        }
    }
    update(cond) {
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        if (cond) {
            this.pos.add(this.vel)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
        }
    }
    show(cond) {
        noStroke()
        fill(this.c)
        ellipse(this.pos.x, this.pos.y, !cond ? this.w : this.wi)
    }
}