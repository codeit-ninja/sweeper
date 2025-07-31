<script lang="ts">
    import * as monaco from 'monaco-editor';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    interface EditorProps {
        value?: string;
        language?: string;
        theme?: string;
        readonly?: boolean;
        minimap?: boolean;
        lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
        wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
        fontSize?: number;
        tabSize?: number;
        automaticLayout?: boolean;
        scrollBeyondLastLine?: boolean;
        smoothScrolling?: boolean;
        cursorBlinking?: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
        cursorStyle?: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
        folding?: boolean;
        foldingStrategy?: 'auto' | 'indentation';
        showFoldingControls?: 'always' | 'never' | 'mouseover';
        matchBrackets?: 'never' | 'near' | 'always';
        autoIndent?: 'none' | 'keep' | 'brackets' | 'advanced' | 'full';
        formatOnPaste?: boolean;
        formatOnType?: boolean;
        suggestOnTriggerCharacters?: boolean;
        acceptSuggestionOnEnter?: 'on' | 'smart' | 'off';
        snippetSuggestions?: 'top' | 'bottom' | 'inline' | 'none';
        emptySelectionClipboard?: boolean;
        copyWithSyntaxHighlighting?: boolean;
        dragAndDrop?: boolean;
        occurrencesHighlight?: 'off' | 'singleFile' | 'multiFile';
        renderWhitespace?: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
        renderControlCharacters?: boolean;
        rulers?: number[];
        colorDecorators?: boolean;
        codeLens?: boolean;
        links?: boolean;
        contextmenu?: boolean;
        mouseWheelZoom?: boolean;
        multiCursorModifier?: 'ctrlCmd' | 'alt';
        multiCursorMergeOverlapping?: boolean;
        accessibilitySupport?: 'auto' | 'off' | 'on';
        quickSuggestions?: boolean | { other: boolean; comments: boolean; strings: boolean };
        quickSuggestionsDelay?: number;
        parameterHints?: { enabled: boolean; cycle: boolean };
        autoClosingBrackets?: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
        autoClosingQuotes?: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
        autoSurround?: 'languageDefined' | 'quotes' | 'brackets' | 'never';
        hover?: { enabled: boolean; delay: number; sticky: boolean };
        find?: {
            cursorMoveOnType?: boolean;
            seedSearchStringFromSelection?: 'always' | 'never' | 'selection';
            autoFindInSelection?: 'always' | 'never' | 'multiline';
            addExtraSpaceOnTop?: boolean;
            loop?: boolean;
        };
        gotoLocation?: {
            multiple?: 'peek' | 'gotoAndPeek' | 'goto';
            multipleDefinitions?: 'peek' | 'gotoAndPeek' | 'goto';
            multipleTypeDefinitions?: 'peek' | 'gotoAndPeek' | 'goto';
            multipleDeclarations?: 'peek' | 'gotoAndPeek' | 'goto';
            multipleImplementations?: 'peek' | 'gotoAndPeek' | 'goto';
            multipleReferences?: 'peek' | 'gotoAndPeek' | 'goto';
            alternativeDefinitionCommand?: string;
            alternativeTypeDefinitionCommand?: string;
            alternativeDeclarationCommand?: string;
            alternativeImplementationCommand?: string;
            alternativeReferenceCommand?: string;
        };
        class?: string;
        style?: string;
        width?: string | number;
        height?: string | number;
        onMount?: (editor: monaco.editor.IStandaloneCodeEditor, monacoModule: any) => void;
        onChange?: (value: string, event: monaco.editor.IModelContentChangedEvent) => void;
        onCursorPositionChange?: (position: monaco.Position, event: monaco.editor.ICursorPositionChangedEvent) => void;
        onSelectionChange?: (selection: monaco.Selection, event: monaco.editor.ICursorSelectionChangedEvent) => void;
        onFocus?: () => void;
        onBlur?: () => void;
        onKeyDown?: (event: monaco.IKeyboardEvent) => void;
        onKeyUp?: (event: monaco.IKeyboardEvent) => void;
        onMouseDown?: (event: monaco.editor.IEditorMouseEvent) => void;
        onMouseUp?: (event: monaco.editor.IEditorMouseEvent) => void;
        onMouseMove?: (event: monaco.editor.IEditorMouseEvent) => void;
        onContextMenu?: (event: monaco.editor.IEditorMouseEvent) => void;
    }

    let {
        value = $bindable(''),
        language = 'javascript',
        theme = 'vs-dark',
        readonly = false,
        minimap = true,
        lineNumbers = 'on',
        wordWrap = 'off',
        fontSize = 14,
        tabSize = 4,
        automaticLayout = true,
        scrollBeyondLastLine = true,
        smoothScrolling = false,
        cursorBlinking = 'blink',
        cursorStyle = 'line',
        folding = true,
        foldingStrategy = 'auto',
        showFoldingControls = 'mouseover',
        matchBrackets = 'always',
        autoIndent = 'advanced',
        formatOnPaste = true,
        formatOnType = false,
        suggestOnTriggerCharacters = true,
        acceptSuggestionOnEnter = 'on',
        snippetSuggestions = 'inline',
        emptySelectionClipboard = true,
        copyWithSyntaxHighlighting = true,
        dragAndDrop = false,
        occurrencesHighlight = 'singleFile',
        renderWhitespace = 'selection',
        renderControlCharacters = false,
        rulers = [],
        colorDecorators = true,
        codeLens = true,
        links = true,
        contextmenu = true,
        mouseWheelZoom = false,
        multiCursorModifier = 'ctrlCmd',
        multiCursorMergeOverlapping = true,
        accessibilitySupport = 'auto',
        quickSuggestions = true,
        quickSuggestionsDelay = 10,
        parameterHints = { enabled: true, cycle: false },
        autoClosingBrackets = 'languageDefined',
        autoClosingQuotes = 'languageDefined',
        autoSurround = 'languageDefined',
        hover = { enabled: true, delay: 300, sticky: true },
        find = {
            cursorMoveOnType: true,
            seedSearchStringFromSelection: 'always',
            autoFindInSelection: 'never',
            addExtraSpaceOnTop: true,
            loop: true,
        },
        gotoLocation = {
            multiple: 'peek',
            multipleDefinitions: 'peek',
            multipleTypeDefinitions: 'peek',
            multipleDeclarations: 'peek',
            multipleImplementations: 'peek',
            multipleReferences: 'peek',
        },
        class: className = '',
        style = '',
        width = '100%',
        height = '400px',
        onMount: onMountCallback,
        onChange,
        onCursorPositionChange,
        onSelectionChange,
        onFocus,
        onBlur,
        onKeyDown,
        onKeyUp,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        onContextMenu,
    }: EditorProps = $props();

    let containerElement: HTMLDivElement;
    let editor: monaco.editor.IStandaloneCodeEditor | null = $state(null);
    let isInitialized = $state(false);
    let disposables: monaco.IDisposable[] = $state([]);

    // Reactive state for tracking internal changes
    let internalValue = $state(value);
    let isInternalChange = $state(false);

    // Watch for external value changes
    $effect(() => {
        if (editor && value !== internalValue && !isInternalChange) {
            editor.setValue(value);
            internalValue = value;
        }
    });

    // Watch for language changes
    $effect(() => {
        if (editor && language) {
            const model = editor.getModel();
            if (model) {
                monaco.editor.setModelLanguage(model, language);
            }
        }
    });

    // Watch for theme changes
    $effect(() => {
        if (editor && theme) {
            monaco.editor.setTheme(theme);
        }
    });

    // Watch for readonly changes
    $effect(() => {
        if (editor) {
            editor.updateOptions({ readOnly: readonly });
        }
    });

    // Watch for other option changes
    $effect(() => {
        if (editor) {
            editor.updateOptions({
                minimap: { enabled: minimap },
                lineNumbers,
                wordWrap,
                fontSize,
                tabSize,
                automaticLayout,
                scrollBeyondLastLine,
                smoothScrolling,
                cursorBlinking,
                cursorStyle,
                folding,
                foldingStrategy,
                showFoldingControls,
                matchBrackets,
                autoIndent,
                formatOnPaste,
                formatOnType,
                suggestOnTriggerCharacters,
                acceptSuggestionOnEnter,
                snippetSuggestions,
                emptySelectionClipboard,
                copyWithSyntaxHighlighting,
                dragAndDrop,
                occurrencesHighlight,
                renderWhitespace,
                renderControlCharacters,
                rulers,
                colorDecorators,
                codeLens,
                links,
                contextmenu,
                mouseWheelZoom,
                multiCursorModifier,
                multiCursorMergeOverlapping,
                accessibilitySupport,
                quickSuggestions,
                quickSuggestionsDelay,
                parameterHints,
                autoClosingBrackets,
                autoClosingQuotes,
                autoSurround,
                hover,
                find,
                gotoLocation,
            });
        }
    });

    onMount(() => {
        if (!browser) return;

        // Initialize Monaco Editor
        editor = monaco.editor.create(containerElement, {
            value: internalValue,
            language,
            theme,
            readOnly: readonly,
            minimap: { enabled: minimap },
            lineNumbers,
            wordWrap,
            fontSize,
            tabSize,
            automaticLayout,
            scrollBeyondLastLine,
            smoothScrolling,
            cursorBlinking,
            cursorStyle,
            folding,
            foldingStrategy,
            showFoldingControls,
            matchBrackets,
            autoIndent,
            formatOnPaste,
            formatOnType,
            suggestOnTriggerCharacters,
            acceptSuggestionOnEnter,
            snippetSuggestions,
            emptySelectionClipboard,
            copyWithSyntaxHighlighting,
            dragAndDrop,
            occurrencesHighlight,
            renderWhitespace,
            renderControlCharacters,
            rulers,
            colorDecorators,
            codeLens,
            links,
            contextmenu,
            mouseWheelZoom,
            multiCursorModifier,
            multiCursorMergeOverlapping,
            accessibilitySupport,
            quickSuggestions,
            quickSuggestionsDelay,
            parameterHints,
            autoClosingBrackets,
            autoClosingQuotes,
            autoSurround,
            hover,
            find,
            gotoLocation,
        });

        // Set up event listeners
        const model = editor.getModel();
        if (model) {
            // Content change listener
            const contentDisposable = model.onDidChangeContent((event) => {
                const newValue = editor!.getValue();
                isInternalChange = true;
                internalValue = newValue;
                value = newValue;
                isInternalChange = false;
                onChange?.(newValue, event);
            });

            // Cursor position change listener
            const cursorDisposable = editor.onDidChangeCursorPosition((event) => {
                onCursorPositionChange?.(event.position, event);
            });

            // Selection change listener
            const selectionDisposable = editor.onDidChangeCursorSelection((event) => {
                onSelectionChange?.(event.selection, event);
            });

            // Focus listeners
            const focusDisposable = editor.onDidFocusEditorWidget(() => {
                onFocus?.();
            });

            const blurDisposable = editor.onDidBlurEditorWidget(() => {
                onBlur?.();
            });

            // Keyboard listeners
            const keyDownDisposable = editor.onKeyDown((event) => {
                onKeyDown?.(event);
            });

            const keyUpDisposable = editor.onKeyUp((event) => {
                onKeyUp?.(event);
            });

            // Mouse listeners
            const mouseDownDisposable = editor.onMouseDown((event) => {
                onMouseDown?.(event);
            });

            const mouseUpDisposable = editor.onMouseUp((event) => {
                onMouseUp?.(event);
            });

            const mouseMoveDisposable = editor.onMouseMove((event) => {
                onMouseMove?.(event);
            });

            const contextMenuDisposable = editor.onContextMenu((event) => {
                onContextMenu?.(event);
            });

            // Store disposables for cleanup
            disposables = [
                contentDisposable,
                cursorDisposable,
                selectionDisposable,
                focusDisposable,
                blurDisposable,
                keyDownDisposable,
                keyUpDisposable,
                mouseDownDisposable,
                mouseUpDisposable,
                mouseMoveDisposable,
                contextMenuDisposable,
            ];
        }

        isInitialized = true;

        // Call the onMount callback if provided
        onMountCallback?.(editor, monaco);
    });

    onDestroy(() => {
        // Dispose event listeners
        disposables.forEach((disposable) => disposable.dispose());
        disposables = [];

        // Dispose editor
        if (editor) {
            editor.dispose();
            editor = null;
        }
    });

    // Public methods accessible via component reference
    export function getEditor() {
        return editor;
    }

    export function getValue() {
        return editor?.getValue() ?? '';
    }

    export function setValue(newValue: string) {
        if (editor) {
            editor.setValue(newValue);
        }
    }

    export function insertText(text: string, position?: monaco.IPosition) {
        if (editor) {
            if (position) {
                const range = new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column,
                );
                editor.executeEdits('insert-text', [{ range, text }]);
            } else {
                const position = editor.getPosition();
                if (position) {
                    const range = new monaco.Range(
                        position.lineNumber,
                        position.column,
                        position.lineNumber,
                        position.column,
                    );
                    editor.executeEdits('insert-text', [{ range, text }]);
                }
            }
        }
    }

    export function focus() {
        editor?.focus();
    }

    export function blur() {
        if (editor && document.activeElement === editor.getDomNode()) {
            (document.activeElement as HTMLElement).blur();
        }
    }

    export function getPosition() {
        return editor?.getPosition() ?? null;
    }

    export function setPosition(position: monaco.IPosition) {
        if (editor) {
            editor.setPosition(position);
        }
    }

    export function getSelection() {
        return editor?.getSelection() ?? null;
    }

    export function setSelection(selection: monaco.IRange | monaco.Selection) {
        if (editor) {
            editor.setSelection(selection);
        }
    }

    export function revealLine(lineNumber: number) {
        if (editor) {
            editor.revealLine(lineNumber);
        }
    }

    export function revealLineInCenter(lineNumber: number) {
        if (editor) {
            editor.revealLineInCenter(lineNumber);
        }
    }

    export function revealPosition(position: monaco.IPosition) {
        if (editor) {
            editor.revealPosition(position);
        }
    }

    export function revealPositionInCenter(position: monaco.IPosition) {
        if (editor) {
            editor.revealPositionInCenter(position);
        }
    }

    export function trigger(source: string, handlerId: string, payload?: any) {
        if (editor) {
            editor.trigger(source, handlerId, payload);
        }
    }

    export function layout(dimension?: monaco.editor.IDimension) {
        if (editor) {
            editor.layout(dimension);
        }
    }

    export function addAction(descriptor: monaco.editor.IActionDescriptor) {
        if (editor) {
            return editor.addAction(descriptor);
        }
        return null;
    }

    export function addCommand(keybinding: number, handler: monaco.editor.ICommandHandler, context?: string) {
        if (editor) {
            return editor.addCommand(keybinding, handler, context);
        }
        return null;
    }

    export function deltaDecorations(oldDecorations: string[], newDecorations: monaco.editor.IModelDeltaDecoration[]) {
        if (editor) {
            return editor.deltaDecorations(oldDecorations, newDecorations);
        }
        return [];
    }

    // Compute container style
    const containerStyle = $derived(
        [
            `width: ${typeof width === 'number' ? `${width}px` : width}`,
            `height: ${typeof height === 'number' ? `${height}px` : height}`,
            style,
        ]
            .filter(Boolean)
            .join('; '),
    );
</script>

<div
    bind:this={containerElement}
    class={`monaco-editor-container ${className}`}
    style={containerStyle}
    role="textbox"
    aria-label="Code editor"
    tabindex="-1"
></div>

<style>
    .monaco-editor-container {
        position: relative;
        overflow: hidden;
    }

    :global(.monaco-editor) {
        width: 100% !important;
        height: 100% !important;
    }

    :global(.monaco-editor .margin) {
        background-color: transparent;
    }

    :global(.monaco-editor .monaco-editor-background) {
        background-color: transparent;
    }

    :global(.monaco-editor .monaco-scrollable-element) {
        background-color: transparent;
    }
</style>
