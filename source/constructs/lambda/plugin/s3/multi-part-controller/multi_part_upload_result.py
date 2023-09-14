# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

from util.multi_part_helper import MultiPartUploadHelper


def lambda_handler(event, _):
    """ This Lambda is used to manage the lifecycle of multi-part uploads in cluster mode. """

    args = event["arguments"]
    status = event["status"]
    upload_id = args.get("uploadID")
    object_key = args.get('objectKey')

    multi_part_helper = MultiPartUploadHelper(
        upload_id=upload_id, object_key=object_key)
    etag = None
    if status == "COMPLETED":
        etag = multi_part_helper.complete_multipart_upload()
        if etag is None:
            status = "ERROR"
    elif status == "ERROR":
        multi_part_helper.abort_multipart_upload()

    # Update the transfer ddb table
    multi_part_helper.update_transfer_table_status(status, etag)

    # Send the transfer result message to worker cloudwatch log group
    multi_part_helper.send_transfer_result_message_to_cloudwatch_log_group(
        status)

    return {
        "status": status,
        "etag": etag
    }
