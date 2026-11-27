---
title: Docker
date: '2026-05-16'
summary: >-
  命令拉取镜像：docker pull查看……：docekr image基于镜像运行容器：docker run查看构建的容器：docker
  psdockerfile构建时遇到问题应该怎么办？在运行时可以看到是哪一行出了问题，可以先将这一行及其之后的注
yuqueUrl: 'https://www.yuque.com/yllmis/uw8ppk/grtytbqvsrcucpbz'
---
# 命令
+ 拉取镜像：`docker pull`
+ 查看……：`docekr image`
+ 基于镜像运行容器：`docker run`
+ 查看构建的容器：`docker ps`

**dockerfile构建时遇到问题应该怎么办？**

在运行时可以看到是哪一行出了问题，可以先将这一行及其之后的注释掉，重新运行容器。再进到容器中，去一行一行执行注释掉的命令，去找问题

**部署服务并使用该网段**

**部署服务并使用该网段请输入代码块名称**

```shell
docker run --name etcd -p 2379:2379 --net user --ip 168.10.0.100 -d etcd
docker run --name user-rpc -p 8080:8080 --net user --ip 168.10.0.70 --1ink etcd -duser-rpc
docker run --name user-api -p 8888:8888 --net user --ip 168.10.0.50 --1ink etcd -duser-api

#etcd查询所有的key6 etcdctl get --prefix
```

## 容器之间互通
+ 通过宿主机绑定端口访问
+ 容器都在同一网络段
+ 通过link命令

# 存储
## 默认存储（非持久化）

> [!COLLAPSE] 容器的文件存储机制
>
> union FS（联合文件系统）
>
> 只写层（容器中运行产生的数据）
>
> 只读层（镜像）

## 持久化存储
### Bind Mount 绑定挂载
> **宿主机 var/data **↔ **容器 /data** 
>

持久化存储

问题：1. 依赖宿主机目录结构 2. 文件映射引起的数据安全风险

### Volume数据卷模式
> **数据卷（volume）**↔ **容器 /data** 
>

持久化存储，心智消耗低

### 适用场景对比
![](/images/yuque/f7ace80b837b01a6.png)
