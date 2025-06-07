import React, { useRef, useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store';
import { getCurveMinMax, getDepthRange } from '../utils/helpers';
import { getColorForCurve, getTrackBackgroundColor } from '../utils/colors';

const WellLogVisualization: React.FC = () => {
  const { 
    files, 
    currentFileIndex, 
    processedResults,
    visualizationOptions,
  } = useAppStore();
  
  const { ref, width, height } = useResizeDetector();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const hasFile = files.length > 0 && currentFileIndex >= 0;
  const currentFile = hasFile ? files[currentFileIndex] : null;
  
  // Find processed result for the current file
  const processedResult = currentFile
    ? processedResults.find(result => result.originalData.filename === currentFile.filename)
    : null;
  
  const originalData = currentFile?.data || [];
  const processedData = processedResult?.processedData.data || [];
  
  // Handle zooming
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };
  
  const handleResetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };
  
  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPanOffset({
      x: panOffset.x + (e.clientX - dragStart.x) / zoom,
      y: panOffset.y + (e.clientY - dragStart.y) / zoom,
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  // Draw the well log visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentFile || !width || !height) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Apply transformation for zoom and pan
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);
    
    // Get depth range
    const depthRange = getDepthRange(originalData);
    const depthMin = visualizationOptions.depth.min ?? depthRange.min;
    const depthMax = visualizationOptions.depth.max ?? depthRange.max;
    const depthSpan = depthMax - depthMin;
    
    // Calculate track dimensions
    const trackCount = 2; // Original and processed
    const trackWidth = (width / zoom - 100) / trackCount;
    const trackHeight = height / zoom - 60;
    const trackStartX = 80;
    const trackStartY = 30;
    
    // Draw depth axis
    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const depthTicks = 10;
    for (let i = 0; i <= depthTicks; i++) {
      const y = trackStartY + (i / depthTicks) * trackHeight;
      const depth = depthMin + (1 - i / depthTicks) * depthSpan;
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(trackStartX - 5, y);
      ctx.lineTo(trackStartX, y);
      ctx.stroke();
      
      // Draw label
      ctx.fillText(depth.toFixed(1), trackStartX - 10, y);
    }
    
    // Draw tracks
    const drawTrack = (
      data: any[],
      trackIndex: number,
      title: string
    ) => {
      // Calculate track position
      const x = trackStartX + trackIndex * trackWidth;
      const y = trackStartY;
      
      // Draw track background
      ctx.fillStyle = getTrackBackgroundColor(trackIndex);
      ctx.fillRect(x, y, trackWidth, trackHeight);
      
      // Draw track border
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, trackWidth, trackHeight);
      
      // Draw track title
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px Arial';
      ctx.fillText(title, x + trackWidth / 2, y - 15);
      
      if (!data.length) return;
      
      // Get curve names (excluding depth)
      const curveNames = Object.keys(data[0].values);
      
      // Draw each curve
      curveNames.forEach((curveName, curveIndex) => {
        // Get curve data
        const curveData = data.map(row => ({
          depth: row.depth,
          value: row.values[curveName] || 0,
        }));
        
        // Get curve min/max
        const { min, max } = getCurveMinMax(data, curveName);
        const valueSpan = max - min;
        
        // Set curve style
        ctx.strokeStyle = getColorForCurve(curveIndex);
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Draw curve
        curveData.forEach((point, i) => {
          // Calculate position
          const normalizedDepth = 1 - (point.depth - depthMin) / depthSpan;
          const normalizedValue = (point.value - min) / valueSpan;
          
          const pointX = x + normalizedValue * trackWidth;
          const pointY = y + normalizedDepth * trackHeight;
          
          if (i === 0) {
            ctx.moveTo(pointX, pointY);
          } else {
            ctx.lineTo(pointX, pointY);
          }
        });
        
        ctx.stroke();
        
        // Draw curve name
        ctx.fillStyle = getColorForCurve(curveIndex);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = '10px Arial';
        ctx.fillText(curveName, x + 5, y + 5 + curveIndex * 15);
      });
    };
    
    // Draw original data track
    drawTrack(originalData, 0, 'Original Data');
    
    // Draw processed data track if available
    if (processedData.length) {
      drawTrack(processedData, 1, 'Processed Data');
    }
    
    // Restore canvas state
    ctx.restore();
    
  }, [currentFile, originalData, processedData, width, height, zoom, panOffset, visualizationOptions]);
  
  if (!hasFile) {
    return (
      <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center text-neutral-500">
        <p>Upload a file to visualize well log data</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col" ref={ref}>
      <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="text-neutral-700 font-medium">Well Log Visualization</h3>
        
        <div className="flex items-center space-x-2">
          <button
            className="p-1 text-neutral-500 hover:text-primary-600 rounded-full hover:bg-primary-50 transition-colors"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          
          <button
            className="p-1 text-neutral-500 hover:text-primary-600 rounded-full hover:bg-primary-50 transition-colors"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          
          <button
            className="p-1 text-neutral-500 hover:text-primary-600 rounded-full hover:bg-primary-50 transition-colors"
            onClick={handleResetView}
            title="Reset View"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
      </div>
    </div>
  );
};

export default WellLogVisualization;