---
title: PyTorch深度学习入门
date: 2026-05-23 10:00:00
cover: /img/pytorch.jpg
categories:
  - 深度学习
tags:
  - PyTorch
  - 深度学习
  - 神经网络
  - Python
  - 机器学习
---

## PyTorch 安装与环境配置

```bash
# 创建虚拟环境
conda create -n pytorch python=3.10
conda activate pytorch

# 安装PyTorch（GPU版本）
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 验证安装
python -c "import torch; print(torch.cuda.is_available())"
```

## Tensor 基础操作

```python
import torch

# 创建张量
x = torch.tensor([1, 2, 3, 4])
y = torch.zeros(3, 4)
z = torch.randn(2, 3)  # 随机正态分布

# 张量运算
a = torch.add(x, 2)
b = x * 2
c = x.view(2, 2)  # 改变形状

# GPU加速
if torch.cuda.is_available():
    x = x.cuda()
```

## 构建第一个神经网络

```python
import torch
import torch.nn as nn
import torch.optim as optim

# 定义网络结构
class SimpleNet(nn.Module):
    def __init__(self):
        super(SimpleNet, self).__init__()
        self.fc1 = nn.Linear(784, 128)  # 输入层
        self.fc2 = nn.Linear(128, 64)   # 隐藏层
        self.fc3 = nn.Linear(64, 10)    # 输出层
        self.relu = nn.ReLU()
        
    def forward(self, x):
        x = x.view(-1, 784)
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x

# 创建模型
model = SimpleNet()

# 定义损失函数和优化器
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)
```

## 训练循环

```python
# 训练函数
def train(model, train_loader, epochs=10):
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        for batch_idx, (data, target) in enumerate(train_loader):
            optimizer.zero_grad()          # 清除梯度
            output = model(data)           # 前向传播
            loss = criterion(output, target)  # 计算损失
            loss.backward()                # 反向传播
            optimizer.step()               # 更新参数
            total_loss += loss.item()
        
        print(f'Epoch {epoch+1}, Loss: {total_loss/len(train_loader):.4f}')

# 加载MNIST数据
from torchvision import datasets, transforms

transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

train_data = datasets.MNIST('data', train=True, download=True, transform=transform)
train_loader = torch.utils.data.DataLoader(train_data, batch_size=64, shuffle=True)

# 开始训练
train(model, train_loader)
```

## 模型保存与加载

```python
# 保存模型
torch.save(model.state_dict(), 'model.pth')

# 加载模型
model = SimpleNet()
model.load_state_dict(torch.load('model.pth'))
model.eval()  # 评估模式
```

## GPU训练技巧

```python
# 检查GPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 将模型和数据移到GPU
model = model.to(device)
data, target = data.to(device), target.to(device)

# 多GPU训练
if torch.cuda.device_count() > 1:
    model = nn.DataParallel(model)
```