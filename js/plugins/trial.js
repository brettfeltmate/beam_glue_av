jsPsych.plugins["trial"] = (function () {

    let plugin = {};

    plugin.info = {
        name: 'trial',
        parameters: {
            // Response properties
            init_key: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                default: null,
                description: "Specifies key to init trial. Currently unused due to jsPsych weirdness"
            },
            response_keys: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                array: true,
                default: null,
                description: "Valid responses to target. First is presumed to map to most likely target identity."
            },
            // Visual properties
            cue_type: {
                type: jsPsych.plugins.parameterType.STRING,
                default: null,
                description: "Cue image to be presented on trial (left, right)."
            },
            stim_loc: {
                type: jsPsych.plugins.parameterType.STRING,
                default: null,
                description: "Location in which letter is presented (left, right)."
            },
            stim_presented: {
                type: jsPsych.plugins.parameterType.STRING,
                default: null,
                description: "Letter to be presented (A, V)."
            },
            target_letter: {
                type: jsPsych.plugins.parameterType.STRING,
                default: null,
                description: "Target letter."
            },
            // Temporal properties
            coa: {
                type: jsPsych.plugins.parameterType.INT,
                default: null,
                description: "Onset time of cue, relative to trial onset. In ms."
            },
            ctoa: {
                type: jsPsych.plugins.parameterType.INT,
                default: null,
                description: "Onset time of target, relative to cue. In ms."
            },
            target_duration: {
                type: jsPsych.plugins.parameterType.INT,
                default: null,
                description: "Time after which target is removed, relative to target onset. In ms."
            }
        }
    };

    // Spawns document elements corresponding to stimuli
    // visual specifics are referenced by class names, and declared in beamglue.scss
    plugin.setup_display = function() {
        // organizes stimuli
        let layout = $('<div />').addClass('layout');

        // spawn stimuli
        let face = $('<div />')
            .addClass('face fixation')
            .attr('id', 'fixation');

        // note: initially fix obscures cue (z indexing), cue is presented by removing fixation
        let cue = $('<div />')
            .addClass(`face cue ${plugin.params.cue_type}`) // cue_type poor word for location
            .attr('id', 'cue');

        // note: target is technically always present, but font colour is same as background
        // target is made visible later on by changing colour
        let target = $('<div />')
            .addClass(`target ${plugin.params.target_loc}`)
            .attr('id', 'target')
            .text(`${plugin.params.target_type}`)

        // append stimuli to layout element
        $(layout).append([face, cue, target])

        return layout

    }

    // handles event changes by triggering changes to stimulus properties at specified times
    plugin.run_trial_sequence = function() {
        // storing timeouts as they are declared allows for terminating them later (if need be)
        plugin.timeouts = [];

        // present cue (by removing fix)
        plugin.timeouts.push(
            setTimeout(function() {
                $('#fixation').remove()
            }, plugin.params.coa)
        )

        // set target to visible (change font colour to white) and start listening for response
        plugin.timeouts.push(
            setTimeout(function() {
                $('#target').addClass('visible')

                plugin.key_listener = jsPsych.pluginAPI.getKeyboardResponse({
                    // upon valid response, log trial data
                    callback_function: plugin.log_trial_data,
                    valid_responses: plugin.params.response_keys,
                })

            }, plugin.params.coa + plugin.params.ctoa)
        )

        // remove target by reverting font colour
        plugin.timeouts.push(
            setTimeout(function() {
                $('#target').removeClass('visible')
            }, plugin.params.coa + plugin.params.ctoa + plugin.params.target_duration)
        )
    }

    // logs trial and response data, plays feedback tone when necessary
    plugin.log_trial_data = function(response) {
        // Ensure listeners & timeouts have been cleared
        jsPsych.pluginAPI.cancelAllKeyboardResponses();
        plugin.timeouts.forEach(timeout => clearTimeout(timeout))

        // get string rep of key pressed for later comparison
        let key = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key)
        let correct;

        // determine if correct response made
        if (plugin.params.stim_presented === plugin.params.target_letter) {
            correct = (key === plugin.params.response_keys[0]) ? 1 : 0
        } else {
            correct = (key === plugin.params.response_keys[1]) ? 1 : 0
        }

        // aggregate trial data & log
        let trial_data = {
            coa: plugin.params.coa,
            ctoa: plugin.params.ctoa,
            cue_type: plugin.params.cue_type,
            stim_loc: plugin.params.stim_loc,
            stim_presented: plugin.params.stim_presented,
            rt: response.rt,
            correct: correct,
        }
        data_repo.push(trial_data)

        // present feedback if necessary and end trial
        if (trial_data.correct === 0) {
            error_tone.play();
            setTimeout(function () {
                plugin.end_trial()
            }, 300)
        } else {
            plugin.end_trial()
        }


    }

    // clears display and ends trial
    plugin.end_trial = function() {
        // Also make sure to detach init listener
        $(document).off()

        jsPsych.finishTrial()
    }

    // calls setup functions and starts trial
    // Shouldn't be called trial as it doesn't handle everything, but jsPsych requires this.
    plugin.trial = function (display_element, trial) {
        // make sure nothing remains from last trial (superstitious move)
        $(display_element).empty();

        // annoying to pass trial params to every function, store as plugin property for global access
        plugin.params = trial;

        // Spawn layout and add to screen display
        let trial_display = plugin.setup_display();
        $(display_element).append(trial_display)

        // Add listener to page doc which executes trial on init_key
        $(document).on("keypress", function(e) {
            // Note: bad practice to hard code key value; but e.which() wants to return uppercase value, but jsPsych only seems to handle lowercase? odd.
            if (e.which === 107) {
                plugin.run_trial_sequence()
            }
        })
    }
    return plugin;
})();
