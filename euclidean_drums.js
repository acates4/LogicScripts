// GUI Controls
var PluginParameters = [
  // Bass Drum
  {name:"Bass", type:"menu", defaultValue:0, valueStrings:["On","Off"]},
  {name:"Bass Pulses", defaultValue:6, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Bass Steps", defaultValue:8, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Bass Offset", defaultValue:0, minValue:0, maxValue:8, numberOfSteps:8, type:"lin"},
  {name:"Bass Multiplier", defaultValue:1, minValue:1, maxValue:10, numberOfSteps:9, type:"lin"},
  //{name:"Bass Accent", type:"menu", defaultValue:0, valueStrings:["None","On","Off"]},
    // Snare Drum
  {name:"Snare", type:"menu", defaultValue:0, valueStrings:["On","Off"]},
  {name:"Snare Pulses", defaultValue:4, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Snare Steps", defaultValue:8, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Snare Offset", defaultValue:1, minValue:0, maxValue:8, numberOfSteps:8, type:"lin"},
  {name:"Snare Multiplier", defaultValue:1, minValue:1, maxValue:10, numberOfSteps:9, type:"lin"},
  //{name:"Snare Accent", type:"menu", defaultValue:0, valueStrings:["None","On","Off"]},
    // Hi-Hats
  {name:"Hi-Hats", type:"menu", defaultValue:0, valueStrings:["On","Off"]},
  {name:"Hi-Hats Pulses", defaultValue:11, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Hi-Hats Steps", defaultValue:16, minValue:0, maxValue:32, numberOfSteps:32, type:"lin"},
  {name:"Hi-Hats Offset", defaultValue:0, minValue:0, maxValue:8, numberOfSteps:8, type:"lin"},
  {name:"Hi-Hats Multiplier", defaultValue:4, minValue:1, maxValue:10, numberOfSteps:9, type:"lin"},
  //{name:"Hi-Hats Accent", type:"menu", defaultValue:0, valueStrings:["None","On","Off"]},
];

// Global Variables
//====================================================================//
var NeedsTimingInfo = true;
var ResetParameterDefaults = true;
var default_velocity = 80;
//====================================================================//
// Bass Drum
var bass_pattern = [];
var bass_note = new NoteOn();
bass_note.pitch = 36;
bass_note.velocity = default_velocity;
var bass_beat_counter = 1;
var bass_beat_last = -1;
var bass_beat_offset;
var bass_pattern_index
//====================================================================//
// Snare Drum
var snare_pattern = [];
var snare_note = new NoteOn();
snare_note.pitch = 38;
snare_note.velocity = default_velocity;
var snare_beat_counter = 1;
var snare_beat_last = -1;
var snare_beat_offset;
var snare_pattern_index
//====================================================================//
// Hi-Hats
var hats_pattern = [];
var hats_note = new NoteOn();
hats_note.pitch = 42;
hats_note.velocity = default_velocity;
var hats_beat_counter = 1;
var hats_beat_last = -1;
var hats_beat_offset;
var hats_pattern_index
//====================================================================//


function ParameterChanged() {

  bass_pattern = bresenhamEuclidean(GetParameter("Bass Pulses"), GetParameter("Bass Steps"));
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
  var bass_beat = Math.floor(info.blockStartBeat * GetParameter("Bass Multiplier")) / GetParameter("Bass Multiplier");
  var snare_beat = Math.floor(info.blockStartBeat * GetParameter("Snare Multiplier")) / GetParameter("Snare Multiplier");
  var hats_beat = Math.floor(info.blockStartBeat * GetParameter("Hi-Hats Multiplier")) / GetParameter("Hi-Hats Multiplier");
  
  //===================================================================================//
  // Bass Drum Processing
  if (info.playing && bass_beat != bass_beat_last) {

    // If the beat counter > pattern length, reset the counter.
	if (bass_beat_counter > bass_pattern.length) {
      bass_beat_counter = 1;
	}
	
	// Apply beat offset to counter
	bass_beat_offset = GetParameter("Bass Offset")
	
	// Get position in pattern
    bass_pattern_index = getPatternIndex(bass_pattern, bass_beat_counter, bass_beat_offset);
	
	// If the current step is 1, send note event.
    if (bass_pattern[bass_pattern_index] === 1 && GetParameter("Bass") === 0) {
      //accent(bass_note, bass_beat);
      bass_note.send();
    }
    
    // Increment beat counter by 1.
    bass_beat_counter += 1;
  }

  //===================================================================================//
  // Snare Drum Processing
  if (info.playing && snare_beat != snare_beat_last) {

    // If the beat counter > pattern length, reset the counter.
	if (snare_beat_counter > snare_pattern.length) {
      snare_beat_counter = 1;
	}
	
	// Apply beat offset to counter
	snare_beat_offset = GetParameter("Snare Offset")
	
	// Get position in pattern
    snare_pattern_index = getPatternIndex(snare_pattern, snare_beat_counter, snare_beat_offset);
	
	// If the current step is 1, send note event.
    if (snare_pattern[snare_pattern_index] === 1 && GetParameter("Snare") === 0) {
      //accent(snare_note, snare_beat);
      snare_note.send();
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
	hats_beat_offset = GetParameter("Hi-Hats Offset")
	
	// Get position in pattern
    hats_pattern_index = getPatternIndex(hats_pattern, hats_beat_counter, hats_beat_offset);
	
	// If the current step is 1, send note event.
    if (hats_pattern[hats_pattern_index] === 1 && GetParameter("Hi-Hats") === 0) {
      //accent(hats_note, hats_beat);
      hats_note.send();
    }
    
    // Increment beat counter by 1.
    hats_beat_counter += 1;
  }
  //===================================================================================//

  // When transport play is off, cutoff notes and reset counter.
  if (!info.playing) {
    MIDI.allNotesOff();
	bass_beat_counter = 1;
	snare_beat_counter = 1;
	hats_beat_counter = 1;
  }

  // Stash last beat value
  bass_beat_last = bass_beat;
  snare_beat_last = snare_beat;
  hats_beat_last = hats_beat;
  
}


function getPatternIndex(pattern, beat_counter, beat_offset) {
	
	if (beat_counter + beat_offset > pattern.length) {
	  pattern_index = (beat_counter + beat_offset) - pattern.length
	} else {
	  pattern_index = beat_counter + beat_offset
	}
	// JS array indices begin with 0
	pattern_index -= 1;

	return pattern_index;
}

