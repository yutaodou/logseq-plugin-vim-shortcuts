import { ILSPluginUser, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentPage, getSettings, scrollToBlockInPage } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();
  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-bottom',
    label: 'Go to current page bottom',
    keybinding: {
      mode: 'non-editing',
      binding: settings.bottom
    }
  }, async () => {
    debug('bottom');
    const page = await getCurrentPage();
    if (page?.name) {
      const blocks = await logseq.Editor.getPageBlocksTree(page?.name);
      if (blocks.length > 0) {
        let block = blocks[blocks.length - 1];
        scrollToBlockInPage(page.name, block.uuid);
      }
    }
  });
};
