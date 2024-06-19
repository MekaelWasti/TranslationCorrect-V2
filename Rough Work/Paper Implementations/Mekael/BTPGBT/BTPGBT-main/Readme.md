# BTPGBT


This is the official release accompanying our Findings of EMNLP 2023 paper, [Towards General Error Diagnosis via Behavioral Testing in Machine Translation] (https://arxiv.org/abs/2310.13362), which includes all the corresponding codes and 
data.

If you find our work useful, please cite:
```
@misc{wu2023general,
      title={Towards General Error Diagnosis via Behavioral Testing in Machine Translation}, 
      author={Junjie Wu and Lemao Liu and Dit-Yan Yeung},
      year={2023},
      eprint={2310.13362},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```

## Data

The data used in our experiments includes all the translation pairs in the WMT21/22 En-Zh/Zh-En news translation task, which is saved in `data/test_en` (source sentences) and `data/test_zh` (target sentences).

## Data Preprocessing

The first step of BTPGBT is to find the positions in both the source and the target sentences that can be modified. To do so, you can simple run the following command
```
python extract_word_phrase_candidates.py
```
It will generate two files `test_words` and `test_phrases`, which refers to all the possible aligned positions that be can be edited to build behavioral testing cases, as we mentioned in section 3.1 of our paper.

**Using your own translation data**
If you want to use your own data to conduct behavioral testing with BTPGBT, make sure to split the source and target sentences into two files like the given `test_en` and `test_zh`, where one sentence takes one line. Also, you need to have an alignment file named `test.align` that incorporates target-source alignments for each translation pair. Such alignment results can be easily obtained by existing alignment tools, such as [Giza++](https://www.fjoch.com/GIZA++.html) or [fast_align](https://github.com/clab/fast_align).

## Generate behavioral testing cases with BTPG.
Then we can generate behavioral testing cases targeting different capabilities. To use BTPG, you need to first have an Open AI API Key. After that, you can run the following command to generate test cases targeting different capabilities.

For generating capabilities under the **POS** category, you can run the following command
```
python btpg_pos.py --capability CAPABILITY
```
where capability is one of `['NOUN', 'VERB', 'ADJ', 'ADV', 'ADP', 'Others] `.

For generating capabilities under the **NER** category, you can run the following command
```
python btpg_ner.py 
```

For generating capabilities under the **Tense** category, you can run the following command
```
python btpg_tense.py 
```

After running the above code, you can get the generated test cases and their corresponding pseudo-references in `generated_en` and `generated_zh`. **Make sure to examine the two files since very few outputs might not follow the expected output format due to the randomness in ChatGPT's generation process**. Also, you will get `response_list.pkl` and `error_list.pkl`, which contains the complete responses from ChatGPT and the index of erroneous responses from ChatGPT (due to the instability of ChatGPT's API).  

For reproducing our results, all the generated test cases and their corresponding pseudo-references used in our experiments are listed in `data/examples`.

## Generating translation outputs

After obtaining behavioral testing cases, we can use different MT systems to translate such test cases and calculate the corresponding test rates. For reproducing our results, all the outputs from MT systems used in our experiments are listed in `data/examples`. For commercial MT systems, we use their APIs/websites to get the translation results. 

For ChatGPT, you can run the following code to generate translation outputs on test cases:
```
python chatgpt_translation.py
```
You will also obtain `response_list.pkl` and `error_list.pkl`, similar as above.

## Conduct behavioral testing
To conduct behavioral testing on test cases, we need to do the following steps. Take the capability **NOUN** as an example:
1. Calculate the difference of the *wmt20-COMET-qe-da* scores on pseudo-references of the generated test cases and the corresponding original references (**section 3.3**). To do so, you can run the following command:```python compare_comet.py```.
2. Calculate the difference of the *wmt22-COMET-da* scores on the evaluated MT system's translations and the pseudo-references of test cases, then obtain the pass rate of the evaluated MT system. To do so, you can run the following command:```python system_compare_comet.py```.




