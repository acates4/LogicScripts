// GUI Controls
var PluginParameters = [
  {name:"Global Default Velocity", defaultValue:70, minValue:0, maxValue:127, numberOfSteps:127, type:"lin"},
  // Kick Drum
  {name:"Kick", type:"menu", defaultValue:0, valueStrings:["On","Off"]},
  {name:"Kick Sounds", type:"menu", defaultValue:2, valueStrings:["Kick 1","Kick 2","Both"]},
  {name:"Kick Accent Intensity", defaultValue:10, minValue:0, maxValue:100, numberOfSteps:100, type:"lin"},
  {name:"Kick Pulses", defaultValue:6, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Kick Steps", defaultValue:8, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Kick Offset", defaultValue:0, minValue:0, maxValue:8, numberOfSteps:8, type:"lin"},
  {name:"Kick Multiplier", defaultValue:1, minValue:1, maxValue:10, numberOfSteps:9, type:"lin"},
    // Snare Drum
  {name:"Snare", type:"menu", defaultValue:0, valueStrings:["On","Off"]},
  {name:"Snare Sounds", type:"menu", defaultValue:2, valueStrings:["Snare 1","Snare 2","Both"]},
  {name:"Snare Accent Intensity", defaultValue:15, minValue:0, maxValue:100, numberOfSteps:100, type:"lin"},
  {name:"Snare Pulses", defaultValue:4, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Snare Steps", defaultValue:8, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Snare Offset", defaultValue:1, minValue:0, maxValue:8, numberOfSteps:8, type:"lin"},
  {name:"Snare Multiplier", defaultValue:1, minValue:1, maxValue:10, numberOfSteps:9, type:"lin"},
    // Hi-Hats
  {name:"Hi-Hats", type:"menu", defaultValue:0, valueStrings:["On","Off"]},
  {name:"Hi-Hats Sounds", type:"menu", defaultValue:1, valueStrings:["Hat Closed","Hat Alternate","Pedal"]},
  {name:"Hi-Hats Accent Intensity", defaultValue:25, minValue:0, maxValue:100, numberOfSteps:100, type:"lin"},
  {name:"Hi-Hats Pulses", defaultValue:11, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Hi-Hats Steps", defaultValue:16, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Hi-Hats Offset", defaultValue:0, minValue:0, maxValue:8, numberOfSteps:8, type:"lin"},
  {name:"Hi-Hats Multiplier", defaultValue:4, minValue:1, maxValue:10, numberOfSteps:9, type:"lin"},
];

// Global Variables
//====================================================================//
var NeedsTimingInfo = true;
var ResetParameterDefaults = true;
var default_velocity = 80;
//====================================================================//
// Kick Drum
var kick_pattern = [];
var kick_note = new NoteOn();
kick_note.pitch = 36;
kick_note.velocity = default_velocity;
var kick_beat_counter = 1;
var kick_beat_last = -1;
var kick_beat_offset;
var kick_pattern_index;
//====================================================================//
// Snare Drum
var snare_pattern = [];
var snare_note = new NoteOn();
snare_note.pitch = 38;
snare_note.velocity = default_velocity;
var snare_beat_counter = 1;
var snare_beat_last = -1;
var snare_beat_offset;
var snare_pattern_index;
//====================================================================//
// Hi-Hats
var hats_pattern = [];
var hats_note = new NoteOn();
hats_note.pitch = 42;
hats_note.velocity = default_velocity;
var hats_beat_counter = 1;
var hats_beat_last = -1;
var hats_beat_offset;
var hats_pattern_index;
//====================================================================//


