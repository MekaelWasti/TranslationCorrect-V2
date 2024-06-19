import os
import stanza
import copy
import itertools
import spacy
import string
from zhon.hanzi import punctuation
import time
import pickle


en_puncs = string.punctuation
zh_puncs = punctuation

en = spacy.load("en_core_web_sm")
zh = spacy.load("zh_core_web_sm")
en_stop_words = en.Defaults.stop_words
raw_zh_stop_words = zh.Defaults.stop_words

number_list = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
zh_stop_words = set()
for item in raw_zh_stop_words:
    if item not in number_list:
        zh_stop_words.add(item)

en_nlp = stanza.Pipeline(lang='en', processors='tokenize,pos,lemma,constituency',
                     tokenize_pretokenized=True)
zh_nlp = stanza.Pipeline(lang='zh', processors='tokenize,pos,lemma,constituency',
                     tokenize_pretokenized=True)

def sub_phrases(tree, phrase_list):
    if not (tree.is_preterminal() or tree.is_leaf() or tree.label == 'ROOT' or tree.label == 'S'):
        label = tree.label
        phrase = tree.leaf_labels()
        if len(phrase) != 1:
            phrase_list.append((label, ' '.join(phrase)))

    if tree.children:
        for children in tree.children:
            sub_phrases(children, phrase_list)

def get_phrase(tree, stop_words):
    phrase_list = []
    for children in tree.children:
        sub_phrases(tree, phrase_list)
    new_phrase_list = []
    for phrase in phrase_list:
        if phrase[1].split()[0] in stop_words:
            new_phrase = (phrase[0], ' '.join(phrase[1].split()[1:]))
        else:
            new_phrase = phrase
        new_phrase_list.append(new_phrase)
    return new_phrase_list

def find_sub_list(sl,l):
    results=[]
    sl_length=len(sl)
    for ind in (i for i,e in enumerate(l) if e==sl[0]):
        if l[ind:ind+sl_length]==sl:
            results.append((ind,ind+sl_length))
    return results

# Load data
en_text_ori = []
zh_text_ori = []
with open('data/test_en') as f:
    for line in f:
        en_text_ori.append(line[:-1])

with open('data/test_zh') as f:
    for line in f:
        zh_text_ori.append(line[:-1])


final_alignment_ori = []
with open('data/test.align') as f:
    for line in f:
        final_alignment_ori.append(line[:-1])


## Filter out very long sentence.
en_text = []
zh_text = []
final_alignment = []
for i, text in enumerate(en_text_ori):
    if len(text.split()) <= 500:
        en_text.append(text)
        zh_text.append(zh_text_ori[i])
        final_alignment.append(final_alignment_ori[i])

print(len(en_text))
print(len(zh_text))
print(len(final_alignment))

## First round word alignment

