let song
let fft
let m
let modeN = 0
let modes = ['default', 'cos', 'sin']
let particles = []
let amp
let img
let fileInput

function preload() {
    song = new p5.SoundFile();
    img = loadImage('city.jpg')

    noCanvas()


    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //console.log('Great success! All the File APIs are supported');
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    // Make the file input
    fileInput = createFileInput(handleFileSelect)
    fileInput.position(windowWidth/2-55,windowHeight/2)

    // Set attribute to file
    fileInput.attribute('type', 'file')

    // Single file. If we want to allow multiple files, use 'multiple'
    fileInput.attribute('multiple', '')
    function handleFileSelect(file) {
        var audioFile = file;
        song = loadSound(audioFile, loadedSoundCallBack)
    }
}

// When we get text we'll just make a paragraph element with the text
function process(text) {
    createP(text);
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

function button1Function() {
    save(song, 'song.mp3')
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
    fill(0, alpha)
    noStroke()
    rect(0, 0, width, height)

    strokeWeight(4)
    stroke(255)
    noFill()

    let wave = fft.waveform()

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
            particles[i].show()
        } else {
            particles.splice(i, 1)
        }

    }
}

function mouseClicked() {
    if (song.isPlaying()) {
        song.pause()
        noLoop()
    } else {
        song.play()
        loop()
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        if (modeN < 0) {
            modeN = 0
        } else {
            modeN -= 1
            m = modes[(modeN) % modes.length]
        }
    } else if (keyCode === RIGHT_ARROW) {
        m = modes[(modeN + 1) % modes.length]
        modeN += 1
        console.log(m)
    }
}

class Particle {
    constructor() {
        this.pos = p5.Vector.random2D().mult(250)
        this.vel = createVector(0, 0)
        this.acc = this.pos.copy().mult(random(0.0001, 0.00001))
        this.w = random(3, 8)
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
    show() {
        noStroke()
        fill(255)
        ellipse(this.pos.x, this.pos.y, 4)
    }
}