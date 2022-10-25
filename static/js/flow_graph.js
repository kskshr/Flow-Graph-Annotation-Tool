$(function(){
    var initialize_fg_linked_list = function() {
        var fg_linked_list = {};
        $(".Ac").each(function(){
            fg_linked_list[$(this).attr("id")] = [];
        });
        $(".F").each(function(){
            fg_linked_list[$(this).attr("id")] = [];
        });
        $(".T").each(function(){
            fg_linked_list[$(this).attr("id")] = [];
        });  
        $(".Sf").each(function(){
            fg_linked_list[$(this).attr("id")] = [];
        });  
        $(".St").each(function(){
            fg_linked_list[$(this).attr("id")] = [];
        });  
        $(".Af").each(function(){
            fg_linked_list[$(this).attr("id")] = [];
        });
        $(".D").each(function(){
            fg_linked_list[$(this).attr("id")] = [];
        });
        $(".Q").each(function(){
            fg_linked_list[$(this).attr("id")] = [];
        });
        fg_linked_list["root"] = [];
        $("#results").val(JSON.stringify(fg_linked_list));      
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
                
                if (end_elem["id"] == "root") {
                    var st_elem_ne_type = st_elem["id"].split("-")[1];
                    var st_color = "";
                    st_color = "black";

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
    }

    var add_edge_property = function(x) {
        x.click(function(){
            var start_node = $(".node_start");
            var end_node = $(".node_end");

            var _edges = ["Targ", "Dest", "F-comp", "T-comp", "F-eq", "F-part-of", "F-set", "other-mod", "Agent", "V-tm", "T-eq", "A-eq"];
            var _nes = ["Ac", "F", "T", "Sf", "St", "Af", "D", "Q"];

            if (start_node.length == 0) {
                if (!_edges.includes($(this).attr("id")) &&
                    _nes.includes($(this).attr("id").split("-")[1])) {

                    $(this).toggleClass("node_start");
                }
            } else if (end_node.length == 0) {
                if ($(".node_start").attr("id") === $(this).attr("id")) {
                    $(this).toggleClass("node_end");
                    $(".node_start").toggleClass("node_start");
                    $(".node_end").toggleClass("node_end");
                    load_and_show(fg_linked_list);
                } else if (!_edges.includes($(this).attr("id")) && 
                    _nes.includes($(this).attr("id").split("-")[1])) {

                    $(this).toggleClass("node_end");
                }
            } else if (_edges.includes($(this).attr("id"))) {
                var start_element = $(".node_start")[0];
                var end_element = $(".node_end")[0];

                if (start_element != end_element) {
                    var arc_label = $(this).attr("id");
                    var fg_linked_list = JSON.parse($("#results").val());

                    var start_ne = $(".node_start").attr("id");
                    if (!fg_linked_list.hasOwnProperty(start_ne)) {
                        fg_linked_list[start_ne] = [];
                    }

                    var end_ne = $(".node_end").attr("id");
                    if (!fg_linked_list.hasOwnProperty(end_ne)) {
                        fg_linked_list[end_ne] = [];
                    }

                    fg_linked_list[start_ne].push([end_ne, arc_label]);
                    $("#results").val(JSON.stringify(fg_linked_list));

                    $(".node_start").toggleClass("node_start");
                    $(".node_end").toggleClass("node_end");

                    load_and_show(fg_linked_list);
                }
            }
        });

        x.dblclick(function() {
            var fg_linked_list = JSON.parse($("#results").val());
            var start_ne = $(this).attr("id");
            fg_linked_list[start_ne] = []; 
            $("#results").val(JSON.stringify(fg_linked_list));

            load_and_show(fg_linked_list);
        });
    }

    var is_rooted_dag = function(fg_linked_list) {
        for(var vertex in fg_linked_list) {
            if(fg_linked_list[vertex].length == 0 && vertex != "root") {
                alert(vertex + " is not connected to other nodes!");
                return false;
            }
        }

        var G = new jsnx.DiGraph();
        for(var vertex in fg_linked_list) {
            G.addNode(vertex);
        }
        for(var vertex in fg_linked_list) {
            for(var i=0; i<fg_linked_list[vertex].length; i++) {
                G.addEdge(vertex, fg_linked_list[vertex][i]);
            }
        }

        if(jsnx.isDirectedAcyclicGraph(G)) {
            return true;
        } else {
            alert("Cycle is detected!");
            return false;
        }

    }
    
    var submit_parse = function(x){
        x.click(function(){});
    }
    
    $(".jump").each(function(){
        $(this).on('click', function(){
            var start_time = $(this).attr("class").split("_")[1];
            var video_url = $("#yc_video").attr("src").split("?")[0];
            var jumped_url = video_url + "?start=" + start_time;
            $("#yc_video").attr("src", jumped_url);
        });
    });
    
    $(".named_entities").each(function(){
        $(this).html($(this).text());
    });
    
    
    $(".Ac").each(function(){
        add_edge_property($(this));
    });
    $(".F").each(function(){
        add_edge_property($(this));
    });
    $(".T").each(function(){
        add_edge_property($(this));
    });
    $(".Sf").each(function(){
        add_edge_property($(this));
    });
    $(".St").each(function(){
        add_edge_property($(this));
    });
    $(".Af").each(function(){
        add_edge_property($(this));
    });
    $(".D").each(function(){
        add_edge_property($(this));
    });
    $(".Q").each(function(){
        add_edge_property($(this));
    });

    /*
    $(".Targ").each(function(){
        add_edge_property($(this));
    });
    $(".Dest").each(function(){
        add_edge_property($(this));
    });
    $(".F-comp").each(function(){
        add_edge_property($(this));
    });
    $(".T-comp").each(function(){
        add_edge_property($(this));
    });
    $(".F-eq").each(function(){
        add_edge_property($(this));
    });
    $(".F-part-of").each(function(){
        add_edge_property($(this));
    });
    $(".other-mod").each(function(){
        add_edge_property($(this));
    });
    */

    $("#Agent").click(function() {
        add_edge_property($(this));
    });
    $("#Targ").click(function() {
        add_edge_property($(this));
    });
    $("#Dest").click(function() {
        add_edge_property($(this));
    });
    $("#F-comp").click(function() {
        add_edge_property($(this));
    });
    $("#T-comp").click(function() {
        add_edge_property($(this));
    });
    $("#F-eq").click(function() {
        add_edge_property($(this));
    });
    $("#T-eq").click(function() {
        add_edge_property($(this));
    });
    $("#F-part-of").click(function() {
        add_edge_property($(this));
    });
    $("#F-set").click(function() {
        add_edge_property($(this));
    });
    $("#A-eq").click(function() {
        add_edge_property($(this));
    });
    $("#V-tm").click(function() {
        add_edge_property($(this));
    });
    $("#other-mod").click(function() {
        add_edge_property($(this));
    });

    add_edge_property($("#root"));
    
    var fg_linked_list = JSON.parse($("#flow_graph").val());
    if (Object.keys(fg_linked_list).length === 0) {
        initialize_fg_linked_list();
    } else {
        for(var start_element in fg_linked_list) {
            if (document.getElementById(start_element) === null) {
                delete fg_linked_list[start_element];
            } else {
                for (var i=fg_linked_list[start_element].length-1; i >= 0;  i--) {
                    end_element = fg_linked_list[start_element][i][0];
                    if (document.getElementById(end_element) === null) {
                        fg_linked_list[start_element].splice(i, 1);
                    }
                }
                if (fg_linked_list[start_element].length === 0) {
                    delete fg_linked_list[start_element];
                }
            }
        }
        load_and_show(fg_linked_list);
        $("#results").val(JSON.stringify(fg_linked_list));      
    }
    submit_parse($("#submit_button"));
});
