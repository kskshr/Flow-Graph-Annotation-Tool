$(function(){
    var initialize_selected_frames = function() {
        var selected_frames = {};
        $(".Frame").each(function(){
            selected_frames[$(this).attr("id").split("-").slice(0,4).join("-")] = {"before": -1, "after": -1};
        });
        $("#results").val(JSON.stringify(selected_frames));
    }

    var restore_selected_frames = function(selected_frames) {
        for (var action_id in selected_frames) {
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

    var fg_linked_list = JSON.parse($("#flow_graph").val());
    load_and_show(fg_linked_list);
    $("#results").val(JSON.stringify(fg_linked_list));      

    var selected_frames = JSON.parse($("#selected_frames").val());
    if (Object.keys(selected_frames).length === 0) {
        initialize_selected_frames();
    } else {
        for (var action_id in selected_frames) {
            if (document.getElementById(action_id + "-1") === null) {
                delete selected_frames[action_id];
            }
        }

        $(".Frame").each(function(){
            action_id = $(this).attr("id").split("-").slice(0,4).join("-")
            if (!selected_frames.hasOwnProperty(action_id)) {
                selected_frames[action_id] = {"before": -1, "after": -1};
            }
        });

        restore_selected_frames(selected_frames);
        $("#results").val(JSON.stringify(selected_frames));
    }

    submit_parse($("#submit"));
});
