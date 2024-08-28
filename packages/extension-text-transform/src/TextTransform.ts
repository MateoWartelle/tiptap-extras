import { Extension } from "@tiptap/core";

export interface TextTransformOptions {
  /**
   * The types where the text-transform attribute can be applied.
   * @default []
   * @example ['heading', 'paragraph']
   */
  types: string[];

  /**
   * The cases which are allowed.
   * @example ['uppercase', 'lowercase']
   */
  cases: string[];

  /**
   * The default case.
   * @default 'none'
   * @example 'capitalize'
   */
  defaultCase: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textTransform: {
      /**
       * Set the text-transform attribute
       * @param textTransform
       * @example editor.commands.setTextCase('left')
       */
      setTextCase: (textTransform: string) => ReturnType;
      /**
       * Unset the text-transform attribute
       * @example editor.commands.unsetTextTransform()
       */
      unsetTextTransform: () => ReturnType;
    };
  }
}

export const TextTranform = Extension.create<TextTransformOptions>({
  name: "textTransform",

  addOptions() {
    return {
      types: ["paragraph"],
      cases: ["uppercase", "lowercase"],
      defaultCase: "none",
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textTransform: {
            default: this.options.defaultCase,
            parseHTML: (element) => {
              const textTransform =
                element.style.textTransform || this.options.defaultCase;

              return this.options.cases.includes(textTransform)
                ? textTransform
                : this.options.defaultCase;
            },
            renderHTML: (attributes) => {
              if (attributes.textTransform === this.options.defaultCase) {
                return {};
              }
              return { style: `text-transform: ${attributes.textTransform}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setTextCase:
        (textCase: string) =>
        ({ commands }) => {
          if (!this.options.cases.includes(textCase)) {
            return false;
          }
          return this.options.types
            .map((type) =>
              commands.updateAttributes(type, { textTransform: textCase })
            )
            .every((response) => response);
        },
      unsetTextTransform:
        () =>
        ({ commands }) => {
          return this.options.types
            .map((type) => commands.resetAttributes(type, "textTransform"))
            .every((response) => response);
        },
    };
  },
});
