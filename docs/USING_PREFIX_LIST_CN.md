[English](./USING_PREFIX_LIST_EN.md)

# 使用前缀列表完成多个指定前缀中数据的传输

## Step 1: 创建前缀列表

请将前缀列表写入纯文本格式文件，每行一个前缀。

示例如下:
![Prefix List File](images/prefix_list_file.png)

## Step 2: 上传前缀列表文件到源数据桶

您可以将前缀列表文件放在源存储桶中的任何位置。
> 注意: 请记住在步骤3填写Prefix List File的位置时填入它的实际路径。

![prefix_list_file_in_s3](images/prefix_list_file_in_s3.png)

## Step 3: 配置 Cloudformation 的堆栈模板

将Prefix List File的路径写入堆栈模板的指定参数中。

![cloudformaiton](images/cloudformation_prefix_list.png)