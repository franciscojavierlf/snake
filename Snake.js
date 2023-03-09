/*******
 *****
 *** Engine
 *****
 *******/

// Sets the html
document.getElementsByTagName("html")[0].innerHTML =
    "<html>" +
        "<head>" +
            "<style>" +
                "html {" +
                    "background-color: #CCCCCC" +
                "}" +
                "body {" +
                    "width: 800px;" +
                    "margin: auto;" +
                    "margin-top: 50px;" +
                "}" +
            "</style>" +
        "</head>" +
        "<body>" +
            "<canvas id='main_canvas' width='800px' height='600px' style='border: 5px solid black;' />" +
        "</body>" +
    "</html>";

/**
 * Main
 **/

// Engine Object
var Engine = {

    scene: null,
    canvas: document.getElementById('main_canvas'),
    context: document.getElementById('main_canvas').getContext('2d'),
    FPS: 60,

    // Runs the program. Just call once.
    start: function () {

        // Starts the main function
        setInterval(this.tick, 1000 / this.FPS);
    },

    // Update function
    tick: function () {

        // Clears canvas. MUST BE ON TOP
        Engine.context.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);

        // Update and render stuff
        if (Engine.scene != null) {
            Engine.scene.tick();
            Engine.scene.render(Engine.context);
        }
    },

    // Writes in window
    debug: function (text) {
        this.context.font = "30px Arial";
        this.context.fillText(text, 10, 30);
    }
};

/**
 * Scene
 **/

function Scene() {

    var objects = [];

    // Adds game object
    this.addGameObject = function (object) {
        object.scene = this;
        objects.push(object);
    }

    // Gets the size of objects
    this.gameObjectCount = function () {
        return objects.length;
    }

    // Gets a specific object
    this.getGameObjectAt = function (i) {
        return objects[i];
    }

    // Returns the game objects at a certain position excluding one
    this.getGameObjectsAtPosition = function (x0, y0, x1, y1, excluded) {
        var list = [];

        for (var i = 0; i < objects.length; i++) {
            if (objects[i].name != excluded.name) {
                if (objects[i].x >= x0 && objects[i].y <= y0 &&
                   objects[i].x <= x1 && objects[i].y >= y1)
                    list.push(objects[i]);
            }
        }

        return list;
    }

    // Update function
    this.tick = function () {

        for (var i = 0; i < objects.length; i++) {

            objects[i].tick();
            objects[i].parentTick();

            // Destroys object
            if (objects[i].isDestroyed()) {
                objects.splice(i, 1);
            }
        }
    }

    // Render function
    this.render = function (context) {

        for (var i = 0; i < objects.length; i++) {
            objects[i].render(context);
        }
    }
}

/**
 * Game Objects
 **/

function GameObject(name) {
    this.scene = null;
    this.name = name;
    this.x = 0;
    this.y = 0;
    this.canvas = null;
    this.sprite = null;
    this.collider = new BoxCollider(this, 5, 5);
    var destroyed = false;

    // Returns if the object is destroyed
    this.isDestroyed = function () {
        return destroyed;
    }

    // Destroy object
    this.destroy = function () {
        destroyed = true;
    }

    // Main update function
    this.parentTick = function () {

        // Updates the collider
        if (this.collider != null)
            this.collider.tick();
    }

    // Update function
    this.tick = function () {
        // Override in instance
    }

    // Render function
    this.render = function (context) {
        // Renders sprite
        this.sprite.render(this.x, this.y, context);

        // Renders canvas
        if (this.canvas != null)
            this.canvas.render(context);
    }

    // Gets called when colliding with object
    this.onCollisionEnter = function (other) {
        // Override in instance
    }

}

// Canvas for writting
function Canvas(name) {
    this.name = name;
    this.x = 0;
    this.y = 0;

    var uiComponents = [];

    // Adds ui component
    this.addUIComponent = function (component) {
        component.canvas = this;
        uiComponents.push(component);
    }

    // Gets the size of ui components
    this.uiComponentsCount = function () {
        return uiComponents.length;
    }

    // Gets a specific ui component
    this.getUIComponentAt = function (i) {
        return uiComponent[i];
    }

    // Render function
    this.render = function (context) {

        for (var i = 0; i < uiComponents.length; i++) {
            uiComponents[i].render(context);
        }
    }
}

