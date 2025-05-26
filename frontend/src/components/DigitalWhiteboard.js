import React, { useState, useRef, useEffect } from 'react';
import { 
  MdUndo, MdRedo, MdDelete, MdSave, MdDownload, MdContentCopy,
  MdFormatColorFill, MdInsertPhoto, MdTextFields, MdOutlineEditNote
} from 'react-icons/md';
import { FaPen, FaEraser, FaHighlighter, FaShapes, FaEye, FaEyeSlash } from 'react-icons/fa';

const DigitalWhiteboard = ({ readOnly = false }) => {
  // Canvas states
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showLayerControls, setShowLayerControls] = useState(false);
  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [isAddingText, setIsAddingText] = useState(false);
  const [layers, setLayers] = useState([
    { id: 1, name: 'Background', visible: true, locked: true },
    { id: 2, name: 'Drawing', visible: true, locked: false, active: true },
    { id: 3, name: 'Annotations', visible: true, locked: false }
  ]);
  
  // Refs
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const textInputRef = useRef(null);
  
  // Color presets for quick access
  const colorPresets = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff9900', '#9900ff'
  ];
  
  // Tool presets
  const tools = [
    { id: 'pen', name: 'Pen', icon: <FaPen /> },
    { id: 'highlighter', name: 'Highlighter', icon: <FaHighlighter /> },
    { id: 'eraser', name: 'Eraser', icon: <FaEraser /> },
    { id: 'text', name: 'Text', icon: <MdTextFields /> },
    { id: 'shapes', name: 'Shapes', icon: <FaShapes /> },
    { id: 'image', name: 'Image', icon: <MdInsertPhoto /> }
  ];
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth * 2; // For higher resolution
    canvas.height = parent.clientHeight * 2;
    canvas.style.width = `${parent.clientWidth}px`;
    canvas.style.height = `${parent.clientHeight}px`;
    
    // Get canvas context
    const context = canvas.getContext('2d');
    context.scale(2, 2); // Scale for high DPI display
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;
    
    // Fill canvas with white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    saveToHistory();
    
  }, []);
  
  // Save current canvas state to history
  const saveToHistory = () => {
    if (!canvasRef.current) return;
    
    const imageData = canvasRef.current.toDataURL('image/png');
    
    // When adding a new state, remove all states after current index
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    // Limit history size to prevent memory issues
    if (newHistory.length > 30) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  // Restore canvas state from history
  const restoreFromHistory = (index) => {
    if (index < 0 || index >= history.length || !canvasRef.current) return;
    
    const img = new Image();
    img.src = history[index];
    img.onload = () => {
      const context = contextRef.current;
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
    };
    
    setHistoryIndex(index);
  };
  
  // Undo action
  const undo = () => {
    if (historyIndex > 0) {
      restoreFromHistory(historyIndex - 1);
    }
  };
  
  // Redo action
  const redo = () => {
    if (historyIndex < history.length - 1) {
      restoreFromHistory(historyIndex + 1);
    }
  };
  
  // Clear canvas
  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    contextRef.current.fillStyle = '#ffffff';
    contextRef.current.fillRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
    
    saveToHistory();
  };
  
  // Start drawing
  const startDrawing = ({ nativeEvent }) => {
    if (readOnly) return;
    if (isAddingText) {
      addTextToCanvas(nativeEvent);
      return;
    }
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    
    if (tool === 'eraser') {
      contextRef.current.globalCompositeOperation = 'destination-out';
    } else if (tool === 'highlighter') {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.globalAlpha = 0.3;
    } else {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.globalAlpha = opacity;
    }
    
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = tool === 'highlighter' ? lineWidth * 2 : lineWidth;
    
    setIsDrawing(true);
  };
  
  // Draw
  const draw = ({ nativeEvent }) => {
    if (!isDrawing || readOnly) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };
  
  // End drawing
  const endDrawing = () => {
    if (!isDrawing || readOnly) return;
    
    contextRef.current.closePath();
    contextRef.current.globalAlpha = 1; // Reset alpha
    setIsDrawing(false);
    
    saveToHistory();
  };
  
  // Add text to canvas
  const addTextToCanvas = (event) => {
    if (readOnly) return;
    
    const { offsetX, offsetY } = event;
    setTextPosition({ x: offsetX, y: offsetY });
    setIsAddingText(true);
    
    // Focus the text input
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 10);
  };
  
  // Commit text to canvas
  const commitTextToCanvas = () => {
    if (!text.trim() || readOnly) {
      setIsAddingText(false);
      setText('');
      return;
    }
    
    contextRef.current.font = `${lineWidth * 5}px Arial`;
    contextRef.current.fillStyle = color;
    contextRef.current.globalAlpha = opacity;
    contextRef.current.fillText(text, textPosition.x, textPosition.y);
    
    setIsAddingText(false);
    setText('');
    saveToHistory();
  };
  
  // Save canvas as image
  const saveAsImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };
  
  // Toggle layer visibility
  const toggleLayerVisibility = (layerId) => {
    setLayers(
      layers.map(layer => 
        layer.id === layerId 
          ? { ...layer, visible: !layer.visible } 
          : layer
      )
    );
  };
  
  // Set active layer
  const setActiveLayer = (layerId) => {
    setLayers(
      layers.map(layer => 
        ({ ...layer, active: layer.id === layerId })
      )
    );
  };
  
  return (
    <div className="flex flex-col h-full bg-theme-card-bg border border-theme-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      {showToolbar && (
        <div className="p-2 border-b border-theme-border bg-theme-background flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center space-x-1 mb-1 sm:mb-0">
            {/* Tools */}
            <div className="flex space-x-1 mr-2">
              {tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  className={`p-2 rounded ${tool === t.id ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary hover:bg-theme-border'}`}
                  title={t.name}
                >
                  {t.icon}
                </button>
              ))}
            </div>
            
            {/* Colors */}
            <div className="flex space-x-1 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <div className="flex space-x-1">
                {colorPresets.slice(0, 5).map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setColor(c)}
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
            
            {/* Line width */}
            <div className="hidden sm:flex items-center ml-2">
              <span className="text-xs text-theme-text-secondary mr-1">Size</span>
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
          
          <div className="flex space-x-1">
            {/* History controls */}
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded ${historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-theme-border'} bg-theme-card-bg text-theme-text-primary`}
              title="Undo"
            >
              <MdUndo />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded ${historyIndex >= history.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-theme-border'} bg-theme-card-bg text-theme-text-primary`}
              title="Redo"
            >
              <MdRedo />
            </button>
            
            {/* Other controls */}
            <button
              onClick={clearCanvas}
              className="p-2 rounded bg-theme-card-bg text-theme-text-primary hover:bg-theme-border"
              title="Clear canvas"
            >
              <MdDelete />
            </button>
            <button
              onClick={saveAsImage}
              className="p-2 rounded bg-theme-card-bg text-theme-text-primary hover:bg-theme-border"
              title="Save as image"
            >
              <MdDownload />
            </button>
            <button
              onClick={() => setShowLayerControls(!showLayerControls)}
              className={`p-2 rounded ${showLayerControls ? 'bg-theme-primary-accent text-white' : 'bg-theme-card-bg text-theme-text-primary hover:bg-theme-border'}`}
              title="Layers"
            >
              <MdOutlineEditNote />
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 relative">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          className="w-full h-full touch-none cursor-crosshair"
        />
        
        {/* Text input overlay */}
        {isAddingText && (
          <div
            className="absolute"
            style={{
              left: `${textPosition.x}px`,
              top: `${textPosition.y - 20}px`,
            }}
          >
            <input
              ref={textInputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={commitTextToCanvas}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitTextToCanvas();
                }
              }}
              className="bg-transparent border-b border-theme-primary-accent outline-none text-theme-text-primary px-1"
              style={{ color }}
              autoFocus
            />
          </div>
        )}
        
        {/* Toggle toolbar button */}
        <button
          onClick={() => setShowToolbar(!showToolbar)}
          className="absolute top-2 right-2 p-2 rounded-full bg-theme-background text-theme-text-primary opacity-70 hover:opacity-100"
          title={showToolbar ? 'Hide toolbar' : 'Show toolbar'}
        >
          {showToolbar ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
        
        {/* Layers panel */}
        {showLayerControls && (
          <div className="absolute bottom-4 right-4 w-48 bg-theme-background border border-theme-border rounded-lg shadow-lg p-2">
            <h3 className="text-sm font-medium text-theme-text-primary mb-2 px-2">Layers</h3>
            <div className="space-y-1 max-h-40 overflow-auto">
              {layers.map(layer => (
                <div 
                  key={layer.id} 
                  className={`flex items-center p-2 rounded ${layer.active ? 'bg-theme-primary-accent bg-opacity-10' : 'hover:bg-theme-border'}`}
                >
                  <button
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className="mr-2"
                  >
                    {layer.visible ? <FaEye size={14} className="text-theme-text-secondary" /> : <FaEyeSlash size={14} className="text-theme-text-secondary" />}
                  </button>
                  <span 
                    className="flex-1 text-sm text-theme-text-primary cursor-pointer"
                    onClick={() => !layer.locked && setActiveLayer(layer.id)}
                  >
                    {layer.name}
                  </span>
                  {layer.locked && (
                    <span className="text-xs text-theme-text-secondary">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalWhiteboard;
