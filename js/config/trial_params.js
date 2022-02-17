const coa = 800;
const ctoa = 400;
const target_duration = 80;

const cue_type = ['left', 'right'];
const target_loc = ['left', 'right'];

const target_cond = (Math.random() >= 0.5) ? ['A', 'V'] : ['V', 'A'];
const stims = {
    'A': ['A', 'A', 'A', 'A', 'V'],
    'V': ['V', 'V', 'V', 'V', 'A']
}

const factorial_reps  = 10;

const target_keys = (Math.random() >= 0.5) ? ['m', 'z'] : ['z', 'm'];
const init_key = 'k'
