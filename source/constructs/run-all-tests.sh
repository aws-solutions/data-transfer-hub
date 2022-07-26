#!/bin/bash
#
# This script runs all tests for the root CDK project, as well as any microservices, Lambda functions, or dependency 
# source code packages. These include unit tests, integration tests, and snapshot tests.
# 
# This script is called by the ../initialize-repo.sh file and the buildspec.yml file. It is important that this script 
# be tested and validated to ensure that all available test fixtures are run.
#
# The if/then blocks are for error handling. They will cause the script to stop executing if an error is thrown from the
# node process running the test case(s). Removing them or not using them for additional calls with result in the 
# script continuing to execute despite an error being thrown.

[ "$DEBUG" == 'true' ] && set -x
set -e

setup_python_env() {
	if [ -d "./.venv-test" ]; then
		echo "Reusing already setup python venv in ./.venv-test. Delete ./.venv-test if you want a fresh one created."
		return
	fi

  echo "Setting up python venv"
	python3 -m venv .venv-test
	echo "Initiating virtual environment"
	source .venv-test/bin/activate

    echo "Installing python packages"
    # install test dependencies in the python virtual environment
	pip3 install -r test/requirements-test.txt
	# pip3 install -r requirements.txt --target .

	echo "deactivate virtual environment"
	deactivate
}

run_python_test() {
	local component_path=$1
	local component_name=$2

	echo "------------------------------------------------------------------------------"
	echo "[Test] Run python unit test with coverage for $component_path $component_name"
	echo "------------------------------------------------------------------------------"
	cd $component_path

	if [ "${CLEAN:-true}" = "true" ]; then
        rm -fr .venv-test
    fi

	setup_python_env

	echo "Initiating virtual environment"
	source .venv-test/bin/activate

	# setup coverage report path
	mkdir -p $source_dir/tests/coverage-reports
	coverage_report_path=$source_dir/tests/coverage-reports/$component_name.coverage.xml
	echo "coverage report path set to $coverage_report_path"

	# Use -vv for debugging
	python3 -m pytest -s --cov --cov-report=term-missing --cov-report "xml:$coverage_report_path"

    # The pytest --cov with its parameters and .coveragerc generates a xml cov-report with `coverage/sources` list
    # with absolute path for the source directories. To avoid dependencies of tools (such as SonarQube) on different
    # absolute paths for source directories, this substitution is used to convert each absolute source directory
    # path to the corresponding project relative path. The $source_dir holds the absolute path for source directory.
    sed -i -e "s,<source>$source_dir,<source>source,g" $coverage_report_path

	echo "deactivate virtual environment"
	deactivate

	if [ "${CLEAN:-true}" = "true" ]; then
		rm -fr .venv-test
		rm .coverage
		rm -fr .pytest_cache
		rm -fr __pycache__ test/__pycache__
	fi
}

run_cdk_project_test() {
	local component_path=$1
  	local component_name=solutions-constructs

	echo "------------------------------------------------------------------------------"
	echo "[Test] $component_name"
	echo "------------------------------------------------------------------------------"
    cd $component_path

	# install and build for unit testing
	npm install

	## Option to suppress the Override Warning messages while synthesizing using CDK
	# export overrideWarningsEnabled=false

	# run unit tests
	npm run test -- -u
}

# Save the current working directory
source_dir=$PWD
echo $source_dir

# Run unit tests
echo "Running unit tests"

coverage_reports_top_path=$source_dir/test/coverage-reports

# Test the CDK project
construct_dir=$source_dir
run_cdk_project_test $construct_dir

# Test the attached Lambda function
run_python_test $construct_dir/lambda/api api
run_python_test $construct_dir/lambda/custom-resource custom-resource

# Return to the source/ level
cd $source_dir