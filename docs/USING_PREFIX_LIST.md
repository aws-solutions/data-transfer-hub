[中文](./USING_PREFIX_LIST_CN.md)

# Using Prefix List File to Filter Data Transmission Job

## Step 1: Create a Prefix List File

Please write the list of prefixes into a Plain Text format file, with one prefix for each line. 

For example:
![Prefix List File](images/prefix_list_file.png)

## Step 2: Upload the Prefix List File to the source data bucket

You can put the prefix list file in anywhere in your source bucket. 
> Note: Please remember to write its actual path when filling in the location of the Prefix List File in the Step 3.

![prefix_list_file_in_s3](images/prefix_list_file_in_s3.png)

## Step 3: Config the Cloudformation Stack template

Write the path of the Prefix List File into the input box.

![cloudformaiton](images/cloudformation_prefix_list.png)