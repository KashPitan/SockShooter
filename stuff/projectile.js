//function for creating projectiles
var Projectile = function(id,origin,updateVector,projectileId){
    var self = {
      id : id,
      projectileId: projectileId,
      origin:origin,
      location: {x:origin.x,y:origin.y},
      velocity: 2.5,
      updateVector: updateVector,
      update: function(){
        // console.log(this.updateVector);
         this.location.x += (this.velocity * this.updateVector.x);
         this.location.y += (this.velocity * this.updateVector.y);
      }
    }
    return self;
  }
  
  /**origin is the location of the player
   * destination is the position of the mouse
   * updateVector is the update values needed to take
   * the projectile from the origin to the destination
   */

  module.exports = Projectile;