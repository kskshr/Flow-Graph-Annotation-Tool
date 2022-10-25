#!/bin/zsh

# download the html files of sample recipes
for f in https://www.kurashiru.com/recipes/418eaa1a-815c-4747-b1d5-835e49bb0f4b \
         https://www.kurashiru.com/recipes/73cdc3d0-fc12-4c67-9e1c-4eab5c985f42 \
         https://www.kurashiru.com/recipes/612d5572-d88b-4854-9ba8-dc72d22ddaea; do

    recipe_id=${f:t}
    d=./data/recipes/${recipe_id}
    mkdir -p ${d}

    wget ${f} -O ${d}/source.txt
    sleep 5s

    video_url=$(cat ${d}/source.txt | grep -Eo "https[^ ]*mp4" | head -n1)
    wget ${video_url} -O ${d}/video.mp4
    sleep 5s

    mkdir -p ${d}/frames
    python scripts/sample_frames.py ${d}
done

ln -s $(readlink -f ./data/recipes/*) ./static/recipes

# download a KyTea model
wget http://www.phontron.com/kytea/download/model/jp-0.4.7-1.mod.gz
gunzip jp-0.4.7-1.mod.gz

# extract and preprocess ingredient/instruction texts
python scripts/parser.py ./data/recipes

python scripts/create_json.py --data_dir ./data/recipes --save_path ./data/recipes.json


