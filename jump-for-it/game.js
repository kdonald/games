var canvas = document.getElementById("canvas"),
context = canvas.getContext("2d"), loop = null;

canvas.width = 640;
canvas.height = 480;

var clear = function() {
  context.fillStyle = "#000000";
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.closePath();
  context.fill();
}

var platformsModule = (function() {

  var platform = (function() {
    var prototype = {
      draw: function() {
        context.fillStyle = "#ff0000";
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.closePath();
        context.fill();        
      },        
      collided: function(player) {
        console.log("collided into platform at (" + this.x + ", " + this.y + ")");
        player.fallStop();
        player.onPlatform(this);        
        return this;        
      },
      supporting: function(player) {
        return player.x + 25 < this.x + this.width &&
          player.x + player.width - 38 > this.x &&
          player.y + player.height > this.y &&
          player.y + player.height < this.y + this.height;
      }
    }
    return function(x, y, height, width) {
      return Object.create(prototype, {
        x: { value: x },
        y: { value: y },
        height: { value: height },
        width: { value: width }
      });
    }
  })();

  var prototype = {
    init: function() {
      for (var i = 0; i < this.number; i++) {
        this.data.push(platform(Math.random() * canvas.width,
          Math.random() * canvas.height, this.height, this.width));
      }
      return this;    
    },
    draw: function() {
      for (var i = 0; i < this.number; i++) {
        this.data[i].draw();
      }
    },
    checkCollision: function(player) {
      var self = this;
      if (player.falling) {
        this.data.forEach(function(platform) {
          if (platform.supporting(player)) {
            platform.collided(player);
          }
        });       
      }
    }
  };

  return function(number, width, height) {
    return Object.create(prototype, {
      number: { value: number },
      width: { value: width },
      height: { value: height },
      data: { value: [] }
    }).init();
  }

})();


var platforms = platformsModule(10, 70, 18);

var player = new (function() {
  this.image = new Image();
  this.image.src = "sunny.png";
  this.width = 100;
  this.height = 123;
  this.x = 0;
  this.y = 0;
  this.space = 18;

  this.jumping = false;
  this.falling = false;
  this.jumpSpeed = 0;
  this.fallSpeed = 0;

  this.jump = function() {
    if (!this.jumping && !this.falling) {
      this.fallSpeed = 0;
      this.jumping = true;
      this.jumpSpeed = 17;
      delete this.platform;
    }
  }

  this.checkJump = function() {
    console.log("jumping", "y", this.y, "jumpSpeed", this.jumpSpeed, this.y - this.jumpSpeed);   
    this.setPosition(this.x, this.y - this.jumpSpeed);
    this.jumpSpeed--;
    if (this.jumpSpeed == 0) {
      this.fall();
    }
  }

  this.fall = function() {
      this.jumping = false;
      this.falling = true;
      this.fallSpeed = 1;
  }

  this.checkFall = function() {
    console.log("falling", "y", this.y, "fallSpeed", this.fallSpeed, canvas.height - this.height);
    if (this.y < canvas.height - this.height) {
      this.setPosition(this.x, Math.min(canvas.height - this.height, this.y + this.fallSpeed));
      this.fallSpeed++;
    } else {
      this.fallStop();
    }
  }

  this.fallStop = function() {
    console.log("Stopping on y", this.y);
    this.falling = false;    
  }

  this.setPosition = function(x, y) {
  	this.x = x;
  	this.y = y;
    console.log("set player position to (" + this.x + ", " + this.y + ")");    
  }

  this.draw = function() {
  	try {
  	  context.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    } catch (e) {
      //sometimes, if character's image is too big and will not load until the drawing of the first frame, Javascript will throws error and stop executing everything. To avoid this we have to catch an error and retry painting in another frame. It is invisible for the user with 50 frames per second.
    }
  }

  this.moveLeft = function() {
    // move him left one space
    if (this.x > 0) {
      this.setPosition(this.x - this.space, this.y);
      if (this.slippedOffPlatform()) {
        delete this.platform;
        this.fall();
      }
    }
  }

  this.moveRight = function() {
    // move hime right one space
    if (this.x + this.width < canvas.width) {
      this.setPosition(this.x + this.space, this.y);
      if (this.slippedOffPlatform()) {
        delete this.platform;       
        this.fall();
      }
    }        
  }

  this.slippedOffPlatform = function() {
    return this.platform ? this.platform.supporting(player) === false : false;
  }

  this.onPlatform = function(platform) {
    this.platform = platform;
  }

})();

player.setPosition(~~((canvas.width - player.width) / 2), canvas.height - player.height);

var gameLoop = function() {
  clear();
  if (player.jumping) {
    player.checkJump();    
  } else if (player.falling) {
    player.checkFall();
  }
  platforms.draw();  
  platforms.checkCollision(player);  
  player.draw();
  loop = setTimeout(gameLoop, 20);
}

$(document).keydown(function(e) {
  if (e.keyCode === 37) {
    player.moveLeft();
  } else if (e.keyCode === 39) {
    player.moveRight();
  } else if (e.keyCode === 38) {
    player.jump();
  }
});

gameLoop();
