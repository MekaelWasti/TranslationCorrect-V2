import openai
import tiktoken
import pickle
from tqdm import tqdm
import nltk
import os
from ast import literal_eval
import random

import time
import copy
import math

def calculate_combination(length):
    total_combinations = 0

    for r in range(1, length+1):
        combinations = math.comb(length, r)
        total_combinations += combinations
    return total_combinations


def find_sub_list(sl,l):
    results=[]
    sl_length=len(sl)
    for ind in (i for i,e in enumerate(l) if e==sl[0]):
        if l[ind:ind+sl_length]==sl:
            results.append((ind,ind+sl_length))
    return results

## Load the data
en_text_ori = []
zh_text_ori = []
with open('data/test_en') as f:
    for line in f:
        en_text_ori.append(line[:-1])

with open('data/test_zh') as f:
    for line in f:
        zh_text_ori.append(line[:-1])


en_text = en_text_ori
zh_text = zh_text_ori

with open("data/test_words", "rb") as fp:
    final_align_words = pickle.load(fp)
with open("data/test_phrases", "rb") as fp:
    final_align_phrases = pickle.load(fp)
final_align_words = final_align_words
final_align_phrases = final_align_phrases

## Filter alignments
# Filter out phrases that are longer than 2, using the source side length
new_final_align_phrases = []
for alignment in final_align_phrases:
    new_final_align_phrase = []

    if len(alignment) == 0:
        new_final_align_phrases.append(new_final_align_phrase)
        continue

    for phrase in alignment:
        if len(phrase[2][0]) <= 2:
            new_final_align_phrase.append(phrase)
    new_final_align_phrases.append(new_final_align_phrase)

# during augmentation, sample from words and phrases simultaneously
final_align_all = []
for i, align in enumerate(new_final_align_phrases):
    alignment = []
    for ali in align:
        alignment.append(ali)
    for ali in final_align_words[i]:
        alignment.append(ali)
    final_align_all.append(alignment)

# pos filtering
old_replace_alignment_all = []
for i, text in tqdm(enumerate(en_text)):
    replace_alignment = []
    if len(final_align_all[i]) == 0:
        old_replace_alignment_all.append(replace_alignment)
        continue

    ## 剔除完成时
    if ('have' in text) or ('has' in text) or ('had' in text):
        old_replace_alignment_all.append(replace_alignment)
        continue

    # get the pos tags of words in the original sentence
    text_tags = nltk.pos_tag(text.split(), tagset='universal')

    # Add mask signals to the original text
    for k, align in enumerate(final_align_all[i]):
        # for word replacement, the source word should be limited in 'noun, adj, adv, verb'
        # and we use bert to get word substitutions
        if len(align[2][0]) == 1:
            if text_tags[align[2][0][0]][1] not in ['VERB']:
                continue
            replace_alignment.append(align)
        else:
            verb_flag = 0
            for index, _ in enumerate(align[2][0]):
                if text_tags[align[2][0][index]][1] in ['VERB']:
                    verb_flag = 1
                    break
            if verb_flag == 0:
                continue

            replace_alignment.append(align)

    old_replace_alignment_all.append(replace_alignment)

## Only keep phrases
replace_alignment_all = []
for i, alignment in enumerate(old_replace_alignment_all):
    en_sub_index = []
    zh_sub_index = []
    alignment_all = []
    for ali in alignment:
        if len(alignment_all) == 0:
            alignment_all.append(ali)
            for index in ali[2][0]:
                en_sub_index.append(index)
            for index in ali[2][1]:
                zh_sub_index.append(index)
            continue
        else:
            overlap_flag = 0
            for index in ali[2][0]:
                if index in en_sub_index:
                    overlap_flag = 1
                    break
            for index in ali[2][1]:
                if index in zh_sub_index:
                    overlap_flag = 1
                    break
            if overlap_flag == 1:
                continue

            for index in ali[2][0]:
                en_sub_index.append(index)
            for index in ali[2][1]:
                zh_sub_index.append(index)

            alignment_all.append(ali)
    new_alignment_all = []
    for ali in alignment_all:
        new_alignment_all.append(ali)

    replace_alignment_all.append(new_alignment_all)


