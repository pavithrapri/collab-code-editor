import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EditorState {
  code: string;
  language: string;
  suggestion: string;
  cursorPosition: number;
}

const initialState: EditorState = {
  code: '# Welcome to CodeSync Pro\n# Start typing to see real-time collaboration!\n\ndef hello_world():\n    print("Hello, World!")\n    return "Success"',
  language: 'python',
  suggestion: '',
  cursorPosition: 0,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setSuggestion: (state, action: PayloadAction<string>) => {
      state.suggestion = action.payload;
    },
    setCursorPosition: (state, action: PayloadAction<number>) => {
      state.cursorPosition = action.payload;
    },
  },
});

export const { setCode, setLanguage, setSuggestion, setCursorPosition } = editorSlice.actions;
export default editorSlice.reducer;