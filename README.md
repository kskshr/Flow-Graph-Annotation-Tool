# Flow-Graph-Annotation-Tool
This repository provides the implementation for flow graph annotation used in [Visual Recipe Flow: A Dataset for Learning Visual State Changes of Objects with Recipe Flows](https://aclanthology.org/2022.coling-1.315).

## Usage
1. Download and preprocess sample recipes.
~~~
$ zsh ./scripts/download_samples.zsh
~~~

2. Run the application.
~~~
$ python app.py --recipe_path ./data/recipes.json --database_path ./data/annotation.db --port 44444
~~~

## Citation
```
@inproceedings{shirai-etal-2022-visual,
    title = "Visual Recipe Flow: A Dataset for Learning Visual State Changes of Objects with Recipe Flows",
    author = "Shirai, Keisuke  and
      Hashimoto, Atsushi  and
      Nishimura, Taichi  and
      Kameko, Hirotaka  and
      Kurita, Shuhei  and
      Ushiku, Yoshitaka  and
      Mori, Shinsuke",
    booktitle = "Proceedings of the 29th International Conference on Computational Linguistics",
    month = oct,
    year = "2022",
    address = "Gyeongju, Republic of Korea",
    publisher = "International Committee on Computational Linguistics",
    url = "https://aclanthology.org/2022.coling-1.315",
    pages = "3570--3577",
}
```

## License
MIT license


