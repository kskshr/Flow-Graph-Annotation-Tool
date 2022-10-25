$(function(){
    var initialize_selected_frames = function() {
        var selected_frames = {};
        var class_elements = document.getElementsByClassName("container");
        for (var i=0; i<class_elements.length; i++) {
            var action_id = class_elements[i].id.split("-").slice(1,5).join("-");
            if (!selected_frames.hasOwnProperty(action_id)) {
                selected_frames[action_id] = {"before": -1, "after": -1};
            }
        }
        $("#results").val(JSON.stringify(selected_frames));
    }

    var restore_selected_actions = function(selected_frames) {
        var recipe_id = $("#recipe_id").val();
        var num_frames = parseInt($("#num_frames").val());
        var action_nums = JSON.parse($("#action_nums").val());

        var word_ids = [];
        for (var action_id in selected_frames) {
            var word_id = action_id.split("-").slice(0,3).join("-");
            var sent_idx = action_id.split("-").slice(1,2);

            if (Number.isInteger(Number(sent_idx)) && !word_ids.includes(word_id)) {
                word_ids.push(word_id);
            }
        }

        for (var i_word_id = 0; i_word_id < word_ids.length; i_word_id++) {
            var word_id = word_ids[i_word_id];

            for (var i_action = 0; i_action < action_nums[word_id]; i_action++) {
                var embed_str = `<div class="container_action" id="container-${word_id}-${i_action}-block"> <div class="container" id="container-${word_id}-${i_action}">`;

                for (var i=1; i<num_frames+1; i++) {
                    embed_str += `<button id="${word_id}-${i_action}-${i}" type="button" class="Frame"> <img src="static/recipes/${recipe_id}/frames/frame_${i}.jpg" title="frame_${i}.jpg"> </button>`;
                    if (i / 10 == 0) {
                        setTimeout(() => {}, 50);
                    }
                }
                embed_str += `</div> <center> <button type="button" id="Before-${word_id}-${i_action}" class="btn btn-primary"><b>Before</b></button> <button type="button" id="After-${word_id}-${i_action}" class="btn btn-danger"><b>After</b></button> <hr style="height:30px"> </center> </div>`;

                document.getElementById("container-vertical-" + word_id).innerHTML += embed_str;
            }
        }

        $(".Frame").each(function(){
            annotate_frame($(this));
        });

        $("[id^=Before]").click(function() {
            annotate_frame($(this));
        });
        $("[id^=After]").click(function() {
            annotate_frame($(this));
        });

    }

    var restore_selected_frames = function(selected_frames) {
        for (var action_id in selected_frames) {

            var word_id = action_id.split("-").slice(0,2).join("-");

            if (selected_frames[action_id]["before"].length !== 0 &&
                selected_frames[action_id]["before"] !== -1) {
                document.getElementById(action_id + "-" + selected_frames[action_id]["before"]).classList.add("node_registered_before");
            }
            if (selected_frames[action_id]["after"].length !== 0 &&
                selected_frames[action_id]["after"] !== -1) {
                document.getElementById(action_id + "-" + selected_frames[action_id]["after"]).classList.add("node_registered_after");
            }
        }
    }

    var annotate_frame = function(x){
        x.click(function(){
            var frame_node = $(".node_selected");

            if ($(this).attr("class").slice(0,5) === "Frame") {
                $(".node_selected").removeClass("node_selected");
                $(this).toggleClass("node_selected");
            } else if (frame_node.length !== 0 && 
                        ($(this).attr("id").split("-")[0] === "Before" ||
                         $(this).attr("id").split("-")[0] === "After")) {

                var selected_frames = JSON.parse($("#results").val());
                var action_id = frame_node.attr("id").split("-").slice(0,4).join("-");
                var frame_id = frame_node.attr("id").split("-")[frame_node.attr("id").split("-").length - 1];

                if (!selected_frames.hasOwnProperty(action_id)) {
                    selected_frames[action_id] = {"before": -1, "after": -1};
                }

                if ($(this).attr("id").split("-")[0] === "Before") {

                    if (selected_frames[action_id]["before"] === parseInt(frame_id)) {
                        document.getElementById(action_id + "-" + selected_frames[action_id]["before"]).classList.remove("node_registered_before");
                        selected_frames[action_id]["before"] = -1;
                    } else {
                        if (selected_frames[action_id]["before"] !== -1) {
                            document.getElementById(action_id + "-" + selected_frames[action_id]["before"]).classList.remove("node_registered_before");
                        }

                        selected_frames[action_id]["before"] = parseInt(frame_id);
                        document.getElementById(action_id + "-" + frame_id).classList.add("node_registered_before");
                    }
                } else if ($(this).attr("id").split("-")[0] === "After") {

                    if (selected_frames[action_id]["after"] === parseInt(frame_id)) {
                        document.getElementById(action_id + "-" + selected_frames[action_id]["after"]).classList.remove("node_registered_after");
                        selected_frames[action_id]["after"] = -1;
                    } else {
                        if (selected_frames[action_id]["after"] !== -1) {
                            document.getElementById(action_id + "-" + selected_frames[action_id]["after"]).classList.remove("node_registered_after");
                        }

                        selected_frames[action_id]["after"] = parseInt(frame_id);
                        document.getElementById(action_id + "-" + frame_id).classList.add("node_registered_after");
                    }
                }
                $(".node_selected").removeClass("node_selected");
                $("#results").val(JSON.stringify(selected_frames));
                $("#selected_frames").val(JSON.stringify(selected_frames));
            }
        });
    }

    var load_and_show = function(fg_linked_list) {
        $("svg").each(function() {
            $(this).remove();
        });

        for(var start_element in fg_linked_list) {

            var end_elements = [];
            var arc_labels = [];
            for (var i=0; i<fg_linked_list[start_element].length; i++) {
                end_elements.push(fg_linked_list[start_element][i][0]);
                arc_labels.push(fg_linked_list[start_element][i][1]);
            }

            for(var i=0; i<end_elements.length; i++) {
                var end_element = end_elements[i];
                var arc_label = arc_labels[i];
                
                var st_elem = $("#" + start_element)[0];
                var end_elem = $("#" + end_element)[0];
                
                var st_elem_ne_type = st_elem["id"].split("-")[1];
                var st_color = "";

                st_color = "black";

                var st_elem_step_num = st_elem["id"].split("-")[2];
                var end_elem_step_num = end_elem["id"].split("-")[2];

                if(end_elem_step_num > st_elem_step_num) {
                    var line = new LeaderLine(
                        LeaderLine.pointAnchor(st_elem, {
                            x: "50%", 
                            y: "100%"
                        }), 
                        LeaderLine.pointAnchor(end_elem, {
                            x: "50%", 
                            y: "0%"
                        }), 
                        {
                            color: st_color,
                            size: 2.25, 
                            startLabel: LeaderLine.pathLabel({text: arc_label, color: "red"})
                        }
                    );
                    line.setOptions({
                        startSocketGravity: [0, -0],
                        endSocketGravity: [-0, -0]
                    });
                } else {
                    var line = new LeaderLine(
                        LeaderLine.pointAnchor(st_elem, {
                            x: "50%", 
                            y: "0%"
                        }), 
                        LeaderLine.pointAnchor(end_elem, {
                            x: "50%", 
                            y: "0%"
                        }), 
                        {
                            color: st_color,
                            size: 2.25, 
                            startLabel: LeaderLine.pathLabel({text: arc_label, color: "red"})
                        }
                    );
                    line.setOptions({
                        startSocketGravity: [20, -20],
                        endSocketGravity: [-20, -20]
                    });
                }                  
            }
        }
    }

    var add_annotation = function(x) {
        x.unbind().click(function(){
            var action_nums = JSON.parse($("#action_nums").val());
            var selected_frames = JSON.parse($("#selected_frames").val());
            var word_id = $(this).attr("id").split("-").slice(2).join("-");

            if (!action_nums.hasOwnProperty(word_id)) {
                action_nums[word_id] = 0;
            }

            var recipe_id = $("#recipe_id").val();
            var num_frames = parseInt($("#num_frames").val());

            var embed_str = `<div class="container_action" id="container-${word_id}-${action_nums[word_id]}-block"> <div class="container" id="container-${word_id}-${action_nums[word_id]}">`;

            for (var i=1; i<num_frames+1; i++) {
                embed_str += `<button id="${word_id}-${action_nums[word_id]}-${i}" type="button" class="Frame"> <img src="static/recipes/${recipe_id}/frames/frame_${i}.jpg" title="frame_${i}.jpg"> </button>`;

                if (i / 10 == 0) {
                    setTimeout(() => {}, 50);
                }
            }
            embed_str += `</div> <center> <button type="button" id="Before-${word_id}-${action_nums[word_id]}" class="btn btn-primary"><b>Before</b></button> <button type="button" id="After-${word_id}-${action_nums[word_id]}" class="btn btn-danger"><b>After</b></button> </center> <hr style="height:30px"> </div>`;

            document.getElementById("container-vertical-" + word_id).innerHTML += embed_str;

            $(".Frame").each(function(){
                annotate_frame($(this));
            });

            $("[id^=Before]").click(function() {
                annotate_frame($(this));
            });
            $("[id^=After]").click(function() {
                annotate_frame($(this));
            });

            var action_id = `${word_id}-${action_nums[word_id]}`;
            selected_frames[action_id] = {"before": -1, "after": -1};
            $("#results").val(JSON.stringify(selected_frames));

            var sent_idx = parseInt(action_id.split("-")[1]);
            var word_idx = parseInt(action_id.split("-")[2]);

            var frame_id = -1;
            for (var action_id2 in selected_frames) {
                var sent_idx2 = parseInt(action_id2.split("-")[1]);
                var word_idx2 = parseInt(action_id2.split("-")[2]);

                if (sent_idx2 == sent_idx && word_idx2 == word_idx) {
                    var frame_id2 = selected_frames[action_id2]["before"];
                    frame_id2 = Math.max(frame_id2, selected_frames[action_id2]["after"]);

                    if (frame_id2 != -1) {
                        var pos = document.getElementById(action_id2 + "-" + frame_id2).offsetLeft;
                        pos = Math.max(pos-100, 0);
                        document.getElementById("container-" + action_id2).scrollLeft = pos;
                    }
                }

                if (sent_idx2 < sent_idx || (sent_idx2 == sent_idx && word_idx2 <= word_idx)) {
                    frame_id = Math.max(frame_id, selected_frames[action_id2]["before"]);
                    frame_id = Math.max(frame_id, selected_frames[action_id2]["after"]);
                }
            }

            if (frame_id != -1) {
                var pos = document.getElementById(action_id + "-" + frame_id).offsetLeft;
                pos = Math.max(pos-100, 0);
                document.getElementById("container-" + action_id).scrollLeft = pos;
            }

            action_nums[word_id] += 1;
            $("#action_nums").val(JSON.stringify(action_nums));
            $("#selected_frames").val(JSON.stringify(selected_frames));
        });
    }

    var remove_annotation = function(x) {
        //x.click(function(){
        x.unbind().click(function(){
            var action_nums = JSON.parse($("#action_nums").val());
            var selected_frames = JSON.parse($("#selected_frames").val());
            var word_id = $(this).attr("id").split("-").slice(2).join("-");

            action_nums[word_id] -= 1;
            if (action_nums[word_id] < 0) {
                action_nums[word_id] = 0;
            }

            var action_id = word_id + "-" + action_nums[word_id]

            $(`#container-${action_id}-block`).remove();
            if (selected_frames.hasOwnProperty(action_id)) {
                delete selected_frames[action_id];
            }

            $("#action_nums").val(JSON.stringify(action_nums));
            $("#selected_frames").val(JSON.stringify(selected_frames));
        });
    }

    var submit_parse = function(x){
        x.click(function(){});
    }

    $("li").each(function(){
        $(this).html($(this).text());
    });

    $(".Frame").each(function(){
        annotate_frame($(this));
    });

    $("[id^=Before]").click(function() {
        annotate_frame($(this));
    });
    $("[id^=After]").click(function() {
        annotate_frame($(this));
    });

    $("[id^=add-container]").click(function() {
        add_annotation($(this));
    });
    $("[id^=remove-container]").click(function() {
        remove_annotation($(this));
    });

    var fg_linked_list = JSON.parse($("#flow_graph").val());
    load_and_show(fg_linked_list);
    $("#results").val(JSON.stringify(fg_linked_list));      

    var selected_frames = JSON.parse($("#selected_frames").val());
    if (Object.keys(selected_frames).length === 0) {
        initialize_selected_frames();
    } else {
        restore_selected_actions(selected_frames);

        for (var action_id in selected_frames) {
            if (document.getElementById("container-" + action_id + "-block") === null) {
                delete selected_frames[action_id];
            }
        }

        restore_selected_frames(selected_frames);

        $("#selected_frames").val(JSON.stringify(selected_frames));
    }

    var selected_frames = JSON.parse($("#selected_frames").val());
    for (var action_id in selected_frames) {

        var frame_id = -1;

        if (selected_frames[action_id]["before"] != -1) {
            frame_id = selected_frames[action_id]["before"];
        } else if (selected_frames[action_id]["after"] != -1) {
            frame_id = selected_frames[action_id]["after"];
        }

        if (frame_id != -1) {
            var pos = document.getElementById(action_id + "-" + frame_id).offsetLeft;
            pos = Math.max(pos-250, 0);
            document.getElementById("container-" + action_id).scrollLeft = pos;
        }
    }
    $("#results").val(JSON.stringify(selected_frames));

    submit_parse($("#submit"));
});
