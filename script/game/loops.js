import $, {
  bpmToMs,
  framesToMs,
  resetAnimation,
  roundBpmToMs,
  roundMsToFrames,
} from "../shortcuts.js"
import {
  gravity,
  classicGravity,
  deluxeGravity,
} from "./loop-modules/gravity.js"
import { PIECE_COLORS, SOUND_SETS } from "../consts.js"
import addStaticScore from "./loop-modules/add-static-score.js"
import arcadeScore from "./loop-modules/arcade-score.js"
import collapse from "./loop-modules/collapse.js"
import firmDrop from "./loop-modules/firm-drop.js"
import tgmSoftDrop from "./loop-modules/tgm-soft-drop.js"
import krsSoftDrop from "./loop-modules/krs-soft-drop.js"
import krsHardDrop from "./loop-modules/krs-hard-drop.js"
import gameHandler from "./game-handler.js"
import handheldDasAre from "./loop-modules/handheld-das-are.js"
import hardDrop from "./loop-modules/hard-drop.js"
import hold from "./loop-modules/hold.js"
import hyperSoftDrop from "./loop-modules/hyper-soft-drop.js"
import initialDas from "./loop-modules/initial-das.js"
import initialHold from "./loop-modules/initial-hold.js"
import initialRotation from "./loop-modules/initial-rotation.js"
import linesToLevel from "./loop-modules/lines-to-level.js"
import lockFlash from "./loop-modules/lock-flash.js"
import respawnPiece from "./loop-modules/respawn-piece.js"
import rotate from "./loop-modules/rotate.js"
import rotate180 from "./loop-modules/rotate-180.js"
import shifting from "./loop-modules/shifting.js"
import shiftingRetro from "./loop-modules/shifting-retro.js"
import sonicDrop from "./loop-modules/sonic-drop.js"
import softDrop from "./loop-modules/soft-drop.js"
import softDropRetro from "./loop-modules/soft-drop-retro.js"
import softDropNes from "./loop-modules/soft-drop-nes.js"
import sound from "../sound.js"
import updateLasts from "./loop-modules/update-lasts.js"
import {
  extendedLockdown,
  retroLockdown,
  classicLockdown,
  infiniteLockdown,
  beatLockdown,
  zenLockdown,
  krsLockdown,
} from "./loop-modules/lockdown.js"
import updateFallSpeed from "./loop-modules/update-fallspeed.js"
import shiftingNes from "./loop-modules/shifting-nes.js"
import nesDasAre from "./loop-modules/nes-das-are.js"
import settings from "../settings.js"
import input from "../input.js"
import locale from "../lang.js"
import rotateReverse from "./loop-modules/rotate-reverse.js"
let lastLevel = 0
let garbageTimer = 0
let shown20GMessage = false
let shownHoldWarning = false
let lastSeenI = 0
let lastBravos = 0
let lastGrade = ""
let rtaGoal = 0
let isEndRoll = false
let endRollPassed = false
let endRollLines = 0
let preEndRollLines = 0
let levelTimer = 0
let levelTimerLimit = 58000
let lastPieces = 0
let underwaterProgression = 0
let testMode = false
let nonEvents = []
let coolProgression = 0
let regretsPenalty = 0
let coolsBonus = 0
let coolPacing = 50
let shiraseTargetLevel = 1300
let bpm
const levelUpdate = (game) => {
  let returnValue = false
  if (game.stat.level !== lastLevel) {
    sound.add("levelup")
    game.stack.levelUpAnimation = 0
    if (game.stat.level % 5 === 0) {
      sound.add("levelupmajor")
    } else {
      sound.add("levelupminor")
    }
    returnValue = true
  }
  lastLevel = game.stat.level
  return returnValue
}
const levelUpdateAce = (game) => {
  let returnValue = false
  if (game.stat.level !== lastLevel) {
    sound.add("levelup")
    game.stack.levelUpAnimation = 0
    if ((game.stat.level - 1) % 5 === 0) {
      sound.add("levelupmajor")
    } else {
      sound.add("levelupminor")
    }
    returnValue = true
  }
  lastLevel = game.stat.level
  return returnValue
}
const testModeUpdate = () => {
	if (input.getGamePress("testModeKey")) {
		if (testMode !== false) {
			testMode = false
		} else {
			testMode = true
		}
	}
}
const levelUpdateSega = (game) => {
  let returnValue = false
  if (game.stat.level !== lastLevel) {
    if (game.stat.level % 2 === 0 || game.stat.level > 15) {
      sound.add("levelup")
	  sound.add("levelupmajor")
    }
    returnValue = true
  }
  lastLevel = game.stat.level
  return returnValue
}
const krsLevelSystem = (game, pieceRequirement) => {
	let returnValue = false
	game.stat.level = Math.floor(game.stat.piece / pieceRequirement) + 1
	if (game.stat.level !== lastLevel) {
		sound.add("levelup")
		sound.add("levelupmajor")
		returnValue = true
	}
	lastLevel = game.stat.level
	return returnValue
}
const krsGradingSystem = (
	game, 
	gradingTable = [
		[0, "N/A"],
	],
	firstGrade = "N/A",
) => {
	for (const pair of gradingTable) {
        const score = pair[0]
        const grade = pair[1]
        if (game.stat.score >= score) {
			game.stat.grade = grade
			break
        }
    }
	if (lastGrade !== game.stat.grade && game.stat.grade !== "N/A") {
		if (game.stat.grade !== firstGrade) {
			sound.add("gradeup")
		}
	}
	lastGrade = game.stat.grade
}
const updateArcadeBg = (game) => {
	if (game.stat.level >= 1900) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back19.png')`)}
	else if (game.stat.level >= 1800) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back18.png')`)}
	else if (game.stat.level >= 1700) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back17.png')`)}
	else if (game.stat.level >= 1600) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back16.png')`)}
	else if (game.stat.level >= 1500) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back15.png')`)}
	else if (game.stat.level >= 1400) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back14.png')`)}
	else if (game.stat.level >= 1300) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back13.png')`)}
	else if (game.stat.level >= 1200) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back12.png')`)}
	else if (game.stat.level >= 1100) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back11.png')`)}
	else if (game.stat.level >= 1000) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back10.png')`)}
	else if (game.stat.level >= 900) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back9.png')`)}
	else if (game.stat.level >= 800) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back8.png')`)}
	else if (game.stat.level >= 700) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back7.png')`)}
	else if (game.stat.level >= 600) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back6.png')`)}
	else if (game.stat.level >= 500) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back5.png')`)}
	else if (game.stat.level >= 400) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back4.png')`)}
	else if (game.stat.level >= 300) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back3.png')`)}
	else if (game.stat.level >= 200) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back2.png')`)}
	else if (game.stat.level >= 100) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back1.png')`)}
	else if (game.stat.level >= 0) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back0.png')`)}
}
const updateAceBg = (game) => {
	if (game.stat.level >= 20) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back19.png')`)}
	else if (game.stat.level >= 19) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back18.png')`)}
	else if (game.stat.level >= 18) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back17.png')`)}
	else if (game.stat.level >= 17) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back16.png')`)}
	else if (game.stat.level >= 16) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back15.png')`)}
	else if (game.stat.level >= 15) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back14.png')`)}
	else if (game.stat.level >= 14) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back13.png')`)}
	else if (game.stat.level >= 13) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back12.png')`)}
	else if (game.stat.level >= 12) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back11.png')`)}
	else if (game.stat.level >= 11) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back10.png')`)}
	else if (game.stat.level >= 10) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back9.png')`)}
	else if (game.stat.level >= 9) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back8.png')`)}
	else if (game.stat.level >= 8) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back7.png')`)}
	else if (game.stat.level >= 7) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back6.png')`)}
	else if (game.stat.level >= 6) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back5.png')`)}
	else if (game.stat.level >= 5) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back4.png')`)}
	else if (game.stat.level >= 4) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back3.png')`)}
	else if (game.stat.level >= 3) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back2.png')`)}
	else if (game.stat.level >= 2) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back1.png')`)}
	else if (game.stat.level >= 1) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back0.png')`)}
}
const updateSegaBg = (game) => {
	if (game.stat.level >= 20) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back9.png')`)}
	else if (game.stat.level >= 19) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back9.png')`)}
	else if (game.stat.level >= 18) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back9.png')`)}
	else if (game.stat.level >= 17) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back8.png')`)}
	else if (game.stat.level >= 16) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back8.png')`)}
	else if (game.stat.level >= 15) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back7.png')`)}
	else if (game.stat.level >= 14) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back7.png')`)}
	else if (game.stat.level >= 13) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back6.png')`)}
	else if (game.stat.level >= 12) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back6.png')`)}
	else if (game.stat.level >= 11) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back5.png')`)}
	else if (game.stat.level >= 10) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back5.png')`)}
	else if (game.stat.level >= 9) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back4.png')`)}
	else if (game.stat.level >= 8) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back4.png')`)}
	else if (game.stat.level >= 7) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back3.png')`)}
	else if (game.stat.level >= 6) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back3.png')`)}
	else if (game.stat.level >= 5) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back2.png')`)}
	else if (game.stat.level >= 4) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back2.png')`)}
	else if (game.stat.level >= 3) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back1.png')`)}
	else if (game.stat.level >= 2) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back1.png')`)}
	else if (game.stat.level >= 1) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back0.png')`)}
	else if (game.stat.level >= 0) {document.getElementById("arcadeBackground").style.setProperty("background-image", `url('bgs/back0.png')`)}
}
const updateTAPGrade = (game) => {
	  if (game.stat.level >= 999 && game.stat.line >= 180 && game.stack.isHidden && endRollPassed && endRollLines >= 32)
		game.stat.grade = "GM"
	  else if (game.stat.level >= 999 && game.stat.line >= 180)
        game.stat.grade = "M"
      else if (game.stat.line >= 170)
        game.stat.grade = "S9"
	  else if (game.stat.line >= 160)
        game.stat.grade = "S8"
	  else if (game.stat.line >= 150)
        game.stat.grade = "S7"
	  else if (game.stat.line >= 140)
        game.stat.grade = "S6"
	  else if (game.stat.line >= 130)
        game.stat.grade = "S5"
	  else if (game.stat.line >= 120)
        game.stat.grade = "S4"
	  else if (game.stat.line >= 110)
        game.stat.grade = "S3"
	  else if (game.stat.line >= 110)
        game.stat.grade = "S2"
	  else if (game.stat.line >= 95)
        game.stat.grade = "S1"
	  else if (game.stat.line >= 80)
        game.stat.grade = "1"
	  else if (game.stat.line >= 70)
        game.stat.grade = "2"
	  else if (game.stat.line >= 60)
        game.stat.grade = "3"
	  else if (game.stat.line >= 50)
        game.stat.grade = "4"
	  else if (game.stat.line >= 40)
        game.stat.grade = "5"
	  else if (game.stat.line >= 30)
        game.stat.grade = "6"
	  else if (game.stat.line >= 20)
        game.stat.grade = "7"
	  else if (game.stat.line >= 10)
        game.stat.grade = "8"
	  else if (game.stat.line >= 0)
        game.stat.grade = "9"
	  if (lastGrade !== game.stat.grade && game.stat.grade !== "N/A") {
		  if (game.stat.grade !== "9") {
			  sound.add("gradeup")
		  }
	  }
	  lastGrade = game.stat.grade
}
const updateTADGrade = (game) => {
	  if (game.stat.level >= 999) game.stat.grade = "GM"
      else if (game.stat.level >= 500 && game.torikanPassed) game.stat.grade = "M"
	  if (lastGrade !== game.stat.grade && game.stat.grade !== "N/A") {
		  sound.add("gradeup")
	  }
	  lastGrade = game.stat.grade
}
const updateShiraseGrade = (game) => {
	  if (game.stat.level >= 2000)
		game.stat.grade = "S20"
	  else if (game.stat.level >= 1900)
        game.stat.grade = "S19"
	  else if (game.stat.level >= 1800)
        game.stat.grade = "S18"
	  else if (game.stat.level >= 1700)
        game.stat.grade = "S17"
	  else if (game.stat.level >= 1600)
        game.stat.grade = "S16"
	  else if (game.stat.level >= 1500)
        game.stat.grade = "S15"
	  else if (game.stat.level >= 1400)
        game.stat.grade = "S14"
	  else if (game.stat.level >= 1300)
        game.stat.grade = "S13"
	  else if (game.stat.level >= 1200)
        game.stat.grade = "S12"
	  else if (game.stat.level >= 1100)
        game.stat.grade = "S11"
	  else if (game.stat.level >= 1000)
        game.stat.grade = "S10"
      else if (game.stat.level >= 900)
        game.stat.grade = "S9"
	  else if (game.stat.level >= 800)
        game.stat.grade = "S8"
	  else if (game.stat.level >= 700)
        game.stat.grade = "S7"
	  else if (game.stat.level >= 600)
        game.stat.grade = "S6"
	  else if (game.stat.level >= 500)
        game.stat.grade = "S5"
	  else if (game.stat.level >= 400)
        game.stat.grade = "S4"
	  else if (game.stat.level >= 300)
        game.stat.grade = "S3"
	  else if (game.stat.level >= 200)
        game.stat.grade = "S2"
	  else if (game.stat.level >= 100)
        game.stat.grade = "S1"
	  else if (game.stat.level >= 0)
        game.stat.grade = "1"
}
const updateTIGrade = (game) => {
	  let coolProgressionTable =  [
		[79, 1],
		[179, 2],
		[279, 3],
		[379, 4],
		[479, 5],
		[579, 6],
		[679, 7],
		[779, 8],
		[879, 9],
	  ]
	  let timeRequirementTable = [
		coolPacing + ((coolPacing / 0.8) * 0),
		coolPacing + ((coolPacing / 0.8) * 1),
		coolPacing + ((coolPacing / 0.8) * 2),
		coolPacing + ((coolPacing / 0.8) * 3),
		coolPacing + ((coolPacing / 0.8) * 4),
		coolPacing + ((coolPacing / 0.8) * 5),
		coolPacing + ((coolPacing / 0.8) * 6),
		coolPacing + ((coolPacing / 0.8) * 7),
		coolPacing + ((coolPacing / 0.8) * 8),
	  ]
	  let gradeTable = [
		"9",
		"8",
		"7",
		"6",
		"5",
		"4",
		"3",
		"2",
		"1",
		"S1",
		"S2",
		"S3",
		"S4",
		"S5",
		"S6",
		"S7",
		"S8",
		"S9",
		"M1",
		"M2",
		"M3",
		"M4",
		"M5",
		"M6",
		"M7",
		"M8",
		"M9",
		"M",
		"MK",
		"MV",
		"MO",
		"MM",
		"GM",
	  ]
	  let lineRequirementTable = [
		0,
		10,
		20,
		30,
		40,
		50,
		60,
		70,
		80,
		90,
		100,
		110,
		120,
		130,
		140,
		150,
		160,
		170,
		180,
		190,
		200,
		210,
		220,
		230,
		240,
		250,
		260,
		270,
	  ]
	  let gradeIndex = 0
	  if (game.stat.level >= 999 && regretsPenalty <= 0 && game.stack.isHidden && endRollPassed && endRollLines >= 32)
		gradeIndex = 32
	  else {
	    for (const line of lineRequirementTable) {
			if (game.stat.line >= line) {
				if (game.stat.level >= 999 && endRollLines >= 32) {
					gradeIndex = Math.max(
						0, 
						Math.min(
							31 - regretsPenalty, 
							lineRequirementTable.indexOf(line) + coolsBonus - regretsPenalty
						)
					)
				} else if (game.stat.level >= 999 && endRollLines >= 24) {
					gradeIndex = Math.max(
						0, 
						Math.min(
							30 - regretsPenalty, 
							lineRequirementTable.indexOf(line) + coolsBonus - regretsPenalty
						)
					)
				} else if (game.stat.level >= 999 && endRollLines >= 16) {
					gradeIndex = Math.max(
						0, 
						Math.min(
							29 - regretsPenalty, 
							lineRequirementTable.indexOf(line) + coolsBonus - regretsPenalty
						)
					)
				} else if (game.stat.level >= 999 && endRollLines >= 8) {
					gradeIndex = Math.max(
						0, 
						Math.min(
							28 - regretsPenalty, 
							lineRequirementTable.indexOf(line) + coolsBonus - regretsPenalty
						)
					)
				} else if (game.stat.level >= 999 && endRollLines >= 0) {
					gradeIndex = Math.max(
						0, 
						Math.min(
							27 - regretsPenalty, 
							lineRequirementTable.indexOf(line) + coolsBonus - regretsPenalty
						)
					)
				} else {
					gradeIndex = Math.max(
						0, 
						Math.min(
							26 - regretsPenalty, 
							lineRequirementTable.indexOf(line) + coolsBonus - regretsPenalty
						)
					)
				}
			}
		}
	  }
	  game.stat.grade = gradeTable[gradeIndex]
	  for (const pair of coolProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && coolProgression < entry) {
          if (game.rta <= timeRequirementTable[entry - 1] * 1000) {
			  if (entry <= 1) {
				coolPacing = game.rta
			  }
			  sound.add("onpace")
			  game.displayActionText("COOL!!!")
			  coolsBonus += 1
		  } else {
			  if (coolsBonus >= 1) {
				sound.add("offpace")
				game.displayActionText("REGRET!")
			  }
			  regretsPenalty += 1
		  }
		  coolProgression = entry
        }
      }
}
const resetCoolsAndRegrets = (game) => {
	  coolProgression = 0
	  regretsPenalty = 0
	  coolsBonus = 0
	  coolPacing = 50
}
const updateAsukaGrade = (game) => {
	  if (game.stat.level >= 1300)
		game.stat.grade = "AM"
	  else if (game.stat.level >= 1200)
        game.stat.grade = "Am-G12"
	  else if (game.stat.level >= 1100)
        game.stat.grade = "Am-G11"
	  else if (game.stat.level >= 1000)
        game.stat.grade = "Am-G10"
      else if (game.stat.level >= 900)
        game.stat.grade = "Am-G9"
	  else if (game.stat.level >= 800)
        game.stat.grade = "Am-G8"
	  else if (game.stat.level >= 700)
        game.stat.grade = "Am-G7"
	  else if (game.stat.level >= 600)
        game.stat.grade = "Am-G6"
	  else if (game.stat.level >= 500)
        game.stat.grade = "Am-G5"
	  else if (game.stat.level >= 400)
        game.stat.grade = "Am-G4"
	  else if (game.stat.level >= 300)
        game.stat.grade = "Am-G3"
	  else if (game.stat.level >= 200)
        game.stat.grade = "Am-G2"
	  else if (game.stat.level >= 100)
        game.stat.grade = "Am-G1"
	  else if (game.stat.level >= 0)
        game.stat.grade = "N/A"
}
const updateRoundsGrade = (game) => {
	  if (game.stat.level >= 2600 && game.rta <= 435000)
		game.stat.grade = "GM-Rounds"
	  else if (game.stat.level >= 2600)
        game.stat.grade = "GM"
	  else if (game.stat.level >= 2500)
        game.stat.grade = "M25"
	  else if (game.stat.level >= 2400)
        game.stat.grade = "M24"
	  else if (game.stat.level >= 2300)
        game.stat.grade = "M23"
	  else if (game.stat.level >= 2200)
        game.stat.grade = "M22"
	  else if (game.stat.level >= 2100)
        game.stat.grade = "M21"
	  else if (game.stat.level >= 2000)
        game.stat.grade = "M20"
	  else if (game.stat.level >= 1900)
        game.stat.grade = "M19"
	  else if (game.stat.level >= 1800)
        game.stat.grade = "M18"
	  else if (game.stat.level >= 1700)
        game.stat.grade = "M17"
	  else if (game.stat.level >= 1600)
        game.stat.grade = "M16"
	  else if (game.stat.level >= 1500)
        game.stat.grade = "M15"
	  else if (game.stat.level >= 1400)
        game.stat.grade = "M14"
	  else if (game.stat.level >= 1300)
        game.stat.grade = "M13"
	  else if (game.stat.level >= 1200)
        game.stat.grade = "M12"	
	  else if (game.stat.level >= 1100)
        game.stat.grade = "M11"
	  else if (game.stat.level >= 1000)
        game.stat.grade = "M10"
	  else if (game.stat.level >= 900)
        game.stat.grade = "M9"
	  else if (game.stat.level >= 800)
        game.stat.grade = "M8"
	  else if (game.stat.level >= 700)
        game.stat.grade = "M7"
	  else if (game.stat.level >= 600)
        game.stat.grade = "M6"
	  else if (game.stat.level >= 500)
        game.stat.grade = "M5"
	  else if (game.stat.level >= 400)
        game.stat.grade = "M4"
	  else if (game.stat.level >= 300)
        game.stat.grade = "M3"
	  else if (game.stat.level >= 200)
        game.stat.grade = "M2"
	  else if (game.stat.level >= 100)
        game.stat.grade = "M1"
	  else if (game.stat.level >= 0)
        game.stat.grade = "N/A"
}

