
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
        return boardTile.owner.team !== hero.team;
      } else {
        return true;
      }
    } else {
      return false;
    }
  });

  //Heal no matter what if low health
  if (myHero.health <= 40) {
    return healthWellStats.direction;
  //Finish Healing / oportunistic healing
  } else if (myHero.health < 100 && healthWellStats.distance === 1) {
    return healthWellStats.direction;
  //If next to team member with < 50 health, heal them
  } else if (nearestTeamMemberStats.distance === 1 && nearestTeamMemberStats.health < 50) {
    return nearestTeamMemberStats.direction
  /*
  // if next to nonTeam diamond mine, and full health, capture it.
  } else if (myHero.health === 100 && nearestNonTeamDiamondMineStats.distance === 1) {
    return nearestNonTeamDiamondMineStats.direction
  */
  //If healthy, fight an enemy! (prefer weaker enemies)
  } else if (nearestWeakerEnemyStats.distance >= 1) {
    return nearestWeakerEnemyStats.direction;
  // if no weaker enemies, get to full health before attacking others
  } else if (myHero.health < 100) {
    return healthWellStats.direction
  // if no weaker enemies, there must be a stronger one (probably everyone has 100% health left)
  } else {
    return helpers.findNearestEnemy(gameData)
  }
};

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
