# Applies the newest kernel-update zip from Downloads to this project, then publishes it.
if (-not (Test-Path .\firebase.json)) { Write-Host "Open PowerShell inside your project folder (the one with firebase.json), then run this again."; exit }
$zip = Get-ChildItem "$HOME\Downloads\kernel-update*.zip" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $zip) { Write-Host "No kernel-update zip found in your Downloads folder. Download it from the chat first."; exit }
Write-Host "Using $($zip.Name)"
Expand-Archive -Path $zip.FullName -DestinationPath . -Force
git add .
git commit -m "Update from Claude"
git push
firebase deploy --only hosting
Remove-Item $zip.FullName
Write-Host "Done. Your site is updated."