old_alignment_pairs = []
error_count = 0
for i, alignment in enumerate(final_alignment):
    alignment_pair = []
    last_en_token = None
    last_align = 0
    count = 0
    for j, align in enumerate(alignment.split()):
        en_index = int(align.split('-')[0]) - 1
        zh_index = int(align.split('-')[1]) - 1
        try:
            ## since the alignment result is target-source, yet we need a source-target format, we switch their positions here.
            en_token = zh_text[i].split()[en_index]
            zh_token = en_text[i].split()[zh_index]
        except IndexError:
            error_count += 1
            continue

        # Check the index for the first token
        if count == 0:
            firstone_index = int(en_index)
            last_en_index = firstone_index
        count += 1

        # special case for the first token
        if en_index == firstone_index:
            if j == 0:
                cur_zh_segment = zh_token
                cur_zh_index_list = [zh_index]
                last_zh_index = zh_index
                last_en_token = en_token
            else:
                ## already not continuous
                if zh_index != last_zh_index + 1:
                    last_align = None
                    continue
                cur_zh_segment = cur_zh_segment + ' ' + zh_token
                cur_zh_index_list.append(zh_index)
                last_zh_index += 1

        else:
            ## Get one pair
            if en_index != last_en_index:
                if last_align == None:
                    alignment_pair.append(None)
                    last_align = 0
                else:
                    alignment_pair.append([last_en_token, cur_zh_segment, [[last_en_index], cur_zh_index_list]])
                cur_zh_segment = zh_token
                cur_zh_index_list = [zh_index]
                last_en_index = en_index
                last_en_token = en_token
                last_zh_index = zh_index
            else:
                # We have filtered out the situation that a word in the source sentence is aligned with two not consecutive words in the target sentence
                if zh_index != last_zh_index + 1:
                    last_align = None
                    continue
                cur_zh_segment = cur_zh_segment + ' ' + zh_token
                cur_zh_index_list.append(zh_index)
                last_zh_index += 1

    if last_align == None:
        alignment_pair.append(None)
        last_align = 0
    else:
        alignment_pair.append([last_en_token, cur_zh_segment, [[last_en_index], cur_zh_index_list]])

    # Filer out None
    new_alignment_pair = []
    zh_list = []
    for j, pair in enumerate(alignment_pair):
        if pair == None:
            continue
        new_alignment_pair.append(pair)
        zh_list.append(pair[1])

    # Combine tokens with continuous and same Chinese translation
    ## Grouping
    zh_group_index_dict = {}
    zh_group_index_list = []
    index = 0
    for k, v in itertools.groupby(zh_list):
        word_list = list(v)
        if len(word_list) > 1:
            zh_group_index_dict[index] = len(word_list)
            for p in range(len(word_list) - 1):
                zh_group_index_list.append(index + p + 1)
        index += len(word_list)

    combine_alignment_pair = []
    for j, pair in enumerate(new_alignment_pair):
        if j in zh_group_index_dict.keys():
            usage_pairs = copy.deepcopy(new_alignment_pair[j:j + zh_group_index_dict[j]])
            en_token = ''
            zh_token = usage_pairs[0][1]
            zh_index_list = usage_pairs[0][2][1]
            en_index_list = []
            last_en_index = usage_pairs[0][2][0][0]
            break_flag = 0
            for p, use in enumerate(usage_pairs):
                # filter out the situation that a word in the source sentence is not aligned
                if p != 0:
                    if use[2][0][0] != last_en_index:
                        break_flag = 1
                        break
                try:
                    en_token += use[0]
                except TypeError:
                    continue
                en_index_list.append(use[2][0][0])
                if p != len(usage_pairs) - 1:
                    en_token += ' '
                last_en_index += 1

            if break_flag == 1:
                continue
            combine_alignment_pair.append([en_token, zh_token, [en_index_list, zh_index_list]])
        elif j in zh_group_index_list:
            continue
        else:
            combine_alignment_pair.append(pair)

    # filter out the situation that a word in the target sentence is aligned with two not consecutive words in the source sentence
    zh_index_list = []
    for pair in combine_alignment_pair:
        zh_index_list.append(pair[2][1])
    removed_indexes = [i for i, v in enumerate(zh_index_list) if zh_index_list.count(v) > 1]

    final_alignment_pair = []
    for j, pair in enumerate(combine_alignment_pair):
        if j not in removed_indexes:
            final_alignment_pair.append(pair)
    old_alignment_pairs.append(final_alignment_pair)

alignment_pairs = []
for pair in old_alignment_pairs:
    alignment_pair = []
    for pa in pair:
        alignment_pair.append([pa[1], pa[0], [pa[2][1], pa[2][0]]])
    alignment_pairs.append(alignment_pair)
print(error_count)
# Phrase alignment

