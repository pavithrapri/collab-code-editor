import re
from typing import Dict

class AIService:
    """Mock AI service for code autocomplete"""
    
    def get_suggestion(self, code: str, cursor_pos: int, language: str) -> Dict:
        """Generate context-aware code suggestions"""
        
        before_cursor = code[:cursor_pos]
        lines = before_cursor.split('\n')
        current_line = lines[-1] if lines else ""
        
        # Python-specific suggestions
        if language == "python":
            return self._python_suggestions(current_line, before_cursor)
        elif language == "javascript":
            return self._javascript_suggestions(current_line)
        else:
            return {"text": "", "confidence": 0.0}
    
    def _python_suggestions(self, current_line: str, context: str) -> Dict:
        """Python-specific autocomplete logic"""
        
        line_stripped = current_line.strip()
        
        # Function definitions
        if line_stripped.startswith('def '):
            if '(' in line_stripped and ')' not in line_stripped:
                return {
                    "text": "self, *args, **kwargs):\n    \"\"\"\n    Description\n    \"\"\"\n    pass",
                    "confidence": 0.85,
                    "context": "function_definition"
                }
        
        # Class definitions
        if line_stripped.startswith('class '):
            if ':' not in line_stripped:
                return {
                    "text": ":\n    def __init__(self):\n        pass",
                    "confidence": 0.9,
                    "context": "class_definition"
                }
        
        # Import statements
        if 'import ' in line_stripped:
            imports = {
                'import pandas': ' as pd',
                'import numpy': ' as np',
                'import matplotlib': '.pyplot as plt',
                'from typing': ' import List, Dict, Optional'
            }
            for key, value in imports.items():
                if line_stripped.startswith(key) and not value[:4] in line_stripped:
                    return {"text": value, "confidence": 0.95, "context": "import"}
        
        # Loop structures
        if line_stripped.startswith('for '):
            if ':' not in line_stripped:
                return {
                    "text": "i in range(len(items)):\n    print(i)",
                    "confidence": 0.8,
                    "context": "for_loop"
                }
        
        # Conditional statements
        if line_stripped.startswith('if '):
            if ':' not in line_stripped:
                return {
                    "text": "condition:\n    # TODO: implement\n    pass",
                    "confidence": 0.75,
                    "context": "conditional"
                }
        
        # Print statements
        if 'print(' in line_stripped and line_stripped.count('(') > line_stripped.count(')'):
            return {
                "text": "f\"{variable}\")",
                "confidence": 0.7,
                "context": "print_statement"
            }
        
        # Try-except blocks
        if line_stripped.startswith('try:'):
            return {
                "text": "\n    # code here\nexcept Exception as e:\n    print(f\"Error: {e}\")",
                "confidence": 0.85,
                "context": "exception_handling"
            }
        
        # Common patterns
        patterns = {
            'with open(': 'filename, "r") as f:\n    content = f.read()',
            'return ': 'result',
            'raise ': 'ValueError("Invalid input")',
        }
        
        for pattern, suggestion in patterns.items():
            if pattern in line_stripped:
                return {"text": suggestion, "confidence": 0.7, "context": "pattern_match"}
        
        return {"text": "", "confidence": 0.0}
    
    def _javascript_suggestions(self, current_line: str) -> Dict:
        """JavaScript-specific autocomplete logic"""
        
        line_stripped = current_line.strip()
        
        if line_stripped.startswith('function '):
            return {
                "text": "(params) {\n  // implementation\n}",
                "confidence": 0.85,
                "context": "function"
            }
        
        if line_stripped.startswith('const '):
            return {
                "text": "= ",
                "confidence": 0.75,
                "context": "variable"
            }
        
        return {"text": "", "confidence": 0.0}