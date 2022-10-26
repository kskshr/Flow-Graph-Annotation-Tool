#!/usr/bin/env python

import os
import argparse
import json
import shutil
import sqlite3
import flask
from flask import Flask, render_template, request, send_file


parser = argparse.ArgumentParser()
parser.add_argument("--recipe_path", type=str, default="./data/recipes.json", help="")
parser.add_argument("--database_path", type=str, default="./data/annotation.db", help="")
parser.add_argument("--port", type=int, default=44444, help="")
parsed_args = parser.parse_args()

app = Flask(__name__)


def getAnnotations():
    connect = sqlite3.connect(parsed_args.database_path)
    cur = connect.cursor()
    res = cur.execute("select recipe_id,json_str from annotation")

    annotations = {
        x[0]: json.loads(x[1])
        for x in res.fetchall()
    }

    return annotations


def update(
    recipe_id: int,
    data,
):
    data_str = json.dumps(data)

    connect = sqlite3.connect(parsed_args.database_path)
    cur = connect.cursor()
    cur.execute("replace into annotation (recipe_id, json_str) values (?,?)", [recipe_id, data_str])
    connect.commit()


def generateHtml(
    tagged_sentences: list,
    annotation_type: str="ne", # ne or fg
    sentence_type: str="ingredient", # ingredient or instruction
):
    html_sentences = []
    sent_type = 0 if sentence_type == "ingredient" else 1

    for i_sent, tagged_sentence in enumerate(tagged_sentences):

        words = [ chunk.rsplit("/", 1)[0] for chunk in tagged_sentence ]
        tags  = [ chunk.rsplit("/", 1)[1] for chunk in tagged_sentence ]
        #tags = [t if "-" in t and t.split("-")[0] in NE_list else "O" for t in tags]
        tags = [t if "-" in t else "O" for t in tags]

        html_sentence = []

        for i_word, tag in enumerate(tags):

            if "-" in tag:
                ne, iob = tag.split("-")
            else:
                ne = tag # O tag
                iob = None

            if iob == "I":
                continue

            if ne != "O":
                j = i_word + 1
                while j < len(tagged_sentence) and \
                      tags[j].split("-")[0] == ne and \
                      tags[j].split("-")[1] == "I":

                    j += 1

                html_words = " ".join(words[i_word:j])

                if annotation_type == "ne":
                    html_substr = "<button type=\"button\" class={}>{}</button>".format(
                        ne, 
                        html_words,
                    )
                elif annotation_type == "fg":

                    _id = "-".join([str(sent_type), ne, str(i_sent), str(i_word)])

                    html_substr = "<button id={} type=\"button\" class={}>{}</button>".format(
                        _id,
                        ne,
                        html_words,
                    )

                    k = "{}-{:03d}-{:03d}".format(sent_type, i_sent, i_word)

                html_sentence += [html_substr]
            else:
                html_sentence += [words[i_word]]

        html_sentences += [" ".join(html_sentence)]

    return html_sentences


@app.route("/")
def index():
    recipes = json.load(open(parsed_args.recipe_path))
    annotations = getAnnotations()

    for recipe_id in recipes.keys():
        if recipe_id in annotations.keys():
            recipes[recipe_id]["num_done_steps"] = annotations[recipe_id]["num_done_steps"]
        else:
            recipes[recipe_id]["num_done_steps"] = 0

    recipes = [
        recipes[recipe_id]
        for recipe_id in recipes.keys()
    ]

    return render_template(
        "index.html", 
        recipes=recipes,
        num_recipes=len(recipes),
    )


@app.route("/named_entity.html")
def annotateNamedEntity():
    recipes = json.load(open(parsed_args.recipe_path))

    params = request.url
    recipe_id = params.split("?")[1].split("=")[-1]

    recipe = recipes[recipe_id]
    annotations = getAnnotations()

    if recipe_id in annotations.keys():
        annotation = annotations[recipe_id]
        ingredients = annotation["ingredients"]
        instructions = annotation["instructions"]
    else:
        annotation = {
            "ingredients": [],
            "instructions": [],
            "recipe_flows": {},
            "frame_annotations": {},
            "num_done_steps": 0,
        }
        update(recipe_id, annotation)

        ingredients = [
            chunk.split(" ") 
            for chunk in recipe["ingredients"]
        ]

        instructions = [
            chunk.split(" ") 
            for chunk in recipe["instructions"]
        ]

    if recipe_id in annotations.keys():
        ingredients = generateHtml(ingredients, "ne")
        instructions = generateHtml(instructions, "ne")
    else:
        ingredients = [" ".join(line) for line in ingredients]
        instructions = [" ".join(line) for line in instructions]

    return render_template(
        "named_entity.html", 
        recipe_id=recipe_id, 
        ingredients=ingredients, 
        instructions=instructions, 
        ingredient_len=len(ingredients),
        instruction_len=len(instructions),
    )


