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

model_path = download_model("Unbabel/wmt20-comet-qe-da", 'data/cache')

model = load_from_checkpoint(model_path)


src = []
with open('data/noun/test_en') as f:
    for line in f:
        src.append(line[:-1])

mt = []
with open('data/noun/test_zh') as f:
    for line in f:
        mt.append(line[:-1].replace(' ', ''))

data = []
for i, text in enumerate(src):
    data.append({"src": src[i], "mt": mt[i]})

model_output = model.predict(data, batch_size=64, gpus=1)

src = []
with open('data/noun/ref_en') as f:
    for line in f:
        src.append(line[:-1])

mt = []
with open('data/noun/ref_zh') as f:
    for line in f:
        mt.append(line[:-1].replace(' ', ''))

data = []
for i, text in enumerate(src):
    data.append({"src": src[i], "mt": mt[i]})

model_output1 = model.predict(data, batch_size=64, gpus=1)
comet_difference = []

## Calculate the differences between the COMET scores
for i, score in enumerate(model_output[0]):
    comet_difference.append(abs(model_output1[0][i]-score))

with open('/data/noun/comet/comet_compare.pkl', 'wb') as f:
    pickle.dump(comet_difference, f)
