// GUI Controls
var PluginParameters = [
  // Note 1
  {name:"Note 1 Pulses", defaultValue:6, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Note 1 Steps", defaultValue:8, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Note 1 Offset", defaultValue:0, minValue:0, maxValue:8, numberOfSteps:8, type:"lin"},
  {name:"Note 1 Multiplier", defaultValue:1, minValue:1, maxValue:10, numberOfSteps:9, type:"lin"},
    // Note 2
  {name:"Note 2 Pulses", defaultValue:4, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Note 2 Steps", defaultValue:8, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Note 2 Offset", defaultValue:1, minValue:0, maxValue:8, numberOfSteps:8, type:"lin"},
  {name:"Note 2 Multiplier", defaultValue:1, minValue:1, maxValue:10, numberOfSteps:9, type:"lin"},
    // Note 3
  {name:"Note 3 Pulses", defaultValue:11, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Note 3 Steps", defaultValue:16, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Note 3 Offset", defaultValue:0, minValue:0, maxValue:8, numberOfSteps:8, type:"lin"},
  {name:"Note 3 Multiplier", defaultValue:4, minValue:1, maxValue:10, numberOfSteps:9, type:"lin"},
];

// Global Variables
//====================================================================//
var NeedsTimingInfo = true;
var ResetParameterDefaults = true;
var active_notes = [];
//====================================================================//
// Note 1
var note1_pattern = [];
var note1_beat_counter = 1;
var note1_beat_last = -1;
var note1_beat_offset;
var note1_pattern_index;
//====================================================================//
// Note 2
var note2_pattern = [];
var note2_beat_counter = 1;
var note2_beat_last = -1;
var note2_beat_offset;
var note2_pattern_index;
//====================================================================//
// Note 3
var note3_pattern = [];
var note3_beat_counter = 1;
var note3_beat_last = -1;
var note3_beat_offset;
var note3_pattern_index;
//====================================================================//

function ParameterChanged() {
  note1_pattern = bresenhamEuclidean(GetParameter("Note 1 Pulses"), GetParameter("Note 1 Steps"));
  note2_pattern = bresenhamEuclidean(GetParameter("Note 2 Pulses"), GetParameter("Note 2 Steps"));
  note3_pattern = bresenhamEuclidean(GetParameter("Note 3 Pulses"), GetParameter("Note 3 Steps"));
}

function HandleMIDI(event) {
	if (event instanceof NoteOn) {
		// add note to array
		active_notes.push(event);
	} 	
	else if (event instanceof NoteOff) {
	  // Send note off
	  event.send();
		// remove note from array
		for (i=0; i < active_notes.length; i++) {
			if (active_notes[i].pitch == event.pitch) {
				active_notes.splice(i, 1);
				break;
			}
		}
	}
	// pass non-note events through
	else event.send();
}

function bresenhamEuclidean(pulses, steps) {
  var previous = null;
  var pattern = [];

  for (var i = 0; i < steps; i++) {
    var x = Math.floor((pulses  / steps) * i);
    pattern.push(x === previous ? 0 : 1);
    previous = x;
  }
  return pattern;
}


function ProcessMIDI() {
  var info = GetTimingInfo();
  
  // Get beat 
  var note1_beat = Math.floor(info.blockStartBeat * GetParameter("Note 1 Multiplier")) / GetParameter("Note 1 Multiplier");
  var note2_beat = Math.floor(info.blockStartBeat * GetParameter("Note 2 Multiplier")) / GetParameter("Note 2 Multiplier");
  var note3_beat = Math.floor(info.blockStartBeat * GetParameter("Note 3 Multiplier")) / GetParameter("Note 3 Multiplier");
  
  //===================================================================================//
  if (info.playing) {
    if (note1_beat != note1_beat_last) {
      // If the beat counter > pattern length, reset the counter.
      if (note1_beat_counter > note1_pattern.length) {
          note1_beat_counter = 1;
      }
      // Apply beat offset to counter
      note1_beat_offset = GetParameter("Note 1 Offset");
      // Get position in pattern
      note1_pattern_index = getPatternIndex(note1_pattern, note1_beat_counter, note1_beat_offset);
      // If the current step is 1, send note event.
      if (note1_pattern[note1_pattern_index] === 1) {
        for (i = 0; i < active_notes.length; i=i+3) {
          active_notes[i].send();
        }
      }
      // Increment beat counter by 1.
      note1_beat_counter += 1;
    }
    //===================================================================================//
    if (note2_beat != note2_beat_last) {
      // If the beat counter > pattern length, reset the counter.
      if (note2_beat_counter > note2_pattern.length) {
          note2_beat_counter = 1;
      }
      // Apply beat offset to counter
      note2_beat_offset = GetParameter("Note 2 Offset");
      // Get position in pattern
      note2_pattern_index = getPatternIndex(note2_pattern, note2_beat_counter, note2_beat_offset);
      // If the current step is 1, send note event.
      if (note2_pattern[note2_pattern_index] === 1) {
        for (i = 1; i < active_notes.length; i=i+3) {
          active_notes[i].send();
        }
      }
      // Increment beat counter by 1.
      note2_beat_counter += 1;
    }
    //===================================================================================//
    if (note3_beat != note3_beat_last) {
      // If the beat counter > pattern length, reset the counter.
      if (note3_beat_counter > note3_pattern.length) {
          note3_beat_counter = 1;
      }
      // Apply beat offset to counter
      note3_beat_offset = GetParameter("Note 3 Offset");
      // Get position in pattern
      note3_pattern_index = getPatternIndex(note3_pattern, note3_beat_counter, note3_beat_offset);
      // If the current step is 1, send note event.
      if (note3_pattern[note3_pattern_index] === 1) {
        for (i = 2; i < active_notes.length; i=i+3) {
          active_notes[i].send();
        }
      }
      // Increment beat counter by 1.
      note3_beat_counter += 1;
    }
  } else {
    // When transport play is off, cutoff notes and reset counter.
    if (!info.playing) {
      MIDI.allNotesOff();
      note1_beat_counter = 1;
      note2_beat_counter = 1;
      note3_beat_counter = 1;
    }
  }
  
  // Stash last beat value
  note1_beat_last = note1_beat;
  note2_beat_last = note2_beat;
  note3_beat_last = note3_beat;

}


function getPatternIndex(pattern, beat_counter, beat_offset) {
  
  if (beat_counter + beat_offset > pattern.length) {
    pattern_index = (beat_counter + beat_offset) - pattern.length;
  } else {
    pattern_index = beat_counter + beat_offset;
  }
  // JS array indices begin with 0
  pattern_index -= 1;

  return pattern_index;
}
