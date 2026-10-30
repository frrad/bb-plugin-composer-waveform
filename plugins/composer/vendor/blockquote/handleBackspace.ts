import type { Editor } from '@tiptap/core'
import type { NodeType } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'


export const handleBackspace = (editor: Editor, type: NodeType): boolean => {
  const { state, view } = editor
  const { selection } = state
  if (!selection.empty) return false

  const { $from } = selection
  if ($from.parentOffset !== 0) return false

  const parentDepth = $from.depth - 1
  const parent = $from.node(parentDepth)
  const index = $from.index(parentDepth)
  if (index === 0) return false

  if (parent.type === type) {
    return editor.commands.lift(type.name)
  }



  const previous = parent.child(index - 1)
  if (previous.type !== type || !previous.lastChild?.isTextblock) {
    return false
  }

  const blockStart = $from.before()





  const insideBlockquoteEnd = blockStart - 1
  const targetPos = insideBlockquoteEnd - 1
  const { tr } = state
  tr.delete(blockStart, $from.after()).insert(targetPos, $from.parent.content)
  tr.setSelection(TextSelection.create(tr.doc, targetPos))
  view.dispatch(tr.scrollIntoView())
  return true
}
