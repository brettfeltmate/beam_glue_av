let factor_trials = function(cond) {
    let trial_list = []
    for (let rep = 0; rep < factorial_reps; rep ++) {
        for (let i = 0; i < cue_type.length; i++) {
            for (let j = 0; j < stims[cond].length; j++) {
                for (let k = 0; k < stim_loc.length; k++) {
                    let this_trial = {
                        cue_type: cue_type[i],
                        stim_presented: stims[cond][j],
                        target_letter: cond,
                        stim_loc: stim_loc[k],
                        coa: coa,
                        ctoa: ctoa,
                        target_duration: target_duration
                    }
                    trial_list.push(this_trial)
                }
            }
        }
    }
    shuffle(trial_list)
    return trial_list

}