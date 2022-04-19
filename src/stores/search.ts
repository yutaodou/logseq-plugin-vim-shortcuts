import { hideMainUI } from "@/common/funcs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin";
import { defineStore } from "pinia";

const flatBlocks = (blocks: BlockEntity[]) => {
  let flat = [];
  blocks.forEach((block) => {
    flat.push({
      uuid: block.uuid,
      content: block.content,
    });

    if (block.children) {
      flat = flat.concat(flatBlocks(block.children as BlockEntity[]));
    }
  });

  return flat;
};

// Check if keyword has upper case
const hasUpperCase = (keyword) => {
  return keyword.toLowerCase() !== keyword;
};

const searchBlock = (keyword, blocks, cursor = -1, dir = "next") => {
  let newCursor;
  if (dir === "next") {
    if (cursor >= blocks.length - 1) {
      return -1;
    }
    const rangeBlocks = blocks.slice(cursor + 1);
    const found = rangeBlocks.findIndex((block) => {
      let content = block.content;
      if (!hasUpperCase(keyword)) {
        content = content.toLowerCase();
      }

      return content.indexOf(keyword) >= 0;
    });

    if (found >= 0) {
      newCursor = blocks.findIndex(
        (block) => block.uuid === rangeBlocks[found].uuid
      );
    } else {
      return -1;
    }
  } else {
    if (cursor <= 0) {
      return -1;
    }
    const rangeBlocks = blocks.slice(0, cursor).reverse();
    const found = rangeBlocks.findIndex((block) => {
      let content = block.content;
      if (!hasUpperCase(keyword)) {
        content = content.toLowerCase();
      }
      return content.indexOf(keyword) >= 0;
    });

    if (found >= 0) {
      newCursor = blocks.findIndex(
        (block) => block.uuid === rangeBlocks[found].uuid
      );
    } else {
      return -1;
    }
  }

  return newCursor;
};

export const useSearchStore = defineStore("search", {
  state: () => ({
    visible: false,
    input: "",
    cursor: -1,
    flatedBlocks: [],
    currentPageName: "",
  }),
  actions: {
    toggle() {
      this.visible = !this.visible;
    },

    show() {
      this.visible = true;
    },

    hide() {
      this.visible = false;
    },

    emptyInput() {
      this.input = "";
    },

    async search() {
      this.cursor = -1;
      let flatedBlocks = [];
      let page = await logseq.Editor.getCurrentPage();
      if (page) {
        const blocks = await logseq.Editor.getCurrentPageBlocksTree();
        flatedBlocks = flatBlocks(blocks);
      } else {
        const block = await logseq.Editor.getCurrentBlock();
        if (block) {
          page = await logseq.Editor.getPage(block.page.id);
          const blocks = await logseq.Editor.getPageBlocksTree(page.name);
          flatedBlocks = flatBlocks(blocks);
        }
      }

      this.flatedBlocks = flatedBlocks;
      this.currentPageName = page ? page.name : "";

      if (!this.currentPageName) {
        logseq.App.showMsg("No page selected");
      }

      this.cursor = searchBlock(
        this.input,
        this.flatedBlocks,
        this.cursor,
        "next"
      );

      if (this.cursor >= 0) {
        const flatBlock = this.flatedBlocks[this.cursor];
        logseq.Editor.scrollToBlockInPage(this.currentPageName, flatBlock.uuid);
      } else {
        logseq.App.showMsg("Pattern not found: " + this.input);
      }

      hideMainUI();
    },

    async searchNext() {
      if (!this.input) {
        logseq.App.showMsg("No search pattern provide, press / to input!");
        return;
      }

      this.cursor = searchBlock(
        this.input,
        this.flatedBlocks,
        this.cursor,
        "next"
      );

      if (this.cursor >= 0) {
        const flatBlock = this.flatedBlocks[this.cursor];
        logseq.Editor.scrollToBlockInPage(this.currentPageName, flatBlock.uuid);
      } else {
        logseq.App.showMsg("search hit BOTTOM, continuing at TOP");
        this.cursor = -1;
        await this.searchNext();
      }
    },

    async searchPrev() {
      if (!this.input) {
        logseq.App.showMsg("No search pattern provide, press / to input!");
        return;
      }

      this.cursor = searchBlock(
        this.input,
        this.flatedBlocks,
        this.cursor,
        "prev"
      );

      if (this.cursor >= 0) {
        const flatBlock = this.flatedBlocks[this.cursor];
        logseq.Editor.scrollToBlockInPage(this.currentPageName, flatBlock.uuid);
      } else {
        logseq.App.showMsg("search hit TOP, continuing at BOTTOM");
        this.cursor = this.flatedBlocks.length;
        await this.searchPrev();
      }
    },
  },
});
