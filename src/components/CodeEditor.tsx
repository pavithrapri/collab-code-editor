import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Code2, Users, Copy, Check, Sparkles, LogOut, Zap, Wifi, WifiOff } from 'lucide-react';
import { RootState } from '../store/store';
import { setCode, setLanguage, setSuggestion } from '../store/slices/editorSlice';
import { WebSocketService } from '../services/websocket';
import { getAutocomplete } from '../services/api';
import Sidebar from './Sidebar';

interface CodeEditorProps {
  roomId: string;
  onLeaveRoom: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ roomId, onLeaveRoom }) => {
  const dispatch = useDispatch();
  const { code, language, suggestion } = useSelector((state: RootState) => state.editor);
  
  const [connectedUsers, setConnectedUsers] = useState<number>(1);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'disconnected'>('good');
  
  const wsRef = useRef<WebSocketService | null>(null);
  const autocompleteTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Initialize WebSocket with enhanced features
  useEffect(() => {
    const ws = new WebSocketService(roomId);
    
    ws.onConnect = () => {
      setIsConnected(true);
      setConnectionQuality('good');
    };

    ws.onDisconnect = () => {
      setIsConnected(false);
      setConnectionQuality('disconnected');
    };

    ws.onCodeUpdate = (newCode: string) => {
      dispatch(setCode(newCode));
    };

    ws.onUserJoined = (count: number) => {
      setConnectedUsers(count);
    };

    ws.onUserLeft = (count: number) => {
      setConnectedUsers(count);
    };

    ws.onTypingStarted = (userId: string) => {
      setTypingUsers(prev => new Set(prev).add(userId));
    };

    ws.onTypingStopped = (userId: string) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    ws.connect();
    wsRef.current = ws;

    // Monitor connection quality
    const qualityInterval = setInterval(() => {
    if (wsRef.current) {
      const latency = wsRef.current.getLatency();
      // Check if latency is a valid number
      if (typeof latency === 'number' && latency > 1000) {
        setConnectionQuality('poor');
      } else if (isConnected) {
        setConnectionQuality('good');
      }
    } else if (isConnected) {
      // If no WebSocket but still connected, set to unknown/poor
      setConnectionQuality('poor');
    }
  }, 5000);

    return () => {
      clearInterval(qualityInterval);
      ws.disconnect();
    };
  }, [roomId, dispatch, isConnected]);

  // Enhanced autocomplete with debouncing
  const handleAutocomplete = useCallback(async (code: string, position: number) => {
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    // Send typing indicator
    if (wsRef.current) {
      wsRef.current.sendTypingIndicator(true);
    }

    autocompleteTimeoutRef.current = setTimeout(async () => {
      // Stop typing indicator
      if (wsRef.current) {
        wsRef.current.sendTypingIndicator(false);
      }

      try {
        const response = await getAutocomplete(code, position, language);
        if (response.suggestion) {
          dispatch(setSuggestion(response.suggestion));
          setShowSuggestion(true);
          setTimeout(() => setShowSuggestion(false), 8000); // Longer display
        }
      } catch (error) {
        // Fallback to mock suggestion
        const mockSuggestion = getMockSuggestion(code, position);
        if (mockSuggestion) {
          dispatch(setSuggestion(mockSuggestion));
          setShowSuggestion(true);
          setTimeout(() => setShowSuggestion(false), 5000);
        }
      }
    }, 800); // Increased debounce time for better UX
  }, [language, dispatch]);

  // Enhanced mock autocomplete
  const getMockSuggestion = (code: string, position: number): string => {
    const beforeCursor = code.substring(0, position);
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    const lineBefore = lines.length > 1 ? lines[lines.length - 2] : '';
    
    if (currentLine.trim().startsWith('def ')) {
      return '(self, *args, **kwargs):\n    """Function description"""\n    # TODO: implement\n    pass';
    } else if (currentLine.includes('print(')) {
      return 'f"{variable}")';
    } else if (currentLine.trim().startsWith('class ')) {
      return ':\n    """Class description"""\n    def __init__(self):\n        self._initialized = True';
    } else if (currentLine.trim().startsWith('import ') || currentLine.trim().startsWith('from ')) {
      return '';
    } else if (lineBefore.includes('if ') && currentLine.trim() === '') {
      return '    # Condition body\n    pass';
    } else if (currentLine.includes('for ') && !currentLine.includes(':')) {
      return 'item in collection:\n    # Process item\n    pass';
    }
    return '';
  };

  // Handle code changes with better debouncing
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    const position = e.target.selectionStart;
    
    dispatch(setCode(newCode));
    setCursorPosition(position);
    
    // Send to WebSocket with throttling
    if (wsRef.current && isConnected) {
      wsRef.current.sendCodeUpdate(newCode);
    }

    // Trigger autocomplete
    handleAutocomplete(newCode, position);
  };

  // Enhanced suggestion acceptance
  const acceptSuggestion = () => {
    if (suggestion && textareaRef.current) {
      const newCode = code.substring(0, cursorPosition) + suggestion + code.substring(cursorPosition);
      dispatch(setCode(newCode));
      setShowSuggestion(false);
      dispatch(setSuggestion(''));
      
      // Move cursor after suggestion
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = cursorPosition + suggestion.length;
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          setCursorPosition(newPosition);
        }
      }, 0);
      
      if (wsRef.current && isConnected) {
        wsRef.current.sendCodeUpdate(newCode);
      }
    }
  };

  // Copy room link
  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && showSuggestion && suggestion) {
        e.preventDefault();
        acceptSuggestion();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // Save code action
        console.log('Code saved (Ctrl+Enter)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestion, suggestion, acceptSuggestion]);

  // Handle leave room
  const handleLeave = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
    onLeaveRoom();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Enhanced Header */}
      <header className="border-b border-purple-500/30 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CodeSync Pro
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400">Real-time collaborative editor</p>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionQuality === 'good' ? 'bg-green-500' :
                    connectionQuality === 'poor' ? 'bg-yellow-500' : 'bg-red-500'
                  } animate-pulse`} />
                  <span className="text-xs text-gray-500">
                    {connectionQuality === 'good' ? <Wifi className="w-3 h-3" /> :
                     connectionQuality === 'poor' ? <Wifi className="w-3 h-3" /> :
                     <WifiOff className="w-3 h-3" />}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Real-time indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">{connectedUsers} online</span>
                {typingUsers.size > 0 && (
                  <span className="text-xs text-yellow-400 animate-pulse">
                    ({typingUsers.size} typing...)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Real-time</span>
              </div>
            </div>
            
            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all font-semibold shadow-lg hover:shadow-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Leave Room
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Enhanced Editor Header */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => dispatch(setLanguage(e.target.value))}
                  className="px-3 py-2 bg-slate-700 rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all hover:border-purple-500"
                >
                  <option value="python">🐍 Python</option>
                  <option value="javascript">🟨 JavaScript</option>
                  <option value="typescript">🔷 TypeScript</option>
                </select>
                
                <button
                  onClick={copyRoomLink}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-lg hover:shadow-purple-500/20"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Share Link'}
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>AI Autocomplete Enabled</span>
              </div>
            </div>

            {/* Enhanced Code Editor */}
            <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 px-4 py-2 border-b border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow"></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-300 font-mono">
                    main.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'ts'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {code.length} chars • {code.split('\n').length} lines
                </div>
              </div>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleCodeChange}
                  onClick={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && showSuggestion) {
                      e.preventDefault();
                      acceptSuggestion();
                    }
                  }}
                  className="w-full h-[500px] p-4 bg-transparent font-mono text-sm focus:outline-none resize-none text-white leading-relaxed"
                  spellCheck={false}
                  placeholder="Start typing... Changes sync in real-time with all users!"
                />
                
                {/* Enhanced AI Suggestion Overlay */}
                {showSuggestion && suggestion && (
                  <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl shadow-2xl border border-purple-400/50 animate-fade-in-up">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold">AI Suggestion</p>
                          <button
                            onClick={() => setShowSuggestion(false)}
                            className="text-xs opacity-70 hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>
                        <code className="text-sm text-white font-mono block bg-black/30 p-2 rounded-lg">
                          {suggestion}
                        </code>
                        <p className="text-xs text-purple-200 mt-2">
                          Press <kbd className="px-2 py-1 bg-black/30 rounded mx-1">Tab</kbd> to accept
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={acceptSuggestion}
                        className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept Suggestion
                      </button>
                      <button
                        onClick={() => {
                          setShowSuggestion(false);
                          dispatch(setSuggestion(''));
                        }}
                        className="px-4 py-2 bg-black/20 hover:bg-black/30 rounded-lg text-sm font-semibold transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <Sidebar roomId={roomId} isConnected={isConnected} connectedUsers={connectedUsers} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;