## Build masked prompts
train_en = []
train_zh = []
final_alignments = []
train_align = []
old_en_text = []
old_zh_text = []
for i, sent in enumerate(en_text):
    alignment = replace_alignment_all[i]
    ori_zh_text = zh_text[i]
    MASK_RATIO = 0.2
    sample_count = 0
    if len(alignment) == 0:
        continue

    # determine the number of samples crafted from each raw example
    max_count = len(alignment)

    # Build phrase edited data
    for _ in range(100):
        max_num = 1
        if max_num == 0:
            sample_num = 1
        else:
            sample_num = random.randint(1, max_num)

        phrase_replace_list = []
        en_sub_index = []
        zh_sub_index = []

        ## avoid the loop from not ending
        count = 0
        while len(phrase_replace_list) < sample_num:
            if count == 99:
                break

            phrase_candidate = random.choice(alignment)
            count += 1
            if len(phrase_replace_list) == 0:
                phrase_replace_list.append(phrase_candidate)
                for index in phrase_candidate[2][0]:
                    en_sub_index.append(index)
                for index in phrase_candidate[2][1]:
                    zh_sub_index.append(index)
                continue

            if phrase_candidate in phrase_replace_list:
                continue
            else:
                ## find inclusive relationship and remove
                repeat_flag = 0
                for phrase in phrase_replace_list:
                    if (len(find_sub_list(phrase_candidate[2][1], phrase[2][1])) != 0) or (
                            len(find_sub_list(phrase_candidate[2][0], phrase[2][0])) != 0):
                        repeat_flag = 1
                        break

                if repeat_flag == 1:
                    continue

                # if this align overlaps with previous, skip.
                overlap_flag = 0
                for index in phrase_candidate[2][0]:
                    if index in en_sub_index:
                        overlap_flag = 1
                        break
                for index in phrase_candidate[2][1]:
                    if index in zh_sub_index:
                        overlap_flag = 1
                        break
                if overlap_flag == 1:
                    continue

                for index in phrase_candidate[2][0]:
                    en_sub_index.append(index)
                for index in phrase_candidate[2][1]:
                    zh_sub_index.append(index)

                phrase_replace_list.append(phrase_candidate)
        align_usage = phrase_replace_list
        if align_usage in final_alignments:
            continue
        final_alignments.append(str(align_usage))

        # processing source side
        en_blank_list = []
        en_delete_list = []
        ori_en_list = sent.split()
        new_en_list = []

        for align in align_usage:
            # not mask the start of the sentence.
            if align[2][0][0] == 0:
                continue
            for p, index in enumerate(align[2][0]):
                if p == 0:
                    en_blank_list.append(index)
                else:
                    en_delete_list.append(index)

        # handle English
        for j, token in enumerate(ori_en_list):
            if j in en_blank_list:
                new_en_list.append('<mask>')
            elif j in en_delete_list:
                continue
            else:
                new_en_list.append(ori_en_list[j])

        # processing target side
        zh_blank_list = []
        zh_delete_list = []
        ori_zh_list = ori_zh_text.split()
        new_zh_list = []

        for align in align_usage:
            if align[2][0][0] == 0:
                continue
            for p, index in enumerate(align[2][1]):
                if p == 0:
                    zh_blank_list.append(index)
                else:
                    zh_delete_list.append(index)

        # handle Chinese
        for j, token in enumerate(ori_zh_list):
            if j in zh_blank_list:
                new_zh_list.append('<mask>')
            elif j in zh_delete_list:
                continue
            else:
                new_zh_list.append(ori_zh_list[j])

        final_en = ' '.join(new_en_list)
        final_zh = ' '.join(new_zh_list)

        if '<mask>' not in final_en:
            continue

        if final_en in train_en:
            continue

        train_en.append(final_en)
        train_zh.append(final_zh)
        train_align.append(phrase_replace_list)
        old_en_text.append(sent)
        old_zh_text.append(zh_text[i])

        sample_count += 1
        if sample_count == max_count:
            break