function ParameterChanged() {
  kick_pattern = bresenhamEuclidean(GetParameter("Kick Pulses"), GetParameter("Kick Steps"));
  snare_pattern = bresenhamEuclidean(GetParameter("Snare Pulses"), GetParameter("Snare Steps"));
  hats_pattern = bresenhamEuclidean(GetParameter("Hi-Hats Pulses"), GetParameter("Hi-Hats Steps"));
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
  var kick_beat = Math.floor(info.blockStartBeat * GetParameter("Kick Multiplier")) / GetParameter("Kick Multiplier");
  var snare_beat = Math.floor(info.blockStartBeat * GetParameter("Snare Multiplier")) / GetParameter("Snare Multiplier");
  var hats_beat = Math.floor(info.blockStartBeat * GetParameter("Hi-Hats Multiplier")) / GetParameter("Hi-Hats Multiplier");
  
  //===================================================================================//
  // Kick Drum Processing
  if (info.playing && kick_beat != kick_beat_last) {

    // If the beat counter > pattern length, reset the counter.
	if (kick_beat_counter > kick_pattern.length) {
      kick_beat_counter = 1;
	}
	
	// Apply beat offset to counter
	kick_beat_offset = GetParameter("Kick Offset");
	
	// Get position in pattern
    kick_pattern_index = getPatternIndex(kick_pattern, kick_beat_counter, kick_beat_offset);
	
	// If the current step is 1, send note event.
    if (kick_pattern[kick_pattern_index] === 1 && GetParameter("Kick") === 0) {
      //accent(kick_note, kick_beat);
      playKick(pattern_index);
    }
    
    // Increment beat counter by 1.
    kick_beat_counter += 1;
  }

  //===================================================================================//
  // Snare Drum Processing
  if (info.playing && snare_beat != snare_beat_last) {

    // If the beat counter > pattern length, reset the counter.
	if (snare_beat_counter > snare_pattern.length) {
      snare_beat_counter = 1;
	}
	
	// Apply beat offset to counter
	snare_beat_offset = GetParameter("Snare Offset");
	
	// Get position in pattern
    snare_pattern_index = getPatternIndex(snare_pattern, snare_beat_counter, snare_beat_offset);
	
	// If the current step is 1, send note event.
    if (snare_pattern[snare_pattern_index] === 1 && GetParameter("Snare") === 0) {
      //accent(snare_note, snare_beat);
      playSnare(pattern_index);
    }
    
    // Increment beat counter by 1.
    snare_beat_counter += 1;
  }  
  //===================================================================================//
  // Hi-Hat Processing
  if (info.playing && hats_beat != hats_beat_last) {

    // If the beat counter > pattern length, reset the counter.
	if (hats_beat_counter > hats_pattern.length) {
      hats_beat_counter = 1;
	}
	
	// Apply beat offset to counter
	hats_beat_offset = GetParameter("Hi-Hats Offset");
	
	// Get position in pattern
    hats_pattern_index = getPatternIndex(hats_pattern, hats_beat_counter, hats_beat_offset);
	
	// If the current step is 1, send note event.
    if (hats_pattern[hats_pattern_index] === 1 && GetParameter("Hi-Hats") === 0) {
      //accent(hats_note, hats_beat);
      playHats(pattern_index);
    }
    
    // Increment beat counter by 1.
    hats_beat_counter += 1;
  }
  //===================================================================================//

  // When transport play is off, cutoff notes and reset counter.
  if (!info.playing) {
    MIDI.allNotesOff();
	kick_beat_counter = 1;
	snare_beat_counter = 1;
	hats_beat_counter = 1;
  }

  // Stash last beat value
  kick_beat_last = kick_beat;
  snare_beat_last = snare_beat;
  hats_beat_last = hats_beat;
  
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

function playSnare(pattern_index) {
  snare_sounds = GetParameter("Snare Sounds");
  snare_accent = GetParameter("Snare Accent Intensity");
  if (snare_sounds === 0) {
    snare_note.pitch = 40;
  } else if (snare_sounds == 1) {
    snare_note.pitch = 38;
  } else if (snare_sounds === 2) {
    if (pattern_index % 2 === 0) {
      snare_note.pitch = 38;
    } else {
      snare_note.pitch = 40;
    }
  }
  var default_velocity = GetParameter("Global Default Velocity");
  var snare_velocity_offset = Math.floor((default_velocity * (snare_accent / 100)) / 2);
  if (pattern_index % 3 === 0) {
    snare_note.velocity = Math.min(default_velocity + snare_velocity_offset, 127);
  } else {
    snare_note.velocity = Math.max(default_velocity - snare_velocity_offset, 0);
  }
  snare_note.send();
}


function playKick(pattern_index) {
  kick_sounds = GetParameter('Kick Sounds');
  kick_accent = GetParameter("Kick Accent Intensity");
  if (kick_sounds === 0) {
    kick_note.pitch = 36;
  } else if (kick_sounds === 1) {
    kick_note.pitch = 53;
  } else if (kick_sounds === 2) {
    if (pattern_index % 2 === 0) {
      kick_note.pitch = 36;
    } else {
      kick_note.pitch = 53;
    }
  }
  var default_velocity = GetParameter("Global Default Velocity");
  var kick_velocity_offset = Math.floor((default_velocity * (kick_accent / 100)) / 2);
  if (pattern_index % 3 === 0) {
    kick_note.velocity = Math.min(default_velocity + kick_velocity_offset, 127);
  } else {
    kick_note.velocity = Math.max(default_velocity - kick_velocity_offset, 0);
  }
  kick_note.send();
}


function playHats(pattern_index) {
  hats_sounds = GetParameter('Hi-Hats Sounds');
  hats_accent = GetParameter("Hi-Hats Accent Intensity");
  if (hats_sounds === 0) {
    hats_note.pitch = 42;
  } else if (hats_sounds === 2) {
    hats_note.pitch = 44;
  } else if (hats_sounds === 1) {
    if (pattern_index % 4 === 0) {
      hats_note.pitch = 46;
    } else {
      hats_note.pitch = 42;
    }
  }
  var default_velocity = GetParameter("Global Default Velocity");
  var hats_velocity_offset = Math.floor((default_velocity * (hats_accent / 100)) / 2);
  if (pattern_index % 3 === 0) {
    hats_note.velocity = Math.min(default_velocity + hats_velocity_offset, 127);
  } else {
    hats_note.velocity = Math.max(default_velocity - hats_velocity_offset, 0);
  }
  hats_note.send();
}
