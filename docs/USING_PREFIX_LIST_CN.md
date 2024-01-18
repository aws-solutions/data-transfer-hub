[English](./USING_PREFIX_LIST_EN.md)

# 使用前缀列表文件过滤数据传输任务

## 第1步：创建前缀列表文件

请将前缀列表以纯文本格式写入文件，每行一个前缀。

例如：
![前缀列表文件](images/prefix_list_file.png)

## 第2步：将前缀列表文件上传到您的存储桶
> **注意**：在第3步指定位置时，请确保输入前缀列表文件的精确路径。

### 选项1：将前缀列表文件上传到您的源存储桶

您可以在源存储桶内的任何位置存储前缀列表文件。
![prefix_list_file_in_s3](images/prefix_list_file_in_s3.png)

### 选项2：将前缀列表文件上传到与数据传输中心同一区域和账户的第三个存储桶

您可以在第三个存储桶的任何位置放置前缀列表文件。重要的是，这个第三个存储桶必须与Data Transfer Hub处于同一区域和账户。
![prefix_list_file_in_third_s3](images/prefix_list_third_s3.png)

对于使用 Data Transfer Hub 控制台的用户，只需点击提供的链接即可直接导航至第三个存储桶。
![prefix_list_file_from_portal](images/prefix_list_portal.png)

## 第3步：配置CloudFormation堆栈模板

在提供的输入框中输入前缀列表文件的路径。
如果您的前缀列表文件位于源存储桶中，请将`Bucket Name for Source Prefix List File`参数留空。

![cloudformation](images/cloudformation_prefix_list.png)
