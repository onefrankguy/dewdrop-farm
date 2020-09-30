#!/bin/bash

set -ex

git checkout master
commit=$(git log --before="$1 23:59" --max-count=1 --oneline | cut -f 1 -d ' ')
git checkout $commit
npm install