// Components for canvas
function UIComponent(canvas) {
    var canvas = canvas;
    this.x = canvas.x;
    this.y = canvas.y;

    // Gets real x
    this.getRealX = function () {
        return this.x + canvas.x;
    }

    // Gets real y
    this.getRealY = function () {
        return this.y + canvas.y;
    }

    // Render function
    this.render = function (context) {
        // Override in instances
    }
}

// Text for canvas
function UIText(canvas, text, size, color) {
    UIComponent.apply(this, arguments);
    this.text = text;
    this.size = size;
    this.color = color;

    // Render function
    this.render = function (context) {
        context.font = this.size + "pt Calibri";
        context.fillStyle = this.color;
        context.fillText(this.text, this.getRealX(), this.getRealY() + this.size);
    }
}


// Sprite for game objects
function Sprite(width, height, color, strokeSize, strokeColor) {
    
    this.width = width;
    this.height = height;
    this.color = color;
    this.strokeSize = strokeSize;
    this.strokeColor = strokeColor;

    // Render function
    this.render = function (x, y, context) {
        context.beginPath();
        context.lineWidth = this.strokeSize;
        context.strokeStyle = this.strokeColor;
        context.fillStyle = this.color;
        context.rect(x, y, this.width, this.height);
        if (strokeSize != "0") context.stroke();
        context.fill();
    }
}

// Box collider for game object
function BoxCollider(object, width, height) {
    var object = object;
    this.xa = 0;
    this.ya = 0;
    this.x = object.x + this.xa;
    this.y = object.y + this.ya;
    this.width = width;
    this.height = height;

    // Update function
    this.tick = function () {

        // Places the collider with the game object
        this.x = object.x + this.xa;
        this.y = object.y + this.ya;

        this.checkCollision();
    }

    // Checks if the collider collides with another
    this.collides = function (collider) {
        if (this.x < collider.x + collider.width &&
            this.x + this.width > collider.x &&
            this.y < collider.y + collider.height &&
            this.height + this.y > collider.y) {

            return true;
        }

        return false;
    }

    // Checks collision in the scene
    this.checkCollision = function () {
        var list = object.scene.getGameObjectsAtPosition(this.x - 100, this.y + 100, this.x + 100, this.y - 100, object);

        for (var i = 0; i < list.length; i++) {
            if (this.collides(list[i].collider))
                object.onCollisionEnter(list[i]);
        }
    }
}

/**
 * Utils
 **/

/**
 * Keyboard Listener
 **/

// Keyboard
var Keyboard = {
    keys: [],
    
    // Keys
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,

    // Checks if a key is pressed
    isKeyPressed: function (i) {
        return this.keys[i];
    }

    // Key codes
};

// On key down
document.addEventListener('keydown', function (event) {
    Keyboard.keys[event.keyCode] = true;
});

// On key up
document.addEventListener('keyup', function (event) {
    Keyboard.keys[event.keyCode] = false;
});


/******
 *****  
 *** Game
 *****
 *******/




// The snake tail pieces
function TailPiece(parent, x, y, idle) {
    // Makes the tail piece a game object
    GameObject.apply(this, arguments);
    this.name = "tail_piece";

    this.idle = idle;
    this.x = x;
    this.y = y;
    this.sprite = new Sprite(25, 25, "red", 0, null);
    this.collider = new BoxCollider(this, 25, 25);
    this.parent = parent;
    this.direction = 1;
    this.lastDirection = 1;

    // Moves the tail
    this.move = function () {

        // Sets the last direction
        this.lastDirection = this.direction;
        this.direction = parent.lastDirection;

        if (this.idle > 0) this.idle--;
        else
            switch (this.direction) {
                case 0: this.y -= 25; break;
                case 1: this.x += 25; break;
                case 2: this.y += 25; break;
                case 3: this.x -= 25; break;
                default: this.x += 25; break;
            }
    }
}

