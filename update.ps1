# Applies the newest kernel-update zip from Downloads, publishes the website,
# and also publishes the email functions when the zip contains them.
if (-not (Test-Path .\firebase.json)) { Write-Host "Open PowerShell inside your project folder (the one with firebase.json), then run this again."; exit }
$zip = Get-ChildItem "$HOME\Downloads\kernel-update*.zip" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $zip) { Write-Host "No kernel-update zip found in your Downloads folder. Download it from the chat first."; exit }
Write-Host "Using $($zip.Name)"
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead($zip.FullName)
$hasFn = (@($z.Entries | Where-Object { $_.FullName -like 'functions/*' })).Count -gt 0
$z.Dispose()
Expand-Archive -Path $zip.FullName -DestinationPath . -Force
git add .
git commit -m "Update from Claude"
git push
firebase deploy --only hosting
if ($hasFn) {
  Write-Host "Publishing the email functions..."
  firebase deploy --only functions
}
Remove-Item $zip.FullName
Write-Host "Finished. Read the lines above: you should see 'Deploy complete!' for each deploy."
