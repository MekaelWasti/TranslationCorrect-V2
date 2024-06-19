import openai
import tiktoken
import pickle
from tqdm import tqdm
import random
import time
import torch
import numpy as np

def setup_seed(seed):
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    np.random.seed(seed)
    random.seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
setup_seed(2023)

def isChinese(word):
    for ch in word:
        if '\u4e00' <= ch <= '\u9fff':
            return True
    return False

new_generated_en = []

with open('path to test case') as f:
    for line in f:
        new_generated_en.append(line[:-1])

print(len(new_generated_en))


direct_ins = 'Translate the following English text to Chinese:'
direct_prompt_list = []

for i, text in enumerate(new_generated_en):
    use_prompt = direct_ins + ' ' + text
    direct_prompt_list.append(use_prompt)

result_path = 'data/'

openai.organization = "Your organization"
openai.api_key = 'Your API key'

def num_tokens_from_messages(messages, model="gpt-3.5-turbo-0301"):
    """Returns the number of tokens used by a list of messages."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    if model == "gpt-3.5-turbo-0301":  # note: future models may deviate from this
        num_tokens = 0
        for message in messages:
            num_tokens += 4  # every message follows <im_start>{role/name}\n{content}<im_end>\n
            for key, value in message.items():
                num_tokens += len(encoding.encode(value))
                if key == "name":  # if there's a name, the role is omitted
                    num_tokens += -1  # role is always required and always 1 token
        num_tokens += 2  # every reply is primed with <im_start>assistant
        return num_tokens
    else:
        raise NotImplementedError(f"""num_tokens_from_messages() is not presently implemented for model {model}.
      See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens.""")


error_list = []
response_list = []
for i, prompt in tqdm(enumerate(direct_prompt_list)):
    try:
        messages = [
            {"role": "system", "content": "You are a helpful assistant that translates English to Chinese."},
            {"role": "user", "content": prompt}]
        print(i, f"{num_tokens_from_messages(messages, 'gpt-3.5-turbo-0301')} prompt tokens counted.")

        # query the api
        start = time.time()
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
        )
        end = time.time()
        response_list.append(response)
        generated_response = response['choices'][0]['message']['content']

        with open(result_path + '/chat', 'a') as f_out:
            f_out.write(generated_response)
            f_out.write('\n')

    except:
        error_list.append(i)
        continue

with open(result_path + 'response_list.pkl', 'wb') as f:
    pickle.dump(response_list, f)
with open(result_path + 'error_list.pkl', 'wb') as f:
    pickle.dump(error_list, f)





