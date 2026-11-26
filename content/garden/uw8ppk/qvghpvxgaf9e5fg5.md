---
title: NLP（自然语言处理）
date: '2026-05-30'
summary: >-
  BERT 论文 BERT: Pre-training of Deep Bidirectional Transformers for Language
  Understanding【BERT 论文逐段精读【论文精读】】语言表示模型 masked langue model （带掩码的模
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/qvghpvxgaf9e5fg5'
---
# BERT 论文 
[BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/html/1810.04805v2)

[【BERT 论文逐段精读【论文精读】】](https://www.bilibili.com/video/BV1PL411M7eQ/?share_source=copy_web&vd_source=2261c9576a4b4cf4d5bae89613c8ab5a)

语言表示模型  

### masked langue model （带掩码的模型）MLM
每一次随机选一些词元（token），将它盖住，目标函数是预测被盖住的字。类似于完形填空。

标准模型是从左看到右，MLM看左右信息。 双向的transformer模型。

附：下一个句子的预测。给两个句子，判断在原文中是不是相邻的或者是随机采样的两个句子。学习句子层的知识。

**双向信息的重要性。**

替换为 [MASK]   BERT 训练时盖住 15% 的词来预测

### 算法 
#### 预训练
在一个没有标号的数据上训练

#### 微调
使用一个 BERT 的模型。 权重初始化为在预训练中得到的权重。

所有的权重会被参与训练，用有标号的数据。

每一个下游任务是一个BERT模型，用最早哪个预训练好的BERT模型作为初始化，根据自己的数据训练好模型。

# LORA
### 核心亮点
+ 参数少：微调原始参数的1%甚至更少
+ 速度快：训练和部署都比全参数微调省时省力
+ 模块化：训练好的LoRA"插件"可以随时加载或卸载，不影响原始模型，特别适合多任务场景。

:::info
模块化设计的优点

避免灾难性遗忘：直接修改W可能导致模型在新任务上表现良好，但在原始任务上性能下降（即"灾难性遗忘”）。LoRA通过冻结W，保留了原始模型的能力

存储效率高：一个大模型可以搭配多个LoRA模块，每个模块只占几MB，相比全模型微调动辄几GB，节省空间。

快速切换：任务切换只需加载不同LoRA文件，几秒钟搞定，不用重新训练。

兼容性强：原始模型完全不动，多个团队可以共享同一个基础模型，只开发自己的LoRA模块。

:::
