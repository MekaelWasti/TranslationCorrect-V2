import pdb
import re
import numpy as np
import pickle
from ast import literal_eval
from tqdm import tqdm

old_zh = []
with open('data/noun/old_zh') as f:
    for line in f:
        old_zh.append(line[:-1].replace(' ', ''))
test_zh = []
with open('data/noun/test_zh') as f:
    for line in f:
        test_zh.append(line[:-1].replace(' ', ''))
old_en = []
with open('data/noun/old_en') as f:
    for line in f:
        old_en.append(line[:-1])
test_en = []
with open('data/noun/test_en') as f:
    for line in f:
        test_en.append(line[:-1])

with open('/home/dycpu4/junjie/projects/nmt-test/data_usage/chatgpt/noun/1k/final/comet/comet_compare.pkl', 'rb') as f:
    comet_score = pickle.load(f)


wmt_src = []
with open('/data/wmt2122/test_en') as f:
    for line in f:
        wmt_src.append(line[:-1])

src = []
with open('/data/noun/old_en') as f:
    for line in f:
        src.append(line[:-1])

ref = []
with open('/home/dycpu4/junjie/projects/nmt-test/data_usage/chatgpt/noun/1k/final/old_zh') as f:
    for line in f:
        ref.append(line[:-1].replace(' ', ''))

mt = []
with open('/home/dycpu4/junjie/projects/nmt-test/data_usage/wmt2122/trans') as f:
    for line in f:
        mt.append(line[:-1].replace(' ', ''))


old_data = []
for i, text in enumerate(src):
    if comet_score[i] <= 0.05:
        #if i in use_index:
        old_index = wmt_src.index(text)
        old_data.append({"src": src[i],
            "mt": mt[old_index],
            "ref": ref[i]
                     })
src = []
with open('/home/dycpu4/junjie/projects/nmt-test/data_usage/chatgpt/noun/1k/final/test_en') as f:
    for line in f:
        src.append(line[:-1])

ref = []
with open('/home/dycpu4/junjie/projects/nmt-test/data_usage/chatgpt/noun/1k/final/test_zh') as f:
    for line in f:
        ref.append(line[:-1].replace(' ', ''))

mt = []
with open('/home/dycpu4/junjie/projects/nmt-test/data_usage/chatgpt/noun/1k/final/trans') as f:
    for line in f:
        mt.append(line[:-1].replace(' ', ''))


new_data = []
new_align = []
for i, text in enumerate(src):
    if comet_score[i] <= 0.05:
        #if i in use_index:
        new_align.append(train_align[i])
        new_data.append({"src": src[i],
            "mt": mt[i],
            "ref": ref[i],
            "align":train_align[i]
                     })

with open('/home/dycpu4/junjie/projects/nmt-test/data_usage/chatgpt/noun/1k/final/comet/trans.pkl', 'rb') as f:
    diff_score = pickle.load(f)
with open('/home/dycpu4/junjie/projects/nmt-test/data_usage/chatgpt/noun/1k/final/comet/trans_raw.pkl', 'rb') as f:
    raw_score = pickle.load(f)

count = 0
for i, score in enumerate(diff_score):
    if (score <= 0.05) and (raw_score[i] >= 0.8):
        count += 1

print(count / len(diff_score))

