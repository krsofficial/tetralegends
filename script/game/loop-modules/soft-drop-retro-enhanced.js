import input from "../../input.js"
import settings from "../../settings.js"
import gameHandler from "../game-handler.js"
import { framesToMs } from "../../shortcuts.js"

const playLandSound = () => {
  let result = false
  let game = gameHandler.game
  if (game.settings.rotationSystem === "heboris") {
	result = true
  }
  if (settings.settings.soundbank === "heboris") {
	result = true
  }
  return result
}

export default function softDropRetro(arg, override) {
  if (input.getGameDown("softDrop") && !arg.piece.softDropIsLocked) {
    arg.piece.gravityOverride = override
    arg.piece.genPieceParticles()
	if (arg.piece.isLanded) {
		if (arg.piece.mustLock === false) {
			arg.piece.mustLock = true
		}
	}
    arg.piece.mustLockRetro = true
	arg.piece.playLandSound = playLandSound()
  } else {
    arg.piece.gravityOverride = 0
    arg.piece.mustLockRetro = false
	arg.piece.playLandSound = true
  }
  if (!input.getGameDown("softDrop")) {
    arg.piece.softDropIsLocked = false
	arg.piece.playLandSound = true
  }
}
