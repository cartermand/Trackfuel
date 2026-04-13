// ── WORKOUT CIRCUITS ──────────────────────────────────────────────
const CIRCUITS = {
  sprints: {
    label: "Sprint Day", icon: "⚡", burn: 575, color: "#ff4d00",
    exercises: [
      { name: "Dynamic Warmup",          sets: "1", reps: "10 min",       note: "High knees, butt kicks, leg swings" },
      { name: "Sprint Drills (A/B skips)",sets: "3", reps: "30m each",    note: "Focus on arm drive" },
      { name: "Acceleration Sprints",    sets: "6", reps: "30m",          note: "90% effort, full recovery between" },
      { name: "Flying 40s",              sets: "4", reps: "40m",          note: "Max speed, rolling start" },
      { name: "Hill Sprints",            sets: "6", reps: "20m uphill",   note: "Drive knees, stay on toes" },
      { name: "Sled Push",               sets: "4", reps: "20m",          note: "Low position, explosive steps" },
      { name: "Core: Dead Bugs",         sets: "3", reps: "10 each side", note: "Keep lower back flat" },
      { name: "Cool Down Jog",           sets: "1", reps: "5 min",        note: "Easy pace + stretch" },
    ]
  },
  shotput: {
    label: "Shot Put Session", icon: "🏋️", burn: 350, color: "#ffcc00",
    exercises: [
      { name: "Shoulder Warmup",             sets: "1",  reps: "5 min",          note: "Arm circles, band pull-aparts" },
      { name: "Standing Puts",               sets: "8",  reps: "throws",          note: "Focus on hip rotation, snap wrist" },
      { name: "Glide Technique",             sets: "10", reps: "throws",          note: "Slow glide, feel the shift" },
      { name: "Full Glide Throws",           sets: "8",  reps: "throws",          note: "Max effort, record best" },
      { name: "Overhead Med Ball Slam",      sets: "4",  reps: "8 reps",          note: "Build explosive power" },
      { name: "Rotational Med Ball Throw",   sets: "4",  reps: "8 each side",     note: "Mirror shot put motion" },
      { name: "Push Press",                  sets: "4",  reps: "6 reps",          note: "Heavy — builds put power" },
      { name: "Shoulder Stretch",            sets: "1",  reps: "5 min",           note: "Across body, doorway stretch" },
    ]
  },
  lift: {
    label: "Lift Day", icon: "💪", burn: 420, color: "#00e676",
    exercises: [
      { name: "Warmup: Jump Rope",  sets: "1", reps: "5 min",          note: "Gets heart rate up" },
      { name: "Back Squat",         sets: "4", reps: "5 reps",         note: "Heavy — queen of all exercises" },
      { name: "Romanian Deadlift",  sets: "3", reps: "8 reps",         note: "Feel the hamstrings load" },
      { name: "Power Clean",        sets: "4", reps: "4 reps",         note: "Explosive — key for throws + sprints" },
      { name: "Bench Press",        sets: "4", reps: "6 reps",         note: "Upper body pushing strength" },
      { name: "Barbell Row",        sets: "3", reps: "8 reps",         note: "Keep back flat" },
      { name: "Jump Squats",        sets: "3", reps: "8 reps",         note: "Bodyweight, land soft" },
      { name: "Pallof Press",       sets: "3", reps: "10 each side",   note: "Anti-rotation core stability" },
    ]
  },
  circuit: {
    label: "Full Body Circuit", icon: "🔥", burn: 500, color: "#ff6b9d",
    exercises: [
      { name: "Box Jumps",               sets: "4", reps: "8 reps",   note: "Land soft, step down" },
      { name: "Push-Up Variations",      sets: "3", reps: "15 reps",  note: "Wide, close, or explosive" },
      { name: "Walking Lunges",          sets: "3", reps: "20 steps", note: "Add dumbbells when easy" },
      { name: "Pull-Ups / Band Assisted",sets: "3", reps: "8 reps",   note: "Full range of motion" },
      { name: "Broad Jumps",             sets: "4", reps: "6 reps",   note: "Max distance each jump" },
      { name: "Dips",                    sets: "3", reps: "10 reps",  note: "Tricep focus, slight lean forward" },
      { name: "Plank Hold",              sets: "3", reps: "45 sec",   note: "Squeeze everything tight" },
      { name: "Sprint Finisher",         sets: "4", reps: "100m",     note: "All out, 2 min rest between" },
    ]
  },
  activerest: {
    label: "Active Recovery", icon: "🚴", burn: 200, color: "#4db8ff",
    exercises: [
      { name: "Easy Bike or Walk",       sets: "1", reps: "20–30 min",      note: "Keep heart rate low, 50–60%" },
      { name: "Foam Roll: Quads",        sets: "1", reps: "60 sec each",    note: "Slow rolls, pause on tight spots" },
      { name: "Foam Roll: Hamstrings",   sets: "1", reps: "60 sec each",    note: "Include glutes" },
      { name: "Hip Flexor Stretch",      sets: "2", reps: "45 sec each side",note: "Lunge position, drive hips forward" },
      { name: "Figure-4 Glute Stretch",  sets: "2", reps: "45 sec each side",note: "On back or seated" },
      { name: "Calf Stretch",            sets: "2", reps: "30 sec each",    note: "Wall stretch, bent and straight knee" },
      { name: "Shoulder Mobility",       sets: "1", reps: "5 min",          note: "Circles, cross body, overhead" },
      { name: "Breathing / Meditation",  sets: "1", reps: "5 min",          note: "Box breathing — inhale 4, hold 4, out 4" },
    ]
  }
};

// ── WEEKLY SCHEDULE ────────────────────────────────────────────────
const SCHED = [
  { day: "Monday",    workout: "sprints" },
  { day: "Tuesday",   workout: "shotput" },
  { day: "Wednesday", workout: "lift" },
  { day: "Thursday",  workout: "shotput" },
  { day: "Friday",    workout: "circuit" },
  { day: "Saturday",  workout: "activerest" },
  { day: "Sunday",    workout: null }
];

// ── CONSTANTS ──────────────────────────────────────────────────────
const DAYS     = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULLDAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const GOAL_CAL = 2200;
const GOAL_PRO = 140;

const BLANK_WEEK = () => DAYS.map(d => ({
  day: d,
  workout: null,
  calories: "",
  protein: "",
  shotExtra: false
}));