## Detokenize the prompt inputs
data_path = 'data/tense/temp'
if not os.path.exists(data_path):
    os.makedirs(data_path)
with open(data_path + '/train_en', 'w') as f_out:
    for i, text in enumerate(train_en):
        f_out.write(text)
        f_out.write('\n')
with open(data_path + '/old_en_text', 'w') as f_out:
    for i, text in enumerate(old_en_text):
        f_out.write(text)
        f_out.write('\n')


os.system("perl detokenizer.perl -a -no-escape -l en < " + data_path + "/train_en >  " + data_path + "/train_en_detok")
os.system("perl detokenizer.perl -a -no-escape -l en < " + data_path + "/old_en_text >  " + data_path + "/old_en_text")

train_en = []
#old_en_text = []
with open(data_path + '/train_en_detok') as f:
    for line in f:
        text = line[:-1].replace('@', '')
        train_en.append(text.replace(' - ', '-'))

## Shuffle the input data
combined_lists = list(zip(train_en, train_zh, train_align, old_en_text, old_zh_text))

# Shuffle the combined lists
random.shuffle(combined_lists)

# Unpack the shuffled lists into separate variables
train_en, train_zh, train_align, old_en_text, old_zh_text = zip(*combined_lists)

## We only use the first 1000 data
split_num = 1000

train_en = train_en[split_num-1000:split_num]
train_zh = train_zh[split_num-1000:split_num]
train_align = train_align[split_num-1000:split_num]
old_en_text = old_en_text[split_num-1000:split_num]
old_zh_text = old_zh_text[split_num-1000:split_num]

instruction = "You are given an English sentence and its Chinese translation. In each sentence, a {} has been masked with the '<mask>' token. Your task is to first fill in the masked token in the English sentence using a past perfect tense {} without modifying any of the unmasked tokens. Then, use the filled English sentence to fill in the masked token in its corresponding Chinese translation in the past perfect tense. If necessary, make modifications to the filled Chinese translation to ensure the correctness of tense while preserving the meaning. Finally, please output the filled English sentence and its filled Chinese translation in the format of \'Filled English:{}\nFilled Chinese:{}\'.\n"

prompt_list = []
for i, text in enumerate(train_en):
    en = text
    zh = train_zh[i].replace(' ', '')
    if len(train_align[i][0][2][0]) == 1:
        verb = 'verb'
    else:
        verb = 'verb phrase'
    prompt = copy.deepcopy(instruction).format(verb, verb,'{}','{}')\
    + 'English Sentence: ' + en + '\n' + 'Chinese Translation: ' + zh
    prompt_list.append(prompt)

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

## Start to query the API
openai.organization = "Your organization"
openai.api_key = 'Your API Key'

result_path = 'data/tense'

response_list = []
error_list = []
for i, prompt in tqdm(enumerate(prompt_list)):
    try:
        messages = [
            {"role": "system", "content": "You are an English-Chinese text infilling system."},
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
        generated_text = response['choices'][0]['message']['content'].split('\n')
        with open(result_path + '/generated_en', 'a') as f_out:
            f_out.write(generated_text[0])
            f_out.write('\n')
        with open(result_path + '/generated_zh', 'a') as f_out:
            f_out.write(generated_text[1])
            f_out.write('\n')

    except:
        print(i)
        error_list.append(i)
        continue

with open(result_path + '/response_list'+'.pkl', 'wb') as f:
    pickle.dump(response_list, f)
with open(result_path + '/error_list'+'.pkl', 'wb') as f:
    pickle.dump(error_list, f)

