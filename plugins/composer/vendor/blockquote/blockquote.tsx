/** @jsxImportSource @tiptap/core */
import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

import { handleBackspace } from './handleBackspace.js'

export interface BlockquoteOptions {

  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockQuote: {

      setBlockquote: () => ReturnType

      toggleBlockquote: () => ReturnType

      unsetBlockquote: () => ReturnType
    }
  }
}


export const inputRegex = /^\s*>\s$/


export const Blockquote = Node.create<BlockquoteOptions>({
  name: 'blockquote',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'block+',

  group: 'block',

  defining: true,

  parseHTML() {
    return [{ tag: 'blockquote' }]
  },

  renderHTML({ HTMLAttributes }) {
    return (
      <blockquote {...mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)}>
        <slot />
      </blockquote>
    )
  },

  parseMarkdown: (token, helpers) => {
    const parseBlockChildren = helpers.parseBlockChildren ?? helpers.parseChildren

    return helpers.createNode('blockquote', undefined, parseBlockChildren(token.tokens || []))
  },

  renderMarkdown: (node, h) => {
    if (!node.content) {
      return ''
    }


    const prefix = '>'
    const result: string[] = []

    node.content.forEach((child, index) => {
      const childContent = h.renderChild?.(child, index) ?? h.renderChildren([child])
      const lines = childContent.split('\n')

      const linesWithPrefix = lines.map(line => {

        if (line.trim() === '') {
          return prefix
        }


        return `${prefix} ${line}`
      })

      result.push(linesWithPrefix.join('\n'))
    })

    return result.join(`\n${prefix}\n`)
  },

  addCommands() {
    return {
      setBlockquote:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name)
        },
      toggleBlockquote:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name)
        },
      unsetBlockquote:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
      Backspace: () => handleBackspace(this.editor, this.type),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },
})
