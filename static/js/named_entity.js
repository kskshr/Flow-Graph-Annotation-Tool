$(function(){
    var annotate_button = function(x){
        x.click(function(){
            var selection = window.getSelection();
            if(selection.getRangeAt) {
                var range = selection.getRangeAt(0);
                var newnode = document.createElement("button");
                newnode.setAttribute("class", $(this).attr("id"));
                range.surroundContents(newnode);
            }
        });
    }
    
    var submit_parse = function(x){
        x.click(function(){

            var max_step_num = $("#max_step_ingredient").text();
            var ingredients = []
            for(var i=0; i<max_step_num; i++) {
                var tagged_tokens = $("#ingredient_" + i).html();
                var tagged_tokens = $.parseHTML(tagged_tokens);
                var result = []
                for(j=0; j<tagged_tokens.length; j++) {
                    if(tagged_tokens[j].tagName == "BUTTON") {
                        var ne_tag = $(tagged_tokens[j]).attr("class");
                        var ne_text = $(tagged_tokens[j]).text().split(" ");
                        for(k=0; k<ne_text.length; k++) {
                            if (k == 0){
                                result.push(ne_text[k] + "/" + ne_tag + "-B")
                            } else {
                                result.push(ne_text[k] + "/" + ne_tag + "-I")
                            }
                        }
                    } else {
                        var space_removed_text = tagged_tokens[j].textContent.replace(/^\s*(.*?)\s*$/, "$1");
                        if(space_removed_text != ""){
                            var o_tokens = space_removed_text.split(" ");
                            for(k=0; k<o_tokens.length; k++) {
                                result.push(o_tokens[k] + "/O")
                            }
                        }
                    }
                }
                ingredients.push(result);
            }

            var max_step_num = $("#max_step_instruction").text();
            var instructions = []
            for(var i=0; i<max_step_num; i++) {
                var tagged_tokens = $("#instruction_" + i).html();
                var tagged_tokens = $.parseHTML(tagged_tokens);
                var result = []
                for(j=0; j<tagged_tokens.length; j++) {
                    if(tagged_tokens[j].tagName == "BUTTON") {
                        var ne_tag = $(tagged_tokens[j]).attr("class");
                        var ne_text = $(tagged_tokens[j]).text().split(" ");
                        for(k=0; k<ne_text.length; k++) {
                            if (k == 0){
                                result.push(ne_text[k] + "/" + ne_tag + "-B")
                            } else {
                                result.push(ne_text[k] + "/" + ne_tag + "-I")
                            }
                        }
                    } else {
                        var space_removed_text = tagged_tokens[j].textContent.replace(/^\s*(.*?)\s*$/, "$1");
                        if(space_removed_text != ""){
                            var o_tokens = space_removed_text.split(" ");
                            for(k=0; k<o_tokens.length; k++) {
                                result.push(o_tokens[k] + "/O")
                            }
                        }
                    }
                }
                instructions.push(result);
            }

            var results = [ingredients, instructions];

            $("#results").val(JSON.stringify(results));
        });
    }
    
    $(".jump").each(function(){
        $(this).on('click', function(){
            var start_time = $(this).attr("class").split("_")[1];
            var video_url = $("#yc_video").attr("src").split("?")[0];
            var jumped_url = video_url + "?start=" + start_time;
            $("#yc_video").attr("src", jumped_url);
        });
    });

    $("li").each(function(){
        $(this).html($(this).text());
    });

    $("body").on('click', '.Ac', function(){
        $(this).replaceWith($(this).text());
    });
    $("body").on('click', '.F', function(){
        $(this).replaceWith($(this).text());
    });
    $("body").on('click', '.T', function(){
        $(this).replaceWith($(this).text());
    });
    $("body").on('click', '.Sf', function(){
        $(this).replaceWith($(this).text());
    });
    $("body").on('click', '.St', function(){
        $(this).replaceWith($(this).text());
    });
    $("body").on('click', '.Af', function(){
        $(this).replaceWith($(this).text());
    });
    $("body").on('click', '.D', function(){
        $(this).replaceWith($(this).text());
    });
    $("body").on('click', '.Q', function(){
        $(this).replaceWith($(this).text());
    });

    annotate_button($("#Ac"));
    annotate_button($("#F"));
    annotate_button($("#T"));
    annotate_button($("#Sf"));
    annotate_button($("#St"));
    annotate_button($("#Af"));
    annotate_button($("#D"));
    annotate_button($("#Q"));
    submit_parse($("#submit"));
});