@app.route("/flow_graph.html", methods=["POST"])
def annotateFlowGraph():
    recipes = json.load(open(parsed_args.recipe_path))

    params = request.url
    recipe_id = params.split("?")[1].split("=")[-1]

    recipe = recipes[recipe_id]
    annotation = getAnnotations()[recipe_id]

    ingredients, instructions = json.loads(request.form.get("results"))
    ingredient_html = generateHtml(
        ingredients, 
        annotation_type="fg",
        sentence_type="ingredient",
    )
    instruction_html = generateHtml(
        instructions, 
        annotation_type="fg",
        sentence_type="instruction",
    )

    annotation["ingredients"] = ingredients
    annotation["instructions"] = instructions
    recipe_flows = annotation["recipe_flows"]
    
    if annotation["num_done_steps"] < 1:
        annotation["num_done_steps"] = 1
    update(recipe_id, annotation)
    
    # save NE annotation results
    for f in ("ingredient", "instruction"):
        path = os.path.join(recipe["recipe_dir"], "{}s.iob2".format(f))

        with open(path, "w") as fw:
            f_idx = 0 if f == "ingredient" else 1

            for sent_idx, chunks in enumerate(annotation["{}s".format(f)]):
                for word_idx, chunk in enumerate(chunks):
                    word, ne = chunk.rsplit("/", 1)

                    word_id = "{}-{}-{}".format(f_idx, sent_idx, word_idx)
                    fw.write("{} {} {}\n".format(word_id, word, ne))

    return render_template(
        "flow_graph.html", 
        recipe_id=recipe_id, 
        ingredients=ingredient_html,
        instructions=instruction_html,
        flow_graph=json.dumps(recipe_flows),
        ingredient_len=len(ingredients),
        instruction_len=len(instructions),
    )


@app.route("/frame.html", methods=["POST"])
def annotateFrames():
    recipes = json.load(open(parsed_args.recipe_path))

    params = request.url
    recipe_id = params.split("?")[1].split("=")[-1]

    recipe = recipes[recipe_id]
    annotation = getAnnotations()[recipe_id]

    ingredients = annotation["ingredients"]
    instructions = annotation["instructions"]

    annotation["recipe_flows"] = json.loads(request.form.get("results"))
    if annotation["num_done_steps"] < 2:
        annotation["num_done_steps"] = 2 
    update(recipe_id, annotation)

    # save FG annotation annotation
    path = os.path.join(recipe["recipe_dir"], "recipe_flows.txt")

    with open(path, "w") as fw:
        recipe_flows = annotation["recipe_flows"]

        for from_key in sorted(recipe_flows.keys()):
            from_word_id = "-".join([from_key.split("-")[0], *from_key.split("-")[2:]])

            for to_key, label in recipe_flows[from_key]:
                to_word_id = "-".join([to_key.split("-")[0], *to_key.split("-")[2:]])

                fw.write("{} {} {}\n".format(from_word_id, to_word_id, label))

    ingredient_html = generateHtml(
        ingredients, 
        annotation_type="fg",
        sentence_type="ingredient",
    )
    instruction_html = generateHtml(
        instructions, 
        annotation_type="fg",
        sentence_type="instruction",
    )

    recipe_flows = annotation["recipe_flows"]
    selected_frames = annotation["frame_annotations"] 

    action_list = []
    for sent_idx, chunks in enumerate(annotation["instructions"]):

        raw_words = [
            x.rsplit("/", 1)[0]
            for x in chunks
        ]

        for word_idx, chunk in enumerate(chunks):
            word, ne = chunk.rsplit("/", 1)

            if ne[:2] == "Ac":
                word_id = "1-{}-{}".format(sent_idx, word_idx)
                action_list += [[
                    word_id, 
                    "<font color='red'>{}</font>".format(word), 
                    " ".join(
                        raw_words[max(0, word_idx-10):word_idx] + 
                        ["<font color='red'>{}</font>".format(raw_words[word_idx])] + 
                        raw_words[word_idx+1:word_idx+10]
                    ),
                ]]

    selected_frames = annotation["frame_annotations"]
    action_nums = {}
    for action_id in selected_frames.keys():
        word_id = action_id.rsplit("-", 1)[0]

        if word_id in action_nums.keys():
            action_nums[word_id] += 1
        else:
            action_nums[word_id] = 1

    return render_template(
        "frame.html", 
        recipe_id=recipe_id, 
        action_list=action_list,
        ingredients=ingredient_html, 
        instructions=instruction_html, 
        flow_graph=json.dumps(recipe_flows),
        selected_frames=json.dumps(selected_frames),
        action_nums=json.dumps(action_nums),
        num_frames=recipe["num_frames"],
        ingredient_len=len(ingredients),
        instruction_len=len(instructions),
        action_list_len=len(action_list),
    )


@app.route("/save.html", methods=["POST"])
def save_annotation():
    recipes = json.load(open(parsed_args.recipe_path))

    params = request.url
    recipe_id = params.split("?")[1].split("=")[-1]
    recipe = recipes[recipe_id]

    annotation = getAnnotations()[recipe_id]

    annotation["frame_annotations"] = json.loads(request.form.get("results"))
    annotation["num_done_steps"] = 3
    annotation["done"] = True
    update(recipe_id, annotation)

    # save Frame annotation results
    path = os.path.join(recipe["recipe_dir"], "state_changes.txt")

    with open(path, "w") as fw:
        frame_annotations = annotation["frame_annotations"]
        for action_id in sorted(frame_annotations.keys()):
            fw.write("{} {} {}\n".format(
                action_id, 
                frame_annotations[action_id]["before"], 
                frame_annotations[action_id]["after"],
            ))

    annotated_frames = []
    for action_id in sorted(annotation["frame_annotations"].keys()):
        ann_frames = annotation["frame_annotations"][action_id]
        annotated_frames  += [[action_id.rsplit("-", 1)[0], ann_frames["before"], ann_frames["after"]]]

    return render_template(
        "save.html",
        recipe_id=recipe_id, 
        annotated_frames=annotated_frames,
        annotated_frame_len=len(annotated_frames),
    )


if __name__ == "__main__":
    if not os.path.exists(parsed_args.database_path):
        connect = sqlite3.connect(parsed_args.database_path)
        cur = connect.cursor()
        cur.execute("create table annotation (recipe_id text primary key, json_str text)")
        connect.commit()

    app.run(
        host="0.0.0.0", 
        port=parsed_args.port,
        threaded=True,
        debug=True,
    )


