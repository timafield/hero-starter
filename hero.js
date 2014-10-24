
/* Personal bot ideas:
 * Basic:
 *  - Go to nearest "thing" <- anything: mine, grave, opposing hero, friendly
 *  	hero, health well...
 *  - Unless: low on health, then avoid enemies and seek nearest health source.
 * Alternate:
 *  - Strategically "drift" toward empty space. Still go for diamond mines
 *  	but prefer going along areas with less enemies & conversely more
 *  	friends.
 * Coward:
 *  - Try to always keep a few friends inbetween hero and enemies.
 *  - Opportunistically get diamonds, health etc.
*/

// increments(or sets) and gets turn number
function getTurn(hero) {
  if (typeof hero.turn_number__ === 'undefined') {
    hero.turn_number__ = 1;
    return 1;
  } else {
    hero.turn_number__++;
    return hero.turn_number__;
  }
}

var move = function(gameData, helpers) {
  var myHero = gameData.activeHero;
  
  //Get stats on the nearest health well
  var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
    if (boardTile.type === 'HealthWell') {
      return true;
    }
  });

  var nearestWeakerEnemyStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
    return boardTile.type === 'Hero' && boardTile.team !== myHero.team && boardTile.health < myHero.health;
  });

  var nearestEnemyStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
    return boardTile.type === 'Hero' && boardTile.team !== myHero.team;
  })

  var nearestTeamMemberStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
    return boardTile.type === 'Hero' && boardTile.team === myHero.team;
  });

  var nearestNonTeamDiamondMineStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
    if (boardTile.type === 'DiamondMine') {
      if (boardTile.owner) {
        return boardTile.owner.team !== myHero.team;
      } else {
        return true;
      }
    } else {
      return false;
    }
  });

  //Heal no matter what if low health
  if (myHero.health < 40) {
    return healthWellStats.direction;
  //Finish Healing / oportunistic healing
  } else if (myHero.health < 100 && healthWellStats.distance === 1) {
    return healthWellStats.direction;
  //If next to team member with < 50 health, heal them
  } else if (myHero.health === 100 && nearestTeamMemberStats.distance === 1 && nearestTeamMemberStats.health < 50) {
    return nearestTeamMemberStats.direction
  /*
  // if next to nonTeam diamond mine, and full health, capture it.
  } else if (myHero.health === 100 && nearestNonTeamDiamondMineStats.distance === 1) {
    return nearestNonTeamDiamondMineStats.direction
  */
  //If healthy, fight an enemy! (prefer weaker enemies)
  } else if (nearestWeakerEnemyStats.distance >= 1) {
    return nearestWeakerEnemyStats.direction;
  // if adjacent enemy has similar health, fight him (if we stick at it, my hero will win, 
  // assuming no other enemies come by)
  } else if (nearestEnemyStats.distance === 1 && nearestEnemyStats.health <= myHero.health) {
    return nearestEnemyStats.direction;
  // if no weaker or adjacent, similarly healthy enemies, get to full health.
  } else if (myHero.health < 100) {
    return healthWellStats.direction;
  // if full health and no other opportunities, attack enemies (but capture a mine if it is nearby)
  } else if (nearestNonTeamDiamondMineStats.distance <= 2) {
    return nearestNonTeamDiamondMineStats.direction;
  // sometimes, even though there is a player on the map, they are
  // unreachable...
  } else if (nearestEnemyStats.distance >= 1) {
    return nearestEnemyStats.direction;
  } else {
    return "Stay";
  }

  // todo: sanity check. Flee obviously suicidal situations (i.e. surrounded by 3 enemies and health < 90!)
  // todo: related, with multiple enemies that are equidistant, make sure hero goes after the weakest one.
  // todo: avoid attacking enemies that are within 1 of healthwell (avoid infinite battles)
};

function findHealthAtRisk(board, hero, dir, helpers) {
  var origdft,newdft = hero.distanceFromTop;
  var origdfl,newdft = hero.distanceFromLeft;

  if (direction === 'North') {
      fromTopNew -= 1;
  } else if (direction === 'East') {
      fromLeftNew += 1;
  } else if (direction === 'South') {
      fromTopNew += 1;
  } else if (direction === 'West') {
      fromLeftNew -= 1;
  }

  if (!helpers.validCoordinates(board, newdft, newdfl)) {
    newdft = origdft;
    newdfl = origdfl;
  }

  var healthAtRisk = 0
  
  // get tile trying to move to
  var newTile = helpers.getTileNearby(board, newdft, newdfl, dir);
  
  // check if tile is blocker
  if (newTile.type !== 'Unoccupied') {
    newdft = origdft;
    newdfl = origdfl;
    if (newTile.type === 'Hero' && newTile.team != hero.team) {
      const healthFleeThresh = 30;
      const fullAttackPts = 30;
      // assuming they will flee if they have 30 health pts
      if (newTile.health <= healthFleeThresh + fullAttackPts) {
      	healthAtRisk -= 30;
      }
    } else if (newTile.type === 'DiamondMine') {
      healthAtRisk += 20;
    } else if (newTile.type === 'HealthWell') {
      healthAtRisk -= 40;
    }
  }



}

// Escape Artist
// Wanders, but is never killed
function escapeArtist(gameData, helpers) {
  var myHero = gameData.activeHero;
  
  // list length 5 that measures health at risk for choosing a particular dir
  var healthAtRisk = [];
  for (var i = 0; i < 5; i++) healthAtRisk.push(Infinity);

  var directions = ["North", "East", "South", "West", "Stay"];

  for (var i = 0; i < 5; i++) {
    healthAtRisk[i] = findHealthAtRisk(gameData.board, 
    				       myHero, 
				       directions[i],
				       helpers);

  
  
  }
  



  // randomly select direction
  // check if direction is safe
  // 

}

/*
// The "Selfish Diamond Miner"
// This hero will attempt to capture diamond mines (even those owned by teammates).
var move = function(gameData, helpers) {
  var myHero = gameData.activeHero;

  //Get stats on the nearest health well
  var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
    if (boardTile.type === 'HealthWell') {
      return true;
    }
  });

  var distanceToHealthWell = healthWellStats.distance;
  var directionToHealthWell = healthWellStats.direction;

  if (myHero.health < 40) {
    //Heal no matter what if low health
    return directionToHealthWell;
  } else if (myHero.health < 100 && distanceToHealthWell === 1) {
    //Heal if you aren't full health and are close to a health well already
    return directionToHealthWell;
  } else {
    //If healthy, go capture a diamond mine!
    return helpers.findNearestUnownedDiamondMine(gameData);
  }
};
*/

// Export the move function here:
module.exports = move;
