#!/bin/bash
#
# This script packages your project into a solution distributable that can be
# used as an input to the solution builder validation pipeline.
#
# This script will perform the following tasks:
#   1. Remove any old dist files from previous runs.
#   2. Install dependencies for the cdk-solution-helper; responsible for
#      converting standard 'cdk synth' output into solution assets.
#   3. Build and synthesize your CDK project.
#   4. Run the cdk-solution-helper on template outputs and organize
#      those outputs into the /global-s3-assets folder.
#   5. Organize source code artifacts into the /regional-s3-assets folder.
#   6. Remove any temporary files used for staging.
#
# Parameters:
#  - source-bucket-base-name: Name for the S3 bucket location where the template will source the Lambda
#    code from. The template will append '-[region_name]' to this bucket name.
#    For example: ./build-s3-dist.sh solutions v1.0.0
#    The template will then expect the source code to be located in the solutions-[region_name] bucket
#  - solution-name: name of the solution for consistency
#  - version-code: version of the package
set -e

run() {
    >&2 echo "[run] $*"
    $*
}

do_cmd() 
{
    echo "------ EXEC $*"
    $*
    rc=$?
    if [ $rc -gt 0 ]
    then
            echo "Aborted - rc=$rc"
            exit $rc
    fi
}

sedi() 
{
    # cross-platform for sed -i
    sed -i $* 2>/dev/null || sed -i "" $*
}

## Important: CDK global version number
cdk_version=1.64.1
cleanup_temporary_generted_files()
{
    echo "------------------------------------------------------------------------------"
    echo "${bold}[Cleanup] Remove temporary files${normal}"
    echo "------------------------------------------------------------------------------"

    # Delete generated files: CDK Consctruct typescript transcompiled generted files
    do_cmd cd $source_dir/constructs
    do_cmd npm run cleanup:tsc

    # Delete the temporary /staging folder
    do_cmd rm -rf $staging_dist_dir
}
#
# Check to see if the required parameters have been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the base source bucket name, trademark approved solution name and version where the lambda code will eventually reside."
    echo "For example: ./build-s3-dist.sh solutions trademarked-solution-name v1.0.0"
    exit 1
fi
if [ ! -z $3 ]; then
    export VERSION="$3"
else
    export VERSION=$(git describe --tags --exact-match || { [ -n "$BRANCH_NAME" ] && echo "$BRANCH_NAME"; } || echo v0.0.0)
fi

# Get reference for all important folders
template_dir="$(cd "$(dirname $0)";pwd)"
staging_dist_dir="$template_dir/staging"
template_dist_dir="$template_dir/global-s3-assets"
build_dist_dir="$template_dir/regional-s3-assets"
source_dir="$template_dir/../source"

echo "------------------------------------------------------------------------------"
echo "[Init] Remove any old dist files from previous runs"
echo "------------------------------------------------------------------------------"

do_cmd rm -rf $template_dist_dir
do_cmd mkdir -p $template_dist_dir
do_cmd rm -rf $build_dist_dir
do_cmd mkdir -p $build_dist_dir
do_cmd rm -rf $staging_dist_dir
do_cmd mkdir -p $staging_dist_dir

echo "------------------------------------------------------------------------------"
echo "[Init] Install dependencies for the cdk-solution-helper"
echo "------------------------------------------------------------------------------"

do_cmd cd $template_dir/cdk-solution-helper
do_cmd npm install

echo "------------------------------------------------------------------------------"
echo "[Build] Build web portal artifacts"
echo "------------------------------------------------------------------------------"
cd $source_dir/portal
npm install --legacy-peer-deps
npm run build


echo "------------------------------------------------------------------------------"
echo "[Synth] CDK Project"
echo "------------------------------------------------------------------------------"

# Install the global aws-cdk package
#echo "npm install -g aws-cdk@$cdk_version"
#npm install -g aws-cdk@$cdk_version


# Run 'npm run build && cdk synth' to generate raw solution outputs
echo "cd $source_dir/constructs"
cd $source_dir/constructs
echo "npm install"
npm install
echo "npm run build"
npm run build

run npx cdk synth --output=$staging_dist_dir --json true > $template_dist_dir/DataTransferHub-cognito.template
run npx cdk synth -c authType=openid --output=$staging_dist_dir --json true > $template_dist_dir/DataTransferHub-openid.template

ls -l $template_dist_dir

# Remove unnecessary output files
echo "cd $staging_dist_dir"
cd $staging_dist_dir
echo "rm tree.json manifest.json cdk.out"
rm tree.json manifest.json cdk.out

echo "------------------------------------------------------------------------------"
echo "[Packing] Template artifacts"
echo "------------------------------------------------------------------------------"

# Run the helper to clean-up the templates and remove unnecessary CDK elements
cd $template_dir/cdk-solution-helper
echo "Run the helper to clean-up the templates and remove unnecessary CDK elements"
echo "node $template_dir/cdk-solution-helper/index"
node $template_dir/cdk-solution-helper/index
if [ "$?" = "1" ]; then
	echo "(cdk-solution-helper) ERROR: there is likely output above." 1>&2
	exit 1
fi

# Find and replace bucket_name, solution_name, and version
echo "Find and replace bucket_name, solution_name, and version"
cd $template_dist_dir
echo "Updating code source bucket in template with $1"
replace="s/%%BUCKET_NAME%%/$1/g"
run sedi $replace $template_dist_dir/*.template
replace="s/%%SOLUTION_NAME%%/$2/g"
run sedi $replace $template_dist_dir/*.template
replace="s/%%VERSION%%/$VERSION/g"
run sedi $replace $template_dist_dir/*.template


echo "------------------------------------------------------------------------------"
echo "[Packing] Source code artifacts"
echo "------------------------------------------------------------------------------"

# ... For each asset.* source code artifact in the temporary /staging folder...
cd $staging_dist_dir
for d in `find . -mindepth 1 -maxdepth 1 -type d`; do

    # pfname = asset.<key-name>
    pfname="$(basename -- $d)"

    # zip folder
    echo "zip -rq $pfname.zip $pfname"
    cd $pfname
    zip -rq $pfname.zip *
    mv $pfname.zip ../
    cd ..

    # Remove the old, unzipped artifact from /staging
    echo "rm -rf $pfname"
    rm -rf $pfname

    # ... repeat until all source code artifacts are zipped and placed in the /staging
done


# ... For each asset.*.zip code artifact in the temporary /staging folder...
cd $staging_dist_dir
for f in `find . -iname \*.zip`; do
    # Rename the artifact, removing the period for handler compatibility
    # pfname = asset.<key-name>.zip
    pfname="$(basename -- $f)"
    echo $pfname
    # fname = <key-name>.zip
    fname="$(echo $pfname | sed -e 's/asset\.//g')"
    mv $pfname $fname

    # Copy the zipped artifact from /staging to /regional-s3-assets
    echo "cp $fname $build_dist_dir"
    cp $fname $build_dist_dir

    # Remove the old, zipped artifact from /staging
    echo "rm $fname"
    rm $fname
done

# cleanup temporary generated files that are not needed for later stages of the build pipeline
cleanup_temporary_generted_files


