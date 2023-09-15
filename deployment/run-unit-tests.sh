#!/bin/bash
#
# You can remove this script if you do NOT have unit test.
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./run-unit-tests.sh
#
source_template_dir="$PWD"
cd $source_template_dir/../source/constructs
./run-all-tests.sh