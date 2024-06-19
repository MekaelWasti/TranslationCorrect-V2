import os
import pdb
import torch
import numpy as np
import random
import pickle
from ast import literal_eval

def setup_seed(seed):
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    np.random.seed(seed)
    random.seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
setup_seed(2023)

from comet import download_model, load_from_checkpoint

model_path = download_model("Unbabel/wmt22-comet-da", '/data/cache/')

model = load_from_checkpoint(model_path)

with open('/data/noun/comet/comet_compare.pkl', 'rb') as f:
    comet_score = pickle.load(f)

src = []
with open('/data/noun/test_en') as f:
    for line in f:
        src.append(line[:-1])

ref = []
with open('/data/noun/test_zh') as f:
    for line in f:
        ref.append(line[:-1].replace(' ', ''))

mt = []
with open('/data/examples/noun/google') as f:
    for line in f:
        mt.append(line[:-1].replace(' ', ''))


data = []
for i, text in enumerate(src):
    if comet_score[i] <= 0.05:
        data.append({"src": src[i],
            "mt": mt[i],
            "ref": ref[i]
                     })

model_output = model.predict(data, batch_size=64, gpus=1)

wmt_src = []
with open('/data/examples/wmt2122/test_en') as f:
    for line in f:
        wmt_src.append(line[:-1])

src = []
with open('/data/noun/old_en') as f:
    for line in f:
        src.append(line[:-1])

ref = []
with open('/data/noun/old_zh') as f:
    for line in f:
        ref.append(line[:-1].replace(' ', ''))

mt = []
with open('/data/wmt2122/google') as f:
    for line in f:
        mt.append(line[:-1].replace(' ', ''))


data = []
for i, text in enumerate(src):
    if comet_score[i] <= 0.05:
        old_index = wmt_src.index(text)
        data.append({"src": src[i],
            "mt": mt[old_index],
            "ref": ref[i]
                     })

model_output1 = model.predict(data, batch_size=64, gpus=1)
comet_difference = []
comet_raw = []
for i, score in enumerate(model_output[0]):
    comet_difference.append(abs(model_output1[0][i]-score))

for score in model_output1[0]:
    comet_raw.append(score)

## calculate pass rate
count = 0
for i, score in enumerate(comet_difference):
    if (score <= 0.05) and (comet_raw[i] >= 0.5):
        count += 1


print('Pass Rate:', count/len(comet_difference))