
'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Code, Loader2, ClipboardCopy, Check, Smartphone, Tablet, Monitor, Maximize2, Minimize2, X, Plus, Laptop, Paintbrush, GripVertical, Palette, ExternalLink, Share2, Wrench, RefreshCw, Beaker, Ruler, Sparkles, LayoutGrid, Columns, PanelLeft, PanelTop, Menu } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ResponsivePreview } from '@/components/responsive-preview';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { generateCode } from '@/ai/flows/suggest-viewport-sizes';
import type { GenerateCodeOutput } from '@/ai/flows/suggest-viewport-sizes';
import { auditUrl } from '@/ai/flows/audit-url';
import type { AuditUrlOutput } from '@/ai/flows/audit-url';
import { critiqueUi } from '@/ai/flows/critique-ui';
import type { CritiqueUiOutput } from '@/ai/flows/critique-ui';
import { refactorCode } from '@/ai/flows/refactor-code';
import type { RefactorCodeOutput } from '@/ai/flows/refactor-code';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


const predefinedDevices = [
    { name: 'Custom', width: 0, height: 0 },
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Air', width: 820, height: 1180 },
    { name: 'Desktop', width: 1440, height: 900 },
];

const wallpapers = [
  { name: 'None', value: 'none', style: { backgroundImage: 'none' } },
  { name: 'Aurora', value: 'aurora', style: { backgroundImage: 'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop)' } },
  { name: 'Pastel', value: 'pastel', style: { backgroundImage: 'url(https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?auto=format&fit=crop)' } },
  { name: 'Summit', value: 'summit', style: { backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop)' } },
  { name: 'Geometry', value: 'geometry', style: { backgroundImage: 'url(https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop)' } },
];

const themes = [
    { name: 'Default', value: 'default' },
    { name: 'Midnight', value: 'theme-midnight' },
    { name: 'Latte', value: 'theme-latte' },
    { name: 'Solar Flare', value: 'theme-solar-flare' },
];

const layouts = [
    { value: 'dynamic', label: 'Dynamic Columns', icon: Columns },
    { value: 'grid', label: 'Grid', icon: LayoutGrid },
    { value: 'focus-left', label: 'Focus Left', icon: PanelLeft },
    { value: 'focus-top', label: 'Focus Top', icon: PanelTop },
];

interface PreviewWorkspaceProps {
  url: string;
  setUrl: (url: string) => void;
  previews: any[];
  setPreviews: (previews: any[] | ((current: any[]) => any[])) => void;
  background: string;
  setBackground: (background: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  isSharedSession: boolean;
  onShare?: () => void;
  onLiveUrlChange: (previewId: string, newUrl: string) => void;
  lastInteractedUrl: string | null;
  maximizedId: string | null;
  setMaximizedId: (id: string | null) => void;
}

function PreviewPanel({ preview, onRemove, onToggleDevTools, onRefresh, onAudit, isMaximized, onMaximize, onMinimize, handleProps, isDragging, isOverlay, isResizing, isWallpaperActive }: { preview: any; onRemove: (id: string) => void; onToggleDevTools: (id: string) => void; onRefresh: (id: string) => void; onAudit: (url: string) => void; isMaximized: boolean; onMaximize: (id: string) => void; onMinimize: () => void; handleProps: any; isDragging: boolean; isOverlay: boolean; isResizing: boolean; isWallpaperActive: boolean; }) {

  const deviceType = preview.width < 768 ? 'mobile' : preview.width < 1024 ? 'tablet' : 'desktop';

  const handleOpenInNewTab = () => {
    window.open(preview.liveUrl, '_blank');
  };
  
  const showDragPlaceholder = isDragging || isOverlay;
  
  return (
    <div className={cn("h-full w-full", isOverlay && "p-2")}>
      <div className={cn(
        "flex flex-col h-full rounded-lg overflow-hidden shadow-lg transition-all duration-300",
        isWallpaperActive ? 'bg-black/20 backdrop-blur-lg border border-white/10' : 'bg-background border border-border',
        isDragging && "opacity-50"
      )}>
        <div className={cn(
            "flex items-center justify-between gap-2 p-2 font-semibold shrink-0 text-card-foreground transition-all duration-300",
            isWallpaperActive ? 'bg-black/20 border-b border-white/10' : 'bg-card border-b border-border'
        )}>
          <div className="flex items-center gap-1 overflow-hidden">
            {handleProps && !isMaximized && (
                <div {...handleProps} className="cursor-grab touch-none p-1">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                </div>
            )}
            {deviceType === 'mobile' && <Smartphone className="w-5 h-5 shrink-0" />}
            {deviceType === 'tablet' && <Tablet className="w-5 h-5 shrink-0" />}
            {deviceType === 'desktop' && <Monitor className="w-5 h-5 shrink-0" />}
            <span className="truncate" title={preview.title}>{preview.title}</span>
            {preview.isDevToolsOpen && (
              <div className="w-2 h-2 ml-2 rounded-full shrink-0 bg-accent animate-pulse" title="DevTools Active" />
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => onAudit(preview.liveUrl)}>
                          <Beaker className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>AI Audit</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                          variant={preview.isDevToolsOpen ? 'secondary' : 'ghost'} 
                          size="icon" 
                          className="w-6 h-6" 
                          onClick={() => onToggleDevTools(preview.id)}
                        >
                          <Wrench className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle DevTools</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => onRefresh(preview.id)}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Refresh</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleOpenInNewTab}>
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Open in new tab</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-6 h-6" onClick={isMaximized ? onMinimize : () => onMaximize(preview.id)}>
                          {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isMaximized ? 'Minimize' : 'Maximize'}</p>
                    </TooltipContent>
                </Tooltip>
                {!isMaximized && 
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => onRemove(preview.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Remove</p>
                      </TooltipContent>
                  </Tooltip>
                }
            </TooltipProvider>
          </div>
        </div>
        <div className={cn("relative flex-1 overflow-hidden", isWallpaperActive ? 'bg-transparent' : 'bg-muted/20')}>
          {showDragPlaceholder ? (
             <div className="flex items-center justify-center w-full h-full bg-card">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <ResponsivePreview
                key={`${preview.id}-${preview.refreshKey || 0}`}
                id={preview.id}
                url={preview.liveUrl}
                width={preview.width}
                height={preview.height}
                title={preview.title}
                isDevToolsOpen={preview.isDevToolsOpen}
                isWallpaperActive={isWallpaperActive}
              />
              {isResizing && (
                <div className="absolute inset-0 z-10" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SortablePreviewPanel({ preview, isWallpaperActive, ...props }: { preview: any; onRemove: (id: string) => void; onToggleDevTools: (id: string) => void; onRefresh: (id: string) => void; onAudit: (url: string) => void; isMaximized: boolean; onMaximize: (id: string) => void; onMinimize: () => void; isResizing: boolean; isWallpaperActive: boolean; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useSortable({ id: preview.id });

  return (
    <div ref={setNodeRef} className="w-full h-full p-2">
      <PreviewPanel
        preview={preview}
        {...props}
        isWallpaperActive={isWallpaperActive}
        isDragging={isDragging}
        isOverlay={false}
        handleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

type AuditReport = AuditUrlOutput & CritiqueUiOutput;

export function PreviewWorkspace({
  url,
  setUrl,
  previews,
  setPreviews,
  background,
  setBackground,
  theme,
  setTheme,
  isSharedSession,
  onShare,
  onLiveUrlChange,
  lastInteractedUrl,
  maximizedId,
  setMaximizedId,
}: PreviewWorkspaceProps) {
  const [prompt, setPrompt] = useState('');
  const [refactorCodeInput, setRefactorCodeInput] = useState('');
  const [refactorInstructions, setRefactorInstructions] = useState('');
  const [isPending, startTransition] = useTransition();
  const [generateResponse, setGenerateResponse] = useState<GenerateCodeOutput | null>(null);
  const [refactorResponse, setRefactorResponse] = useState<RefactorCodeOutput | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [hasMounted, setHasMounted] = useState(false);
  
  const { toast } = useToast();

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isAddPreviewDialogOpen, setAddPreviewDialogOpen] = useState(false);

  const [newPreviewWidth, setNewPreviewWidth] = useState('');
  const [newPreviewHeight, setNewPreviewHeight] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('Custom');
  const [activeId, setActiveId] = useState<string | null>(null);

  const [auditResult, setAuditResult] = useState<AuditReport | null>(null);
  const [isAuditPending, startAuditTransition] = useTransition();
  const [isAuditDialogOpen, setAuditDialogOpen] = useState(false);
  
  const [rulersVisible, setRulersVisible] = useState(false);
  const [layout, setLayout] = useState('dynamic');
  const [isResizing, setIsResizing] = useState(false);
  
  const isMobile = useIsMobile();
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = React.useState(0)


  useEffect(() => {
    setHasMounted(true);

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'drishtidev-url-update') {
        const { url: newUrl, previewId } = event.data;
        if (newUrl && previewId) {
            onLiveUrlChange(previewId, newUrl);
        }
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onLiveUrlChange]);

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  useEffect(() => {
    const root = document.documentElement;
    const themeClasses = themes.map(t => t.value).filter(v => v !== 'default');
    
    themeClasses.forEach(tClass => root.classList.remove(tClass));

    if (theme !== 'default') {
        root.classList.add(theme);
    }
    
    if (theme === 'theme-latte') {
        root.classList.remove('dark');
    } else {
        if (!root.classList.contains('dark')) {
            root.classList.add('dark');
        }
    }
  }, [theme]);
  
  useEffect(() => {
    if (!carouselApi) {
      return
    }
 
    setCurrentSlide(carouselApi.selectedScrollSnap())
 
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    if(maximizedId) return;
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
      const {active, over} = event;

      if (over && active.id !== over.id) {
        setPreviews(items => {
          if (!Array.isArray(items)) return [];
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
      setActiveId(null);
  }

  const handleGenerate = () => {
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Prompt is empty',
        description: 'Please enter a description for the component you want to generate.',
      });
      return;
    }
    setError(null);
    setGenerateResponse(null);
    startTransition(async () => {
      try {
        const response = await generateCode({ prompt });
        setGenerateResponse(response);
      } catch (e) {
        console.error(e);
        setError((e as Error).message || 'An unexpected error occurred.');
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: 'Could not generate the component. Please try again.',
        });
      }
    });
  };

  const handleRefactor = () => {
    if (!refactorCodeInput) {
      toast({
        variant: 'destructive',
        title: 'Code is empty',
        description: 'Please paste the code you want to refactor.',
      });
      return;
    }
     if (!refactorInstructions) {
      toast({
        variant: 'destructive',
        title: 'Instructions are empty',
        description: 'Please provide instructions for the refactor.',
      });
      return;
    }
    setError(null);
    setRefactorResponse(null);
    startTransition(async () => {
      try {
        const response = await refactorCode({ code: refactorCodeInput, instructions: refactorInstructions });
        setRefactorResponse(response);
      } catch (e) {
        console.error(e);
        setError((e as Error).message || 'An unexpected error occurred.');
        toast({
          variant: 'destructive',
          title: 'Refactor Failed',
          description: 'Could not refactor the component. Please try again.',
        });
      }
    });
  };
  
  const handleAudit = (auditUrlTarget: string) => {
    if (!auditUrlTarget) {
      toast({
        variant: 'destructive',
        title: 'Audit Failed',
        description: 'URL is empty.',
      });
      return;
    }
      
    setAuditResult(null);
    setAuditDialogOpen(true);
    
    startAuditTransition(async () => {
      try {
        const analysisPayload: { url: string; htmlContent?: string } = { url: auditUrlTarget };

        if (auditUrlTarget.includes('localhost')) {
            const fetchUrl = `/api/fetch-html?url=${encodeURIComponent(auditUrlTarget)}`;
            const htmlResponse = await fetch(fetchUrl);
            if (!htmlResponse.ok) {
                const errorText = await htmlResponse.text();
                toast({
                    variant: 'destructive',
                    title: 'Audit Failed',
                    description: errorText || `Failed to fetch from /api/fetch-html: ${htmlResponse.statusText}`,
                });
                setAuditDialogOpen(false);
                return;
            }
            analysisPayload.htmlContent = await htmlResponse.text();
        }

        const [auditResponse, critiqueResponse] = await Promise.all([
            auditUrl(analysisPayload),
            critiqueUi(analysisPayload),
        ]);

        setAuditResult({ ...auditResponse, ...critiqueResponse });

      } catch (e) {
        console.error(e);
        toast({
          variant: 'destructive',
          title: 'Audit Failed',
          description: (e as Error).message || 'Could not audit the page. Please try again.',
        });
        setAuditDialogOpen(false);
      }
    });
  };

  const copyToClipboard = (text: string, type: 'Code' | 'URL') => {
    navigator.clipboard.writeText(text);
    if(type === 'Code') {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    }
    toast({
      title: 'Copied!',
      description: `${type} copied to clipboard.`,
    });
  };

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newUrlValue = currentUrl;
    if (!(newUrlValue.startsWith('http://') || newUrlValue.startsWith('https://'))) {
      if (newUrlValue.includes('localhost')) {
        newUrlValue = `http://${newUrlValue}`;
      } else {
        newUrlValue = `https://${newUrlValue}`;
      }
    }
    setUrl(newUrlValue);
  };

  const handlePreviewLocal = () => {
    const baseUrl = 'http://localhost:3000';
    setCurrentUrl(baseUrl);
    setUrl(baseUrl);
    toast({
      title: 'Previewing Local App',
      description: 'URL set to localhost:3000. HMR is enabled.',
    });
  };

  const handleRemove = (id: string) => {
    setPreviews((currentPreviews: any[]) => currentPreviews.filter(p => p.id !== id));
  };

  const openAddPreviewDialog = () => {
    if (!isMobile && previews.length >= 4 && layout === 'grid') {
      toast({
        variant: 'destructive',
        title: 'Layout Full',
        description: 'You can only have a maximum of 4 previews in grid layout.',
      });
      return;
    }
    setAddPreviewDialogOpen(true);
    setSelectedDevice('Custom');
    setNewPreviewWidth('');
    setNewPreviewHeight('');
  }

  const handleDeviceChange = (deviceName: string) => {
    setSelectedDevice(deviceName);
    const device = predefinedDevices.find(d => d.name === deviceName);
    if (device && device.name !== 'Custom') {
        setNewPreviewWidth(String(device.width));
        setNewPreviewHeight(String(device.height));
    } else {
        setNewPreviewWidth('');
        setNewPreviewHeight('');
    }
  };

  const handleAddPreviewSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const width = parseInt(newPreviewWidth, 10);
    const height = parseInt(newPreviewHeight, 10);

    if (!width || !height || width <= 0 || height <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid dimensions',
        description: 'Please enter a valid positive width and height.',
      });
      return;
    }

    const selected = predefinedDevices.find(d => d.name === selectedDevice);
    const title = (selected && selected.name !== 'Custom') ? selected.name : `${width}x${height}`;

    const newPreview = {
      id: uuidv4(),
      width,
      height,
      title: title,
      isDevToolsOpen: false,
      refreshKey: 0,
      liveUrl: url,
    };

    setPreviews((currentPreviews) => [...currentPreviews, newPreview]);
    setAddPreviewDialogOpen(false);
  };

  const handleToggleDevTools = (id: string) => {
    setPreviews((currentPreviews) => currentPreviews.map(p => 
      p.id === id ? { ...p, isDevToolsOpen: !p.isDevToolsOpen } : p
    ));
  };
  
  const handleRefresh = (id: string) => {
    setPreviews((currentPreviews: any[]) =>
      currentPreviews.map(p => {
        if (p.id === id) {
          // Reset liveUrl to the main url on refresh
          return { ...p, liveUrl: url, refreshKey: (p.refreshKey || 0) + 1 };
        }
        return p;
      })
    );
  };
  
  const handleSyncPreviews = () => {
    if (lastInteractedUrl) {
      setUrl(lastInteractedUrl);
      toast({
        title: 'Previews Synced',
        description: `All previews are now showing the new URL.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Nothing to Sync',
        description: 'Enable DevTools on a preview and navigate to a new page first.',
      });
    }
  };

  const openAiAssistant = () => {
    setGenerateResponse(null);
    setRefactorResponse(null);
    setError(null);
    setPrompt('');
    setRefactorCodeInput('');
    setRefactorInstructions('');
    setIsGeneratorOpen(true)
  }

  const selectedWallpaperStyle = wallpapers.find(w => w.value === background)?.style || {};
  const isWallpaperActive = background !== 'none';
  const activePreviewData = activeId ? previews.find(p => p.id === activeId) : null;
  const maximizedPreview = previews.find(p => p.id === maximizedId);

  const renderLayout = () => {
    const count = previews.length;
  
    if (!hasMounted) {
      return (
        <div className="w-full h-full p-4">
          <div className="flex items-center justify-center w-full h-full border rounded-lg bg-card border-border">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      );
    }
  
    if (count === 0) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-background/50">
          <Button variant="outline" size="lg" onClick={openAddPreviewDialog}>
            <Plus className="mr-2" /> Add a Preview to Get Started
          </Button>
        </div>
      );
    }

    const renderPreviewItem = (p: any, isCarouselItem = false) => (
      <div className={cn("w-full h-full", isCarouselItem ? "flex items-center justify-center" : "p-2")}>
        <div className={cn(isCarouselItem && "w-full h-full p-2")}>
            <PreviewPanel
                key={p.id}
                preview={p}
                onRemove={handleRemove}
                onToggleDevTools={handleToggleDevTools}
                onRefresh={handleRefresh}
                onAudit={handleAudit}
                onMaximize={setMaximizedId}
                onMinimize={() => setMaximizedId(null)}
                isMaximized={p.id === maximizedId}
                isResizing={isResizing}
                isWallpaperActive={isWallpaperActive}
                handleProps={null}
                isDragging={false}
                isOverlay={false}
            />
        </div>
      </div>
    );
  
    if (isMobile) {
      return (
        <Carousel setApi={setCarouselApi} className="w-full h-full">
          <CarouselContent>
            {previews.map((p) => (
              <CarouselItem key={p.id}>
                {renderPreviewItem(p, true)}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      );
    }

    const renderSortableItem = (p: any) => {
        return (
            <SortablePreviewPanel
                key={p.id}
                preview={p}
                onRemove={handleRemove}
                onToggleDevTools={handleToggleDevTools}
                onRefresh={handleRefresh}
                onAudit={handleAudit}
                onMaximize={setMaximizedId}
                onMinimize={() => setMaximizedId(null)}
                isMaximized={p.id === maximizedId}
                isResizing={isResizing}
                isWallpaperActive={isWallpaperActive}
            />
        );
    };
    
    // This key forces the ResizablePanelGroup to remount when the order of previews changes, fixing the resize handle bug.
    const panelGroupKey = previews.map(p => p.id).join('-');
    let layoutContent;

    switch (layout) {
        case 'grid':
            const gridClass = count < 2 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2';
            layoutContent = (
                <div className={cn("grid w-full h-full", gridClass)}>
                    {previews.map(renderSortableItem)}
                </div>
            );
            break;

        case 'focus-left':
            if (count < 2) {
                 layoutContent = (
                    <ResizablePanelGroup key={panelGroupKey} direction="horizontal" onLayout={() => {}}>
                        {previews.map(p => <ResizablePanel key={p.id}>{renderSortableItem(p)}</ResizablePanel>)}
                    </ResizablePanelGroup>
                 )
            } else {
                const innerKey = previews.slice(1).map(p => p.id).join('-');
                layoutContent = (
                    <ResizablePanelGroup key={panelGroupKey} direction="horizontal" onLayout={() => {}}>
                        <ResizablePanel defaultSize={66}>
                            {renderSortableItem(previews[0])}
                        </ResizablePanel>
                        <ResizableHandle withHandle onDragging={setIsResizing} />
                        <ResizablePanel defaultSize={34}>
                             <ResizablePanelGroup key={innerKey} direction="vertical">
                                {previews.slice(1).map((p, index) => (
                                    <React.Fragment key={p.id}>
                                        <ResizablePanel>
                                            {renderSortableItem(p)}
                                        </ResizablePanel>
                                        {index < previews.slice(1).length - 1 && <ResizableHandle withHandle onDragging={setIsResizing} />}
                                    </React.Fragment>
                                ))}
                             </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                );
            }
            break;
            
        case 'focus-top':
            if (count < 2) {
                layoutContent = (
                    <ResizablePanelGroup key={panelGroupKey} direction="horizontal" onLayout={() => {}}>
                        {previews.map(p => <ResizablePanel key={p.id}>{renderSortableItem(p)}</ResizablePanel>)}
                    </ResizablePanelGroup>
                )
            } else {
                 const innerKey = previews.slice(1).map(p => p.id).join('-');
                 layoutContent = (
                    <ResizablePanelGroup key={panelGroupKey} direction="vertical" onLayout={() => {}}>
                        <ResizablePanel defaultSize={66}>
                            {renderSortableItem(previews[0])}
                        </ResizablePanel>
                        <ResizableHandle withHandle onDragging={setIsResizing} />
                        <ResizablePanel defaultSize={34}>
                             <ResizablePanelGroup key={innerKey} direction="horizontal">
                                {previews.slice(1).map((p, index) => (
                                    <React.Fragment key={p.id}>
                                        <ResizablePanel>
                                            {renderSortableItem(p)}
                                        </ResizablePanel>
                                        {index < previews.slice(1).length - 1 && <ResizableHandle withHandle onDragging={setIsResizing} />}
                                    </React.Fragment>
                                ))}
                             </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                );
            }
            break;
        
        case 'dynamic':
        default:
            layoutContent = (
                <ResizablePanelGroup key={panelGroupKey} direction="horizontal" onLayout={() => {}}>
                    {previews.map((p, index) => (
                        <React.Fragment key={p.id}>
                            <ResizablePanel>
                                {renderSortableItem(p)}
                            </ResizablePanel>
                            {index < previews.length - 1 && <ResizableHandle withHandle onDragging={setIsResizing} />}
                        </React.Fragment>
                    ))}
                </ResizablePanelGroup>
            );
            break;
    }

    return (
        <SortableContext items={previews.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="w-full h-full">
                {layoutContent}
            </div>
        </SortableContext>
    );
  };

  const DesktopControls = () => (
    <div className="flex items-center shrink-0 gap-2">
      <TooltipProvider delayDuration={100}>
      <DropdownMenu>
          <Tooltip>
          <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                      <LayoutGrid />
                      <span className="sr-only">Change Layout</span>
                  </Button>
              </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
              <p>Change Layout</p>
          </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Panel Layout</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={layout} onValueChange={setLayout}>
                  {layouts.map((l) => (
                      <DropdownMenuRadioItem key={l.value} value={l.value}>
                          <l.icon className="w-4 h-4 mr-2" />
                          <span>{l.label}</span>
                      </DropdownMenuRadioItem>
                  ))}
              </DropdownMenuRadioGroup>
          </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
          <Tooltip>
          <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                  <Palette />
                  <span className="sr-only">Theme</span>
              </Button>
              </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
              <p>Theme</p>
          </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select a Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  {themes.map((t) => (
                      <DropdownMenuRadioItem key={t.value} value={t.value}>
                          {t.name}
                      </DropdownMenuRadioItem>
                  ))}
              </DropdownMenuRadioGroup>
          </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
          <Tooltip>
          <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                  <Paintbrush />
                  <span className="sr-only">Wallpaper</span>
              </Button>
              </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
              <p>Wallpaper</p>
          </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Select a background</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={background} onValueChange={setBackground}>
              {wallpapers.map(w => (
              <DropdownMenuRadioItem key={w.value} value={w.value}>{w.name}</DropdownMenuRadioItem>
              ))}
          </DropdownMenuRadioGroup>
          </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <Tooltip>
          <TooltipTrigger asChild>
              <Button variant={rulersVisible ? 'secondary' : 'outline'} size="icon" onClick={() => setRulersVisible(!rulersVisible)}>
                  <Ruler />
                  <span className="sr-only">Toggle Rulers</span>
              </Button>
          </TooltipTrigger>
          <TooltipContent>
              <p>Toggle Rulers</p>
          </TooltipContent>
      </Tooltip>
      
      <Tooltip>
          <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleSyncPreviews} disabled={!lastInteractedUrl}>
                  <RefreshCw />
                  <span className="sr-only">Sync Previews</span>
              </Button>
          </TooltipTrigger>
          <TooltipContent>
              <p>Sync Previews</p>
          </TooltipContent>
      </Tooltip>

      <Tooltip>
          <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={openAddPreviewDialog}>
              <Plus />
              <span className="sr-only">Add Preview</span>
          </Button>
          </TooltipTrigger>
          <TooltipContent>
          <p>Add Preview</p>
          </TooltipContent>
      </Tooltip>
      <Tooltip>
          <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handlePreviewLocal}>
                  <Laptop />
                  <span className="sr-only">Preview Local App</span>
              </Button>
          </TooltipTrigger>
          <TooltipContent>
             <p>Preview Local App</p>
          </TooltipContent>
      </Tooltip>
      {isSharedSession ? (
          <Tooltip>
              <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(window.location.href, 'URL')}>
                  <ClipboardCopy />
                  <span className="sr-only">Copy Session URL</span>
              </Button>
              </TooltipTrigger>
              <TooltipContent>
              <p>Copy Session URL</p>
              </TooltipContent>
          </Tooltip>
          ) : (
          onShare && <Tooltip>
              <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onShare}>
                  <Share2 />
                  <span className="sr-only">Share Session</span>
              </Button>
              </TooltipTrigger>
              <TooltipContent>
              <p>Share Session</p>
              </TooltipContent>
          </Tooltip>
          )}
      <Tooltip>
          <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={openAiAssistant}>
              <Sparkles />
              <span className="sr-only">AI Assistant</span>
          </Button>
          </TooltipTrigger>
          <TooltipContent>
          <p>AI Assistant</p>
          </TooltipContent>
      </Tooltip>
      </TooltipProvider>
    </div>
  );

  const MobileControls = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={openAiAssistant}>
          <Sparkles className="mr-2" /> AI Assistant
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Display Options</DropdownMenuLabel>
          {!isMobile && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <LayoutGrid className="mr-2" />
                    Change Layout
                </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                <DropdownMenuRadioGroup value={layout} onValueChange={setLayout}>
                    {layouts.map((l) => (
                    <DropdownMenuRadioItem key={l.value} value={l.value}>
                        <l.icon className="w-4 h-4 mr-2" />
                        <span>{l.label}</span>
                    </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Palette className="mr-2" />
                Theme
              </DropdownMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                {themes.map((t) => (
                  <DropdownMenuRadioItem key={t.value} value={t.value}>
                    {t.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Paintbrush className="mr-2" />
                Wallpaper
              </DropdownMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={background} onValueChange={setBackground}>
                {wallpapers.map((w) => (
                  <DropdownMenuRadioItem key={w.value} value={w.value}>
                    {w.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setRulersVisible(!rulersVisible)}>
          <Ruler className="mr-2" />
          {rulersVisible ? 'Hide Rulers' : 'Show Rulers'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSyncPreviews} disabled={!lastInteractedUrl}>
          <RefreshCw className="mr-2" />
          Sync Previews
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openAddPreviewDialog}>
          <Plus className="mr-2" />
          Add Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePreviewLocal}>
          <Laptop className="mr-2" />
          Preview Local App
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isSharedSession ? (
          <DropdownMenuItem onClick={() => copyToClipboard(window.location.href, 'URL')}>
            <ClipboardCopy className="mr-2" />
            Copy Session URL
          </DropdownMenuItem>
        ) : (
          onShare && (
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="mr-2" />
              Share Session
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-screen overflow-hidden text-foreground bg-background font-body">
            
            {/* DIALOGS */}
            <Dialog open={isAddPreviewDialogOpen} onOpenChange={setAddPreviewDialogOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Preview</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPreviewSubmit}>
                    <div className="grid gap-4 py-4">
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="device" className="text-right">Device</Label>
                        <Select onValueChange={handleDeviceChange} defaultValue={selectedDevice}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a device" />
                            </SelectTrigger>
                            <SelectContent>
                                {predefinedDevices.map(d => <SelectItem key={d.name} value={d.name}>{`${d.name}${d.width ? ` (${d.width}x${d.height})` : ''}`}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="width" className="text-right">Width</Label>
                        <Input id="width" type="number" value={newPreviewWidth} onChange={(e) => setNewPreviewWidth(e.target.value)} className="col-span-3" placeholder="e.g., 390" disabled={selectedDevice !== 'Custom'} />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="height" className="text-right">Height</Label>
                        <Input id="height" type="number" value={newPreviewHeight} onChange={(e) => setNewPreviewHeight(e.target.value)} className="col-span-3" placeholder="e.g., 844" disabled={selectedDevice !== 'Custom'} />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button type="submit">Add Preview</Button>
                    </DialogFooter>
                </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>AI Assistant</DialogTitle>
                </DialogHeader>
                 <Tabs defaultValue="generate" onValueChange={() => { setGenerateResponse(null); setRefactorResponse(null); setError(null); }} className="flex flex-col flex-grow overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2 shrink-0">
                        <TabsTrigger value="generate"><Sparkles className="mr-2"/>Generate</TabsTrigger>
                        <TabsTrigger value="refactor"><Sparkles className="mr-2"/>Refactor</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="flex flex-col flex-grow gap-4 pt-4 overflow-y-auto">
                        <Label htmlFor="generate-prompt">Describe the component you want to create:</Label>
                        <Textarea
                            id="generate-prompt"
                            placeholder="e.g., A login screen with email/password inputs and a login button."
                            className="flex-grow text-base resize-none"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <Button onClick={handleGenerate} disabled={isPending} className="w-full shrink-0">
                            {isPending ? <Loader2 className="animate-spin" /> : <Code className="mr-2" />}
                            Generate
                        </Button>
                        <div className="flex-grow overflow-y-auto -mr-6 pr-6">
                            {isPending && (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                <p className="text-lg">AI is thinking...</p>
                            </div>
                            )}
                            {error && <div className="text-destructive">Error: {error}</div>}
                            {generateResponse && (
                            <div className="pt-4 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Explanation</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>{generateResponse.explanation}</CardDescription>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>{generateResponse.componentName}.tsx</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generateResponse.code, 'Code')}>
                                        {hasCopied ? <Check className="text-green-500" /> : <ClipboardCopy />}
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <SyntaxHighlighter
                                            language="tsx"
                                            style={atomDark}
                                            customStyle={{
                                                margin: 0,
                                                border: 'none',
                                                padding: '1.5rem',
                                                backgroundColor: '#272822',
                                                borderBottomLeftRadius: '0.5rem',
                                                borderBottomRightRadius: '0.5rem',
                                                maxHeight: '40vh',
                                                overflow: 'auto',
                                            }}
                                            codeTagProps={{
                                                style: {
                                                fontFamily: "Menlo, Monaco, 'Lucida Console', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New', monospace",
                                                fontSize: '0.9rem'
                                                }
                                            }}
                                        >
                                        {generateResponse.code}
                                        </SyntaxHighlighter>
                                    </CardContent>
                                </Card>
                            </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="refactor" className="flex flex-col flex-grow gap-4 pt-4 overflow-y-auto">
                        <div className="grid grid-rows-2 gap-4 flex-grow overflow-hidden">
                            <div className="flex flex-col gap-2 overflow-y-auto -mr-6 pr-6">
                                <Label htmlFor="refactor-code">Paste the code you want to refactor:</Label>
                                <Textarea
                                    id="refactor-code"
                                    placeholder="Paste your component code here."
                                    className="flex-grow text-base resize-none font-mono"
                                    value={refactorCodeInput}
                                    onChange={(e) => setRefactorCodeInput(e.target.value)}
                                />
                                <Label htmlFor="refactor-instructions">Describe how you want to refactor it:</Label>
                                <Textarea
                                    id="refactor-instructions"
                                    placeholder="e.g., 'Convert to use shadcn/ui components', 'make the primary button blue', or 'Improve readability'."
                                    className="text-base resize-none"
                                    rows={5}
                                    value={refactorInstructions}
                                    onChange={(e) => setRefactorInstructions(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2 overflow-y-auto -mr-6 pr-6">
                                {isPending && (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                    <p className="text-lg">AI is thinking...</p>
                                </div>
                                )}
                                {error && <div className="text-destructive">Error: {error}</div>}
                                {refactorResponse && (
                                <div className="pt-4 space-y-4">
                                    <Card>
                                    <CardHeader>
                                        <CardTitle>Explanation</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>{refactorResponse.explanation}</CardDescription>
                                    </CardContent>
                                    </Card>
                                    <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>RefactoredComponent.tsx</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(refactorResponse.refactoredCode, 'Code')}>
                                        {hasCopied ? <Check className="text-green-500" /> : <ClipboardCopy />}
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <SyntaxHighlighter
                                        language="tsx"
                                        style={atomDark}
                                        customStyle={{
                                            margin: 0,
                                            border: 'none',
                                            padding: '1.5rem',
                                            backgroundColor: '#272822',
                                            borderBottomLeftRadius: '0.5rem',
                                            borderBottomRightRadius: '0.5rem',
                                            maxHeight: '40vh',
                                            overflow: 'auto',
                                        }}
                                        codeTagProps={{
                                            style: {
                                            fontFamily: "Menlo, Monaco, 'Lucida Console', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New', monospace",
                                            fontSize: '0.9rem'
                                            }
                                        }}
                                        >
                                        {refactorResponse.refactoredCode}
                                        </SyntaxHighlighter>
                                    </CardContent>
                                    </Card>
                                </div>
                                )}
                            </div>
                        </div>
                        <Button onClick={handleRefactor} disabled={isPending} className="w-full shrink-0">
                            {isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                            Refactor
                        </Button>
                    </TabsContent>
                </Tabs>
                </DialogContent>
            </Dialog>

             <Dialog open={isAuditDialogOpen} onOpenChange={setAuditDialogOpen}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Page Audit Report</DialogTitle>
                        <CardDescription>AI-powered accessibility, performance, and UI/UX analysis.</CardDescription>
                    </DialogHeader>
                    <div className="flex-grow px-6 pb-6 -m-6 overflow-y-auto mt-2">
                        {isAuditPending && (
                             <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                <p className="text-lg">Auditing page...</p>
                            </div>
                        )}
                        {auditResult && (
                            <Tabs defaultValue="accessibility" className="w-full mt-4">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="accessibility">Accessibility ({auditResult.accessibilityIssues.length})</TabsTrigger>
                                    <TabsTrigger value="performance">Performance ({auditResult.performanceIssues.length})</TabsTrigger>
                                    <TabsTrigger value="ui">UI/UX Critique ({auditResult.uiIssues.length})</TabsTrigger>
                                </TabsList>
                                <TabsContent value="accessibility" className="pt-4">
                                    {auditResult.accessibilityIssues.length > 0 ? (
                                        <Accordion type="single" collapsible className="w-full">
                                            {auditResult.accessibilityIssues.map((issue, index) => (
                                                <AccordionItem value={`item-${index}`} key={`acc-${index}`}>
                                                  <AccordionTrigger>{issue.title}</AccordionTrigger>
                                                  <AccordionContent>
                                                    <p className="mb-2"><strong>Description:</strong> {issue.description}</p>
                                                    <p><strong>Suggestion:</strong> <code className="p-1 text-sm rounded bg-muted">{issue.suggestion}</code></p>
                                                  </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    ) : (
                                        <p className="p-4 text-center text-muted-foreground">No major accessibility issues found. Great job!</p>
                                    )}
                                </TabsContent>
                                <TabsContent value="performance" className="pt-4">
                                      {auditResult.performanceIssues.length > 0 ? (
                                        <Accordion type="single" collapsible className="w-full">
                                            {auditResult.performanceIssues.map((issue, index) => (
                                                <AccordionItem value={`item-${index}`} key={`perf-${index}`}>
                                                    <AccordionTrigger>{issue.title}</AccordionTrigger>
                                                    <AccordionContent>
                                                        <p className="mb-2"><strong>Description:</strong> {issue.description}</p>
                                                        <p><strong>Suggestion:</strong> <code className="p-1 text-sm rounded bg-muted">{issue.suggestion}</code></p>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    ) : (
                                        <p className="p-4 text-center text-muted-foreground">No major performance issues found. Keep it up!</p>
                                    )}
                                </TabsContent>
                                <TabsContent value="ui" className="pt-4">
                                      {auditResult.uiIssues.length > 0 ? (
                                        <Accordion type="single" collapsible className="w-full">
                                            {auditResult.uiIssues.map((issue, index) => (
                                                <AccordionItem value={`item-${index}`} key={`ui-${index}`}>
                                                   <AccordionTrigger>{issue.title}</AccordionTrigger>
                                                   <AccordionContent>
                                                        <p className="mb-2"><strong>Description:</strong> {issue.description}</p>
                                                        <p><strong>Suggestion:</strong> <code className="p-1 text-sm rounded bg-muted">{issue.suggestion}</code></p>
                                                   </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    ) : (
                                        <p className="p-4 text-center text-muted-foreground">No major UI/UX issues found. Looks great!</p>
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            
            {/* HEADER */}
            <header className="flex-col md:flex-row flex items-center justify-between p-2 border-b shrink-0 gap-2 md:gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <Logo />
                    <div className="md:hidden">
                        <MobileControls />
                    </div>
                </div>
                <form className="w-full md:flex-1 md:max-w-xl" onSubmit={handleUrlSubmit}>
                    <div className="relative">
                        <Input 
                            type="text" 
                            value={currentUrl}
                            onChange={(e) => setCurrentUrl(e.target.value)}
                            placeholder="Enter a URL to preview"
                            className="pr-24 text-base md:text-sm"
                        />
                        <Button type="submit" className="absolute top-1/2 right-1 h-full -translate-y-1/2">Preview</Button>
                    </div>
                </form>
                <div className="hidden md:flex">
                  <DesktopControls />
                </div>
            </header>
            
            {/* MAIN CONTENT */}
             <main className="relative flex-1 min-h-0 transition-all duration-500 bg-center bg-cover" style={selectedWallpaperStyle}>
                {rulersVisible && !isMobile && (
                    <>
                        <div className="absolute top-0 left-6 h-6 w-full bg-card border-b border-l border-border z-10" style={{ backgroundSize: '100px 100%', backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)' }}/>
                        <div className="absolute top-6 left-0 w-6 h-full bg-card border-r border-t border-border z-10" style={{ backgroundSize: '100% 100px', backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)' }}/>
                        <div className="absolute top-0 left-0 w-6 h-6 border-b border-r bg-card z-10"/>
                    </>
                )}
                <div className={cn("w-full h-full", rulersVisible && !isMobile && "p-6 pt-0")}>
                   {maximizedId && maximizedPreview ? (
                     <div className="w-full h-full p-2">
                        <PreviewPanel
                            preview={maximizedPreview}
                            onRemove={handleRemove}
                            onToggleDevTools={handleToggleDevTools}
                            onRefresh={handleRefresh}
                            onAudit={handleAudit}
                            isMaximized={true}
                            onMaximize={() => {}}
                            onMinimize={() => setMaximizedId(null)}
                            handleProps={null}
                            isDragging={false}
                            isOverlay={false}
                            isResizing={false}
                            isWallpaperActive={isWallpaperActive}
                        />
                    </div>
                   ) : (
                     renderLayout()
                   )}
                </div>
                 <DragOverlay>
                    {activeId && activePreviewData ? (
                        <PreviewPanel 
                            preview={activePreviewData} 
                            onRemove={() => {}} 
                            onToggleDevTools={() => {}}
                            onRefresh={() => {}}
                            onAudit={() => {}}
                            isMaximized={false}
                            onMaximize={() => {}}
                            onMinimize={() => {}}
                            handleProps={null}
                            isDragging={false}
                            isOverlay={true}
                            isResizing={false}
                            isWallpaperActive={isWallpaperActive}
                        />
                    ) : null}
                </DragOverlay>
            </main>
            <footer className="p-2 text-center text-xs text-muted-foreground border-t">
                {isMobile && previews.length > 0 ? (
                  <div className="py-2 text-center text-sm text-muted-foreground">
                    Slide {currentSlide + 1} of {previews.length}
                  </div>
                ) : `© ${new Date().getFullYear()} DrishtiDev. All Rights Reserved.`}
            </footer>
        </div>
    </DndContext>
  );
}