start = time.time()
en_docs = []
print_size = 10000
batch_num = (len(en_text) // print_size) + 1
for i in range(batch_num):
    if i == batch_num - 1:
        if len(en_text[i*print_size:]) != 0:
            en_documents = en_text[i*print_size:]
        else:
            continue
    else:
        en_documents = en_text[i*print_size:(i+1)*print_size]
    en_in_docs = [stanza.Document([], text=d) for d in en_documents]
    en_docs.extend(en_nlp(en_in_docs))
    print(i)

start1 = time.time()
print('Finish English')

print(start1-start)
zh_docs = []
batch_num = (len(zh_text) // print_size) + 1
for i in range(batch_num):
    if i == batch_num - 1:
        if len(zh_text[i*print_size:]) != 0:
            zh_documents = zh_text[i*print_size:]
        else:
            continue
    else:
        zh_documents = zh_text[i*print_size:(i+1)*print_size]
    zh_in_docs = [stanza.Document([], text=d) for d in zh_documents]
    zh_docs.extend(zh_nlp(zh_in_docs))
    print(i)
start2 = time.time()
print('Finish Chinese')
print(start2-start1)

# find phrases
en_phrases = []
zh_phrases = []
for en_doc in en_docs:
    en_phrases.append(get_phrase(en_doc.sentences[0].constituency, en_stop_words))

for zh_doc in zh_docs:
    zh_phrases.append(get_phrase(zh_doc.sentences[0].constituency, zh_stop_words))

raw_align_phrases = []
error_num = []
for num, alignment_pair in enumerate(alignment_pairs):
    ## rank phrases with their original order
    en_alignment_order = [(align[2][0][0], align) for align in alignment_pair]
    en_alignment_order = sorted(en_alignment_order)
    en_alignment_pair = [k[1] for k in en_alignment_order]
    zh_alignment_order = [(align[2][1][0], align) for align in alignment_pair]
    zh_alignment_order = sorted(zh_alignment_order)
    zh_alignment_pair = [k[1] for k in zh_alignment_order]

    final_phrases = []
    en_alignment_str_list = []
    zh_alignment_str_list = []
    for p, pair in enumerate(en_alignment_pair):
        en_alignment_str_list.append(pair[0])
        zh_alignment_str_list.append(zh_alignment_pair[p][1])
    try:
        en_alignment_str = ' '.join(en_alignment_str_list)
        zh_alignment_str = ' '.join(zh_alignment_str_list)
    except TypeError:
        ## some rows are not aligned
        error_num.append(num)
        raw_align_phrases.append(final_phrases)
        continue

    en_phrases_list = [phrase[1] for phrase in en_phrases[num]]
    zh_phrases_list = [phrase[1] for phrase in zh_phrases[num]]

    ## Source side alignment

    for phrase in en_phrases[num]:
        if phrase[1] in en_alignment_str:
            phrase_indexes = find_sub_list(phrase[1].split(), en_alignment_str_list)
            for phrase_index in phrase_indexes:
                phrase_alignments = alignment_pair[phrase_index[0]:phrase_index[1]]

                en_indexes = []
                zh_indexes = []
                ## to see whether found indexes are continuous or not
                if len(phrase_alignments) == 1:
                    continue
                else:
                    for i, alignment in enumerate(phrase_alignments):
                        en_indexes.extend(alignment[2][0])
                        zh_indexes.extend(alignment[2][1])
                        if i == 0:
                            last_en_index = alignment[2][0][-1]
                            last_zh_index = alignment[2][1][-1]
                        else:
                            ## to see whether the obtained phrases are continuous or not.
                            if alignment[2][0][-1] != (last_en_index + len(alignment[2][0])):
                                break
                            if alignment[2][1][-1] != (last_zh_index + len(alignment[2][1])):
                                break
                            last_en_index = alignment[2][0][-1]
                            last_zh_index = alignment[2][1][-1]

                            if (i == len(phrase_alignments) - 1) and (
                                    ' '.join([align[1] for align in phrase_alignments]) in zh_phrases_list) and (
                                    [' '.join([align[0] for align in phrase_alignments]),
                                     ' '.join([align[1] for align in phrase_alignments]),
                                     [en_indexes, zh_indexes]] not in final_phrases):
                                final_phrases.append([' '.join([align[0] for align in phrase_alignments]),
                                                      ' '.join([align[1] for align in phrase_alignments]),
                                                      [en_indexes, zh_indexes]])
    # target side alignment
    for phrase in zh_phrases[num]:
        if phrase[1] in zh_alignment_str:
            phrase_indexes = find_sub_list(phrase[1].split(), zh_alignment_str_list)
            for phrase_index in phrase_indexes:
                phrase_alignments = alignment_pair[phrase_index[0]:phrase_index[1]]

                en_indexes = []
                zh_indexes = []
                # to see whether found indexes are continuous or not

                if len(phrase_alignments) == 1:
                    continue
                else:
                    for i, alignment in enumerate(phrase_alignments):
                        en_indexes.extend(alignment[2][0])
                        zh_indexes.extend(alignment[2][1])
                        if i == 0:
                            last_en_index = alignment[2][0][-1]
                            last_zh_index = alignment[2][1][-1]
                        else:
                            if alignment[2][0][-1] != (last_en_index + len(alignment[2][0])):
                                break
                            if alignment[2][1][-1] != (last_zh_index + len(alignment[2][1])):
                                break
                            last_en_index = alignment[2][0][-1]
                            last_zh_index = alignment[2][1][-1]

                            if (i == len(phrase_alignments) - 1) and (
                                    ' '.join([align[0] for align in phrase_alignments]) in en_phrases_list) and (
                                    [' '.join([align[0] for align in phrase_alignments]),
                                     ' '.join([align[1] for align in phrase_alignments]),
                                     [en_indexes, zh_indexes]] not in final_phrases):
                                final_phrases.append([' '.join([align[0] for align in phrase_alignments]),
                                                      ' '.join([align[1] for align in phrase_alignments]),
                                                      [en_indexes, zh_indexes]])
    raw_align_phrases.append(final_phrases)

raw_align_words = []
for i, alignment in enumerate(alignment_pairs):
    raw_align_word = []
    for align in alignment:
        if len(align[2][0]) > 1 or len(align[2][1]) > 1:
            if align not in raw_align_phrases[i]:
                raw_align_phrases[i].append(align)
            else:
                raw_align_word.append(align)
        else:
            raw_align_word.append(align)
    raw_align_words.append(raw_align_word)

final_align_words = []
for num, alignment_pair in enumerate(raw_align_words):
    final_align_word = []

    if num in error_num:
        final_align_words.append(final_align_word)
        continue

    for pair in alignment_pair:

        if (pair[0] in en_puncs) or (pair[0] in zh_puncs):
            continue
        if (pair[1] in en_puncs) or (pair[1] in zh_puncs):
            continue
        # remove stopwords

        if (pair[0] in en_stop_words) or (pair[0] in zh_stop_words):
            continue
        if (pair[1] in en_stop_words) or (pair[1] in zh_stop_words):
            continue
        final_align_word.append(pair)
    final_align_words.append(final_align_word)

final_align_phrases = []
for num, alignment_pair in enumerate(raw_align_phrases):
    final_align_phrase = []

    if num in error_num:
        final_align_phrases.append(final_align_phrase)
        continue

    for pair in alignment_pair:
        if len(pair[2][0]) == 1:
            if (pair[0] in en_puncs) or (pair[0] in zh_puncs):
                continue
            if (pair[0] in en_stop_words) or (pair[0] in zh_stop_words):
                continue

        if len(pair[2][1]) == 1:
            if (pair[1] in en_puncs) or (pair[1] in zh_puncs):
                continue
            if (pair[1] in en_stop_words) or (pair[1] in zh_stop_words):
                continue
        final_align_phrase.append(pair)
    final_align_phrases.append(final_align_phrase)

# Save word and phrase alignments
with open("data/test_words", "wb") as fp:
    pickle.dump(final_align_words, fp)
with open("data/test_phrases", "wb") as fp:
    pickle.dump(final_align_phrases, fp)