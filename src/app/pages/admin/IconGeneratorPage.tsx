import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Download, Image, Check, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  generateIconSVG, 
  generateShortcutIconSVG,
  generateAllIcons,
  downloadIconAsPNG,
  ICON_SIZES,
  SHORTCUT_ICONS,
  svgToDataURL,
} from '../../utils/iconGenerator';

// Skeleton Component
function IconGeneratorSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 pb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-7 w-56 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Preview Section Skeleton */}
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2 border-b pb-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-28" />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generator Section Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IconGeneratorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [selectedPreview, setSelectedPreview] = useState<'main' | 'maskable' | 'shortcut'>('main');

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <IconGeneratorSkeleton />;
  }

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setGeneratedCount(0);
    
    try {
      const icons = generateAllIcons();
      
      for (let i = 0; i < icons.length; i++) {
        const icon = icons[i];
        await downloadIconAsPNG(icon.svg, icon.filename, icon.size);
        setGeneratedCount(i + 1);
        // Small delay to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      toast.success(`Successfully generated ${icons.length} icons`);
    } catch (error) {
      console.error('Error generating icons:', error);
      toast.error('Error generating icons. Please try again.');
    } finally {
      setIsGenerating(false);
      setGeneratedCount(0);
    }
  };

  const handleGenerateSingle = async (size: number, maskable: boolean = false) => {
    const svg = generateIconSVG(size, {
      text: 'E',
      background: 'gradient',
      maskable,
    });
    await downloadIconAsPNG(svg, `icon-${size}x${size}.png`, size);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Image className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">PWA Icon Generator</h1>
              <p className="text-sm text-muted-foreground">Generate all required icons for Ezyify PWA</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Preview Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how icons look at different sizes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview Tabs */}
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => setSelectedPreview('main')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      selectedPreview === 'main'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Main Icons
                  </button>
                  <button
                    onClick={() => setSelectedPreview('maskable')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      selectedPreview === 'maskable'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Maskable Icons
                  </button>
                  <button
                    onClick={() => setSelectedPreview('shortcut')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      selectedPreview === 'shortcut'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Shortcuts
                  </button>
                </div>

                {/* Main Icons Preview */}
                {selectedPreview === 'main' && (
                  <div className="grid grid-cols-4 gap-4">
                    {ICON_SIZES.map(size => (
                      <div key={size} className="text-center">
                        <div 
                          className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center p-2"
                          dangerouslySetInnerHTML={{
                            __html: generateIconSVG(size, { text: 'E', background: 'gradient', maskable: false })
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{size}px</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Maskable Icons Preview */}
                {selectedPreview === 'maskable' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[192, 512].map(size => (
                        <div key={size} className="text-center">
                          <div 
                            className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center p-2"
                            dangerouslySetInnerHTML={{
                              __html: generateIconSVG(size, { text: 'E', background: 'gradient', maskable: true })
                            }}
                          />
                          <p className="text-sm text-muted-foreground mt-2">{size}x{size} (Maskable)</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-muted p-4 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        ℹ️ Maskable icons have rounded corners and safe area to prevent content from being cut off on different devices.
                      </p>
                    </div>
                  </div>
                )}

                {/* Shortcut Icons Preview */}
                {selectedPreview === 'shortcut' && (
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(SHORTCUT_ICONS).map(([name, path]) => (
                      <div key={name} className="text-center">
                        <div 
                          className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center p-2"
                          dangerouslySetInnerHTML={{
                            __html: generateShortcutIconSVG(path, { size: 96, background: 'gradient' })
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Testing Preview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Background Testing</CardTitle>
                <CardDescription>Test icon visibility on different backgrounds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {/* White background */}
                  <div className="bg-card p-4 rounded-2xl border">
                    <div 
                      className="w-full aspect-square flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: generateIconSVG(96, { text: 'E', background: 'gradient' })
                      }}
                    />
                    <p className="text-xs text-center mt-2 text-muted-foreground">White BG</p>
                  </div>

                  {/* Black background */}
                  <div className="bg-muted p-4 rounded-xl">
                    <div 
                      className="w-full aspect-square flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: generateIconSVG(96, { text: 'E', background: 'gradient' })
                      }}
                    />
                    <p className="text-xs text-center mt-2 text-foreground">Black BG</p>
                  </div>

                  {/* Colored background */}
                  <div className="bg-primary p-4 rounded-xl">
                    <div 
                      className="w-full aspect-square flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: generateIconSVG(96, { text: 'E', background: 'gradient' })
                      }}
                    />
                    <p className="text-xs text-center mt-2 text-muted-foreground">Colored BG</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generator Section */}
          <div className="space-y-6">
            {/* Generate All */}
            <Card>
              <CardHeader>
                <CardTitle>Generate All Icons</CardTitle>
                <CardDescription>
                  Generate all {generateAllIcons().length} required icons at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-xl space-y-2">
                  <h4 className="font-medium text-sm text-foreground">This will generate:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      8 PWA manifest icons (72px to 512px)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      4 app shortcut icons (Home, Shop, Upload, Messages)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      2 favicon sizes (16px, 32px)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      1 Apple touch icon (180px)
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleGenerateAll}
                  disabled={isGenerating}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating... ({generatedCount}/{generateAllIcons().length})
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate All Icons
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="bg-muted p-3 rounded-xl">
                    <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${(generatedCount / generateAllIcons().length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Individual Icons */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Individual Icons</CardTitle>
                <CardDescription>Download specific icon sizes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3 text-foreground">Main Icons</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_SIZES.map(size => (
                      <Button
                        key={size}
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateSingle(size, size === 192 || size === 512)}
                        className="text-xs"
                      >
                        {size}px
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3 text-foreground">Shortcut Icons</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(SHORTCUT_ICONS).map(([name, path]) => (
                      <Button
                        key={name}
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const svg = generateShortcutIconSVG(path, { size: 96 });
                          await downloadIconAsPNG(svg, `shortcut-${name}.png`, 96);
                        }}
                        className="text-xs capitalize"
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Installation Instructions</CardTitle>
                <CardDescription>How to use the generated icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">1. Download Icons</h4>
                  <p>Click "Generate All Icons" to download all required icon files.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">2. Organize Files</h4>
                  <p>Place files in your project:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>icon-*.png → /public/icons/</li>
                    <li>shortcut-*.png → /public/icons/</li>
                    <li>favicon-*.png → /public/</li>
                    <li>apple-touch-icon.png → /public/</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">3. Convert Favicon</h4>
                  <p>
                    Use <a href="https://favicon.io/favicon-converter/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">favicon.io</a> to convert favicon-32x32.png to .ico format
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">4. Test Installation</h4>
                  <p>Build and test your PWA to ensure icons display correctly.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Note */}
        <Card className="mt-6">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              ℹ️ These are placeholder icons. For production, consider hiring a professional designer to create custom branded icons.
              See <code className="bg-muted px-2 py-1 rounded text-xs">/PWA_ICON_SPECIFICATIONS.md</code> for detailed design guidelines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}