export const loops = {
  sudden: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      game.rta += arg.ms
      arcadeScore(arg)
      linesToLevel(arg, 999, 100)
      game.endSectionLevel =
        game.stat.level >= 900
          ? 999
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
	  updateTADGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      //sonicDrop(arg, true);
      //firmDrop(arg, 1, true);
      //extendedLockdown(arg);
      //classicLockdown(arg);
	  if (
		settings.settings.rotationSystem === "arsae"
		) {
		  if (input.getGameDown("specialKey")) {
			tgmSoftDrop(arg)
			hardDrop(arg)
		  } else {
			sonicDrop(arg, true)
			firmDrop(arg, 1, true)
		  }
		  extendedLockdown(arg)
	  } else if (
		settings.settings.rotationSystem === "worldae"
	  ) {
		  tgmSoftDrop(arg)
		  hardDrop(arg)
		  extendedLockdown(arg)
	  } else {
		  sonicDrop(arg, true)
		  firmDrop(arg, 1, true)
		  classicLockdown(arg)
	  }
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  testModeUpdate()
    },
    onInit: (game) => {
	  if (
		settings.settings.rotationSystem === "arsae" ||
		settings.settings.rotationSystem === "worldae"
		) {
		  game.hold.isDisabled = false
		  game.next.nextLimit = 6
	  } else {
		  game.hold.isDisabled = false
		  game.next.nextLimit = 1
	  }
      game.stat.level = 0
      game.isRaceMode = true
      game.stat.grade = "N/A"
	  lastGrade = ""
      game.rta = 0
      game.piece.gravity = framesToMs(1 / 20)
      game.torikanPassed = false
      game.stat.initPieces = 2
      game.endingStats.grade = true
      game.musicProgression = 0
      game.drop = 0
      game.updateStats()
    },
    onPieceSpawn: (game) => {
      const areTable = [
        [101, 18],
        [301, 14],
        [401, 8],
        [500, 7],
        [1000, 6],
      ]
      const areLineModifierTable = [
        [101, -4],
        [301, -6],
        [1000, 0],
      ]
      const areLineTable = [
        [101, 12],
        [401, 6],
        [500, 5],
        [1000, 4],
      ]
      const dasTable = [
        [200, 12],
        [300, 11],
        [400, 10],
        [1000, 8],
      ]
      const lockDelayTable = [
        [101, 30],
        [201, 26],
        [301, 22],
        [401, 18],
        [1000, 15],
      ]
      const musicProgressionTable = [
        [279, 1],
        [300, 2],
        [479, 3],
        [500, 4],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
            case 3:
              sound.killBgm()
              break
            case 2:
              sound.loadBgm(["arcade3"], "tap")
              sound.killBgm()
              sound.playBgm(["arcade3"], "tap")
              break
            case 4:
              sound.loadBgm(["arcade4"], "tap")
              sound.killBgm()
              sound.playBgm(["arcade4"], "tap")
          }
          game.musicProgression = entry
        }
      }
      if (game.stat.level >= 500 && game.rta <= 205000)
        game.torikanPassed = true
      else if (
        (game.stat.level >= 500 && !game.torikanPassed) ||
        game.stat.level === 999
      ) {
        if (game.stat.level < 999) game.stat.level = 500
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99 &&
        game.stat.level !== 998
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }

      updateFallSpeed(game)
    },
  },
  special: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      game.rta += arg.ms
      arcadeScore(arg)
      linesToLevel(arg, 999, 100)
      game.endSectionLevel =
        game.stat.level >= 900
          ? 999
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
      updateTAPGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      sonicDrop(arg, true)
      firmDrop(arg, 1, game.piece.gravity < framesToMs(1) && game.piece.isLanded)
      //extendedLockdown(arg);
      classicLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.stat.level >= 999) {
		  if (isEndRoll === false) {
			  isEndRoll = true
			  game.stack.endRollStart()
			  if (testMode === false && game.rta <= 600000 && game.stat.line >= 180) {
				game.stack.isHidden = true
				game.stack.isFading = false
			  } else {
				if (testMode === false) {
					game.stack.isFading = true
				} else {
					game.stack.isFading = false
				}
				game.stack.isHidden = false
			  }
			  rtaGoal = game.rta + 55000
			  sound.loadBgm(["ending"], "tap")
			  sound.killBgm()
			  sound.playBgm(["ending"], "tap")
		  } else if (isEndRoll === true) {
			  if (game.rta >= rtaGoal) {
			  endRollPassed = true
			  }
		  }
		  game.stat.level = 999
		  endRollLines = Math.max(0, (game.stat.line - preEndRollLines))
	  } else {
		  preEndRollLines = game.stat.line
		  endRollLines = 0
	  }
	  if (game.stat.level >= 999 && endRollPassed) {
		game.stat.level = 999
		$("#kill-message").textContent = locale.getString("ui", "excellent")
		sound.killVox()
		sound.add("voxexcellent")
		game.end(true)
	  }
	  testModeUpdate()
    },
    onInit: (game) => {
      game.stat.level = 0
      game.isRaceMode = true
	  isEndRoll = false
	  endRollPassed = false
      game.stat.grade = "N/A"
	  lastGrade = ""
	  //game.arcadeCombo = 1;
      game.rta = 0
	  game.stack.redrawOnHidden = true
	  game.stack.isHidden = false
	  game.stack.isFading = false
	  game.redrawOnLevelUp = true
      game.torikanPassed = false
      game.stat.initPieces = 2
      game.endingStats.grade = true
      game.musicProgression = 0
      game.updateStats()
	  updateFallSpeed(game)
    },
    onPieceSpawn: (game) => {
      const areTable = [
		[100, 30],
		[200, 24],
		[300, 20],
        [400, 18],
        [500, 16],
        [600, 14],
        [800, 12],
        [1000, 12],
      ]
      const areLineModifierTable = [
        [400, -4],
        [600, -6],
        [800, 0],
      ]
      const areLineTable = [
		[100, 30],
		[200, 24],
		[300, 20],
		[400, 18],
        [500, 16],
        [600, 14],
        [800, 12],
        [1000, 12],
      ]
      const dasTable = [
        [400, 12],
        [600, 11],
        [800, 10],
        [1000, 8],
      ]
	  let gravityDenominator = 1
      const gravityTable = [
        [8, 4],
        [19, 5],
        [35, 6],
        [40, 8],
        [50, 10],
        [60, 12],
        [70, 16],
        [80, 32],
        [90, 48],
        [100, 64],
        [108, 4],
        [119, 5],
        [125, 6],
        [131, 8],
        [139, 12],
        [149, 32],
        [156, 48],
        [164, 80],
        [174, 112],
        [180, 128],
        [200, 144],
        [212, 176],
        [221, 192],
        [232, 208],
        [244, 224],
        [256, 240],
        [267, 260],
        [277, 280],
        [287, 300],
        [295, 320],
        [300, 340],
		[310, 360],
		[320, 380],
		[330, 400],
		[340, 420],
		[350, 440],
		[360, 480],
		[370, 500],
		[380, 540],
		[390, 580],
		[400, 600],
      ]
      const lockDelayTable = [
        [101, 30],
        [400, 28],
        [600, 26],
        [800, 24],
        [1000, 22],
      ]
      const musicProgressionTable = [
        [479, 1],
        [500, 2],
        [679, 3],
        [700, 4],
		[879, 5],
		[900, 6],
		[979, 7],
		[999, 8],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
            case 3:
              sound.killBgm()
              break
			case 5:
              sound.killBgm()
              break
			case 7:
              sound.killBgm()
              break
            case 2:
              sound.loadBgm(["arcade2"], "tap")
              sound.killBgm()
              sound.playBgm(["arcade2"], "tap")
              break
            case 4:
              sound.loadBgm(["arcade3"], "tap")
			  sound.killBgm()
			  sound.playBgm(["arcade3"], "tap")
			case 3:
              sound.loadBgm(["arcade4"], "tap")
			  sound.killBgm()
			  sound.playBgm(["arcade4"], "tap")
             }
          game.musicProgression = entry
        }
      }
	  
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99 &&
        game.stat.level !== 998
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
	  
	  for (const pair of gravityTable) {
        const level = pair[0]
        const denom = pair[1]
        if (game.stat.level < level) {
          gravityDenominator = denom
          break
        }
      }
	  if (game.stat.level < 400) {
		  game.piece.ghostIsVisible = game.stat.level < 100
		  game.piece.gravity = framesToMs(256 / gravityDenominator)
	  } else {
		  game.piece.ghostIsVisible = false
		  game.piece.gravity = framesToMs(1 / 20)
      }
      updateFallSpeed(game)
    },
   },
  novice: {
    update: (arg) => {
	  const game = gameHandler.game
	  updateArcadeBg(game)
      gameHandler.game.rta += arg.ms
      if (input.getGameDown("softDrop")) {
        gameHandler.game.drop += arg.ms
      }
      if (input.getGamePress("hardDrop")) {
        gameHandler.game.drop += framesToMs(2 * arg.piece.getDrop())
      }
      arcadeScore(arg, roundMsToFrames(gameHandler.game.drop), 6)
      linesToLevel(arg, 300, 300)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      sonicDrop(arg)
      firmDrop(arg)
      classicLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  testModeUpdate()
    },
    onPieceSpawn: (game) => {
      game.drop = 0
      if (game.stat.level === 300) {
        game.stat.score += Math.max(
          0,
          (300 - Math.floor(game.rta / 1000)) * 1253
        )
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      } else if (game.stat.initPieces === 0 && game.stat.level !== 299) {
        game.stat.level = game.stat.level + 1
      } else {
        game.stat.initPieces = game.stat.initPieces - 1
      }
      if (game.stat.level >= 280) {
        sound.killBgm()
      }
      let gravityDenominator = 1
      const gravityTable = [
        [8, 4],
        [19, 5],
        [35, 6],
        [40, 8],
        [50, 10],
        [60, 12],
        [70, 16],
        [80, 32],
        [90, 48],
        [100, 64],
        [108, 4],
        [119, 5],
        [125, 6],
        [131, 8],
        [139, 12],
        [149, 32],
        [156, 48],
        [164, 80],
        [174, 112],
        [180, 128],
        [200, 144],
        [212, 16],
        [221, 48],
        [232, 80],
        [244, 112],
        [256, 144],
        [267, 176],
        [277, 192],
        [287, 208],
        [295, 224],
        [300, 240],
      ]
      for (const pair of gravityTable) {
        const level = pair[0]
        const denom = pair[1]
        if (game.stat.level < level) {
          gravityDenominator = denom
          break
        }
      }
	  game.piece.lockDelayLimit = Math.ceil(framesToMs(30))
      game.piece.gravity = framesToMs(256 / gravityDenominator)
      game.piece.ghostIsVisible = game.stat.level < 100
      updateFallSpeed(game)
    },
    onInit: (game) => {
      game.stat.level = 0
      game.rta = 0
      game.isRaceMode = true
      game.arcadeCombo = 1
      game.drop = 0
      game.stat.initPieces = 2
      game.appends.level = `<span class="small">/300</span>`
      updateFallSpeed(game)
      game.updateStats()
    },
  },
  suddenti: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      game.rta += arg.ms
      arcadeScore(arg)
      linesToLevel(arg, shiraseTargetLevel, 100)
      game.endSectionLevel = Math.min(shiraseTargetLevel, Math.floor(game.stat.level / 100 + 1) * 100)
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
      updateShiraseGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      //sonicDrop(arg, true)
      //firmDrop(arg, 1, true)
      //extendedLockdown(arg);
      //classicLockdown(arg)
	  if (
		settings.settings.rotationSystem === "arsae"
		) {
		  if (input.getGameDown("specialKey")) {
			tgmSoftDrop(arg)
			hardDrop(arg)
		  } else {
			sonicDrop(arg, true)
			firmDrop(arg, 1, true)
		  }
		  extendedLockdown(arg)
		  game.piece.boneColor = "white"
	  } else if (
		settings.settings.rotationSystem === "worldae"
	  ) {
		  tgmSoftDrop(arg)
		  hardDrop(arg)
		  extendedLockdown(arg)
		  game.piece.boneColor = "green"
	  } else {
		  sonicDrop(arg, true)
		  firmDrop(arg, 1, true)
		  classicLockdown(arg)
		  game.piece.boneColor = "white"
	  }
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  game.copyBottomForGarbage = true
	  if (arg.piece.startingAre >= arg.piece.startingAreLimit) {
        garbageTimer += arg.ms
        if (garbageTimer > 10240) {
          garbageTimer -= 10240
          if (game.stat.level >= 500 && game.stat.level <= 1000) {
			  arg.stack.addGarbageToCounter(1)
		  }
        }
      }
	  testModeUpdate()
    },
    onInit: (game) => {
	  if (
		settings.settings.rotationSystem === "arsae" ||
		settings.settings.rotationSystem === "worldae"
		) {
		  game.next.nextLimit = 6
		  shiraseTargetLevel = 2000
	  } else {
		  game.next.nextLimit = 3
		  shiraseTargetLevel = 1300
	  }
      game.stat.level = 0
      game.isRaceMode = true
      game.stat.grade = "N/A"
	  //game.arcadeCombo = 1;
      game.rta = 0
      game.piece.gravity = framesToMs(1 / 20)
      game.torikanPassed = false
      game.stat.initPieces = 2
      game.endingStats.grade = true
      game.musicProgression = 0
      game.drop = 0
      game.updateStats()
	  garbageTimer = 0
    },
    onPieceSpawn: (game) => {
	  if (game.stat.level >= 1000) {
		 game.piece.useBoneBlocks = true
	  }
	  else {
		 game.piece.useBoneBlocks = false
	  }
      const areTable = [
        [101, 8],
        [301, 7],
        [401, 6],
        [500, 6],
        [1000, 6],
      ]
      const areLineModifierTable = [
        [101, -4],
        [301, -6],
        [1000, 0],
      ]
      const areLineTable = [
        [101, 8],
        [401, 7],
        [500, 6],
        [1000, 6],
      ]
      const dasTable = [
        [200, 10],
        [300, 8],
        [400, 6],
        [1000, 6],
		[1200, 6],
      ]
      const lockDelayTable = [
        [101, 20],
        [201, 20],
        [301, 18],
        [401, 18],
		[601, 14],
		[801, 12],
        [1001, 10],
		[1201, 10],
      ]
      const musicProgressionTable = [
        [479, 1],
        [500, 2],
        [679, 3],
        [700, 4],
		[979, 5],
		[1000, 6],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
            case 3:
              sound.killBgm()
              break
			case 5:
			  sound.killBgm()
			  break
            case 2:
              sound.loadBgm(["arcade4"], "arcade")
              sound.killBgm()
              sound.playBgm(["arcade4"], "arcade")
              break
            case 4:
              sound.loadBgm(["arcade5"], "arcade")
              sound.killBgm()
              sound.playBgm(["arcade5"], "arcade")
			  break
			case 6:
			  sound.loadBgm(["arcade6"], "arcade")
              sound.killBgm()
              sound.playBgm(["arcade6"], "arcade")
          }
          game.musicProgression = entry
        }
      }
	  game.piece.ghostIsVisible = false
      if (game.stat.level >= 500 && game.rta <= 148000)
        game.torikanPassed = true
      else if (
        (game.stat.level >= 500 && !game.torikanPassed) ||
        game.stat.level === shiraseTargetLevel
      ) {
        if (game.stat.level < shiraseTargetLevel) game.stat.level = 500
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }

      updateFallSpeed(game)
    },
  },
  specialti: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      game.rta += arg.ms
      arcadeScore(arg)
      linesToLevel(arg, 999, 100)
      game.endSectionLevel =
        game.stat.level >= 900
          ? 999
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
      updateTIGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      sonicDrop(arg, true)
      firmDrop(arg, 1, game.piece.gravity < framesToMs(1) && game.piece.isLanded)
      //extendedLockdown(arg);
      classicLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.stat.level >= 999) {
		if (isEndRoll === false) {
			isEndRoll = true
			game.stack.endRollStart()
			if (testMode === false && regretsPenalty <= 0 && game.rta <= 600000 && game.stat.line >= 270) {
				game.stack.isHidden = true
				game.stack.isFading = false
			} else {
				if (testMode === false) {
					game.stack.isFading = true
				} else {
					game.stack.isFading = false
				}
				game.stack.isHidden = false
			}
			rtaGoal = game.rta + 55000
			sound.loadBgm(["ending2"], "arcade")
			sound.killBgm()
			sound.playBgm(["ending2"], "arcade")
		} else if (isEndRoll === true) {
			if (game.rta >= rtaGoal) {
				endRollPassed = true
			}
		}
		game.stat.level = 999
		endRollLines = Math.max(0, (game.stat.line - preEndRollLines))
	  } else {
		preEndRollLines = game.stat.line
		endRollLines = 0
	  }
	  if (game.stat.level >= 999 && endRollPassed) {
		game.stat.level = 999
		$("#kill-message").textContent = locale.getString("ui", "excellent")
		sound.killVox()
		sound.add("voxexcellent")
		game.end(true)
	  }
	  testModeUpdate()
    },
    onInit: (game) => {
      game.stat.level = 0
      game.isRaceMode = true
	  isEndRoll = false
	  endRollPassed = false
      game.stat.grade = "N/A"
	  resetCoolsAndRegrets()
	  //game.arcadeCombo = 1;
      game.rta = 0
	  game.stack.redrawOnHidden = true
	  game.stack.isHidden = false
	  game.stack.isFading = false
	  game.redrawOnLevelUp = true
      game.torikanPassed = false
      game.stat.initPieces = 2
      game.endingStats.grade = true
      game.musicProgression = 0
      game.updateStats()
	  updateFallSpeed(game)
    },
    onPieceSpawn: (game) => {
      const areTable = [
		[100, 24],
		[200, 24],
		[300, 20],
        [400, 18],
        [500, 16],
        [600, 14],
        [800, 12],
        [1000, 10],
      ]
      const areLineModifierTable = [
        [400, -4],
        [600, -6],
        [800, 0],
      ]
      const areLineTable = [
		[100, 24],
		[200, 24],
		[300, 20],
		[400, 18],
        [500, 16],
        [600, 14],
        [800, 12],
        [1000, 10],
      ]
      const dasTable = [
        [400, 12],
        [600, 11],
        [800, 10],
        [1000, 8],
      ]
	  let gravityDenominator = 1
      const gravityTable = [
        [8, 4],
        [19, 5],
        [35, 6],
        [40, 8],
        [50, 10],
        [60, 12],
        [70, 16],
        [80, 32],
        [90, 48],
        [100, 64],
        [108, 4],
        [119, 5],
        [125, 6],
        [131, 8],
        [139, 12],
        [149, 32],
        [156, 48],
        [164, 80],
        [174, 112],
        [180, 128],
        [200, 144],
        [212, 176],
        [221, 192],
        [232, 208],
        [244, 224],
        [256, 240],
        [267, 340],
        [277, 440],
        [287, 540],
        [295, 640],
        [300, 740],
      ]
      const lockDelayTable = [
        [101, 30],
        [400, 26],
        [600, 22],
        [800, 20],
        [1000, 18],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  
	  if (game.stat.level >= 300 && regretsPenalty <= 0) {
        game.torikanPassed = true
	  }
	  let musicProgressionTable = []
	  if (game.torikanPassed === true) {
		  musicProgressionTable = [
			[279, 1],
			[300, 2],
			[379, 3],
			[400, 4],
			[979, 5],
			[999, 6],
		  ]
	  } else {
		  musicProgressionTable = [
			[279, 1],
			[300, 2],
			[479, 3],
			[500, 4],
			[979, 5],
			[999, 6],
		  ]
	  }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
            case 3:
              sound.killBgm()
              break
			case 5:
              sound.killBgm()
              break
            case 2:
              sound.loadBgm(["arcade2"], "arcade")
              sound.killBgm()
              sound.playBgm(["arcade2"], "arcade")
              break
            case 4:
              sound.loadBgm(["arcade3"], "arcade")
			  sound.killBgm()
			  sound.playBgm(["arcade3"], "arcade")
             }
          game.musicProgression = entry
        }
      }
	  
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99 &&
        game.stat.level !== 998
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
	  
	  for (const pair of gravityTable) {
        const level = pair[0]
        const denom = pair[1]
        if (game.stat.level < level) {
          gravityDenominator = denom
          break
        }
      }
	  if (game.stat.level < 300) {
		  game.piece.ghostIsVisible = game.stat.level < 100
		  game.piece.gravity = framesToMs(256 / gravityDenominator)
	  } else {
		  game.piece.ghostIsVisible = false
		  game.piece.gravity = framesToMs(1 / 20)
      }
      updateFallSpeed(game)
    },
   },
  noviceti: {
    update: (arg) => {
	  const game = gameHandler.game
	  updateArcadeBg(game)
      gameHandler.game.rta += arg.ms
      if (input.getGameDown("softDrop")) {
        gameHandler.game.drop += arg.ms
      }
      if (input.getGamePress("hardDrop")) {
        gameHandler.game.drop += framesToMs(2 * arg.piece.getDrop())
      }
      arcadeScore(arg, roundMsToFrames(gameHandler.game.drop), 6)
      linesToLevel(arg, 200, 100)
	  game.appends.level = `<span class="small">/200</span>`
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      sonicDrop(arg)
      firmDrop(arg)
      classicLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.stat.level >= 200) {
		  if (isEndRoll === false) {
			isEndRoll = true
			game.stack.endRollStart()
			rtaGoal = game.rta + 55000
			sound.loadBgm(["ending1"], "arcade")
			sound.killBgm()
			sound.playBgm(["ending1"], "arcade")
		  } else if (isEndRoll === true) {
			if (game.rta >= rtaGoal) {
				endRollPassed = true
			}
		  }
		  game.stat.level = 200
		  endRollLines = Math.max(0, (game.stat.line - preEndRollLines))
	  } else {
		  preEndRollLines = game.stat.line
		  endRollLines = 0
	  }
	  if (game.stat.level >= 200 && endRollPassed) {
        game.stat.score += Math.max(
          0,
          (200 - Math.floor((game.rta - 60000) / 1000)) * 1253
        )
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
	  }
	  testModeUpdate()
    },
    onPieceSpawn: (game) => {
      game.drop = 0
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99 &&
        game.stat.level !== 199
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
      if (game.stat.level >= 180 && game.stat.level < 200) {
        sound.killBgm()
      }
      let gravityDenominator = 1
      const gravityTable = [
        [8, 4],
        [19, 5],
        [35, 6],
        [40, 8],
        [50, 10],
        [60, 12],
        [70, 16],
        [80, 32],
        [90, 48],
        [100, 64],
        [108, 4],
        [119, 5],
        [125, 6],
        [131, 8],
        [139, 12],
        [149, 32],
        [156, 48],
        [164, 80],
        [174, 112],
        [180, 128],
        [200, 144],
      ]
      for (const pair of gravityTable) {
        const level = pair[0]
        const denom = pair[1]
        if (game.stat.level < level) {
          gravityDenominator = denom
          break
        }
      }
      if (game.stat.level < 200) {
		game.piece.gravity = framesToMs(256 / gravityDenominator)
		game.piece.ghostIsVisible = game.stat.level < 100
	  } else {
		game.piece.gravity = framesToMs(1 / 20)
		game.piece.ghostIsVisible = false
	  }
	  game.piece.lockDelayLimit = Math.ceil(framesToMs(30))
      updateFallSpeed(game)
    },
    onInit: (game) => {
      game.stat.level = 0
      game.rta = 0
	  isEndRoll = false
	  endRollPassed = false
      game.isRaceMode = true
      game.arcadeCombo = 1
      game.drop = 0
      game.stat.initPieces = 2
      updateFallSpeed(game)
      game.updateStats()
    },
  },
  suddenworld: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      game.rta += arg.ms
      arcadeScore(arg)
      linesToLevel(arg, shiraseTargetLevel, 100)
      game.endSectionLevel = Math.min(shiraseTargetLevel, Math.floor(game.stat.level / 100 + 1) * 100)
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
      updateShiraseGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      //tgmSoftDrop(arg)
      //hardDrop(arg)
      //extendedLockdown(arg)
	  if (
		settings.settings.rotationSystem === "arsae"
		) {
		  if (input.getGameDown("specialKey")) {
			tgmSoftDrop(arg)
			hardDrop(arg)
		  } else {
			sonicDrop(arg, true)
			firmDrop(arg, 1, true)
		  }
		  extendedLockdown(arg)
		  game.piece.boneColor = "white"
	  } else if (
		settings.settings.rotationSystem === "worldae"
	  ) {
		  tgmSoftDrop(arg)
		  hardDrop(arg)
		  extendedLockdown(arg)
		  game.piece.boneColor = "green"
	  } else {
		  tgmSoftDrop(arg)
		  hardDrop(arg)
		  extendedLockdown(arg)
		  game.piece.boneColor = "green"
	  }
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  game.copyBottomForGarbage = true
	  if (arg.piece.startingAre >= arg.piece.startingAreLimit) {
        garbageTimer += arg.ms
        if (garbageTimer > 10240) {
          garbageTimer -= 10240
          if (game.stat.level >= 500 && game.stat.level <= 1000) {
			  arg.stack.addGarbageToCounter(1)
		  }
        }
      }
	  testModeUpdate()
    },
    onInit: (game) => {
	  if (
		settings.settings.rotationSystem === "arsae" ||
		settings.settings.rotationSystem === "worldae"
		) {
		  game.next.nextLimit = 6
		  shiraseTargetLevel = 2000
	  } else {
		  game.next.nextLimit = 3
		  shiraseTargetLevel = 1300
	  }
      game.stat.level = 0
      game.isRaceMode = true
      game.stat.grade = "N/A"
      game.rta = 0
	  //game.arcadeCombo = 1;
      game.piece.gravity = framesToMs(1 / 20)
      game.torikanPassed = false
      game.stat.initPieces = 2
      game.endingStats.grade = true
      game.musicProgression = 0
      game.drop = 0
      game.updateStats()
	  garbageTimer = 0
    },
    onPieceSpawn: (game) => {
	  if (game.stat.level >= 1000) {
		 game.piece.useBoneBlocks = true
	  }
	  else {
		 game.piece.useBoneBlocks = false
	  }
      const areTable = [
        [101, 8],
        [301, 7],
        [401, 6],
        [500, 6],
        [1000, 6],
      ]
      const areLineModifierTable = [
        [101, -4],
        [301, -6],
        [1000, 0],
      ]
      const areLineTable = [
        [101, 8],
        [401, 7],
        [500, 6],
        [1000, 6],
      ]
      const dasTable = [
        [200, 10],
        [300, 8],
        [400, 6],
        [1000, 6],
		[1200, 6],
      ]
      const lockDelayTable = [
        [101, 20],
        [201, 20],
        [301, 18],
        [401, 18],
		[601, 14],
		[801, 12],
        [1001, 10],
		[1201, 10],
      ]
      const musicProgressionTable = [
        [479, 1],
        [500, 2],
        [679, 3],
        [700, 4],
		[979, 5],
		[1000, 6],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
            case 3:
              sound.killBgm()
              break
			case 5:
			  sound.killBgm()
			  break
            case 2:
              sound.loadBgm(["arcade4"], "arcade")
              sound.killBgm()
              sound.playBgm(["arcade4"], "arcade")
              break
            case 4:
              sound.loadBgm(["arcade5"], "arcade")
              sound.killBgm()
              sound.playBgm(["arcade5"], "arcade")
			  break
			case 6:
			  sound.loadBgm(["arcade6"], "arcade")
              sound.killBgm()
              sound.playBgm(["arcade6"], "arcade")
          }
          game.musicProgression = entry
        }
      }
	  game.piece.ghostIsVisible = false
      if (game.stat.level >= 500 && game.rta <= 184000)
        game.torikanPassed = true
      else if (
        (game.stat.level >= 500 && !game.torikanPassed) ||
        game.stat.level === shiraseTargetLevel
      ) {
        if (game.stat.level < shiraseTargetLevel) game.stat.level = 500
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }

      updateFallSpeed(game)
    },
  },
  specialworld: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      game.rta += arg.ms
      arcadeScore(arg)
      linesToLevel(arg, 999, 100)
      game.endSectionLevel =
        game.stat.level >= 900
          ? 999
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
      updateTIGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      tgmSoftDrop(arg)
      hardDrop(arg)
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.stat.level >= 999) {
		if (isEndRoll === false) {
			isEndRoll = true
			game.stack.endRollStart()
			if (testMode === false && regretsPenalty <= 0 && game.rta <= 600000 && game.stat.line >= 270) {
				game.stack.isHidden = true
				game.stack.isFading = false
			} else {
				if (testMode === false) {
					game.stack.isFading = true
				} else {
					game.stack.isFading = false
				}
				game.stack.isHidden = false
			}
			rtaGoal = game.rta + 55000
			sound.loadBgm(["ending2"], "arcade")
			sound.killBgm()
			sound.playBgm(["ending2"], "arcade")
		} else if (isEndRoll === true) {
			if (game.rta >= rtaGoal) {
				endRollPassed = true
			}
		}
		game.stat.level = 999
		endRollLines = Math.max(0, (game.stat.line - preEndRollLines))
	  } else {
		preEndRollLines = game.stat.line
		endRollLines = 0
	  }
	  if (game.stat.level >= 999 && endRollPassed) {
		game.stat.level = 999
		$("#kill-message").textContent = locale.getString("ui", "excellent")
		sound.killVox()
		sound.add("voxexcellent")
		game.end(true)
	  }
	  testModeUpdate()
    },
    onInit: (game) => {
      game.stat.level = 0
      game.isRaceMode = true
	  isEndRoll = false
	  endRollPassed = false
      game.stat.grade = "N/A"
	  resetCoolsAndRegrets()
	  //game.arcadeCombo = 1;
      game.rta = 0
	  game.stack.redrawOnHidden = true
	  game.stack.isHidden = false
	  game.stack.isFading = false
	  game.redrawOnLevelUp = true
      game.torikanPassed = false
      game.stat.initPieces = 2
      game.endingStats.grade = true
      game.musicProgression = 0
      game.updateStats()
	  updateFallSpeed(game)
    },
    onPieceSpawn: (game) => {
      const areTable = [
		[100, 24],
		[200, 24],
		[300, 20],
        [400, 18],
        [500, 16],
        [600, 14],
        [800, 12],
        [1000, 10],
      ]
      const areLineModifierTable = [
        [400, -4],
        [600, -6],
        [800, 0],
      ]
      const areLineTable = [
		[100, 24],
		[200, 24],
		[300, 20],
		[400, 18],
        [500, 16],
        [600, 14],
        [800, 12],
        [1000, 10],
      ]
      const dasTable = [
        [400, 12],
        [600, 11],
        [800, 10],
        [1000, 8],
      ]
	  let gravityDenominator = 1
      const gravityTable = [
        [8, 4],
        [19, 5],
        [35, 6],
        [40, 8],
        [50, 10],
        [60, 12],
        [70, 16],
        [80, 32],
        [90, 48],
        [100, 64],
        [108, 4],
        [119, 5],
        [125, 6],
        [131, 8],
        [139, 12],
        [149, 32],
        [156, 48],
        [164, 80],
        [174, 112],
        [180, 128],
        [200, 144],
        [212, 176],
        [221, 192],
        [232, 208],
        [244, 224],
        [256, 240],
        [267, 340],
        [277, 440],
        [287, 540],
        [295, 640],
        [300, 740],
      ]
      const lockDelayTable = [
        [101, 30],
        [400, 26],
        [600, 22],
        [800, 20],
        [1000, 18],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  
	  if (game.stat.level >= 300 && regretsPenalty <= 0) {
        game.torikanPassed = true
	  }
	  let musicProgressionTable = []
	  if (game.torikanPassed === true) {
		  musicProgressionTable = [
			[279, 1],
			[300, 2],
			[379, 3],
			[400, 4],
			[979, 5],
			[999, 6],
		  ]
	  } else {
		  musicProgressionTable = [
			[279, 1],
			[300, 2],
			[479, 3],
			[500, 4],
			[979, 5],
			[999, 6],
		  ]
	  }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
            case 3:
              sound.killBgm()
              break
			case 5:
              sound.killBgm()
              break
            case 2:
              sound.loadBgm(["arcade2"], "arcade")
              sound.killBgm()
              sound.playBgm(["arcade2"], "arcade")
              break
            case 4:
              sound.loadBgm(["arcade3"], "arcade")
			  sound.killBgm()
			  sound.playBgm(["arcade3"], "arcade")
             }
          game.musicProgression = entry
        }
      }
	  
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99 &&
        game.stat.level !== 998
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
	  
	  for (const pair of gravityTable) {
        const level = pair[0]
        const denom = pair[1]
        if (game.stat.level < level) {
          gravityDenominator = denom
          break
        }
      }
	  if (game.stat.level < 300) {
		  game.piece.ghostIsVisible = game.stat.level < 100
		  game.piece.gravity = framesToMs(256 / gravityDenominator)
	  } else {
		  game.piece.ghostIsVisible = false
		  game.piece.gravity = framesToMs(1 / 20)
      }
      updateFallSpeed(game)
    },
   },
  noviceworld: {
    update: (arg) => {
	  const game = gameHandler.game
	  updateArcadeBg(game)
      gameHandler.game.rta += arg.ms
      if (input.getGameDown("softDrop")) {
        gameHandler.game.drop += arg.ms
      }
      if (input.getGamePress("hardDrop")) {
        gameHandler.game.drop += framesToMs(2 * arg.piece.getDrop())
      }
      arcadeScore(arg, roundMsToFrames(gameHandler.game.drop), 6)
      linesToLevel(arg, 200, 100)
	  game.appends.level = `<span class="small">/200</span>`
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      tgmSoftDrop(arg)
      hardDrop(arg)
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.stat.level >= 200) {
		  if (isEndRoll === false) {
			isEndRoll = true
			game.stack.endRollStart()
			rtaGoal = game.rta + 55000
			sound.loadBgm(["ending1"], "arcade")
			sound.killBgm()
			sound.playBgm(["ending1"], "arcade")
		  } else if (isEndRoll === true) {
			if (game.rta >= rtaGoal) {
				endRollPassed = true
			}
		  }
		  game.stat.level = 200
		  endRollLines = Math.max(0, (game.stat.line - preEndRollLines))
	  } else {
		  preEndRollLines = game.stat.line
		  endRollLines = 0
	  }
	  if (game.stat.level === 200 && endRollPassed) {
        game.stat.score += Math.max(
          0,
          (200 - Math.floor((game.rta - 60000) / 1000)) * 1253
        )
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
	  testModeUpdate()
    },
    onPieceSpawn: (game) => {
      game.drop = 0
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99 &&
        game.stat.level !== 199
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
      if (game.stat.level >= 180 && game.stat.level < 200) {
        sound.killBgm()
      }
      let gravityDenominator = 1
      const gravityTable = [
        [8, 4],
        [19, 5],
        [35, 6],
        [40, 8],
        [50, 10],
        [60, 12],
        [70, 16],
        [80, 32],
        [90, 48],
        [100, 64],
        [108, 4],
        [119, 5],
        [125, 6],
        [131, 8],
        [139, 12],
        [149, 32],
        [156, 48],
        [164, 80],
        [174, 112],
        [180, 128],
        [200, 144],
      ]
      for (const pair of gravityTable) {
        const level = pair[0]
        const denom = pair[1]
        if (game.stat.level < level) {
          gravityDenominator = denom
          break
        }
      }
      if (game.stat.level < 200) {
		game.piece.gravity = framesToMs(256 / gravityDenominator)
		game.piece.ghostIsVisible = game.stat.level < 100
	  } else {
		game.piece.gravity = framesToMs(1 / 20)
		game.piece.ghostIsVisible = false
	  }
	  game.piece.lockDelayLimit = Math.ceil(framesToMs(30))
	  updateFallSpeed(game)
    },
    onInit: (game) => {
      game.stat.level = 0
      game.rta = 0
      game.isRaceMode = true
	  isEndRoll = false
	  endRollPassed = false
      game.arcadeCombo = 1
      game.drop = 0
      game.stat.initPieces = 2
      updateFallSpeed(game)
      game.updateStats()
    },
  },
  marathon: {
    update: (arg) => {
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      softDrop(arg)
      hardDrop(arg)
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
      /* Might use this code later
      $('#das').max = arg.piece.dasLimit;
      $('#das').value = arg.piece.das;
      $('#das').style.setProperty('--opacity', ((arg.piece.arr >= arg.piece.arrLimit) || arg.piece.inAre) ? 1 : 0);
      */
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.max(
        settings.game.marathon.startingLevel,
        Math.floor(game.stat.line / 10 + 1)
      )
      if (settings.game.marathon.levelCap >= 0) {
        game.stat.level = Math.min(
          game.stat.level,
          settings.game.marathon.levelCap
        )
      }
      const x = game.stat.level
      const gravityEquation = (0.8 - (x - 1) * 0.007) ** (x - 1)
      game.piece.gravity = Math.max(gravityEquation * 1000, framesToMs(1 / 20))
      if (game.stat.level >= 20) {
        game.piece.lockDelayLimit = ~~framesToMs(
          30 * Math.pow(0.93, Math.pow(game.stat.level - 20, 0.8))
        )
      } else {
        game.piece.lockDelayLimit = 500
      }
      updateFallSpeed(game)
      levelUpdate(game)
    },
    onInit: (game) => {
      if (settings.game.marathon.lineGoal >= 0) {
        game.lineGoal = settings.game.marathon.lineGoal
      }
      game.stat.level = settings.game.marathon.startingLevel
      lastLevel = parseInt(settings.game.marathon.startingLevel)
      game.piece.gravity = 1000
      updateFallSpeed(game)
      game.updateStats()
    },
  },
  konoha: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      arcadeScore(arg)
      linesToLevel(arg, 2000, 100)
      game.endSectionLevel =
        game.stat.level >= 1800
          ? 2000
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
		rotate180(arg)
        rotate(arg)
        shifting(arg)
      }
      gravity(arg)
      if (input.getGameDown("specialKey")) {
        tgmSoftDrop(arg)
		hardDrop(arg)
      } else {
		sonicDrop(arg)
		firmDrop(arg, 1, game.piece.gravity < framesToMs(1) && game.piece.isLanded)
	  }
      infiniteLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.stat.pcCount > lastBravos) {
		  lastBravos = game.stat.pcCount
		  game.timeGoal += 10000
	  }
	  if (game.timePassed >= game.timeGoal - 10000) {
        if (!game.playedHurryUp) {
          sound.add("hurryup")
          $("#timer").classList.add("hurry-up")
          game.playedHurryUp = true
        }
      } else {
		if (game.playedHurryUp) {
			$("#timer").classList.remove("hurry-up")
		}
		game.playedHurryUp = false
      }
	  testModeUpdate()
    },
    onInit: (game) => {
      game.stat.level = 0
      game.isRaceMode = true
	  game.timeGoal = 240000
      game.stat.pcCount = 0
	  //game.arcadeCombo = 1;
	  game.timePassed = 0
      game.stat.initPieces = 2
      game.musicProgression = 0
	  lastBravos = 0
      game.updateStats()
	  updateFallSpeed(game)
    },
    onPieceSpawn: (game) => {
      const areTable = [
		[100, 24],
      ]
      const areLineTable = [
		[100, 30],
      ]
	  let gravityDenominator = 1
      const gravityTable = [
        [5, 4],
        [10, 5],
        [15, 6],
        [20, 8],
        [25, 10],
        [30, 12],
        [35, 16],
        [40, 24],
        [45, 28],
        [50, 32],
        [55, 36],
        [60, 40],
        [65, 44],
        [70, 48],
        [75, 52],
        [80, 56],
        [85, 60],
        [100, 64],
        [105, 68],
        [110, 72],
        [115, 76],
        [120, 80],
        [125, 84],
        [130, 88],
        [135, 92],
        [140, 96],
        [145, 100],
        [150, 120],
        [155, 140],
        [160, 180],
        [165, 200],
		[170, 220],
        [175, 240],
        [180, 280],
        [183, 300],
        [185, 320],
        [187, 340],
        [190, 380],
        [195, 400],
		[200, 400],
      ]
      const lockDelayTable = [
        [101, 60],
        [1000, 60],
		[2000, 60],
      ]
      const musicProgressionTable = [
        [979, 1],
        [1000, 2],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
		  game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
		  game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
			  sound.killBgm()
              break
            case 2:
              sound.loadBgm(["konoha-hard"], "konoha")
              sound.killBgm()
              sound.playBgm(["konoha-hard"], "konoha")
              break
             }
          game.musicProgression = entry
        }
      }
	  
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
	  
	  for (const pair of gravityTable) {
        const level = pair[0]
        const denom = pair[1]
        if (game.stat.level < level) {
          gravityDenominator = denom
          break
        }
      }
	  if (game.stat.level < 200) {
		  game.piece.ghostIsVisible = true
		  game.piece.gravity = framesToMs(256 / gravityDenominator)
	  } else {
		  game.piece.ghostIsVisible = false
		  game.piece.gravity = framesToMs(1 / 20)
      }
	  if (
        game.stat.level >= 2000
      ) {
		game.stat.level = 2000
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
      updateFallSpeed(game)
    },
   },
  konohaworld: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      arcadeScore(arg)
      linesToLevel(arg, 2000, 100)
      game.endSectionLevel =
        game.stat.level >= 1800
          ? 2000
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
		rotate180(arg)
        rotate(arg)
        shifting(arg)
      }	  
      gravity(arg)
      tgmSoftDrop(arg)
      hardDrop(arg)
      infiniteLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.stat.pcCount > lastBravos) {
		  lastBravos = game.stat.pcCount
		  game.timeGoal += 10000
	  }
	  if (game.timePassed >= game.timeGoal - 10000) {
        if (!game.playedHurryUp) {
          sound.add("hurryup")
          $("#timer").classList.add("hurry-up")
          game.playedHurryUp = true
        }
      } else {
		if (game.playedHurryUp) {
			$("#timer").classList.remove("hurry-up")
		}
		game.playedHurryUp = false
      }
	  testModeUpdate()
    },
    onInit: (game) => {
      game.stat.level = 0
      game.isRaceMode = true
	  game.timeGoal = 120000
      game.stat.pcCount = 0
	  //game.arcadeCombo = 1;
	  game.timePassed = 0
      game.stat.initPieces = 2
      game.musicProgression = 0
	  lastBravos = 0
      game.updateStats()
	  updateFallSpeed(game)
    },
    onPieceSpawn: (game) => {
      const areTable = [
		[100, 24],
      ]
      const areLineTable = [
		[100, 30],
      ]
	  let gravityDenominator = 1
      const gravityTable = [
        [5, 4],
        [10, 5],
        [15, 6],
        [20, 8],
        [25, 10],
        [30, 12],
        [35, 16],
        [40, 24],
        [45, 28],
        [50, 32],
        [55, 36],
        [60, 40],
        [65, 44],
        [70, 48],
        [75, 52],
        [80, 56],
        [85, 60],
        [100, 64],
        [105, 68],
        [110, 72],
        [115, 76],
        [120, 80],
        [125, 84],
        [130, 88],
        [135, 92],
        [140, 96],
        [145, 100],
        [150, 120],
        [155, 140],
        [160, 180],
        [165, 200],
		[170, 220],
        [175, 240],
        [180, 280],
        [183, 300],
        [185, 320],
        [187, 340],
        [190, 380],
        [195, 400],
		[200, 400],
      ]
      const lockDelayTable = [
        [101, 60],
        [1000, 60],
		[2000, 60],
      ]
      const musicProgressionTable = [
        [979, 1],
        [1000, 2],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
			  sound.killBgm()
              break
            case 2:
              sound.loadBgm(["konoha-hard"], "konoha")
              sound.killBgm()
              sound.playBgm(["konoha-hard"], "konoha")
              break
             }
          game.musicProgression = entry
        }
      }
	  
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
	  
	  for (const pair of gravityTable) {
        const level = pair[0]
        const denom = pair[1]
        if (game.stat.level < level) {
          gravityDenominator = denom
          break
        }
      }
	  if (game.stat.level < 200) {
		  game.piece.ghostIsVisible = true
		  game.piece.gravity = framesToMs(256 / gravityDenominator)
	  } else {
		  game.piece.ghostIsVisible = false
		  game.piece.gravity = framesToMs(1 / 20)
      }
	  if (
        game.stat.level >= 2000
      ) {
		game.stat.level = 2000
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
      updateFallSpeed(game)
    },
   },
  asukaworld: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      arcadeScore(arg)
      linesToLevel(arg, 1300, 100)
      game.endSectionLevel =
        game.stat.level >= 1200
          ? 1300
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
	  updateAsukaGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
		rotate180(arg)
        rotate(arg)
        shifting(arg)
      }
      gravity(arg)
      tgmSoftDrop(arg)
      hardDrop(arg)
      infiniteLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.timePassed >= game.timeGoal - 10000) {
        if (!game.playedHurryUp) {
          sound.add("hurryup")
          $("#timer").classList.add("hurry-up")
          game.playedHurryUp = true
        }
      } else {
		if (game.playedHurryUp) {
			$("#timer").classList.remove("hurry-up")
		}
		game.playedHurryUp = false
      }
	  testModeUpdate()
    },
    onInit: (game) => {
      game.stat.level = 0
      game.isRaceMode = true
	  game.timeGoal = 420000
      game.stat.grade = "N/A"
	  game.endingStats.grade = true
	  //game.arcadeCombo = 1;
	  game.stack.isHidden = false
	  game.stack.redrawOnHidden = false
	  game.stack.isFading = false
	  game.timePassed = 0
      game.stat.initPieces = 2
      game.musicProgression = 0
	  game.piece.gravity = framesToMs(1 / 20)
      game.updateStats()
	  updateFallSpeed(game)
    },
    onPieceSpawn: (game) => {
      const areTable = [
        [101, 18],
        [301, 14],
        [401, 8],
        [500, 7],
        [1000, 6],
      ]
      const areLineModifierTable = [
        [101, -4],
        [301, -6],
        [1000, 0],
      ]
      const areLineTable = [
        [101, 12],
        [401, 6],
        [500, 5],
        [1000, 4],
      ]
      const dasTable = [
        [200, 12],
        [300, 11],
        [400, 10],
        [1000, 8],
      ]
      const lockDelayTable = [
        [101, 30],
        [201, 26],
        [301, 22],
        [401, 18],
        [1000, 15],
      ]
	  const musicProgressionTable = [
        [979, 1],
        [1000, 2],
		[1279, 1],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
			  sound.killBgm()
              break
			case 3:
			  sound.killBgm()
              break
            case 2:
              sound.loadBgm(["asuka2"], "asuka")
              sound.killBgm()
              sound.playBgm(["asuka2"], "asuka")
              break
             }
          game.musicProgression = entry
        }
      }
	  
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
	  
	  if (game.stat.level < 1000) {
		  game.stack.isHidden = false
		  game.piece.gravity = framesToMs(1 / 20)
	  } else {
		  if (game.stat.level < 1100) {
			if (testMode === false) {
				game.stack.isHidden = false
				game.stack.isFading = true
			} else {
				game.stack.isHidden = false
				game.stack.isFading = false
			}
		  } else {
			if (testMode === false) {
				game.stack.isHidden = true
				game.stack.isFading = false
			} else {
				game.stack.isHidden = false
				game.stack.isFading = false
			}
		  }
		  game.piece.gravity = framesToMs(1 / 20)
      }
	  if (
        game.stat.level >= 1300
      ) {
		game.stat.level = 1300
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
      updateFallSpeed(game)
    },
   },
  asuka: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      arcadeScore(arg)
      linesToLevel(arg, 1300, 100)
      game.endSectionLevel =
        game.stat.level >= 1200
          ? 1300
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
	  updateAsukaGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
		rotate180(arg)
        rotate(arg)
        shifting(arg)
      }
      gravity(arg)
      if (input.getGameDown("specialKey")) {
        tgmSoftDrop(arg)
		hardDrop(arg)
      } else {
		sonicDrop(arg, true)
		firmDrop(arg, 1, true)
	  }
      infiniteLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.timePassed >= game.timeGoal - 10000) {
        if (!game.playedHurryUp) {
          sound.add("hurryup")
          $("#timer").classList.add("hurry-up")
          game.playedHurryUp = true
        }
      } else {
		if (game.playedHurryUp) {
			$("#timer").classList.remove("hurry-up")
		}
		game.playedHurryUp = false
      }
	  testModeUpdate()
    },
    onInit: (game) => {
      game.stat.level = 0
      game.isRaceMode = true
	  game.timeGoal = 420000
      game.stat.grade = "N/A"
	  game.endingStats.grade = true
	  game.stack.isHidden = false
	  game.stack.redrawOnHidden = false
	  game.stack.isFading = false
	  //game.arcadeCombo = 1;
	  game.timePassed = 0
      game.stat.initPieces = 2
      game.musicProgression = 0
	  game.piece.gravity = framesToMs(1 / 20)
      game.updateStats()
	  updateFallSpeed(game)
    },
    onPieceSpawn: (game) => {
      const areTable = [
        [101, 18],
        [301, 14],
        [401, 8],
        [500, 7],
        [1000, 6],
      ]
      const areLineModifierTable = [
        [101, -4],
        [301, -6],
        [1000, 0],
      ]
      const areLineTable = [
        [101, 12],
        [401, 6],
        [500, 5],
        [1000, 4],
      ]
      const dasTable = [
        [200, 12],
        [300, 11],
        [400, 10],
        [1000, 8],
      ]
      const lockDelayTable = [
        [101, 30],
        [201, 26],
        [301, 22],
        [401, 18],
        [1000, 15],
      ]
	  const musicProgressionTable = [
        [979, 1],
        [1000, 2],
		[1279, 1],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
			  sound.killBgm()
              break
			case 3:
			  sound.killBgm()
              break
            case 2:
              sound.loadBgm(["asuka2"], "asuka")
              sound.killBgm()
              sound.playBgm(["asuka2"], "asuka")
              break
             }
          game.musicProgression = entry
        }
      }
	  
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
	  if (game.stat.level < 1000) {
		  game.stack.isHidden = false
		  game.piece.gravity = framesToMs(1 / 20)
	  } else {
		  if (game.stat.level < 1100) {
			if (testMode === false) {
				game.stack.isHidden = false
				game.stack.isFading = true
			} else {
				game.stack.isHidden = false
				game.stack.isFading = false
			}
		  } else {
			if (testMode === false) {
				game.stack.isHidden = true
				game.stack.isFading = false
			} else {
				game.stack.isHidden = false
				game.stack.isFading = false
			}
		  }
		  game.piece.gravity = framesToMs(1 / 20)
      }
	  if (
        game.stat.level >= 1300
      ) {
		game.stat.level = 1300
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
      updateFallSpeed(game)
    },
   },
  rounds: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      arcadeScore(arg)
      linesToLevel(arg, 2600, 100)
      game.endSectionLevel =
        game.stat.level >= 2500
          ? 2600
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
	  updateRoundsGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
		rotate180(arg)
        rotate(arg)
        shifting(arg)
      }
      gravity(arg)
	  if (input.getGameDown("specialKey")) {
        tgmSoftDrop(arg)
		hardDrop(arg)
      } else {
		sonicDrop(arg, true)
		firmDrop(arg, 1, true)
	  }
      
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  const underwaterProgressionTable = [
		[300, 1],
		[399, 2],
		[500, 3],
		[599, 4],
        [700, 5],
        [799, 6],
		[899, 7],
		[999, 8],
      ]
	  for (const pair of underwaterProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && underwaterProgression < entry) {
          switch (entry) {
            case 1:
			  game.stack.isUnderwater = true
			  underwaterProgression = entry
              break
			case 2:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = false
				  underwaterProgression = entry
			  }
              break
			case 3:
			  game.stack.isUnderwater = true
			  underwaterProgression = entry
              break
			case 4:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = false
				  underwaterProgression = entry
			  }
              break
			case 5:
			  game.stack.isUnderwater = true
			  underwaterProgression = entry
              break
			case 6:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = true
				  game.stack.clearUnderwaterRows()
				  underwaterProgression = entry
			  }
              break
			case 7:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = true
				  game.stack.clearUnderwaterRows()
				  underwaterProgression = entry
			  }
              break
			case 8:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = false
				  underwaterProgression = entry
			  }
              break
          }
        }
      }
	  testModeUpdate()
    },
    onInit: (game) => {
	  underwaterProgression = 0
      game.stat.level = 0
      game.isRaceMode = true
      game.stat.grade = "N/A"
	  game.endingStats.grade = true
	  game.redrawOnLevelUp = true
	  //game.arcadeCombo = 1;
      game.rta = 0
      game.stat.initPieces = 2
      game.musicProgression = 0
	  game.piece.gravity = framesToMs(1 / 20)
      game.updateStats()
	  updateFallSpeed(game)
    },
    onPieceSpawn: (game) => {
      const areTable = [
		[301, 12],
        [401, 10],
        [501, 9],
        [601, 8],
        [901, 7],
        [1001, 6],
		[2601, 12],
      ]
      const areLineModifierTable = [
        [101, -4],
        [301, -6],
        [1000, 0],
      ]
      const areLineTable = [
        [301, 8],
        [401, 8],
        [501, 7],
        [601, 6],
        [901, 5],
        [1001, 5],
		[2601, 10],
      ]
      const dasTable = [
        [301, 10],
        [401, 8],
        [501, 8],
        [601, 8],
        [901, 8],
        [1001, 8],
		[2001, 8],
		[2601, 4],
      ]
      const lockDelayTable = [
        [401, 20],
        [501, 19],
        [601, 18],
        [901, 17],
        [1001, 16],
		[2001, 16],
		[2601, 10],
      ]
      const musicProgressionTable = [
        [279, 1],
        [300, 2],
		[679, 3],
		[700, 4],
		[974, 5],
		[1000, 6],
		[1279, 7],
		[1300, 8],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
			  sound.killBgm()
              break
			case 3:
			  sound.killBgm()
              break
			case 5:
			  sound.killBgm()
              break
			case 7:
			  sound.killBgm()
              break
            case 2:
              sound.loadBgm(["master2"], "rounds")
              sound.killBgm()
              sound.playBgm(["master2"], "rounds")
              break
			case 4:
              sound.loadBgm(["master3"], "rounds")
              sound.killBgm()
              sound.playBgm(["master3"], "rounds")
              break
			case 6:
              sound.loadBgm(["master4"], "rounds")
              sound.killBgm()
              sound.playBgm(["master4"], "rounds")
              break
			case 8:
              sound.loadBgm(["master5"], "rounds")
              sound.killBgm()
              sound.playBgm(["master5"], "rounds")
              break
             }
          game.musicProgression = entry
        }
      }
	  if (game.stat.level >= 1300) {
		  game.stack.isFrozen = true
	  } else {
		  game.stack.isFrozen = false
	  }
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
	  if (
        game.stat.level >= 2600
      ) {
		game.stat.level = 2600
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
      updateFallSpeed(game)
    },
   },
  roundsworld: {
    update: (arg) => {
      const game = gameHandler.game
	  updateArcadeBg(game)
      arcadeScore(arg)
      linesToLevel(arg, 2600, 100)
      game.endSectionLevel =
        game.stat.level >= 2500
          ? 2600
          : Math.floor(game.stat.level / 100 + 1) * 100
      game.appends.level = `<span class="small">/${game.endSectionLevel}</span>`
	  updateRoundsGrade(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
		rotate180(arg)
        rotate(arg)
        shifting(arg)
      }
      gravity(arg)
      tgmSoftDrop(arg)
      hardDrop(arg)
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  const underwaterProgressionTable = [
		[300, 1],
		[399, 2],
		[500, 3],
		[599, 4],
        [700, 5],
        [799, 6],
		[899, 7],
		[999, 8],
      ]
	  for (const pair of underwaterProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && underwaterProgression < entry) {
          switch (entry) {
            case 1:
			  game.stack.isUnderwater = true
			  underwaterProgression = entry
              break
			case 2:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = false
				  underwaterProgression = entry
			  }
              break
			case 3:
			  game.stack.isUnderwater = true
			  underwaterProgression = entry
              break
			case 4:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = false
				  underwaterProgression = entry
			  }
              break
			case 5:
			  game.stack.isUnderwater = true
			  underwaterProgression = entry
              break
			case 6:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = true
				  game.stack.clearUnderwaterRows()
				  underwaterProgression = entry
			  }
              break
			case 7:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = true
				  game.stack.clearUnderwaterRows()
				  underwaterProgression = entry
			  }
              break
			case 8:
			  if (game.stack.wouldCauseLineClear() >= 1) {
				  game.stack.isUnderwater = false
				  underwaterProgression = entry
			  }
              break
          }
        }
      }
	  testModeUpdate()
    },
    onInit: (game) => {
	  underwaterProgression = 0
      game.stat.level = 0
      game.isRaceMode = true
      game.stat.grade = "N/A"
	  //game.arcadeCombo = 1;
      game.rta = 0
      game.stat.initPieces = 2
	  game.endingStats.grade = true
	  game.redrawOnLevelUp = true
      game.musicProgression = 0
	  game.piece.gravity = framesToMs(1 / 20)
      game.updateStats()
	  updateFallSpeed(game)
    },
    onPieceSpawn: (game) => {
      const areTable = [
		[301, 12],
        [401, 10],
        [501, 9],
        [601, 8],
        [901, 7],
        [1001, 6],
		[2601, 12],
      ]
      const areLineModifierTable = [
        [101, -4],
        [301, -6],
        [1000, 0],
      ]
      const areLineTable = [
        [301, 8],
        [401, 8],
        [501, 7],
        [601, 6],
        [901, 5],
        [1001, 5],
		[2601, 10],
      ]
      const dasTable = [
        [301, 12],
        [401, 10],
        [501, 10],
        [601, 10],
        [901, 10],
        [1001, 10],
		[2001, 8],
		[2601, 4],
      ]
      const lockDelayTable = [
        [401, 20],
        [501, 19],
        [601, 18],
        [901, 17],
        [1001, 16],
		[2001, 16],
		[2601, 10],
      ]
      const musicProgressionTable = [
        [279, 1],
        [300, 2],
		[679, 3],
		[700, 4],
		[974, 5],
		[1000, 6],
		[1279, 7],
		[1300, 8],
      ]
      for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of dasTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          game.piece.dasLimit = framesToMs(entry)
          break
        }
      }
      for (const pair of lockDelayTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level < level) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
      for (const pair of musicProgressionTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level >= level && game.musicProgression < entry) {
          switch (entry) {
            case 1:
			  sound.killBgm()
              break
			case 3:
			  sound.killBgm()
              break
			case 5:
			  sound.killBgm()
              break
			case 7:
			  sound.killBgm()
              break
            case 2:
              sound.loadBgm(["master2"], "rounds")
              sound.killBgm()
              sound.playBgm(["master2"], "rounds")
              break
			case 4:
              sound.loadBgm(["master3"], "rounds")
              sound.killBgm()
              sound.playBgm(["master3"], "rounds")
              break
			case 6:
              sound.loadBgm(["master4"], "rounds")
              sound.killBgm()
              sound.playBgm(["master4"], "rounds")
              break
			case 8:
              sound.loadBgm(["master5"], "rounds")
              sound.killBgm()
              sound.playBgm(["master5"], "rounds")
              break
             }
          game.musicProgression = entry
        }
      }
      if (
        game.stat.initPieces === 0 &&
        game.stat.level % 100 !== 99
      ) {
        game.stat.level = game.stat.level + 1
      }
      if (game.stat.initPieces > 0) {
        game.stat.initPieces = game.stat.initPieces - 1
      }
	  if (game.stat.level >= 1300) {
		  game.stack.isFrozen = true
	  } else {
		  game.stack.isFrozen = false
	  }
	  if (
        game.stat.level >= 2600
      ) {
		game.stat.level = 2600
        $("#kill-message").textContent = locale.getString("ui", "excellent")
        sound.killVox()
        sound.add("voxexcellent")
        game.end(true)
      }
      updateFallSpeed(game)
    },
   },
  ace: {
    update: (arg) => {
	  const game = gameHandler.game
	  updateAceBg(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      if (settings.game.ace.arstype === "acears") {
		tgmSoftDrop(arg)
		hardDrop(arg)
	  }
	  else if (settings.game.ace.arstype === "acears2") {
		sonicDrop(arg)
        firmDrop(arg, 1, game.piece.gravity < framesToMs(1) && game.piece.isLanded)
	  }
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.timePassed >= game.timeGoal - 10000) {
        if (!game.playedHurryUp) {
          sound.add("hurryup")
          $("#timer").classList.add("hurry-up")
          game.playedHurryUp = true
        }
      } else {
		if (game.playedHurryUp) {
			$("#timer").classList.remove("hurry-up")
		}
		game.playedHurryUp = false
      }
	  testModeUpdate()
      /* Might use this code later
      $('#das').max = arg.piece.dasLimit;
      $('#das').value = arg.piece.das;
      $('#das').style.setProperty('--opacity', ((arg.piece.arr >= arg.piece.arrLimit) || arg.piece.inAre) ? 1 : 0);
      */
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10 + 1)
      const x = game.stat.level
      const gravityEquation = (0.8 - (x - 1) * 0.007) ** (x - 1)
	  const difficulty = parseInt(settings.game.ace.difficulty)
      switch (difficulty) {
		  case 1: {
			  if (game.stat.level <= 10) {
				  if (game.stat.level <= 5) {
					  game.piece.gravity = Math.max((gravityEquation * 1000) / Math.max(((game.stat.level - 1) * 5), 1), framesToMs(1 / 20))
				  }
				  else {
					  game.piece.gravity = Math.max((gravityEquation * 1000) / 20, framesToMs(1 / 20)) 
			      }
			  }
			  else {
				  game.piece.gravity = framesToMs(1 / 20)
			  }
			  break
		  }
		  case 2: {
			  if (game.stat.level <= 5) {
				  game.piece.gravity = Math.max(framesToMs(1 / game.stat.level), framesToMs(1 / 20))
			  }
			  else {
				  game.piece.gravity = framesToMs(1 / 20)
			  }
			  break
		  }
		  case 3: {
			  game.piece.gravity = framesToMs(1 / 20)
			  break
		  }
		  case 4: {
			  game.piece.gravity = framesToMs(1 / 20)
			  break
		  }
		  case 5: {
			  game.piece.gravity = framesToMs(1 / 20)
			  break
		  }
		  case 6: {
			  game.piece.gravity = framesToMs(1 / 20)
			  break
		  }
	  }
      updateFallSpeed(game)
      if (levelUpdateAce(game)) {
		game.timePassedOffset += game.timePassed
		game.timePassed = 0
	  }
	  let timeLimit = 120000
	  switch (difficulty) {
		case 1: {
			if (game.stat.level <= 2) {
				timeLimit = 120000
			}
			else {
				timeLimit = 90000
			}
		    break
		}
		case 2: {
			if (game.stat.level <= 2) {
				timeLimit = 120000
			}
			else {
				timeLimit = 90000
			}
		    break
		}
		case 3: {
			if (game.stat.level <= 2) {
				timeLimit = 120000
			}
			else {
				timeLimit = 90000
			}
		    break
		}
		case 4: {
			timeLimit = 60000
		    break
		}
		case 5: {
			timeLimit = 60000
		    break
		}
		case 6: {
			timeLimit = 60000
		    break
		}
	  }
	  game.timeGoal = timeLimit
	  const areTable = [
		[1, 28],
		[4, 24],
		[7, 20],
        [10, 18],
        [11, 16],
        [12, 14],
        [13, 12],
        [14, 10],
      ]
	  const areLineModifierTable = [
        [10, -4],
        [13, -6],
        [15, 0],
      ]
      const areLineTable = [
		[1, 28],
		[4, 24],
		[7, 20],
		[10, 18],
        [11, 16],
        [12, 14],
        [13, 12],
        [14, 10],
      ]
	  const areTableHiSpeed = [
		[1, 24],
		[4, 20],
		[7, 18],
        [10, 16],
        [11, 14],
        [12, 12],
        [13, 10],
        [14, 8],
      ]
	  const areLineModifierTableHiSpeed = [
        [10, -4],
        [13, -6],
        [15, 0],
      ]
      const areLineTableHiSpeed = [
		[1, 24],
		[4, 20],
		[7, 18],
		[10, 16],
        [11, 14],
        [12, 12],
        [13, 10],
        [14, 8],
      ]
	  const areTableHiSpeed2 = [
		[1, 20],
		[4, 18],
		[7, 16],
        [10, 14],
        [11, 12],
        [12, 10],
        [13, 8],
        [14, 7],
      ]
	  const areLineModifierTableHiSpeed2 = [
        [10, -4],
        [13, -6],
        [15, 0],
      ]
      const areLineTableHiSpeed2 = [
		[1, 20],
		[4, 18],
		[7, 16],
		[10, 14],
        [11, 12],
        [12, 10],
        [13, 8],
        [14, 7],
      ]
	  const areTableAnother = [
        [1, 18],
        [4, 14],
        [7, 8],
        [10, 7],
        [13, 6],
      ]
	  const areLineModifierTableAnother = [
	    [1, -4],
        [4, -4],
        [10, -6],
        [13, 0],
      ]
      const areLineTableAnother = [
        [1, 12],
        [4, 6],
        [10, 5],
        [13, 4],
      ]
	  const areTableAnother2 = [
        [1, 14],
        [4, 8],
        [7, 7],
        [9, 6],
        [13, 6],
      ]
	  const areLineModifierTableAnother2 = [
		[1, -4],
        [4, -6],
        [10, -6],
        [13, 0],
      ]
      const areLineTableAnother2 = [
        [1, 6],
        [4, 5],
        [10, 4],
        [13, 4],
      ]
	  const musicProgressionTable = [
        [47, 1],
        [50, 2],
        [97, 3],
        [100, 4],
		[147, 5],
        [150, 6],
		[197, 7],
      ]
	  const lockDelayTable = [
		[25, 30],
		[50, 30],
		[75, 30],
		[100, 28],
		[125, 26],
		[150, 24],
      ]
	  const lockDelayTableHiSpeed = [
		[25, 30],
		[50, 28],
		[75, 26],
		[100, 24],
		[125, 22],
		[150, 20],
      ]
	  const lockDelayTableHiSpeed2 = [
		[25, 24],
		[50, 22],
		[75, 20],
		[100, 18],
		[125, 16],
		[150, 14],
      ]
	  const lockDelayTableAnother = [
		[25, 18],
		[50, 16],
		[75, 14],
		[100, 12],
		[125, 10],
		[150, 10],
      ]
	  const lockDelayTableAnother2 = [
		[25, 10],
		[50, 10],
		[75, 10],
		[100, 10],
		[125, 10],
		[150, 10],
      ]
	  for (const pair of lockDelayTable) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty === 1) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of lockDelayTableHiSpeed) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty === 2) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of lockDelayTableHiSpeed2) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty === 3) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of lockDelayTableAnother) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty === 4) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of lockDelayTableAnother2) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty >= 5) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of musicProgressionTable) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line >= line && game.musicProgression < entry) {
          switch (entry) {
            case 1:
			  sound.killBgm()
			  break
            case 3:
              sound.killBgm()
              break
			case 5:
			  sound.killBgm()
			  break
			case 7:
			  sound.killBgm()
			  break
            case 2:
				switch (difficulty) {
					case 1: {
						sound.loadBgm(["arcade2"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade2"], "ace")
						break
					}
					case 2: {
						sound.loadBgm(["arcade3"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade3"], "ace")
						break
					}
					case 3: {
						sound.loadBgm(["arcade6"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade6"], "ace")
						break
					}
					case 4: {
						sound.loadBgm(["arcade4"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade4"], "ace")
						break
					}
					case 5: {
						sound.loadBgm(["arcade4"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade4"], "ace")
						break
					}
					case 6: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
				}
				break
            case 4:
				switch (difficulty) {
					case 1: {
						sound.loadBgm(["arcade3"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade3"], "ace")
						break
					}
					case 2: {
						sound.loadBgm(["arcade6"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade6"], "ace")
						break
					}
					case 3: {
						sound.loadBgm(["arcade4"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade4"], "ace")
						break
					}
					case 4: {
						sound.loadBgm(["arcade5"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade5"], "ace")
						break
					}
					case 5: {
						sound.loadBgm(["arcade5"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade5"], "ace")
						break
					}
					case 6: {
						break
					}
				}
				break
			case 6:
				switch (difficulty) {
					case 1: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 2: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 3: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 4: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 5: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 6: {
						break
					}
				}
				break
          }
          game.musicProgression = entry
        }
      }
	  for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty <= 1) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty <= 1) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty <= 1) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areTableHiSpeed) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 2) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTableHiSpeed) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 2) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTableHiSpeed) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 2) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areTableHiSpeed2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 3) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTableHiSpeed2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 3) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTableHiSpeed2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 3) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areTableAnother) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 4) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTableAnother) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 4) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTableAnother) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 4) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areTableAnother2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty >= 5) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTableAnother2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty >= 5) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTableAnother2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty >= 5) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  if (difficulty >= 6) {
		  game.stack.isFrozen = true
	  } else {
		  game.stack.isFrozen = false
	  }
    },
    onInit: (game) => {
      if (settings.game.ace.lineGoal >= 0) {
        game.lineGoal = settings.game.ace.lineGoal
      }
	  const difficulty = parseInt(settings.game.ace.difficulty)
      switch (difficulty) {
		  case 1: {
			  game.settings.music = ["../ace/kachusha-easy"]
			  break
		  }
		  case 2: {
			  game.settings.music = ["../ace/arcade1"]
			  break
		  }
		  case 3: {
			  game.settings.music = ["../ace/arcade3"]
			  break
		  }
		  case 4: {
			  game.settings.music = ["../ace/arcade6"]
			  break
		  }
		  case 5: {
			  game.settings.music = ["../ace/arcade6"]
			  break
		  }
		  case 6: {
			  game.settings.music = ["../rounds/master5"]
			  break
		  }
	  }
      game.stat.level = 1
      lastLevel = 1
      game.piece.gravity = 1000
      updateFallSpeed(game)
      game.updateStats()
	  game.isRaceMode = true
	  game.timePassed = 0
	  game.timePassedOffset = 0
	  game.timeGoal = 120000
	  game.musicProgression = 0
    },
  },
  aceworld: {
    update: (arg) => {
	  const game = gameHandler.game
	  updateAceBg(game)
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      tgmSoftDrop(arg)
	  hardDrop(arg)
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
	  if (game.timePassed >= game.timeGoal - 10000) {
        if (!game.playedHurryUp) {
          sound.add("hurryup")
          $("#timer").classList.add("hurry-up")
          game.playedHurryUp = true
        }
      } else {
		if (game.playedHurryUp) {
			$("#timer").classList.remove("hurry-up")
		}
		game.playedHurryUp = false
      }
	  testModeUpdate()
      /* Might use this code later
      $('#das').max = arg.piece.dasLimit;
      $('#das').value = arg.piece.das;
      $('#das').style.setProperty('--opacity', ((arg.piece.arr >= arg.piece.arrLimit) || arg.piece.inAre) ? 1 : 0);
      */
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10 + 1)
      const x = game.stat.level
      const gravityEquation = (0.8 - (x - 1) * 0.007) ** (x - 1)
	  let difficulty = parseInt(settings.game.aceworld.difficulty)
      switch (difficulty) {
		  case 1: {
			  if (game.stat.level <= 10) {
				  if (game.stat.level <= 5) {
					  game.piece.gravity = Math.max((gravityEquation * 1000) / Math.max(((game.stat.level - 1) * 5), 1), framesToMs(1 / 20))
				  }
				  else {
					  game.piece.gravity = Math.max((gravityEquation * 1000) / 20, framesToMs(1 / 20)) 
			      }
			  }
			  else {
				  game.piece.gravity = framesToMs(1 / 20)
			  }
			  break
		  }
		  case 2: {
			  if (game.stat.level <= 5) {
				  game.piece.gravity = Math.max(framesToMs(1 / game.stat.level), framesToMs(1 / 20))
			  }
			  else {
				  game.piece.gravity = framesToMs(1 / 20)
			  }
			  break
		  }
		  case 3: {
			  game.piece.gravity = framesToMs(1 / 20)
			  break
		  }
		  case 4: {
			  game.piece.gravity = framesToMs(1 / 20)
			  break
		  }
		  case 5: {
			  game.piece.gravity = framesToMs(1 / 20)
			  break
		  }
		  case 6: {
			  game.piece.gravity = framesToMs(1 / 20)
			  break
		  }
	  }
      updateFallSpeed(game)
      if (levelUpdateAce(game)) {
		game.timePassedOffset += game.timePassed
		game.timePassed = 0
	  }
	  let timeLimit = 120000
	  switch (difficulty) {
		case 1: {
			if (game.stat.level <= 2) {
				timeLimit = 120000
			}
			else {
				timeLimit = 90000
			}
		    break
		}
		case 2: {
			if (game.stat.level <= 2) {
				timeLimit = 120000
			}
			else {
				timeLimit = 90000
			}
		    break
		}
		case 3: {
			if (game.stat.level <= 2) {
				timeLimit = 120000
			}
			else {
				timeLimit = 90000
			}
		    break
		}
		case 4: {
			timeLimit = 60000
		    break
		}
		case 5: {
			timeLimit = 60000
		    break
		}
		case 6: {
			timeLimit = 60000
		    break
		}
	  }
	  game.timeGoal = timeLimit
	  const areTable = [
		[1, 28],
		[4, 24],
		[7, 20],
        [10, 18],
        [11, 16],
        [12, 14],
        [13, 12],
        [14, 10],
      ]
	  const areLineModifierTable = [
        [10, -4],
        [13, -6],
        [15, 0],
      ]
      const areLineTable = [
		[1, 28],
		[4, 24],
		[7, 20],
		[10, 18],
        [11, 16],
        [12, 14],
        [13, 12],
        [14, 10],
      ]
	  const areTableHiSpeed = [
		[1, 24],
		[4, 20],
		[7, 18],
        [10, 16],
        [11, 14],
        [12, 12],
        [13, 10],
        [14, 8],
      ]
	  const areLineModifierTableHiSpeed = [
        [10, -4],
        [13, -6],
        [15, 0],
      ]
      const areLineTableHiSpeed = [
		[1, 24],
		[4, 20],
		[7, 18],
		[10, 16],
        [11, 14],
        [12, 12],
        [13, 10],
        [14, 8],
      ]
	  const areTableHiSpeed2 = [
		[1, 20],
		[4, 18],
		[7, 16],
        [10, 14],
        [11, 12],
        [12, 10],
        [13, 8],
        [14, 7],
      ]
	  const areLineModifierTableHiSpeed2 = [
        [10, -4],
        [13, -6],
        [15, 0],
      ]
      const areLineTableHiSpeed2 = [
		[1, 20],
		[4, 18],
		[7, 16],
		[10, 14],
        [11, 12],
        [12, 10],
        [13, 8],
        [14, 7],
      ]
	  const areTableAnother = [
        [1, 18],
        [4, 14],
        [7, 8],
        [10, 7],
        [13, 6],
      ]
	  const areLineModifierTableAnother = [
	    [1, -4],
        [4, -4],
        [10, -6],
        [13, 0],
      ]
      const areLineTableAnother = [
        [1, 12],
        [4, 6],
        [10, 5],
        [13, 4],
      ]
	  const areTableAnother2 = [
        [1, 14],
        [4, 8],
        [7, 7],
        [9, 6],
        [13, 6],
      ]
	  const areLineModifierTableAnother2 = [
		[1, -4],
        [4, -6],
        [10, -6],
        [13, 0],
      ]
      const areLineTableAnother2 = [
        [1, 6],
        [4, 5],
        [10, 4],
        [13, 4],
      ]
	  const musicProgressionTable = [
        [47, 1],
        [50, 2],
        [97, 3],
        [100, 4],
		[147, 5],
        [150, 6],
		[197, 7],
      ]
	  const lockDelayTable = [
		[25, 30],
		[50, 30],
		[75, 30],
		[100, 28],
		[125, 26],
		[150, 24],
      ]
	  const lockDelayTableHiSpeed = [
		[25, 30],
		[50, 28],
		[75, 26],
		[100, 24],
		[125, 22],
		[150, 20],
      ]
	  const lockDelayTableHiSpeed2 = [
		[25, 24],
		[50, 22],
		[75, 20],
		[100, 18],
		[125, 16],
		[150, 14],
      ]
	  const lockDelayTableAnother = [
		[25, 18],
		[50, 16],
		[75, 14],
		[100, 12],
		[125, 10],
		[150, 10],
      ]
	  const lockDelayTableAnother2 = [
		[25, 10],
		[50, 10],
		[75, 10],
		[100, 10],
		[125, 10],
		[150, 10],
      ]
	  for (const pair of lockDelayTable) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty === 1) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of lockDelayTableHiSpeed) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty === 2) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of lockDelayTableHiSpeed2) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty === 3) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of lockDelayTableAnother) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty === 4) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of lockDelayTableAnother2) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line < line && difficulty >= 5) {
          if (testMode === false) {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(entry))
		  } else {
			game.piece.lockDelayLimit = Math.ceil(framesToMs(60))
		  }
          break
        }
      }
	  for (const pair of musicProgressionTable) {
        const line = pair[0]
        const entry = pair[1]
        if (game.stat.line >= line && game.musicProgression < entry) {
          switch (entry) {
            case 1:
			  sound.killBgm()
			  break
            case 3:
              sound.killBgm()
              break
			case 5:
			  sound.killBgm()
			  break
			case 7:
			  sound.killBgm()
			  break
            case 2:
				switch (difficulty) {
					case 1: {
						sound.loadBgm(["arcade2"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade2"], "ace")
						break
					}
					case 2: {
						sound.loadBgm(["arcade3"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade3"], "ace")
						break
					}
					case 3: {
						sound.loadBgm(["arcade6"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade6"], "ace")
						break
					}
					case 4: {
						sound.loadBgm(["arcade4"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade4"], "ace")
						break
					}
					case 5: {
						sound.loadBgm(["arcade4"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade4"], "ace")
						break
					}
					case 6: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
				}
				break
            case 4:
				switch (difficulty) {
					case 1: {
						sound.loadBgm(["arcade3"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade3"], "ace")
						break
					}
					case 2: {
						sound.loadBgm(["arcade6"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade6"], "ace")
						break
					}
					case 3: {
						sound.loadBgm(["arcade4"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade4"], "ace")
						break
					}
					case 4: {
						sound.loadBgm(["arcade5"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade5"], "ace")
						break
					}
					case 5: {
						sound.loadBgm(["arcade5"], "ace")
						sound.killBgm()
						sound.playBgm(["arcade5"], "ace")
						break
					}
					case 6: {
						break
					}
				}
				break
			case 6:
				switch (difficulty) {
					case 1: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 2: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 3: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 4: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 5: {
						sound.loadBgm(["kachusha-hard"], "ace")
						sound.killBgm()
						sound.playBgm(["kachusha-hard"], "ace")
						break
					}
					case 6: {
						break
					}
				}
				break
          }
          game.musicProgression = entry
        }
      }
	  for (const pair of areTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 1) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 1) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTable) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 1) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areTableHiSpeed) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 2) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTableHiSpeed) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 2) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTableHiSpeed) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 2) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areTableHiSpeed2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 3) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTableHiSpeed2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 3) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTableHiSpeed2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 3) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areTableAnother) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 4) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTableAnother) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 4) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTableAnother) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty === 4) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areTableAnother2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty >= 5) {
          game.piece.areLimit = framesToMs(entry)
          break
        }
      }
	  for (const pair of areLineModifierTableAnother2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty >= 5) {
          game.piece.areLimitLineModifier = framesToMs(entry)
          break
        }
      }
      for (const pair of areLineTableAnother2) {
        const level = pair[0]
        const entry = pair[1]
        if (game.stat.level <= level && difficulty >= 5) {
          game.piece.areLineLimit = framesToMs(entry)
          break
        }
      }
	  if (difficulty >= 6) {
		  game.stack.isFrozen = true
	  } else {
		  game.stack.isFrozen = false
	  }
    },
    onInit: (game) => {
	  const difficulty = parseInt(settings.game.aceworld.difficulty)
      switch (difficulty) {
		  case 1: {
			  game.settings.music = ["../ace/kachusha-easy"]
			  break
		  }
		  case 2: {
			  game.settings.music = ["../ace/arcade1"]
			  break
		  }
		  case 3: {
			  game.settings.music = ["../ace/arcade3"]
			  break
		  }
		  case 4: {
			  game.settings.music = ["../ace/arcade6"]
			  break
		  }
		  case 5: {
			  game.settings.music = ["../ace/arcade6"]
			  break
		  }
		  case 6: {
			  game.settings.music = ["../rounds/master5"]
			  break
		  }
	  }
      if (settings.game.aceworld.lineGoal >= 0) {
        game.lineGoal = settings.game.aceworld.lineGoal
      }
      game.stat.level = 1
      lastLevel = 1
      game.piece.gravity = 1000
      updateFallSpeed(game)
      game.updateStats()
	  game.isRaceMode = true
	  game.timePassed = 0
	  game.timePassedOffset = 0
	  game.timeGoal = 120000
	  game.musicProgression = 0
    },
  },
  zen: {
    update: (arg) => {
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      softDrop(arg, 20, true)
      hardDrop(arg)
      switch (settings.game.zen.lockdownMode) {
        case "zen":
          zenLockdown(arg)
          break
        case "infinity":
          infiniteLockdown(arg)
          break
        case "extended":
          extendedLockdown(arg)
          break
        case "classic":
          classicLockdown(arg)
          break
      }
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
    },
    onPieceSpawn: (game) => {
      game.updateStats()
    },
    onInit: (game) => {
      if (settings.game.zen.holdType === "skip") {
        game.hold.useSkip = true
        // game.hold.holdAmount = 2;
        // game.hold.holdAmountLimit = 2;
        // game.hold.gainHoldOnPlacement = true;
        // game.resize();
      }
      game.stat.level = 1
      // game.piece.gravity = 1000;
      // updateFallSpeed(game);
      // game.stat.b2b = 0;
      // game.updateStats();
    },
  },
  beat: {
    update: (arg) => {
      const game = gameHandler.game
      let respawn = false
      if (arg.piece.startingAre >= arg.piece.startingAreLimit) {
        game.beatTime += arg.ms
      }
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      softDrop(arg)
      if (input.getGamePress("hardDrop")) {
        if (!arg.piece.isFrozen) {
          sound.add("lockforce")
        }
        arg.piece.isFrozen = true
      }
      while (game.beatTime > bpmToMs(bpm)) {
        arg.piece.hardDrop()
        respawn = true
        game.beatTime -= bpmToMs(bpm)
      }
      beatLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      if (respawn) {
        respawnPiece(arg)
      }
      // for (let i = 0; i < events.length; i++) {
      //   const event = events[i]
      //   if (event[0] <= game.timePassed) {
      //     const eType = event[1]
      //     if (eType === 'flashBg') {
      //       console.log('flash')
      //     }
      //     events.splice(i, 1)
      //     i--
      //   } else {
      //     break
      //   }
      // }
      lockFlash(arg)
      updateLasts(arg)
    },
    onPieceSpawn: (game) => {
      game.piece.gravity = framesToMs(1 / 20)
      game.piece.lockDelayLimit = roundBpmToMs(bpm)
    },
    onInit: (game) => {
      switch (settings.game.beat.song) {
        case "non":
          bpm = 180
          break
        case "beat":
          bpm = 166
          break
        case "ritn":
          bpm = 158.5
          break
		case "ggg":
          bpm = 154
          break
		case "ar":
          bpm = 100
          break
      }
      /* game.isRaceMode = true; */
      game.beatTime = bpmToMs(bpm)
      game.updateStats()
    },
  },
  nontwo: {
    update: (arg) => {
      collapse(arg)
      const game = gameHandler.game
      const timePassed = game.timePassed + game.timePassedAre
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        if (timePassed > 54830 && timePassed < 63660) {
          rotateReverse(arg)
        } else {
          rotate(arg)
        }
        rotate180(arg)
        shifting(arg)
      }
      if (game.hold.isDisabled) {
        classicGravity(arg)
      } else {
        gravity(arg)
      }
      hyperSoftDrop(arg)
      hardDrop(arg)
      if (timePassed > 32000 && timePassed < 42660) {
        const calcNum = 42660 - 32000
        arg.piece.lockDelayLimit = Math.round(
          500 - ((timePassed - 32000) / calcNum) * 300
        )
        $("#delay").innerHTML = `${Math.round(
          arg.piece.lockDelayLimit
        )} <b>ms</b>`
        $("#delay").classList.add("danger")
      } else {
        $("#delay").classList.remove("danger")
        arg.piece.lockDelayLimit = 500
      }
      if (game.hold.isDisabled) {
        retroLockdown(arg, false)
      } else {
        classicLockdown(arg)
      }
      if (!arg.piece.inAre) {
        hold(arg)
      }
      while (
        ((nonEvents[0][0] - 1) * 16 + (nonEvents[0][1] - 1)) *
          (1 / 12) *
          1000 <=
        timePassed
      ) {
        const eType = nonEvents[0][2]
        switch (eType) {
          case "flashBg":
            resetAnimation("body", "non-flash")
            break
          case "gravChange":
            arg.piece.gravity = nonEvents[0][3]
            break
          case "silOn":
            $("#game-container").classList.add("sil")
            break
          case "silOff":
            $("#game-container").classList.remove("sil")
            break
          case "silBoardOn":
            $("#stack").classList.add("sil")
            break
          case "silBoardOff":
            $("#stack").classList.remove("sil")
            break
          case "silPieceOn":
            $("#piece").classList.add("sil")
            break
          case "silPieceOff":
            $("#piece").classList.remove("sil")
            break
          case "setFlashSpeed":
            $("body").style.setProperty("--flash-speed", `${nonEvents[0][3]}s`)
            break
          case "transform":
            const x = nonEvents[0][3]
            $(
              "#game-container"
            ).style.transform = `perspective(${x[0]}em) translateX(${x[1]}em) translateY(${x[2]}em) translateZ(${x[3]}em) rotateX(${x[4]}deg) rotateY(${x[5]}deg) rotateZ(${x[6]}deg)`
            break
          case "tranFunc":
            $("#game-container").style.transitionTimingFunction =
              nonEvents[0][3]
            break
          case "tranSpeed":
            $("#game-container").style.transitionProperty = `transform`
            $(
              "#game-container"
            ).style.transitionDuration = `${nonEvents[0][3]}s`
            break
          case "showMessage":
            $("#message").innerHTML = nonEvents[0][3]
            resetAnimation("#message", "dissolve")
            break
          case "changeNext":
            game.next.nextLimit = nonEvents[0][3]
            game.next.isDirty = true
            break
          case "startRetro":
            game.hold.isDirty = true
            game.hold.isDisabled = true
            game.piece.ghostIsVisible = false
            game.next.nextLimit = 1
            game.next.isDirty = true
            break
          case "endRetro":
            game.hold.isDirty = true
            game.hold.isDisabled = false
            game.piece.ghostIsVisible = true
            game.next.nextLimit = 6
            game.next.isDirty = true
            break
        }
        nonEvents.shift()
      }
      lockFlash(arg)
      updateLasts(arg)
    },
    onPieceSpawn: (game) => {},
    onInit: (game) => {
      game.timeGoal = 140000
      game.rtaLimit = true
      game.stat.level = 1
      const PERS = 35
      game.hideGrid = true
      game.stack.updateGrid()
      nonEvents = [
        [1, 1, "tranFunc", "linear"],
        [1, 1, "gravChange", 16.6666666667],
        [
          3,
          1,
          "showMessage",
          '<small style="font-size: .75em">Night of Nights X',
        ],
        [5, 1, "setFlashSpeed", 0.7],
        [5, 1, "flashBg"],
        [5, 1, "silOn"],
        [5, 13, "flashBg"],
        [6, 1, "flashBg"],
        [6, 13, "flashBg"],
        [7, 1, "flashBg"],
        [7, 9, "flashBg"],
        [8, 1, "flashBg"],
        [8, 5, "flashBg"],
        [8, 9, "flashBg"],
        [8, 13, "flashBg"],
        [8, 16, "silOff"],
        [8, 16, "silBoardOn"],
        [9, 1, "setFlashSpeed", 0.03],
        [9, 1, "flashBg"],
        [9, 1, "transform", [PERS, 0, 0, -25, 10, 10, 30]],
        [9, 2, "tranSpeed", 10],
        [9, 3, "transform", [PERS, 0, 0, 10, 0, 0, 0]],
        [9, 3, "flashBg"],
        [9, 5, "flashBg"],
        [9, 6, "flashBg"],
        [9, 8, "flashBg"],
        [9, 10, "flashBg"],
        [9, 12, "flashBg"],
        [9, 13, "flashBg"],
        [9, 14, "flashBg"],
        [9, 15, "flashBg"],
        [9, 16, "flashBg"],
        [10, 2, "flashBg"],
        [10, 3, "flashBg"],
        [10, 5, "flashBg"],
        [10, 6, "flashBg"],
        [10, 8, "flashBg"],
        [10, 10, "flashBg"],
        [10, 12, "flashBg"],
        [10, 13, "flashBg"],
        [10, 15, "flashBg"],
        [11, 1, "flashBg"],
        [11, 3, "flashBg"],
        [11, 5, "flashBg"],
        [11, 6, "flashBg"],
        [11, 8, "flashBg"],
        [11, 10, "flashBg"],
        [11, 12, "flashBg"],
        [11, 13, "flashBg"],
        [11, 14, "flashBg"],
        [11, 15, "flashBg"],
        [11, 16, "flashBg"],
        [12, 2, "flashBg"],
        [12, 3, "flashBg"],
        [12, 5, "flashBg"],
        [12, 6, "flashBg"],
        [12, 8, "flashBg"],
        [12, 10, "flashBg"],
        [12, 12, "flashBg"],
        [12, 13, "flashBg"],
        [12, 15, "flashBg"],
        [13, 1, "flashBg"],
        [13, 3, "flashBg"],
        [13, 5, "flashBg"],
        [13, 6, "flashBg"],
        [13, 8, "flashBg"],
        [13, 10, "flashBg"],
        [13, 12, "flashBg"],
        [13, 13, "flashBg"],
        [13, 14, "flashBg"],
        [13, 15, "flashBg"],
        [13, 16, "flashBg"],
        [14, 2, "flashBg"],
        [14, 3, "flashBg"],
        [14, 5, "flashBg"],
        [14, 6, "flashBg"],
        [14, 8, "flashBg"],
        [14, 10, "flashBg"],
        [14, 12, "flashBg"],
        [14, 13, "flashBg"],
        [14, 15, "flashBg"],
        [15, 1, "flashBg"],
        [15, 3, "flashBg"],
        [15, 5, "flashBg"],
        [15, 6, "flashBg"],
        [15, 8, "flashBg"],
        [15, 10, "flashBg"],
        [15, 12, "flashBg"],
        [15, 13, "flashBg"],
        [15, 14, "flashBg"],
        [15, 15, "flashBg"],
        [15, 16, "flashBg"],
        [16, 2, "flashBg"],
        [16, 3, "flashBg"],
        [16, 5, "flashBg"],
        [16, 6, "flashBg"],
        [16, 8, "flashBg"],
        [16, 10, "flashBg"],
        [16, 12, "flashBg"],
        [16, 13, "flashBg"],
        [16, 15, "flashBg"],
        [16, 15, "tranSpeed", 0.5],
        [16, 15, "tranFunc", "cubic-bezier(0.030, 0.935, 0.050, 0.970)"],
        [17, 1, "setFlashSpeed", 0.5],
        [17, 1, "flashBg"],
        [
          17,
          1,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [18, 13, "flashBg"],
        [
          18,
          13,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [18, 15, "flashBg"],
        [
          18,
          15,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [20, 1, "flashBg"],
        [
          20,
          1,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [21, 1, "flashBg"],
        [
          21,
          1,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [22, 1, "flashBg"],
        [
          22,
          1,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [23, 1, "flashBg"],
        [
          23,
          1,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [23, 9, "flashBg"],
        [
          23,
          9,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [24, 1, "flashBg"],
        [
          24,
          1,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [24, 5, "flashBg"],
        [
          24,
          5,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [24, 9, "flashBg"],
        [
          24,
          9,
          "transform",
          [
            PERS,
            0,
            0,
            -10,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
            Math.random() * 80 - 40,
          ],
        ],
        [24, 9, "showMessage", "20G"],
        [24, 9, "gravChange", 0.0001],
        [24, 14, "tranSpeed", 0.05],

        [25, 1, "silBoardOff"],
        [25, 1, "transform", [PERS, 0, 0, 0, 0, 0, 0]],
        [25, 1, "setFlashSpeed", 0.15],
        [25, 1, "flashBg"],
        [25, 2, "tranSpeed", 10],
        [25, 2, "tranFunc", "cubic-bezier(0.895, 0.030, 0.685, 0.220)"],
        [25, 3, "transform", [PERS, 0, 0, -35, 0, 0, 0]],
        [25, 9, "flashBg"],
        [26, 1, "flashBg"],
        [26, 5, "flashBg"],
        [26, 9, "flashBg"],
        [26, 13, "flashBg"],
        [27, 1, "flashBg"],
        [27, 9, "flashBg"],
        [28, 1, "flashBg"],
        [28, 5, "flashBg"],
        [28, 9, "flashBg"],
        [28, 13, "flashBg"],
        [29, 1, "flashBg"],
        [29, 9, "flashBg"],
        [30, 1, "flashBg"],
        [30, 5, "flashBg"],
        [30, 9, "flashBg"],
        [30, 13, "flashBg"],
        [31, 1, "flashBg"],
        [31, 9, "flashBg"],
        [32, 1, "flashBg"],
        [32, 5, "flashBg"],
        [32, 9, "flashBg"],
        [32, 13, "flashBg"],

        [32, 16, "tranSpeed", 0],
        [33, 1, "transform", [PERS, 0, 0, 0, 0, 0, 0]],
        [33, 1, "silPieceOn"],
        [33, 1, "showMessage", "1/60G"],
        [33, 1, "gravChange", 1000],
        [33, 1, "setFlashSpeed", 0.08],
        [33, 1, "flashBg"],
        [33, 5, "flashBg"],
        [33, 9, "flashBg"],
        [33, 13, "flashBg"],
        [34, 1, "flashBg"],
        [34, 5, "flashBg"],
        [34, 9, "flashBg"],
        [34, 13, "flashBg"],
        [35, 1, "flashBg"],
        [35, 5, "flashBg"],
        [35, 9, "flashBg"],
        [35, 13, "flashBg"],
        [36, 1, "flashBg"],
        [36, 5, "flashBg"],
        [36, 9, "flashBg"],
        [36, 13, "flashBg"],
        [37, 1, "silBoardOn"],
        [37, 1, "showMessage", "20G"],
        [37, 1, "gravChange", 0.0001],
        [37, 1, "setFlashSpeed", 0.04],
        [37, 1, "flashBg"],
        [37, 3, "flashBg"],
        [37, 5, "flashBg"],
        [37, 7, "flashBg"],
        [37, 9, "flashBg"],
        [37, 11, "flashBg"],
        [37, 13, "flashBg"],
        [37, 15, "flashBg"],
        [38, 1, "flashBg"],
        [38, 3, "flashBg"],
        [38, 5, "flashBg"],
        [38, 7, "flashBg"],
        [38, 9, "flashBg"],
        [38, 11, "flashBg"],
        [38, 13, "flashBg"],
        [38, 15, "flashBg"],
        [39, 1, "flashBg"],
        [39, 3, "flashBg"],
        [39, 5, "flashBg"],
        [39, 7, "flashBg"],
        [39, 9, "flashBg"],
        [39, 11, "flashBg"],
        [39, 13, "flashBg"],
        [39, 15, "flashBg"],
        [40, 1, "flashBg"],
        [40, 3, "flashBg"],
        [40, 5, "flashBg"],
        [40, 7, "flashBg"],
        [40, 9, "flashBg"],
        [40, 11, "flashBg"],
        [40, 13, "flashBg"],
        [40, 13, "tranSpeed", 3],
        [40, 13, "tranFunc", "cubic-bezier(0.860, 0.000, 0.070, 1.000)"],
        [40, 15, "flashBg"],
        [41, 1, "silBoardOff"],
        [41, 1, "silPieceOff"],
        [41, 1, "transform", [PERS, 0, 0, 0, 180, 0, 0]],
        [41, 1, "showMessage", "1/60G"],
        [41, 1, "gravChange", 1000],
        [42, 2.5, "changeNext", 1],
        [48, 10, "tranSpeed", 0],
        [48, 13, "transform", [PERS, 0, 0, 0, 0, 0, 0]],
        [48, 13, "setFlashSpeed", 2.6],
        [48, 13, "flashBg"],
        [49, 1, "silBoardOn"],
        [49, 1, "showMessage", "1G"],
        [49, 1, "gravChange", 16.6666666667],
        [49, 1, "changeNext", 6],
        [52, 13, "setFlashSpeed", 0.08],
        [52, 13, "flashBg"],
        [52, 15, "flashBg"],
        [55, 1, "setFlashSpeed", 0.5],
        [55, 1, "flashBg"],
        [55, 9, "flashBg"],
        [55, 9, "flashBg"],
        [56, 1, "flashBg"],
        [56, 5, "flashBg"],
        [56, 9, "flashBg"],
        [57, 1, "flashBg"],
        [61, 1, "flashBg"],
        [62, 1, "flashBg"],
        [63, 1, "flashBg"],
        [63, 9, "flashBg"],
        [64, 1, "flashBg"],
        [64, 5, "flashBg"],
        [64, 9, "flashBg"],
        [64, 13, "flashBg"],
        [65, 1, "silBoardOff"],
        [65, 1, "gravChange", 0.0001],
        [65, 1, "showMessage", "20G"],
        [65, 1, "tranFunc", "cubic-bezier(0.030, 0.935, 0.050, 0.970)"],
        [65, 1, "tranSpeed", 0.08],

        [65, 1, "setFlashSpeed", 0.17],

        [65, 1, "transform", [PERS, 0, 10, -20, 0, 0, 0]],
        [65, 1, "flashBg"],
        [65, 3, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [65, 5, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [65, 6, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [65, 7, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [65, 9, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [65, 11, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [65, 13, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [65, 14, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [65, 15, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [65, 16, "transform", [PERS, 0, 7, -20, 0, 0, 0]],
        [66, 1, "transform", [PERS, 0, 5, -20, 0, 0, 0]],
        [66, 1, "flashBg"],
        [66, 3, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [66, 5, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [66, 6, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [66, 7, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [66, 8, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [66, 9, "transform", [PERS, 0, -5, -20, 0, 0, 0]],
        [66, 11, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [66, 13, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [66, 15, "transform", [PERS, 0, -2, -20, 0, 0, 0]],

        [67, 1, "transform", [PERS, 0, 10, -20, 0, 0, 0]],
        [67, 1, "flashBg"],
        [67, 3, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [67, 5, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [67, 6, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [67, 7, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [67, 9, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [67, 11, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [67, 13, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [67, 14, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [67, 15, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [67, 16, "transform", [PERS, 0, 7, -20, 0, 0, 0]],
        [68, 1, "transform", [PERS, 0, 5, -20, 0, 0, 0]],
        [68, 1, "flashBg"],
        [68, 3, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [68, 5, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [68, 5, "flashBg"],
        [68, 6, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [68, 7, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [68, 8, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [68, 9, "transform", [PERS, 0, -6, -20, 0, 0, 0]],
        [68, 9, "flashBg"],
        [68, 11, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [68, 13, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [68, 13, "flashBg"],
        [68, 15, "transform", [PERS, 0, -2, -20, 0, 0, 0]],

        [69, 1, "transform", [PERS, 0, 10, -20, 0, 0, 0]],
        [69, 1, "flashBg"],
        [69, 3, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [69, 5, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [69, 6, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [69, 7, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [69, 9, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [69, 11, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [69, 13, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [69, 14, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [69, 15, "transform", [PERS, 0, 3, -20, 0, 0, 0]],
        [69, 16, "transform", [PERS, 0, 7, -20, 0, 0, 0]],
        [70, 1, "transform", [PERS, 0, 5, -20, 0, 0, 0]],
        [70, 1, "flashBg"],
        [70, 3, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [70, 5, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [70, 6, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [70, 7, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [70, 8, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [70, 9, "transform", [PERS, 0, -5, -20, 0, 0, 0]],
        [70, 11, "transform", [PERS, 0, -2, -20, 0, 0, 0]],
        [70, 13, "transform", [PERS, 0, 2, -20, 0, 0, 0]],
        [70, 15, "transform", [PERS, 0, 1, -20, 0, 0, 0]],
        [70, 15, "transform", [PERS, 0, 1, -20, 0, 0, 0]],

        [71, 1, "transform", [PERS, 0, 0, -20, 0, 0, 0]],
        [71, 1, "flashBg"],
        [71, 3, "transform", [PERS, 0, 0, -19, 0, 0, 0]],
        [71, 3, "flashBg"],
        [71, 4, "transform", [PERS, 0, 0, -18, 0, 0, 0]],
        [71, 4, "flashBg"],
        [71, 7, "transform", [PERS, 0, 0, -17, 0, 0, 0]],
        [71, 7, "flashBg"],
        [71, 9, "transform", [PERS, 0, 0, -12, 0, 0, 0]],
        [71, 9, "flashBg"],
        [71, 11, "transform", [PERS, 0, 0, -11, 0, 0, 0]],
        [71, 11, "flashBg"],
        [71, 12, "transform", [PERS, 0, 0, -10, 0, 0, 0]],
        [71, 12, "flashBg"],
        [71, 15, "transform", [PERS, 0, 0, -9, 0, 0, 0]],
        [71, 15, "flashBg"],
        [72, 1, "transform", [PERS, 0, 0, -4, 0, 0, 0]],
        [72, 1, "flashBg"],
        [72, 3, "transform", [PERS, 0, 0, -3, 0, 0, 0]],
        [72, 3, "flashBg"],
        [72, 5, "transform", [PERS, 0, 0, 2, 0, 0, 0]],
        [72, 5, "flashBg"],
        [72, 7, "transform", [PERS, 0, 0, 3, 0, 0, 0]],
        [72, 7, "flashBg"],
        [72, 9, "transform", [PERS, 0, 0, 8, 0, 0, 0]],
        [72, 9, "flashBg"],

        [73, 1, "transform", [PERS, 0, 0, 0, 0, 0, 0]],
        [73, 3, "tranSpeed", 0],
        [73, 3, "silOn"],
        [73, 3, "setFlashSpeed", 0.34],

        [
          73,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [73, 3, "flashBg"],
        [
          73,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [73, 7, "flashBg"],
        [
          73,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [73, 11, "flashBg"],
        [
          73,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [73, 15, "flashBg"],

        [
          74,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [74, 3, "flashBg"],
        [
          74,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [74, 7, "flashBg"],
        [
          74,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [74, 11, "flashBg"],
        [
          74,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [74, 15, "flashBg"],

        [
          75,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [75, 3, "flashBg"],
        [
          75,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [75, 7, "flashBg"],
        [
          75,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [75, 11, "flashBg"],
        [
          75,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [75, 15, "flashBg"],

        [
          76,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [76, 3, "flashBg"],
        [
          76,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [76, 7, "flashBg"],
        [
          76,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [76, 11, "flashBg"],
        [
          76,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [76, 15, "flashBg"],

        [73, 3, "setFlashSpeed", 0.17],

        [
          77,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [77, 3, "flashBg"],
        [
          77,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [77, 7, "flashBg"],
        [
          77,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [77, 11, "flashBg"],
        [
          77,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [77, 15, "flashBg"],

        [
          78,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [78, 3, "flashBg"],
        [
          78,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [78, 7, "flashBg"],
        [
          78,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [78, 11, "flashBg"],
        [
          78,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [78, 15, "flashBg"],

        [
          79,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [79, 3, "flashBg"],
        [
          79,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [79, 7, "flashBg"],
        [
          79,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [79, 11, "flashBg"],
        [
          79,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [79, 15, "flashBg"],

        [
          80,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [80, 3, "flashBg"],
        [
          80,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [80, 7, "flashBg"],
        [
          80,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [80, 11, "flashBg"],
        [
          80,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [80, 15, "flashBg"],

        [81, 1, "silOff"],
        [81, 1, "transform", [PERS, 0, 0, 0, 0, 0, 0]],
        [81, 1, "setFlashSpeed", 0.017],
        [81, 1, "flashBg"],
        [81, 1, "silBoardOn"],
        [81, 5, "flashBg"],
        [81, 5, "silBoardOff"],
        [81, 5, "silPieceOn"],
        [81, 9, "flashBg"],
        [81, 9, "silPieceOff"],
        [81, 9, "silBoardOn"],
        [81, 13, "flashBg"],
        [81, 13, "silBoardOff"],
        [81, 13, "silPieceOn"],

        [82, 1, "flashBg"],
        [82, 1, "silPieceOff"],
        [82, 1, "silBoardOn"],
        [82, 5, "flashBg"],
        [82, 5, "silBoardOff"],
        [82, 5, "silPieceOn"],
        [82, 9, "flashBg"],
        [82, 9, "silPieceOff"],
        [82, 9, "silBoardOn"],
        [82, 13, "flashBg"],
        [82, 13, "silBoardOff"],
        [82, 13, "silPieceOn"],

        [83, 1, "flashBg"],
        [83, 1, "silPieceOff"],
        [83, 1, "silBoardOn"],
        [83, 5, "flashBg"],
        [83, 5, "silBoardOff"],
        [83, 5, "silPieceOn"],
        [83, 9, "flashBg"],
        [83, 9, "silPieceOff"],
        [83, 9, "silBoardOn"],
        [83, 13, "flashBg"],
        [83, 13, "silBoardOff"],
        [83, 13, "silPieceOn"],

        [84, 1, "flashBg"],
        [84, 1, "silPieceOff"],
        [84, 1, "silBoardOn"],
        [84, 5, "flashBg"],
        [84, 5, "silBoardOff"],
        [84, 5, "silPieceOn"],
        [84, 9, "flashBg"],
        [84, 9, "silPieceOff"],
        [84, 9, "silBoardOn"],
        [84, 13, "flashBg"],
        [84, 13, "silBoardOff"],
        [84, 13, "silPieceOn"],

        [84, 13, "tranSpeed", 0.33],
        [84, 13, "tranFunc", "cubic-bezier(0.030, 0.935, 0.050, 0.970)"],

        [85, 1, "flashBg"],
        [85, 1, "silPieceOff"],
        [85, 1, "silBoardOn"],
        [
          85,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [85, 5, "flashBg"],
        [85, 5, "silBoardOff"],
        [85, 5, "silPieceOn"],
        [
          85,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [85, 9, "flashBg"],
        [85, 9, "silPieceOff"],
        [85, 9, "silBoardOn"],
        [
          85,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [85, 13, "flashBg"],
        [85, 13, "silBoardOff"],
        [85, 13, "silPieceOn"],
        [
          85,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],

        [86, 1, "flashBg"],
        [86, 1, "silPieceOff"],
        [86, 1, "silBoardOn"],
        [
          86,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [86, 5, "flashBg"],
        [86, 5, "silBoardOff"],
        [86, 5, "silPieceOn"],
        [
          86,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [86, 9, "flashBg"],
        [86, 9, "silPieceOff"],
        [86, 9, "silBoardOn"],
        [
          86,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [86, 13, "flashBg"],
        [86, 13, "silBoardOff"],
        [86, 13, "silPieceOn"],
        [
          86,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],

        [87, 1, "flashBg"],
        [87, 1, "silPieceOff"],
        [87, 1, "silBoardOn"],
        [
          87,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [87, 5, "flashBg"],
        [87, 5, "silBoardOff"],
        [87, 5, "silPieceOn"],
        [
          87,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [87, 9, "flashBg"],
        [87, 9, "silPieceOff"],
        [87, 9, "silBoardOn"],
        [
          87,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [87, 13, "flashBg"],
        [87, 13, "silBoardOff"],
        [87, 13, "silPieceOn"],
        [
          87,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],

        [88, 1, "flashBg"],
        [88, 1, "silPieceOff"],
        [88, 1, "silBoardOn"],
        [
          88,
          3,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [88, 5, "flashBg"],
        [88, 5, "silBoardOff"],
        [88, 5, "silPieceOn"],
        [
          88,
          7,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [88, 9, "flashBg"],
        [88, 9, "silPieceOff"],
        [88, 9, "silBoardOn"],
        [
          88,
          11,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],
        [88, 13, "flashBg"],
        [88, 13, "silBoardOff"],
        [88, 13, "silPieceOn"],
        [
          88,
          15,
          "transform",
          [
            PERS,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            -10,
            0,
            0,
            Math.random() * 10 - 5,
          ],
        ],

        [89, 1, "silOn"],
        [89, 1, "setFlashSpeed", 0.03],
        [89, 1, "flashBg"],
        [89, 1, "tranSpeed", 0],
        [89, 1, "silPieceOff"],
        [89, 1, "transform", [PERS, 0, 0, -25, 10, -10, -30]],
        [89, 2, "tranSpeed", 10],
        [89, 2, "tranFunc", "linear"],
        [89, 3, "transform", [PERS, 0, 0, 0, 0, 0, 0]],
        [89, 3, "flashBg"],
        [89, 5, "flashBg"],
        [89, 6, "flashBg"],
        [89, 7, "flashBg"],
        [89, 9, "flashBg"],
        [89, 11, "flashBg"],
        [89, 13, "flashBg"],
        [89, 14, "flashBg"],
        [89, 15, "flashBg"],
        [89, 16, "flashBg"],

        [90, 1, "flashBg"],
        [90, 3, "flashBg"],
        [90, 5, "flashBg"],
        [90, 6, "flashBg"],
        [90, 7, "flashBg"],
        [90, 8, "flashBg"],
        [90, 9, "flashBg"],
        [90, 11, "flashBg"],
        [90, 13, "flashBg"],
        [90, 15, "flashBg"],

        [91, 1, "flashBg"],
        [91, 3, "flashBg"],
        [91, 5, "flashBg"],
        [91, 6, "flashBg"],
        [91, 7, "flashBg"],
        [91, 9, "flashBg"],
        [91, 11, "flashBg"],
        [91, 13, "flashBg"],
        [91, 14, "flashBg"],
        [91, 15, "flashBg"],
        [91, 16, "flashBg"],

        [92, 1, "flashBg"],
        [92, 3, "flashBg"],
        [92, 5, "flashBg"],
        [92, 6, "flashBg"],
        [92, 7, "flashBg"],
        [92, 8, "flashBg"],
        [92, 9, "flashBg"],
        [92, 11, "flashBg"],
        [92, 13, "flashBg"],
        [92, 15, "flashBg"],

        [93, 1, "flashBg"],
        [93, 7, "flashBg"],
        [93, 8, "flashBg"],
        [93, 9, "flashBg"],
        [93, 11, "flashBg"],
        [93, 13, "flashBg"],
        [93, 15, "flashBg"],

        [94, 3, "flashBg"],
        [94, 5, "flashBg"],
        [94, 7, "flashBg"],
        [94, 9, "flashBg"],
        [94, 11, "flashBg"],
        [94, 12, "flashBg"],
        [94, 13, "flashBg"],
        [94, 15, "flashBg"],

        [95, 1, "flashBg"],
        [95, 3, "flashBg"],
        [95, 4, "flashBg"],
        [95, 5, "flashBg"],
        [95, 6, "flashBg"],
        [95, 7, "flashBg"],
        [95, 9, "flashBg"],
        [95, 11, "flashBg"],
        [95, 13, "flashBg"],
        [95, 15, "flashBg"],

        [96, 1, "flashBg"],

        [97, 1, "silOff"],
        [97, 1, "showMessage", "1/60G"],
        [97, 1, "gravChange", 1000],
        [97, 1, "tranSpeed", 12],
        [97, 1, "tranFunc", "ease-in"],
        [97, 1, "transform", [PERS, 0, 0, -150, 0, 0, 0]],
        [Number.MAX_SAFE_INTEGER, "none"],
      ]
      game.updateStats()
    },
  },
  sprint: {
    update: (arg) => {
      const game = gameHandler.game
      if (game.pps >= 2 && game.settings.hasPaceBgm) {
        if (!game.startedOnPaceEvent) {
          game.onPaceTime = game.timePassed
          game.startedOnPaceEvent = true
        }
        if (game.timePassed - game.onPaceTime >= 3000) {
          if (!sound.paceBgmIsRaised) {
            sound.add("onpace")
          }
          sound.raisePaceBgm()
          $("#timer").classList.add("pace")
        }
      } else {
        if (sound.paceBgmIsRaised) {
          sound.add("offpace")
        }
        game.startedOnPaceEvent = false
        sound.lowerPaceBgm()
        $("#timer").classList.remove("pace")
      }
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      softDrop(arg, 70)
      hardDrop(arg)
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
    },
    onPieceSpawn: (game) => {},
    onInit: (game) => {
      game.lineGoal = settings.game.sprint.lineGoal
      game.isRaceMode = true
      game.stat.level = 1
      game.appends.line = `<span class="small">/${settings.game.sprint.lineGoal}</span>`
      game.piece.gravity = 1000
      if (settings.game.sprint.regulationMode) {
        game.piece.areLimit = 0
        game.piece.areLineLimit = 0
        game.piece.areLimitLineModifier = 0
      }
      updateFallSpeed(game)
      game.updateStats()
    },
  },
  ultra: {
    update: (arg) => {
      const game = gameHandler.game
      if (
        game.timePassed + (game.rtaLimit ? game.timePassedAre : 0) >=
        game.timeGoal - 30000
      ) {
        if (!game.playedHurryUp) {
          sound.add("hurryup")
          $(`#timer${game.rtaLimit ? "-real" : ""}`).classList.add("hurry-up")
          game.playedHurryUp = true
        }
        sound.raisePaceBgm()
      } else {
        game.playedHurryUp = false
      }
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      softDrop(arg, 70)
      hardDrop(arg)
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
    },
    onPieceSpawn: (game) => {},
    onInit: (game) => {
      game.timeGoal = settings.game.ultra.timeLimit
      game.rtaLimit = settings.game.ultra.useRta
      game.isRaceMode = true
      game.piece.gravity = 1000
      updateFallSpeed(game)
      game.stat.level = 1
      game.updateStats()
    },
  },
  combo: {
    update: (arg) => {
      const game = gameHandler.game
      if (game.timePassed >= game.timeGoal - 10000) {
        if (!game.playedHurryUp) {
          sound.add("hurryup")
          $("#timer").classList.add("hurry-up")
          game.playedHurryUp = true
        }
        sound.raisePaceBgm()
      } else {
        game.playedHurryUp = false
      }
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      softDrop(arg, 70)
      hardDrop(arg)
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
    },
    onPieceSpawn: (game) => {},
    onInit: (game) => {
      if (settings.game.combo.holdType === "skip") {
        game.hold.useSkip = true
        game.hold.holdAmount = 2
        game.hold.holdAmountLimit = 2
        game.hold.gainHoldOnPlacement = true
        game.resize()
      }
      if (!input.holdingShift) {
        game.timeGoal = 30000
      }
      game.isRaceMode = true
      game.piece.gravity = 1000
      updateFallSpeed(game)
      game.stat.level = 1
      game.updateStats()
      game.stack.grid[0][game.stack.height + game.stack.hiddenHeight - 1] =
        "white"
      game.stack.grid[0][game.stack.height + game.stack.hiddenHeight - 2] =
        "white"
      if (game.next.queue[0] === "J") {
        game.stack.grid[1][game.stack.height + game.stack.hiddenHeight - 1] =
          "white"
      } else {
        game.stack.grid[1][game.stack.height + game.stack.hiddenHeight - 2] =
          "white"
      }
    },
  },
  standardx: {
    update: (arg) => {
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      hyperSoftDrop(arg)
      hardDrop(arg)
      classicLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10 + 1)
      const x = game.stat.level
      const gravityEquation = (0.9 - (x - 1) * 0.001) ** (x - 1)
      game.piece.gravity = Math.max(gravityEquation * 1000, framesToMs(1 / 20))
      if (game.stat.level >= 40) {
        game.piece.lockDelayLimit = ~~framesToMs(
          30 * Math.pow(0.93, Math.pow(game.stat.level - 40, 0.8))
        )
      } else {
        game.piece.lockDelayLimit = 500
      }
      updateFallSpeed(game)
      levelUpdate(game)
    },
    onInit: (game) => {
      game.stat.level = 1
      lastLevel = 1
      game.piece.gravity = 1000
      updateFallSpeed(game)
      game.updateStats()
    },
  },
  survival: {
    update: (arg) => {
      const game = gameHandler.game

      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      if (
        arg.piece.startingAre >= arg.piece.startingAreLimit &&
        game.marginTime >= game.marginTimeLimit
      ) {
        garbageTimer += arg.ms
        if (garbageTimer > 16.667) {
          garbageTimer -= 16.667
          const randomCheck = Math.floor(Math.random() * 100000) / 100
          if (randomCheck < game.garbageRate) {
            arg.stack.addGarbageToCounter(1)
          }
        }
      }
      gravity(arg)
      softDrop(arg, 70)
      hardDrop(arg)
      extendedLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
      game.stat.level = Math.max(
        settings.game.survival.startingLevel,
        Math.floor(game.timePassed / 10000 + 1)
      )
      const x = game.stat.level
      const gravityEquation = (0.99 - (x - 1) * 0.007) ** (x - 1)
      game.piece.gravity = Math.max(gravityEquation * 1000, framesToMs(1 / 20))
      game.garbageRate =
        x ** game.garbageRateExponent * game.garbageRateMultiplier +
        game.garbageRateAdditive
      if (levelUpdate(game)) {
        game.updateStats()
      }
      if (
        arg.piece.startingAre >= arg.piece.startingAreLimit &&
        game.marginTime < game.marginTimeLimit
      ) {
        game.marginTime += arg.ms
      }
    },
    onPieceSpawn: (game) => {},
    onInit: (game) => {
      // if (settings.game.survival.matrixWidth === "standard") {
      //   game.settings.width = 10
      //   game.stack.width = 10
      //   game.stack.new()
      //   game.piece.xSpawnOffset = 0
      //   game.resize()
      // }
      switch (settings.game.survival.matrixWidth) {
        // case 4:
        //   game.settings.width = 4
        //   game.stack.width = 4
        //   game.stack.new()
        //   game.piece.xSpawnOffset = -3
        //   game.resize()
        //   break
        case 5:
          game.settings.width = 5
          game.stack.width = 5
          game.stack.new()
          game.piece.xSpawnOffset = -3
          game.resize()
          break
        case 6:
          game.settings.width = 6
          game.stack.width = 6
          game.stack.new()
          game.piece.xSpawnOffset = -2
          game.resize()
          break
        case 7:
          game.settings.width = 7
          game.stack.width = 7
          game.stack.new()
          game.piece.xSpawnOffset = -2
          game.resize()
          break
        case 8:
          game.settings.width = 8
          game.stack.width = 8
          game.stack.new()
          game.piece.xSpawnOffset = -1
          game.resize()
          break
        case 9:
          game.settings.width = 9
          game.stack.width = 9
          game.stack.new()
          game.piece.xSpawnOffset = -1
          game.resize()
          break
        case 10:
          game.settings.width = 10
          game.stack.width = 10
          game.stack.new()
          game.piece.xSpawnOffset = 0
          game.resize()
          break
      }
      let difficulty = settings.game.survival.difficulty
      game.garbageRateExponent = [1.91, 1.95, 1.97, 2, 2.03, 2.07, 2.1][
        difficulty
      ]
      game.garbageRateMultiplier = [0.005, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1][
        difficulty
      ]
      game.garbageRateAdditive = [1, 1.5, 2, 2.5, 9, 18, 35][difficulty]
      game.stack.garbageSwitchRate = [1, 1, 8, 4, 2, 1, 1][difficulty]
      game.stack.antiGarbageBuffer = [-20, -10, -8, -6, -4, -2, 0][difficulty]
      if (difficulty <= 1) {
        game.stack.copyBottomForGarbage = true
      }
      game.garbageRate = 0
      game.marginTime = 0
      game.marginTimeLimit = 5000
      garbageTimer = 0
      game.stat.level = settings.game.survival.startingLevel
      lastLevel = parseInt(settings.game.survival.startingLevel)
      game.piece.gravity = 1000
      updateFallSpeed(game)
      game.updateStats()
    },
  },
  master: {
    update: (arg) => {
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      softDrop(arg)
      hardDrop(arg)
      switch (settings.game.master.lockdownMode) {
        case "infinity":
          infiniteLockdown(arg)
          break
        case "extended":
          extendedLockdown(arg)
          break
        case "classic":
          classicLockdown(arg)
          break
      }
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.max(
        Math.floor(game.stat.line / 10 + 1),
        settings.game.master.startingLevel
      )
      const calcLevel = Math.min(29, game.stat.level - 1)
      const DELAY_TABLE = [
        500, 480, 461, 442, 425, 408, 391, 376, 361, 346, 332, 319, 306, 294,
        282, 271, 260, 250, 240, 230, 221, 212, 204, 196, 188, 180, 173, 166,
        159, 153,
      ]
      game.piece.lockDelayLimit = DELAY_TABLE[calcLevel]
      const ARE_TABLE = [
        400, 376, 353, 332, 312, 294, 276, 259, 244, 229, 215, 203, 190, 179,
        168, 158, 149, 140, 131, 123, 116, 109, 103, 96, 91, 85, 80, 75, 71, 65,
      ]
      game.piece.areLimit = ARE_TABLE[calcLevel]
      game.piece.areLineLimit = ARE_TABLE[calcLevel]
      game.stat.entrydelay = `${ARE_TABLE[calcLevel]}ms`
      levelUpdate(game)
    },
    onInit: (game) => {
      if (settings.game.master.startingLevel < 10) {
        sound.playMenuSe("hardstart1")
      } else if (settings.game.master.startingLevel < 20) {
        sound.playMenuSe("hardstart2")
      } else if (settings.game.master.startingLevel < 25) {
        sound.playMenuSe("hardstart3")
      } else {
        sound.playMenuSe("hardstart4")
      }
      game.lineGoal = 300
      game.stat.level = settings.game.master.startingLevel
      lastLevel = parseInt(settings.game.master.startingLevel)
      game.prefixes.level = "M"
      game.stat.entrydelay = "400ms"
      game.piece.gravity = framesToMs(1 / 20)
      updateFallSpeed(game)
      game.updateStats()
    },
  },
  prox: {
    update: (arg) => {
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        initialRotation(arg)
        initialHold(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        rotate180(arg)
        shifting(arg)
      }
      gravity(arg)
      hyperSoftDrop(arg)
      hardDrop(arg)
      classicLockdown(arg)
      if (!arg.piece.inAre) {
        hold(arg)
      }
      lockFlash(arg)
      updateLasts(arg)
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.min(
        10,
        Math.max(
          settings.game.prox.startingLevel,
          Math.floor(game.stat.line / 20 + 1)
        )
      )
      const calcLevel = game.stat.level - 1
      const SPEED_TABLE = [
        1,
        1 / 2.5,
        1 / 5,
        1 / 20,
        1 / 20,
        1 / 20,
        1 / 20,
        1 / 20,
        1 / 20,
        1 / 20,
      ]
      game.piece.gravity = framesToMs(SPEED_TABLE[calcLevel])
      const DELAY_TABLE = [500, 475, 450, 375, 350, 325, 300, 275, 250, 225]
      game.piece.lockDelayLimit = DELAY_TABLE[calcLevel]
      const NEXT_TABLE = [6, 5, 4, 3, 2, 1, 1, 1, 1, 1]
      game.next.nextLimit = NEXT_TABLE[calcLevel]
      if (calcLevel >= 3 && !shown20GMessage) {
        $("#message").textContent = "20G"
        resetAnimation("#message", "dissolve")
        shown20GMessage = true
      }
      if (calcLevel >= 8 && !game.hold.isDisabled) {
		if (game.stat.piece > 0) {
          sound.killBgm()
          sound.playBgm(game.settings.music[1], game.type)
        }
        game.useAltMusic = true
        game.hold.isDisabled = true
        game.hold.isDirty = true
      }
      // if (game.stat.level > 1 && !shownHoldWarning) {
      //   $('#hold-disappear-message').textContent = locale.getString('ui', 'watchOutWarning');
      // }
      levelUpdate(game)
    },
    onInit: (game) => {
      sound.playMenuSe("hardstart3")
      shown20GMessage = settings.game.prox.startingLevel > 3 ? true : false
      shownHoldWarning = false
      game.lineGoal = 200
      game.stat.level = settings.game.prox.startingLevel
      lastLevel = parseInt(settings.game.prox.startingLevel)
      game.prefixes.level = "MACH "
      game.smallStats.level = true
      game.resize()
      updateFallSpeed(game)
      game.updateStats()
    },
  },
  deluxe: {
    update: (arg) => {
      collapse(arg)
      if (arg.piece.inAre) {
        handheldDasAre(arg, framesToMs(9), framesToMs(3))
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        shiftingRetro(arg, framesToMs(9), framesToMs(3))
      }
      deluxeGravity(arg)
      softDropRetro(arg, framesToMs(2))
      classicLockdown(arg)
      lockFlash(arg)
      updateLasts(arg)
	  const game = gameHandler.game
	  if (game.stat.score >= 999999) {
		  game.stat.score = 999999
	  }
    },
    onPieceSpawn: (game) => {
      // game.stat.level = Math.floor(game.stat.line / 10);
      game.stat.level = Math.max(
        settings.game.deluxe.startingLevel,
        Math.floor(game.stat.line / 10)
      )
      const SPEED_TABLE = [
        53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4,
        3,
      ]
      let levelAdd = 0
      if (game.appends.level === "♥") {
        levelAdd = 10
      }
      game.piece.gravity = framesToMs(
        SPEED_TABLE[Math.min(20, game.stat.level + levelAdd)]
      )
      levelUpdate(game)
    },
    onInit: (game) => {
	  game.hideGrid = true
      game.stack.updateGrid()
      // game.stat.level = 0;
      // game.appends.level = '♥';
      // lastLevel = 0;
      game.stat.level = settings.game.deluxe.startingLevel
      lastLevel = parseInt(settings.game.deluxe.startingLevel)
      if (settings.settings.skin !== "auto") {
        game.makeSprite(
          [
            "i1",
            "i2",
            "i3",
            "i4",
            "i5",
            "i6",
            "l",
            "o",
            "z",
            "t",
            "j",
            "s",
            "white",
            "black",
          ],
          ["mino", "stack"],
          "deluxe-special"
        )
        game.colors = PIECE_COLORS.handheldSpecial
        game.piece.useSpecialI = true
      } else {
        game.makeSprite(
          [
            "i1",
            "i2",
            "i3",
            "i4",
            "i5",
            "i6",
            "l",
            "o",
            "z",
            "t",
            "j",
            "s",
            "white",
            "black",
          ],
          ["mino", "stack"],
          "deluxe-special"
        )
        game.colors = PIECE_COLORS.handheldSpecial
      }
    },
  },
  handheld: {
    update: (arg) => {
      collapse(arg)
      if (arg.piece.inAre) {
		if (input.getGameDown("specialKey")) {
			handheldDasAre(arg, framesToMs(9), framesToMs(3))
		} else {
			handheldDasAre(arg, framesToMs(23), 150)
	    }
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
		if (input.getGameDown("specialKey")) {
			shiftingRetro(arg, framesToMs(9), framesToMs(3))
		} else {
			shiftingRetro(arg, framesToMs(23), 150)
	    }
      }
      classicGravity(arg)
      softDropRetro(arg, 50)
      retroLockdown(arg)
      lockFlash(arg)
      updateLasts(arg)
	  const game = gameHandler.game
	  if (game.stat.score >= 999999) {
		  game.stat.score = 999999
	  }
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.max(
        settings.game.handheld.startingLevel,
        Math.floor(game.stat.line / 10)
      )
      const SPEED_TABLE = [
        53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4,
        3,
      ]
      let levelAdd = 0
      if (game.appends.level === "♥") {
        levelAdd = 10
      }
      game.piece.gravity = framesToMs(
        SPEED_TABLE[Math.min(20, game.stat.level + levelAdd)]
      )
      levelUpdate(game)
    },
    onInit: (game) => {
	  game.hideGrid = true
      game.stack.updateGrid()
      game.stat.level = settings.game.handheld.startingLevel
      lastLevel = parseInt(settings.game.handheld.startingLevel)
      if (input.holdingShift) {
        sound.add("levelup")
        game.appends.level = "♥"
      }
      if (settings.settings.skin !== "auto") {
        game.makeSprite(
          [
            "i1",
            "i2",
            "i3",
            "i4",
            "i5",
            "i6",
            "l",
            "o",
            "z",
            "t",
            "j",
            "s",
            "white",
            "black",
          ],
          ["mino"],
          "handheld-special"
        )
        game.colors = PIECE_COLORS.handheldSpecial
        game.updateStats()
        game.piece.useSpecialI = true
      } else {
        game.makeSprite(
          [
            "i1",
            "i2",
            "i3",
            "i4",
            "i5",
            "i6",
            "l",
            "o",
            "z",
            "t",
            "j",
            "s",
            "white",
            "black",
          ],
          ["mino"],
          "handheld-special"
        )
        game.colors = PIECE_COLORS.handheldSpecial
        game.updateStats()
      }
    },
  },
  retro: {
    update: (arg) => {
      collapse(arg)
      if (arg.stack.levelUpAnimation < arg.stack.levelUpAnimationLimit) {
        arg.stack.makeAllDirty()
        arg.stack.isDirty = true
        arg.stack.levelUpAnimation += arg.ms
      }
      if (settings.game.retro.mechanics === "accurate") {
        if (arg.piece.inAre) {
		  if (input.getGameDown("specialKey")) {
			  handheldDasAre(arg, framesToMs(9), framesToMs(3))
		  } else {
			  nesDasAre(arg)
	      }
          arg.piece.are += arg.ms
        } else {
          respawnPiece(arg)
		  if (input.getGameDown("specialKey")) {
			  shiftingRetro(arg, framesToMs(9), framesToMs(3))
		  } else {
			  shiftingNes(arg)
	      }
          rotate(arg)
          classicGravity(arg)
          softDropNes(arg)
		  retroLockdown(arg, true)
        }
      } else {
        if (arg.piece.inAre) {
          initialDas(arg)
          initialRotation(arg)
          arg.piece.are += arg.ms
        } else {
          respawnPiece(arg)
          rotate(arg)
          rotate180(arg)
          shifting(arg)
        }
        classicGravity(arg)
        softDropNes(arg, false)
        hardDrop(arg)
		classicLockdown(arg)
      }
      if (!arg.piece.inAre) {
        arg.piece.holdingTime += arg.ms
      }
      lockFlash(arg)
      updateLasts(arg)
	  const game = gameHandler.game
	  if (game.stat.score >= 999999) {
		  game.stat.score = 999999
	  }
    },
    onPieceSpawn: (game) => {
      const startLevel = settings.game.retro.startingLevel
      const startingLines = Math.min(
        Math.max(100, startLevel * 10 - 50),
        startLevel * 10 + 10
      )
      game.stat.level = Math.floor(
        Math.max(
          (game.stat.line + 10 - startingLines + startLevel * 10) / 10,
          startLevel
        )
      )
      const SPEED_TABLE = [
        48, 43, 38, 33, 28, 23, 18, 13, 8, 5, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 1,
      ]
      game.piece.gravity = framesToMs(
        SPEED_TABLE[Math.min(29, game.stat.level)]
      )
      if (game.next.queue[0] === "I") {
        lastSeenI = 0
      } else {
        lastSeenI++
      }
      levelUpdate(game)
    },
    onInit: (game) => {
      if (settings.game.retro.mechanics === "accurate") {
        game.hideGrid = true
        game.stack.updateGrid()
      }
      lastSeenI = 0
      game.piece.holdingTimeLimit = 1600
      game.stat.level = settings.game.retro.startingLevel
      game.redrawOnLevelUp = true
      lastLevel = parseInt(settings.game.retro.startingLevel)
      if (settings.settings.skin !== "auto") {
        game.makeSprite(
          [
            "x-0",
            "l-0",
            "r-0",
            "x-1",
            "l-1",
            "r-1",
            "x-2",
            "l-2",
            "r-2",
            "x-3",
            "l-3",
            "r-3",
            "x-4",
            "l-4",
            "r-4",
            "x-5",
            "l-5",
            "r-5",
            "x-6",
            "l-6",
            "r-6",
            "x-7",
            "l-7",
            "r-7",
            "x-8",
            "l-8",
            "r-8",
            "x-9",
            "l-9",
            "r-9",
          ],
          ["mino"],
          "retro-special"
        )
        game.piece.useRetroColors = true
        game.colors = PIECE_COLORS.retroSpecial
      } else {
        game.makeSprite(
          [
            "x-0",
            "l-0",
            "r-0",
            "x-1",
            "l-1",
            "r-1",
            "x-2",
            "l-2",
            "r-2",
            "x-3",
            "l-3",
            "r-3",
            "x-4",
            "l-4",
            "r-4",
            "x-5",
            "l-5",
            "r-5",
            "x-6",
            "l-6",
            "r-6",
            "x-7",
            "l-7",
            "r-7",
            "x-8",
            "l-8",
            "r-8",
            "x-9",
            "l-9",
            "r-9",
          ],
          ["mino"],
          "retro-special"
        )
        game.piece.useRetroColors = true
        game.colors = PIECE_COLORS.retroSpecial
      }
      game.stack.levelUpAnimation = 1000
      game.stack.levelUpAnimationLimit = 450
      game.updateStats()
      game.piece.lockDownType = null
      game.drawLockdown()
    },
  },
  sega: {
    update: (arg) => {
	  const game = gameHandler.game
	  updateSegaBg(game)
	  levelTimer += arg.ms
      collapse(arg)
      if (arg.piece.inAre) {
        initialDas(arg)
        arg.piece.are += arg.ms
      } else {
        respawnPiece(arg)
        rotate(arg)
        shifting(arg)
      }
      gravity(arg)
      firmDrop(arg)
      classicLockdown(arg)
      lockFlash(arg)
      updateLasts(arg)
	  if (game.stat.score >= 999999) {
		  game.stat.score = 999999
	  }
    },
    onPieceSpawn: (game) => {
      //game.stat.level = Math.floor(game.stat.line / 8)
	  if (game.stat.level < 1) {
		  levelTimerLimit = 58000
	  } else if (game.stat.level >= 1 && game.stat.level < 9) {
		  levelTimerLimit = 38670
	  } else if (game.stat.level >= 9 && game.stat.level < 11) {
		  levelTimerLimit = 58000
	  } else if (game.stat.level >= 11 && game.stat.level <15) {
		  levelTimerLimit = 29000
	  } else {
		  levelTimerLimit = 58000
	  }
	  if (Math.floor(game.stat.line / 4) > game.stat.level) {
		  levelTimer = 0
		  game.stat.level += 1
	  } else if (levelTimer >= levelTimerLimit && game.stat.piece > lastPieces) {
		  levelTimer = 0
		  game.stat.level += 1
	  }
	  lastPieces = game.stat.piece
      const x = game.stat.level
      const gravityEquation = (0.8 - (x - 1) * 0.007) ** (x - 1)
	  let gravityMultiplier = 500
	  const difficulty = parseInt(settings.game.sega.difficulty)
	  switch (difficulty) {
		  case 1: {
			  gravityMultiplier = 600
			  break
		  }
		  case 2: {
			  gravityMultiplier = 500
			  break
		  }
		  case 3: {
			  gravityMultiplier = 400
			  break
		  }
		  case 4: {
			  gravityMultiplier = 300
			  break
		  }
	  }
      game.piece.gravity = Math.max(gravityEquation * gravityMultiplier, framesToMs(1))
      game.piece.lockDelayLimit = 500
      updateFallSpeed(game)
	  game.piece.ghostIsVisible = false
	  levelUpdateSega(game)
    },
    onInit: (game) => {
	  game.hideGrid = true
	  game.stack.updateGrid()
      game.lineGoal = null
	  game.makeSprite(
		[
			"red",
			"orange",
			"yellow",
			"green",
			"lightBlue",
			"blue",
			"purple",
			"white",
			"black",
		],
		["mino", "stack"],
		"sega"
	  )
      //game.colors = PIECE_COLORS.sega;
	  if (game.settings.rotationSystem === "handheld") {
		  game.colors = PIECE_COLORS.handheldNoSkin
	  }
	  if (game.settings.rotationSystem === "deluxe") {
		  game.colors = PIECE_COLORS.deluxeNoSkin
	  }
	  if (game.settings.rotationSystem === "retro") {
		  game.colors = PIECE_COLORS.retro
	  }
      game.stat.level = 0
      lastLevel = 0
	  levelTimer = 0
	  levelTimerLimit = 58000
	  lastPieces = 0
      game.piece.gravity = 500
      updateFallSpeed(game)
      game.updateStats()
    },
  },
}
