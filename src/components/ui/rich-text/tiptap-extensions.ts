import { Extension } from "@tiptap/core";

/* TipTap v3 ships color / fontFamily / lineHeight / backgroundColor inside
   `@tiptap/extension-text-style`. The two things missing for Google-Docs
   parity are (a) paragraph indentation and (b) a `list-style-type`
   attribute on bullet/ordered lists so the toolbar can offer disc /
   circle / square / decimal / lower-alpha / upper-alpha / lower-roman /
   upper-roman variants. Both are added here as small global-attribute
   extensions. */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
    listStyle: {
      setListStyleType: (value: string) => ReturnType;
    };
  }
}

const INDENT_STEP_PX = 24;
const INDENT_MAX = 8;

export const Indent = Extension.create({
  name: "indent",

  addOptions() {
    return {
      types: ["paragraph", "heading"] as string[],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const ml = parseInt(
                element.style.marginInlineStart || element.style.marginLeft || "0",
                10,
              );
              return Math.max(0, Math.round(ml / INDENT_STEP_PX));
            },
            renderHTML: (attributes) => {
              const level = (attributes.indent ?? 0) as number;
              if (!level) return {};
              return { style: `margin-inline-start: ${level * INDENT_STEP_PX}px` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection;
          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!this.options.types.includes(node.type.name)) return;
            const next = Math.min(INDENT_MAX, ((node.attrs.indent ?? 0) as number) + 1);
            if (next === node.attrs.indent) return;
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
            changed = true;
          });
          if (changed && dispatch) dispatch(tr);
          return changed;
        },
      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection;
          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!this.options.types.includes(node.type.name)) return;
            const next = Math.max(0, ((node.attrs.indent ?? 0) as number) - 1);
            if (next === node.attrs.indent) return;
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
            changed = true;
          });
          if (changed && dispatch) dispatch(tr);
          return changed;
        },
    };
  },
});

export const ListStyle = Extension.create({
  name: "listStyle",

  addOptions() {
    return {
      types: ["bulletList", "orderedList"] as string[],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          listStyleType: {
            default: null as string | null,
            parseHTML: (element) => element.style.listStyleType || null,
            renderHTML: (attributes) => {
              const v = attributes.listStyleType as string | null | undefined;
              if (!v) return {};
              return { style: `list-style-type: ${v}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setListStyleType:
        (value: string) =>
        ({ commands, editor }) => {
          // Apply to whichever list type the selection sits in.
          if (editor.isActive("bulletList")) {
            return commands.updateAttributes("bulletList", { listStyleType: value });
          }
          if (editor.isActive("orderedList")) {
            return commands.updateAttributes("orderedList", { listStyleType: value });
          }
          return false;
        },
    };
  },
});