// Snake
function SnakeHead() {
    TailPiece.apply(this, [arguments, null, 0, 0, 0]);
    this.name = "snake";
    this.pausedMovement = false;

    // The score
    this.score = 0;
    this.canvas = new Canvas("score_display");
    var textScore = new UIText(this.canvas, "Score: 0", 20, "white");
    textScore.x = 5;
    textScore.y = 5;
    this.canvas.addUIComponent(textScore);

    // The tail
    var tail = [];

    // Variables for delay
    var time = 0;
    this.delay = 10;

    // Adds a tail piece
    this.addTailPiece = function () {
        var tailPiece;

        // Adds the first piece
        if (tail.length == 0)
            tailPiece = new TailPiece(this, this.x, this.y, 1);
        else
            tailPiece = new TailPiece(tail[tail.length - 1], this.x, this.y, tail.length + 1);

        tail.push(tailPiece);
        this.scene.addGameObject(tailPiece);
    }

    // Update function
    this.tick = function () {

        // Movement
        if (this.lastDirection != 1 && Keyboard.isKeyPressed(Keyboard.ARROW_LEFT))
            this.direction = 3;
        if (this.lastDirection != 3 && Keyboard.isKeyPressed(Keyboard.ARROW_RIGHT))
            this.direction = 1;
        if (this.lastDirection != 2 && Keyboard.isKeyPressed(Keyboard.ARROW_UP))
            this.direction = 0;
        if (this.lastDirection != 0 && Keyboard.isKeyPressed(Keyboard.ARROW_DOWN))
            this.direction = 2;

        if (!this.pausedMovement)
            this.move();
    }

    // Monitors the velocity of the snake
    this.delayMonitor = function () {
        this.delay = 30 - Math.floor(tail.length / 2);
        if (this.delay < 5) this.delay = 5;
    }

    // Moves the snake
    this.move = function () {

        time++;
        if (time % this.delay == 0) {

            switch (this.direction) {
                case 0: this.y -= 25; break;
                case 1: this.x += 25; break;
                case 2: this.y += 25; break;
                case 3: this.x -= 25; break;
                default: this.x += 25; break;
            }

            // Checks if it will be out of bounds
            if (this.x < 0 || this.x >= Engine.canvas.width ||
                this.y < 0 || this.y >= Engine.canvas.height) {

                // Returns the head to its previous position for better visuals
                switch (this.direction) {
                    case 0: this.y += 25; break;
                    case 1: this.x -= 25; break;
                    case 2: this.y -= 25; break;
                    case 3: this.x += 25; break;
                    default: this.x -= 25; break;
                }

                this.gameOver();

                // Avoids moving the tail
                return;
            }

            // Moves the tail
            for (var i = 0; i < tail.length; i++) {
                tail[i].move();
            }

            // Sets the new last direction
            this.lastDirection = this.direction;

            // Monitors the velocity of the snake depending on the length
            this.delayMonitor();
        }
    }

    // On collision enter
    this.onCollisionEnter = function (other) {

        // Eats a fruit
        if (other.name == "fruit") {
            this.score += 1;
            textScore.text = "Score: " + this.score;
            this.addTailPiece();
            other.destroy();
            addRandomFruit(this.scene);
        }

        // Hits the tail
        if (other.name == "tail_piece" && other.idle <= 0) {
            this.gameOver();
        }
    }

    // Lose
    this.gameOver = function () {
        this.pausedMovement = true;
        var lose = new UIText(this.canvas, "Game Over", 24, "white");
        lose.x = 300;
        lose.y = 200;
        this.canvas.addUIComponent(lose);
        textScore.y = 230;
        textScore.x = 320;
    }
}

// Adds a random fruit when called
function addRandomFruit(scene) {
    var fruit = new GameObject("fruit");
    fruit.sprite = new Sprite(25, 25, "green");
    fruit.collider = new BoxCollider(fruit, 25, 25);
    fruit.x = parseInt(Math.random() * 32) * 25;
    fruit.y = parseInt(Math.random() * 24) * 25;
    fruit.onCollisionEnter = function (other) {

        // Resets the position of the fruit if it collides with the tail or other object
        if (other.name != "snake") {
            fruit.x = parseInt(Math.random() * 32) * 25;
            fruit.y = parseInt(Math.random() * 24) * 25;
        }
    }

    scene.addGameObject(fruit);
}

function startGame() {
    var scene = new Scene();

    var snake = new SnakeHead();
    scene.addGameObject(snake);

    // Adds first fruit
    addRandomFruit(scene);

    // Sets background to black
    document.getElementById('main_canvas').style = "background-color: black; border: 5px solid grey;";

    Engine.scene = scene;
    Engine.start();
}

// Starts game
startGame();