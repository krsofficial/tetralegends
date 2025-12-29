import input from "../../input.js"
import settings from "../../settings.js"
import gameHandler from "../game-handler.js"
import { framesToMs } from "../../shortcuts.js"

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
  } else {
    arg.piece.gravityOverride = 0
    arg.piece.mustLockRetro = false
  }
  if (!input.getGameDown("softDrop")) {
    arg.piece.softDropIsLocked = false
  }
}
