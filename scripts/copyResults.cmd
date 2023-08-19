
echo off
set output_file=".\data\data.js"

echo const jsonData = > %output_file%
type ..\QuantConnect\LeanStorage\Results\PaoloHourETHEURAlgorithm.json >> %output_file%
