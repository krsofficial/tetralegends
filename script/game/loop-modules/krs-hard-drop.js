import input from "../../input.js"

export default function sonicDrop(arg) {
  if (input.getGamePress("hardDrop")) {
    if (!arg.piece.isLanded) {
		arg.piece.realSonicDrop()
	} else {
		arg.piece.hardDrop()
	}
    if (arg.piece.breakHoldingTimeOnSoftDrop) {
		arg.piece.holdingTime = arg.piece.holdingTimeLimit
    }
  }
}