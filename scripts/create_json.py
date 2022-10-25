#!/usr/bin/env python

import os
import json
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default=None, help="")
    parser.add_argument("--save_path", type=str, default=None, help="")
    args = parser.parse_args()

    data = {}

    for recipe_id in os.listdir(args.data_dir): 

        recipe_dir = os.path.join(args.data_dir, recipe_id)
        title = open("{}/title.txt".format(recipe_dir)).readlines()[0].rstrip()

        ingredients = [
            line.rstrip()
            for line in open("{}/ingredients.tok".format(recipe_dir)).readlines()
        ]

        instructions = [
            line.rstrip()
            for line in open("{}/instructions.tok".format(recipe_dir)).readlines()
        ]

        frame_dir = os.path.abspath(os.path.join(recipe_dir, "frames"))

        num_frames = 0 
        while os.path.exists(os.path.join(frame_dir, "frame_{}.jpg".format(num_frames+1))):
            num_frames += 1

        data[recipe_id] = {
            "title": title,
            "recipe_id": recipe_id,
            "recipe_dir": recipe_dir,
            "frame_dir": frame_dir,
            "num_frames": num_frames,
            "instructions": instructions,
            "ingredients": ingredients,
        }

    with open(args.save_path, "w") as fw:
        json.dump(data, fw)


