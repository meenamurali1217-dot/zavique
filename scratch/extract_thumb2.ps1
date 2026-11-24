Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.IsGenericMethod } | Select-Object -First 1

$path = "c:\Users\meena\Downloads\zavique\assets\videos\gemini_generated_video_35f981ba.mp4"

try {
    $op = [Windows.Storage.StorageFile]::GetFileFromPathAsync($path)
    $task = $asTaskGeneric.MakeGenericMethod([Windows.Storage.StorageFile]).Invoke($null, @($op))
    $file = $task.Result
    
    $thumbOp = $file.GetThumbnailAsync([Windows.Storage.FileProperties.ThumbnailMode]::VideosView, 1280)
    $thumbTask = $asTaskGeneric.MakeGenericMethod([Windows.Storage.FileProperties.StorageItemThumbnail]).Invoke($null, @($thumbOp))
    $thumb = $thumbTask.Result
    
    if ($thumb) {
        $stream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($thumb)
        $bmp = [System.Drawing.Bitmap]::FromStream($stream)
        $bmp.Save("c:\Users\meena\Downloads\zavique\scratch\extracted_thumb.png", [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "Thumbnail saved successfully: $($bmp.Width)x$($bmp.Height)"
    }
} catch {
    Write-Output "Error: $_"
}
