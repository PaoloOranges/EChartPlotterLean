#! /bin/bash

output_file="./data/data.js"

echo const jsonData = > $output_file
cat ../QuantConnect/LeanStorage/Results/PaoloHourETHEURAlgorithm.json >> $output_file
