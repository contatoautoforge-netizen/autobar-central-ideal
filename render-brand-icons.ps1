Add-Type -AssemblyName System.Drawing
$base = Join-Path $PSScriptRoot 'brand'
$master = [System.Drawing.Bitmap]::new(512, 512)
$graphics = [System.Drawing.Graphics]::FromImage($master)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::Transparent)
$shape = [System.Drawing.Drawing2D.GraphicsPath]::new()
$radius = 104
$shape.AddArc(0, 0, $radius, $radius, 180, 90)
$shape.AddArc(512 - $radius, 0, $radius, $radius, 270, 90)
$shape.AddArc(512 - $radius, 512 - $radius, $radius, $radius, 0, 90)
$shape.AddArc(0, 512 - $radius, $radius, $radius, 90, 90)
$shape.CloseFigure()
$dark = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#202528'))
$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$orange = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#f26522'))
$graphics.FillPath($dark, $shape)
$font = [System.Drawing.Font]::new('Arial Black', 255, [System.Drawing.FontStyle]::Bold -bor [System.Drawing.FontStyle]::Italic, [System.Drawing.GraphicsUnit]::Pixel)
$graphics.DrawString('G', $font, $white, -2, 99)
$graphics.DrawString('B', $font, $orange, 235, 99)
foreach ($size in 64, 180, 192, 512) {
  $image = [System.Drawing.Bitmap]::new($size, $size)
  $surface = [System.Drawing.Graphics]::FromImage($image)
  $surface.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $surface.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $surface.DrawImage($master, 0, 0, $size, $size)
  $name = switch ($size) { 64 { 'gelabar-favicon.png' } 180 { 'gelabar-touch.png' } 192 { 'gelabar-192.png' } 512 { 'gelabar-512.png' } }
  $image.Save((Join-Path $base $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $surface.Dispose()
  $image.Dispose()
}
$font.Dispose()
$orange.Dispose()
$white.Dispose()
$dark.Dispose()
$shape.Dispose()
$graphics.Dispose()
$master.Dispose()
