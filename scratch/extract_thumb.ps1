Add-Type -AssemblyName System.Drawing
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.FileProperties.ThumbnailMode, Windows.Storage, ContentType = WindowsRuntime] | Out-Null

$path = "c:\Users\meena\Downloads\zavique\assets\videos\gemini_generated_video_35f981ba.mp4"

function Get-VideoThumbnail {
    try {
        $fileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($path)
        $file = $fileTask.GetAwaiter().GetResult()
        $thumbTask = $file.GetThumbnailAsync([Windows.Storage.FileProperties.ThumbnailMode]::VideosView, 1280)
        $thumb = $thumbTask.GetAwaiter().GetResult()
        if ($thumb) {
            $stream = $thumb.AsStreamForRead()
            $bmp = [System.Drawing.Bitmap]::FromStream($stream)
            $bmp.Save("c:\Users\meena\Downloads\zavique\scratch\extracted_thumb.png", [System.Drawing.Imaging.ImageFormat]::Png)
            Write-Output "Thumbnail saved successfully!"
        } else {
            Write-Output "No thumbnail found."
        }
    } catch {
        Write-Output "Error: $_"
    }
}

Get-VideoThumbnail
